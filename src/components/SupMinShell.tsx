"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Shield, LayoutDashboard, Building2, Gift, UserCog, FileText, BarChart3, LogOut, Settings, Store } from "lucide-react";

const nav = [
  { href: "/sup-min/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/sup-min/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/sup-min/merchants", label: "Merchants", icon: Store },
  { href: "/sup-min/rewards", label: "Platform Rewards", icon: Gift },
  { href: "/sup-min/admins", label: "Admins", icon: UserCog },
  { href: "/sup-min/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/sup-min/audit", label: "Audit Log", icon: FileText },
  { href: "/sup-min/platform-settings", label: "Settings", icon: Settings },
];

export default function SupMinShell({ children, adminEmail }: { children: React.ReactNode; adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/sup-min/logout", { method: "POST" });
    router.push("/sup-min");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-gray-900 text-gray-300 flex-col hidden md:flex">
        <Link href="/sup-min/dashboard" className="flex items-center gap-2 px-5 h-14 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-white">Cherishu Admin</span>
        </Link>
        <div className="p-3">
          <div className="px-2 pt-2 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wide">Platform</div>
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/sup-min/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? "bg-indigo-600 text-white font-medium" : "text-gray-300 hover:bg-gray-800"}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-3 border-t border-gray-800">
          <div className="px-1 text-xs text-gray-500 mb-2">Signed in as</div>
          <div className="px-1 text-sm text-gray-200 truncate mb-3">{adminEmail}</div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-xs">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="md:hidden bg-gray-900 text-white h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /><span className="font-bold">Admin</span>
          </div>
          <button onClick={logout} className="text-gray-400"><LogOut className="w-4 h-4" /></button>
        </div>
        {children}
      </main>
    </div>
  );
}
