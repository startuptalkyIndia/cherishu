import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MerchantDetail from "./MerchantDetail";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { id },
    include: {
      rewards: { orderBy: { createdAt: "desc" }, take: 50 },
      redemptions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { name: true, email: true } },
          reward: { select: { name: true } },
        },
      },
    },
  });
  if (!merchant) return notFound();

  const earnings = await prisma.redemption.aggregate({
    where: { merchantId: id },
    _sum: { commissionEarned: true },
    _count: true,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link href="/sup-min/merchants" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to merchants
      </Link>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{merchant.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{merchant.slug}</code>
            <span className="ml-2">· {merchant.contactEmail}</span>
            <span className="ml-2">· {merchant.commissionPercent}% commission</span>
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Stat label="Products" value={merchant.rewards.length} />
          <Stat label="Orders" value={earnings._count} />
          <Stat label="Commission earned" value={`₹${(earnings._sum.commissionEarned || 0).toFixed(0)}`} />
        </div>
      </div>

      <MerchantDetail
        merchantId={merchant.id}
        products={merchant.rewards.map((r) => ({
          id: r.id, name: r.name, providerSku: r.providerSku, pointsCost: r.pointsCost,
          currencyValue: r.currencyValue, isActive: r.isActive, type: r.type,
        }))}
        orders={merchant.redemptions.map((r) => ({
          id: r.id, ref: `CHR-${r.id.slice(-8).toUpperCase()}`,
          userName: r.user.name, userEmail: r.user.email,
          productName: r.reward.name, status: r.status,
          commission: r.commissionEarned, points: r.pointsSpent,
          createdAt: formatDistanceToNow(r.createdAt, { addSuffix: true }),
        }))}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}
