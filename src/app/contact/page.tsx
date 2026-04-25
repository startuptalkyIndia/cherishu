import { Mail, MessageCircle, Calendar } from "lucide-react";
import MarketingShell from "@/components/MarketingShell";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact — Cherishu",
  description: "Talk to a real person about Cherishu. Demo requests, security paperwork, custom enterprise deals.",
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Let&apos;s talk</h1>
            <p className="mt-4 text-lg text-gray-600">
              Demo, custom pricing, security questionnaire, partnership — whatever it is, a real human reads every message and replies within a business day.
            </p>

            <div className="mt-10 space-y-5">
              <Channel icon={Calendar} title="Book a 20-minute demo" body="Walkthrough tailored to your team's size and use case. No prep work needed on your end." />
              <Channel icon={Mail} title="Email us directly" body={<>For sales: <a href="mailto:sales@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800 font-medium">sales@cherishu.talkytools.com</a><br/>For support: <a href="mailto:hello@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800 font-medium">hello@cherishu.talkytools.com</a><br/>For security: <a href="mailto:security@cherishu.talkytools.com" className="text-indigo-600 hover:text-indigo-800 font-medium">security@cherishu.talkytools.com</a></>} />
              <Channel icon={MessageCircle} title="Already a customer?" body="Existing workspaces can use the in-app chat (bottom right of every admin page). HR admins get priority response on Pro+ plans." />
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function Channel({ icon: Icon, title, body }: { icon: any; title: string; body: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="mt-1 text-sm text-gray-600">{body}</div>
      </div>
    </div>
  );
}
