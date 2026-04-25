import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { planFor } from "@/lib/plans";
import { getRazorpayConfig, isRazorpayConfigured, createCustomer, createSubscription, stubCheckoutUrl } from "@/lib/razorpay";

export async function POST(req: Request) {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.redirect(new URL("/admin", req.url));

  const form = await req.formData();
  const plan = String(form.get("plan") || "");
  const targetPlan = planFor(plan);
  if (!["free", "pro"].includes(plan)) {
    return NextResponse.redirect(new URL("/admin/billing", req.url));
  }

  // Free downgrade: just flip workspace.plan
  if (plan === "free") {
    await prisma.workspace.update({ where: { id: admin.workspaceId }, data: { plan: "free", seatLimit: 10 } });
    await prisma.subscription.updateMany({
      where: { workspaceId: admin.workspaceId, status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } },
      data: { cancelAtPeriodEnd: true },
    });
    return NextResponse.redirect(new URL("/admin/billing?downgraded=1", req.url), 303);
  }

  // Pro upgrade
  const seatCount = await prisma.user.count({ where: { workspaceId: admin.workspaceId, isActive: true, email: { not: { contains: "@demo." } } } });
  const quantity = Math.max(seatCount, 1);

  const cfg = await getRazorpayConfig();

  // Stub mode: no Razorpay keys → create a local trial subscription + simulated checkout
  if (!isRazorpayConfigured(cfg) || !cfg.planIdPro) {
    await prisma.subscription.upsert({
      where: { workspaceId: admin.workspaceId },
      update: {
        plan: "pro", status: "TRIAL",
        seatsPurchased: quantity, pricePerSeatMonthly: targetPlan.pricePerSeatMonthly,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 3600_000),
      },
      create: {
        workspaceId: admin.workspaceId,
        plan: "pro", status: "TRIAL",
        seatsPurchased: quantity, pricePerSeatMonthly: targetPlan.pricePerSeatMonthly,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 3600_000),
      },
    });
    await prisma.workspace.update({ where: { id: admin.workspaceId }, data: { plan: "pro", seatLimit: null } });
    return NextResponse.redirect(new URL(stubCheckoutUrl(admin.workspaceId, plan), req.url), 303);
  }

  // Real Razorpay flow
  try {
    const workspace = await prisma.workspace.findUnique({ where: { id: admin.workspaceId } });
    const existing = await prisma.subscription.findUnique({ where: { workspaceId: admin.workspaceId } });

    let customerId = existing?.razorpayCustomerId;
    if (!customerId) {
      const customer = await createCustomer(cfg, {
        name: workspace?.name || "Workspace",
        email: workspace?.billingEmail || admin.email,
      });
      customerId = customer.id;
    }

    const sub = await createSubscription(cfg, {
      planId: cfg.planIdPro,
      quantity,
      customerNotify: true,
      notes: { workspaceId: admin.workspaceId, cherishuPlan: "pro" },
    });

    await prisma.subscription.upsert({
      where: { workspaceId: admin.workspaceId },
      update: {
        plan: "pro", status: "TRIAL",
        razorpayPlanId: cfg.planIdPro,
        razorpaySubscriptionId: sub.id,
        razorpayCustomerId: customerId,
        seatsPurchased: quantity,
        pricePerSeatMonthly: targetPlan.pricePerSeatMonthly,
      },
      create: {
        workspaceId: admin.workspaceId,
        plan: "pro", status: "TRIAL",
        razorpayPlanId: cfg.planIdPro,
        razorpaySubscriptionId: sub.id,
        razorpayCustomerId: customerId,
        seatsPurchased: quantity,
        pricePerSeatMonthly: targetPlan.pricePerSeatMonthly,
      },
    });

    // Razorpay returns short_url for hosted checkout
    const checkoutUrl = sub.short_url || `https://rzp.io/i/${sub.id}`;
    return NextResponse.redirect(checkoutUrl, 303);
  } catch (e: any) {
    const msg = encodeURIComponent(e.message || "Upgrade failed");
    return NextResponse.redirect(new URL(`/admin/billing?error=${msg}`, req.url), 303);
  }
}
