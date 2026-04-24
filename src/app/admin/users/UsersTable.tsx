"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Upload, Download, Zap } from "lucide-react";

type U = { id: string; name: string; email: string; role: string; jobTitle: string | null; department: string | null; giveablePoints: number; redeemablePoints: number; isActive: boolean; createdAt: string };

export default function UsersTable({ initialUsers }: { initialUsers: U[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", jobTitle: "", department: "", giveablePoints: 500 });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [csv, setCsv] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [topup, setTopup] = useState({ amount: 500, scope: "giveable" });

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
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

  async function bulkImport() {
    setLoading(true);
    const res = await fetch("/api/admin/users/import", { method: "POST", headers: { "Content-Type": "text/csv" }, body: csv });
    const data = await res.json();
    setLoading(false);
    setImportResult(data);
    router.refresh();
  }

  async function bulkTopup() {
    setLoading(true);
    const res = await fetch("/api/admin/users/topup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(topup) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setTopupOpen(false);
      router.refresh();
      setUsers(users.map(u => ({ ...u, [topup.scope === "giveable" ? "giveablePoints" : "redeemablePoints"]: (topup.scope === "giveable" ? u.giveablePoints : u.redeemablePoints) + topup.amount })));
    }
  }

  return (
    <>
      <div className="flex justify-end mb-3 gap-2 flex-wrap">
        <button onClick={() => setTopupOpen(true)} className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Bulk top-up
        </button>
        <button onClick={() => setImportOpen(true)} className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import CSV
        </button>
        <a href="/api/admin/export?type=users" className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export
        </a>
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
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Dept / Title</th>
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
                <td className="px-3 py-3 text-xs text-gray-600">{u.department || "—"} · {u.jobTitle || "—"}</td>
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
        <Modal onClose={() => setOpen(false)} title="Add new user">
          <form onSubmit={invite} className="space-y-3">
            <F label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <F label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <F label="Temporary password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR_ADMIN">HR Admin</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Job title" value={form.jobTitle} onChange={(v) => setForm({ ...form, jobTitle: v })} />
              <F label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
            </div>
            <F label="Starting giveable pts" type="number" value={String(form.giveablePoints)} onChange={(v) => setForm({ ...form, giveablePoints: parseInt(v || "0") })} />
            {err && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{err}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-300">Cancel</button>
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add user
              </button>
            </div>
          </form>
        </Modal>
      )}

      {importOpen && (
        <Modal onClose={() => { setImportOpen(false); setImportResult(null); }} title="Bulk import users">
          {!importResult ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Paste CSV with columns: <code className="bg-gray-100 px-1 rounded text-xs">name,email,password,role,jobTitle,department</code>. One user per row. Password must be at least 6 chars.
              </p>
              <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={10} placeholder="name,email,password,role,jobTitle,department&#10;Jane Doe,jane@co.com,Welcome1,EMPLOYEE,Engineer,Engineering" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setImportOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-300">Cancel</button>
                <button onClick={bulkImport} disabled={loading || !csv.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Import
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <p className="text-gray-900 font-medium">Imported: <span className="text-green-600">{importResult.created}</span></p>
              <p className="text-gray-900 font-medium">Skipped: <span className="text-yellow-600">{importResult.skipped}</span></p>
              {importResult.errors?.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <p className="font-medium text-red-600">Errors:</p>
                  <ul className="text-xs text-red-600 list-disc pl-4">
                    {importResult.errors.slice(0, 20).map((e: string, i: number) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button onClick={() => { setImportOpen(false); setImportResult(null); setCsv(""); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Done</button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {topupOpen && (
        <Modal onClose={() => setTopupOpen(false)} title="Bulk points top-up">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Add points to every active user in this workspace.</p>
            <F label="Amount (points)" type="number" value={String(topup.amount)} onChange={(v) => setTopup({ ...topup, amount: parseInt(v || "0") })} />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Add to wallet</label>
              <select value={topup.scope} onChange={(e) => setTopup({ ...topup, scope: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="giveable">Giveable (monthly budget)</option>
                <option value="redeemable">Redeemable (earned/reward)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setTopupOpen(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm border border-gray-300">Cancel</button>
              <button onClick={bulkTopup} disabled={loading || !topup.amount} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Top-up
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function F({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}
