import { prisma } from "@/lib/prisma";
import PlatformSettingsForm from "./PlatformSettingsForm";

export const dynamic = "force-dynamic";

export default async function PlatformSettingsPage() {
  const settings = await prisma.platformSetting.findMany({ where: { key: { in: ["resend_api_key", "email_from", "email_base_url", "razorpay_key_id", "razorpay_key_secret", "razorpay_webhook_secret", "razorpay_plan_pro"] } } });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Global configuration for email, integrations, and platform behavior.</p>
      <PlatformSettingsForm
        apiKey={map.resend_api_key || ""}
        from={map.email_from || ""}
        baseUrl={map.email_base_url || ""}
        rzpKeyId={map.razorpay_key_id || ""}
        rzpKeySecret={map.razorpay_key_secret || ""}
        rzpWebhookSecret={map.razorpay_webhook_secret || ""}
        rzpPlanPro={map.razorpay_plan_pro || ""}
      />
    </div>
  );
}
