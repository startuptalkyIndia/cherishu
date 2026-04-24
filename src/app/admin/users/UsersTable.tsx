"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

type U = { id: string; name: string; email: string; role: string; jobTitle: string | null; department: string | null; giveablePoints: number; redeemablePoints: number; isActive: boolean; createdAt: string };

export default function UsersTable({ initialUsers }: { initialUsers: U[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", jobTitle: "", department: "", giveablePoints: 500 });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error || "Failed");
    setUsers([data.user, ...users]);
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "EMPLOYEE", jobTitle: "", department: "", giveablePoints: 500 });
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    if (res.ok) setUsers(users.map((u) => u.id === id ? { ...u, isActive: !isActive } : u));
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add user
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Email</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Role</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Title</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Give / Earn</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm text-gray-900 font-medium">{u.name}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{u.email}</td>
                <td className="px-3 py-3 text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-gray-700">{u.jobTitle || "—"}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{u.giveablePoints} / {u.redeemablePoints}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => toggleActive(u.id, u.isActive)} className="text-xs text-indigo-600 hover:text-indigo-800">
                    {u.isActive ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add new user</h3>
            <form onSubmit={invite} className="space-y-3">
              <FormInput label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <FormInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <FormInput label="Temporary password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR_ADMIN">HR Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Job title" value={form.jobTitle} onChange={(v) => setForm({ ...form, jobTitle: v })} />
                <FormInput label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
              </div>
              <FormInput label="Starting giveable points" type="number" value={String(form.giveablePoints)} onChange={(v) => setForm({ ...form, giveablePoints: parseInt(v || "0") })} />
              {err && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{err}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-300">Cancel</button>
                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add user
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function FormInput({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}
