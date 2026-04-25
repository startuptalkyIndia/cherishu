"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Send, Gift, Trophy, Users, Settings, LogOut, Sparkles, Award, ClipboardList, Coins } from "lucide-react";
import { signOut } from "next-auth/react";

type NavItem = { href: string; label: string; icon: any };

const employeeNav: NavItem[] = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/dashboard/send", label: "Send Kudos", icon: Send },
  { href: "/dashboard/nominate", label: "Nominate", icon: Award },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
  { href: "/dashboard/redemptions", label: "My Redemptions", icon: ClipboardList },
  { href: "/dashboard/profile", label: "My Profile", icon: Users },
];

const hrNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: Sparkles },
  { href: "/admin/analytics", label: "Analytics", icon: Trophy },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/rewards", label: "Rewards Catalog", icon: Gift },
  { href: "/admin/redemptions", label: "Redemptions", icon: ClipboardList },
  { href: "/admin/nominations", label: "Nominations", icon: Award },
  { href: "/admin/values", label: "Values & Badges", icon: Sparkles },
  { href: "/admin/billing", label: "Billing", icon: Coins },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AppShell({
  children,
  user,
  section = "employee",
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; workspaceName?: string; giveablePoints?: number; redeemablePoints?: number };
  section?: "employee" | "admin";
}) {
  const pathname = usePathname();
  const nav = section === "admin" ? hrNav : employeeNav;
  const canSeeAdmin = user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <Link href="/dashboard" className="flex items-center gap-2 px-5 h-14 border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Heart className="w-4 h-4" fill="currentColor" />
          </div>
          <span className="font-bold text-gray-900">Cherishu</span>
        </Link>

        <div className="p-3">
          <div className="px-2 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
            {section === "admin" ? "Admin" : user.workspaceName || "Workspace"}
          </div>
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {canSeeAdmin && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="px-2 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Switch</div>
              <Link
                href={section === "admin" ? "/dashboard" : "/admin"}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                {section === "admin" ? <Home className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                {section === "admin" ? "Back to Employee" : "Admin Panel"}
              </Link>
            </div>
          )}
        </div>

        {/* Points wallet */}
        <div className="mt-auto p-3 border-t border-gray-200">
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-indigo-700 font-medium mb-1">
              <span>Give</span>
              <span>{user.giveablePoints ?? 0} pts</span>
            </div>
            <div className="flex items-center justify-between text-xs text-indigo-700 font-medium">
              <span>Earn</span>
              <span>{user.redeemablePoints ?? 0} pts</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 px-1">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-gray-700 p-1 rounded"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
            </div>
            <span className="font-bold text-gray-900">Cherishu</span>
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
