"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Check } from "lucide-react";

type Props = {
  name: string;
  jobTitle: string | null;
  department: string | null;
};

export default function ProfileEditForm({ name, jobTitle, department }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name, jobTitle: jobTitle || "", department: department || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name || undefined,
        jobTitle: form.jobTitle || null,
        department: form.department || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed to save");
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
      router.refresh();
    }, 1200);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit profile
      </button>
    );
  }

  return (
    <form onSubmit={save} className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900">Edit your profile</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-xs">Cancel</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field
          label="Display name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          required
        />
        <Field
          label="Job title"
          value={form.jobTitle}
          onChange={(v) => setForm({ ...form, jobTitle: v })}
          placeholder="e.g. Senior Engineer"
        />
        <Field
          label="Department"
          value={form.department}
          onChange={(v) => setForm({ ...form, department: v })}
          placeholder="e.g. Engineering"
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || saved}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <Check className="w-4 h-4" />}
          {saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
