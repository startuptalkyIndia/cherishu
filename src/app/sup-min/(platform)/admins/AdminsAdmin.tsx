"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Trash2 } from "lucide-react";

type A = { id: string; name: string; email: string; lastLoginAt: string | null; createdAt: string };

export default function AdminsAdmin({ initial }: { initial: A[] }) {
  const router = useRouter();
  const [admins, setAdmins] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    const res = await fetch("/api/sup-min/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error || "Failed");
    setAdmins([data.admin, ...admins]);
    setOpen(false);
    setForm({ name: "", email: "", password: "" });
    router.refresh();
  }

  async function remove(id: string) {
    if (admins.length <= 1) return alert("Cannot delete the last admin.");
    if (!confirm("Remove this admin?")) return;
    await fetch(`/api/sup-min/admins/${id}`, { method: "DELETE" });
    setAdmins(admins.filter(a => a.id !== id));
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add admin
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Email</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Last Login</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Created</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                <td className="px-3 py-3 text-sm text-gray-700">{a.email}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "never"}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => remove(a.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add platform admin</h3>
            <form onSubmit={create} className="space-y-3">
              <F label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <F label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <F label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
              {err && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{err}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-300">Cancel</button>
                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function F({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
