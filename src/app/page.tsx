import Link from "next/link";
import { Heart, Gift, Trophy, Users, Sparkles, ArrowRight, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Heart className="w-4 h-4" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900">Cherishu</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#rewards" className="text-gray-600 hover:text-gray-900">Rewards</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">Sign in</Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Trusted by modern teams
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
          Recognize. Reward.<br />
          <span className="text-indigo-600">Retain.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Cherishu makes it effortless to celebrate your team&apos;s wins with peer-to-peer recognition,
          points, and a world-class rewards catalog — from gift cards to experiences.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
            Start free trial <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 border border-gray-300">
            See demo
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">No credit card required · Free forever plan</p>
      </section>

      {/* Feature grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Heart, title: "Peer Recognition", desc: "Send kudos with points, emojis, and company values baked in." },
            { icon: Gift, title: "Global Rewards", desc: "Gift cards, experiences, merchandise, cashback & charity — 100+ brands." },
            { icon: Trophy, title: "Leaderboards", desc: "Gamify culture with monthly leaderboards and spotlight awards." },
            { icon: Users, title: "Multi-Workspace", desc: "Each company gets an isolated workspace with its own values & budgets." },
            { icon: Sparkles, title: "Provider Agnostic", desc: "Plug in Xoxoday, Tremendous, Amazon Incentives — or fulfill manually." },
            { icon: Check, title: "HR Analytics", desc: "Budget tracking, engagement heatmaps, redemption reports." },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rewards strip */}
      <section id="rewards" className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Every reward type. Every integration.
          </h2>
          <p className="mt-4 text-indigo-100 max-w-2xl mx-auto">
            Gift cards · Experiences · Merchandise · Cashback · Charity · Custom swag · Subscriptions · Travel
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap text-sm text-indigo-50">
            <span className="px-4 py-2 bg-white/10 rounded-full">Xoxoday</span>
            <span className="px-4 py-2 bg-white/10 rounded-full">Tremendous</span>
            <span className="px-4 py-2 bg-white/10 rounded-full">Amazon Incentives</span>
            <span className="px-4 py-2 bg-white/10 rounded-full">Giftbit</span>
            <span className="px-4 py-2 bg-white/10 rounded-full">Manual fulfillment</span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900">Simple, transparent pricing</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Free", price: "₹0", desc: "Up to 10 users", features: ["Peer recognition", "Basic leaderboard", "Manual rewards"] },
            { name: "Pro", price: "₹199", desc: "per user / month", features: ["Everything in Free", "Real rewards catalog", "All integrations", "HR analytics", "Company values & badges"], popular: true },
            { name: "Enterprise", price: "Custom", desc: "For 200+ teams", features: ["Everything in Pro", "SSO / SCIM", "Custom integrations", "Dedicated support", "SLA"] },
          ].map((p, i) => (
            <div key={i} className={`rounded-xl border p-6 ${p.popular ? "border-indigo-600 ring-2 ring-indigo-600" : "border-gray-200 bg-white"}`}>
              {p.popular && <div className="inline-block px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full mb-2">Most popular</div>}
              <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
              <div className="mt-2"><span className="text-3xl font-bold text-gray-900">{p.price}</span></div>
              <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 block text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
            <Heart className="w-3 h-3" fill="currentColor" />
          </div>
          <span className="font-semibold text-gray-900">Cherishu</span>
        </div>
        © 2026 Cherishu. A TalkyTools product.
      </footer>
    </div>
  );
}
