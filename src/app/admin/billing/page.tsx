import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS, planFor, seatsRemaining } from "@/lib/plans";
import BillingClient from "./BillingClient";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return null;

  const [workspace, seatCount, subscription] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: admin.workspaceId } }),
    prisma.user.count({ where: { workspaceId: admin.workspaceId, isActive: true, email: { not: { contains: "@demo." } } } }),
    prisma.subscription.findUnique({ where: { workspaceId: admin.workspaceId } }),
  ]);
  if (!workspace) return null;

  const currentPlan = planFor(workspace.plan);
  const remaining = seatsRemaining(workspace.plan, seatCount);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Manage your subscription and seats.</p>

      {/* Current plan */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="relative">
          <div className="text-xs font-medium text-indigo-200 uppercase tracking-wide mb-1">Current plan</div>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-3xl font-bold">{currentPlan.name}</h2>
            {currentPlan.pricePerSeatMonthly > 0 && (
              <span className="text-indigo-100">₹{currentPlan.pricePerSeatMonthly}/user/month</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div>
              <div className="text-xs text-indigo-200">Active seats</div>
              <div className="text-2xl font-semibold">{seatCount}{currentPlan.seatLimit ? ` / ${currentPlan.seatLimit}` : ""}</div>
              {remaining !== null && remaining <= 3 && remaining > 0 && (
                <div className="text-xs text-yellow-200 mt-1">{remaining} seat{remaining === 1 ? "" : "s"} left on Free</div>
              )}
              {remaining === 0 && (
                <div className="text-xs text-red-200 mt-1">Seat cap reached — upgrade to add more</div>
              )}
            </div>
            <div>
              <div className="text-xs text-indigo-200">Status</div>
              <div className="text-2xl font-semibold capitalize">{subscription?.status?.toLowerCase() || "Free"}</div>
              {subscription?.currentPeriodEnd && (
                <div className="text-xs text-indigo-200 mt-1">Renews {format(subscription.currentPeriodEnd, "MMM d, yyyy")}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-indigo-200">Monthly bill</div>
              <div className="text-2xl font-semibold">
                ₹{(currentPlan.pricePerSeatMonthly * seatCount).toLocaleString()}
              </div>
              <div className="text-xs text-indigo-200 mt-1">Based on current seat count</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan chooser */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose a plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(["free", "pro", "enterprise"] as const).map((key) => (
          <PlanCard key={key} plan={PLANS[key]} currentPlan={workspace.plan} workspaceId={workspace.id} />
        ))}
      </div>

      <BillingClient
        currentPlan={workspace.plan}
        subscriptionStatus={subscription?.status || null}
        seatCount={seatCount}
        workspaceId={workspace.id}
        billingEmail={workspace.billingEmail || admin.email}
      />
    </div>
  );
}

function PlanCard({ plan, currentPlan, workspaceId }: { plan: typeof PLANS[keyof typeof PLANS]; currentPlan: string; workspaceId: string }) {
  const isCurrent = plan.key === currentPlan;
  const isUpgrade = rankOf(plan.key) > rankOf(currentPlan as any);
  return (
    <div className={`rounded-xl border p-5 ${plan.featured && !isCurrent ? "border-indigo-600 ring-2 ring-indigo-600 bg-white" : "border-gray-200 bg-white"}`}>
      {isCurrent && <div className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full mb-2 font-medium">Current</div>}
      {!isCurrent && plan.featured && <div className="inline-block px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full mb-2 font-medium">Most popular</div>}
      <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
      <p className="text-xs text-gray-500 mt-0.5 mb-3">{plan.tagline}</p>
      <div className="mb-4">
        {plan.key === "enterprise" ? (
          <span className="text-2xl font-bold text-gray-900">Custom</span>
        ) : plan.pricePerSeatMonthly === 0 ? (
          <span className="text-2xl font-bold text-gray-900">₹0</span>
        ) : (
          <>
            <span className="text-3xl font-bold text-gray-900">₹{plan.pricePerSeatMonthly}</span>
            <span className="text-sm text-gray-500"> / user / month</span>
          </>
        )}
      </div>
      <ul className="space-y-1.5 mb-5">
        {plan.features.slice(0, 5).map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" clipRule="evenodd"/></svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <button disabled className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">Current plan</button>
      ) : plan.key === "enterprise" ? (
        <a href="mailto:enterprise@cherishu.talkytools.com?subject=Cherishu Enterprise interest" className="w-full block text-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Contact sales</a>
      ) : (
        <form action="/api/admin/billing/upgrade" method="POST">
          <input type="hidden" name="plan" value={plan.key} />
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <button type="submit" className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${isUpgrade ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"}`}>
            {isUpgrade ? plan.cta : `Downgrade to ${plan.name}`}
          </button>
        </form>
      )}
    </div>
  );
}

function rankOf(key: "free" | "pro" | "enterprise"): number {
  return { free: 0, pro: 1, enterprise: 2 }[key] ?? 0;
}
