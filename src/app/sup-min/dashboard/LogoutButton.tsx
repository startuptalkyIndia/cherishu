"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SupMinLogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/sup-min/logout", { method: "POST" });
    router.push("/sup-min");
  }
  return (
    <button onClick={logout} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
      <LogOut className="w-4 h-4" /> Sign out
    </button>
  );
}
