import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Heart className="w-4 h-4" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900">Cherishu</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/security" className="text-gray-600 hover:text-gray-900">Security</Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">Sign in</Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1">
              Start free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
              <span className="font-bold text-gray-900">Cherishu</span>
            </div>
            <p className="text-sm text-gray-600 max-w-sm">Employee rewards & recognition that actually gets used. Built for modern teams.</p>
            <p className="text-xs text-gray-400 mt-3">A TalkyTools product · Made in India 🇮🇳</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/features" className="hover:text-indigo-600">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-600">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-indigo-600">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/contact" className="hover:text-indigo-600">Contact sales</Link></li>
              <li><Link href="/faq" className="hover:text-indigo-600">FAQ</Link></li>
              <li><a href="https://talkytools.com" className="hover:text-indigo-600">More from TalkyTools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Get started</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/signup" className="hover:text-indigo-600">Create workspace</Link></li>
              <li><Link href="/login" className="hover:text-indigo-600">Sign in</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-600">Request demo</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 py-5 text-center text-xs text-gray-500 flex items-center justify-center gap-4 flex-wrap">
          <span>© 2026 Cherishu. All rights reserved.</span>
          <span className="text-gray-300">·</span>
          <Link href="/privacy" className="hover:text-indigo-600">Privacy</Link>
          <Link href="/terms" className="hover:text-indigo-600">Terms</Link>
          <Link href="/refund" className="hover:text-indigo-600">Refund</Link>
        </div>
      </footer>
    </div>
  );
}
