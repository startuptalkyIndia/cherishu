import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import Footer from "./Footer";

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

      <Footer />
    </div>
  );
}
