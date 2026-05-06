"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Send, Gift, Trophy, Users, Settings, LogOut, Sparkles, Award, ClipboardList, Coins, Bell, MoreHorizontal, X, ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

type NavItem = { href: string; label: string; icon: any; badge?: number };

const employeeNav: NavItem[] = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/dashboard/send", label: "Send Kudos", icon: Send },
  { href: "/dashboard/nominate", label: "Nominate", icon: Award },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
  { href: "/dashboard/redemptions", label: "My Redemptions", icon: ClipboardList },
  { href: "/dashboard/profile", label: "My Profile", icon: Users },
];

const managerExtras: NavItem[] = [
  { href: "/dashboard/team", label: "My Team", icon: Users },
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
  { href: "/admin/activity", label: "Activity Log", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// Mobile primary bar (4 most-used items; 5th slot = More drawer)
const mobileEmployeePrimary: NavItem[] = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/dashboard/send", label: "Send", icon: Send },
  { href: "/dashboard/nominate", label: "Nominate", icon: Award },
  { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
];
const mobileEmployeeMore: NavItem[] = [
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/redemptions", label: "My Redemptions", icon: ClipboardList },
  { href: "/dashboard/team", label: "My Team", icon: Users },
  { href: "/dashboard/profile", label: "My Profile", icon: Users },
];

const mobileAdminPrimary: NavItem[] = [
  { href: "/admin", label: "Overview", icon: Sparkles },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/nominations", label: "Reviews", icon: Award },
  { href: "/admin/redemptions", label: "Redemptions", icon: ClipboardList },
];
const mobileAdminMore: NavItem[] = [
  { href: "/admin/analytics", label: "Analytics", icon: Trophy },
  { href: "/admin/rewards", label: "Rewards Catalog", icon: Gift },
  { href: "/admin/values", label: "Values & Badges", icon: Sparkles },
  { href: "/admin/billing", label: "Billing", icon: Coins },
  { href: "/admin/activity", label: "Activity Log", icon: ClipboardList },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AppShell({
  children,
  user,
  section = "employee",
  pendingNominations = 0,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; workspaceName?: string; giveablePoints?: number; redeemablePoints?: number };
  section?: "employee" | "admin";
  pendingNominations?: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isManager = user.role === "MANAGER" || user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN";
  const nav = section === "admin" ? hrNav : (isManager ? [...employeeNav.slice(0, 3), ...managerExtras, ...employeeNav.slice(3)] : employeeNav);
  const canSeeAdmin = user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN";

  // Inject badge counts into sidebar nav + mobile primary bars
  const enrichedNav = nav.map(item =>
    item.href === "/admin/nominations" ? { ...item, badge: pendingNominations || undefined } : item
  );
  const mobilePrimary = (section === "admin" ? mobileAdminPrimary : mobileEmployeePrimary).map(item =>
    item.href === "/admin/nominations" ? { ...item, badge: pendingNominations || undefined } : item
  );
  const mobileMore = (section === "admin" ? mobileAdminMore : mobileEmployeeMore).map(item =>
    item.href === "/admin/nominations" ? { ...item, badge: pendingNominations || undefined } : item
  );
  // Hide "My Team" in More drawer for non-managers
  const filteredMore = mobileMore.filter(item =>
    item.href === "/dashboard/team" ? isManager : true
  );
  // Count how many More items are "active" to show badge on the More button
  const moreHasActive = filteredMore.some(item =>
    pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href))
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar — desktop only */}
      <aside className="w-60 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <Link href="/dashboard" className="flex items-center gap-2 px-5 h-14 border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Heart className="w-4 h-4" fill="currentColor" />
          </div>
          <span className="font-bold text-gray-900">Cherishu</span>
        </Link>

        <div className="p-3 flex-1 overflow-y-auto">
          <div className="px-2 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
            {section === "admin" ? "Admin" : user.workspaceName || "Workspace"}
          </div>
          <nav className="space-y-0.5">
            {enrichedNav.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="bg-rose-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
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
        <div className="p-3 border-t border-gray-200">
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
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium shrink-0">
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
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sticky top-0 z-30">
          <Link href={section === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
            </div>
            <div>
              <span className="font-bold text-gray-900">Cherishu</span>
              {section === "admin" && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">Admin</span>}
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {pendingNominations > 0 && (
              <Link href="/admin/nominations" className="relative text-gray-500">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingNominations > 9 ? "9+" : pendingNominations}
                </span>
              </Link>
            )}
            {canSeeAdmin && (
              <Link
                href={section === "admin" ? "/dashboard" : "/admin"}
                className="text-xs text-indigo-600 font-medium px-2 py-1 rounded bg-indigo-50"
              >
                {section === "admin" ? "Employee" : "Admin"}
              </Link>
            )}
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-gray-500 p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {children}

        {/* Mobile bottom navigation — primary 4 + More */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
          {mobilePrimary.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative ${active ? "text-indigo-600" : "text-gray-400"}`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge ? (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-600 rounded-full" />}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative ${moreOpen || moreHasActive ? "text-indigo-600" : "text-gray-400"}`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">More</span>
            {moreHasActive && !moreOpen && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-600 rounded-full" />}
          </button>
        </nav>

        {/* More drawer — slide-up panel with all remaining pages */}
        {moreOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setMoreOpen(false)}
            />
            {/* Panel */}
            <div className="md:hidden fixed bottom-[56px] left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 pb-2">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">All pages</span>
                <button onClick={() => setMoreOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-3 py-2 grid grid-cols-1 gap-0.5">
                {filteredMore.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-indigo-100" : "bg-gray-100"}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span className="bg-rose-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </Link>
                  );
                })}

                {/* Switch section */}
                {canSeeAdmin && (
                  <div className="mt-1 pt-2 border-t border-gray-100">
                    <Link
                      href={section === "admin" ? "/dashboard" : "/admin"}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-indigo-700 bg-indigo-50"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100">
                        {section === "admin" ? <Home className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                      </div>
                      <span className="flex-1 font-medium">{section === "admin" ? "Switch to Employee view" : "Switch to Admin panel"}</span>
                      <ChevronRight className="w-4 h-4 text-indigo-400" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
