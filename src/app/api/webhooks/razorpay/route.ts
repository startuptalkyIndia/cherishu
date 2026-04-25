import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpayConfig, verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook handler. Configure this URL in your Razorpay dashboard:
 *   https://cherishu.talkytools.com/api/webhooks/razorpay
 * Subscribe to events: subscription.activated, subscription.charged,
 * subscription.halted, subscription.cancelled, subscription.completed,
 * subscription.paused, subscription.resumed, payment.captured, payment.failed.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const cfg = await getRazorpayConfig();
  if (!cfg.webhookSecret) {
    console.warn("[rzp-webhook] webhook secret not configured — rejecting");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!verifyWebhookSignature(raw, signature, cfg.webhookSecret)) {
    console.warn("[rzp-webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: any;
  try { payload = JSON.parse(raw); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event as string;
  const sub = payload.payload?.subscription?.entity || null;
  const payment = payload.payload?.payment?.entity || null;

  const subId = sub?.id || payment?.subscription_id;
  const subscription = subId
    ? await prisma.subscription.findUnique({ where: { razorpaySubscriptionId: subId } })
    : null;

  await prisma.paymentEvent.create({
    data: {
      subscriptionId: subscription?.id || null,
      workspaceId: subscription?.workspaceId || null,
      eventType: event,
      amount: payment?.amount ? payment.amount / 100 : null,
      currency: payment?.currency || "INR",
      rawPayload: payload,
    },
  });

  if (!subscription) return NextResponse.json({ ok: true, noted: true });

  // State machine for subscription lifecycle
  const mapState: Record<string, any> = {
    "subscription.activated": { status: "ACTIVE", currentPeriodStart: sub?.current_start ? new Date(sub.current_start * 1000) : undefined, currentPeriodEnd: sub?.current_end ? new Date(sub.current_end * 1000) : undefined },
    "subscription.charged": { status: "ACTIVE", currentPeriodStart: sub?.current_start ? new Date(sub.current_start * 1000) : undefined, currentPeriodEnd: sub?.current_end ? new Date(sub.current_end * 1000) : undefined },
    "subscription.halted": { status: "PAST_DUE" },
    "subscription.paused": { status: "PAUSED" },
    "subscription.resumed": { status: "ACTIVE" },
    "subscription.cancelled": { status: "CANCELLED", cancelledAt: new Date() },
    "subscription.completed": { status: "EXPIRED" },
  };
  const update = mapState[event];
  if (update) {
    await prisma.subscription.update({ where: { id: subscription.id }, data: update });
    // If subscription is now ACTIVE or TRIAL — keep workspace on pro.
    // If cancelled/expired — drop back to free.
    if (event === "subscription.cancelled" || event === "subscription.completed") {
      await prisma.workspace.update({ where: { id: subscription.workspaceId }, data: { plan: "free", seatLimit: 10 } });
    }
  }

  return NextResponse.json({ ok: true });
}
