import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import FilterBar from "@/components/FilterBar";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800",
  demo_booked: "bg-indigo-100 text-indigo-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-gray-100 text-gray-700",
};

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 30;
  const status = sp.status || "";
  const teamSize = sp.teamSize || "";
  const q = (sp.q || "").trim();

  const where: any = {};
  if (status) where.status = status;
  if (teamSize) where.teamSize = teamSize;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, total, byStatus] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
      <p className="text-sm text-gray-500 mt-0.5 mb-6">Demo requests + contact form submissions from the public site.</p>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { key: "new", label: "New" },
          { key: "contacted", label: "Contacted" },
          { key: "qualified", label: "Qualified" },
          { key: "demo_booked", label: "Demo booked" },
          { key: "converted", label: "Converted" },
          { key: "lost", label: "Lost" },
        ].map((s) => (
          <a key={s.key} href={`?status=${s.key}`} className={`bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition ${status === s.key ? "ring-2 ring-indigo-500" : ""}`}>
            <div className="text-2xl font-bold text-gray-900">{counts[s.key] || 0}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </a>
        ))}
      </div>

      <FilterBar
        searchPlaceholder="Search by name, email, company or message…"
        filters={[
          { key: "status", label: "Status", options: [
            { label: "All", value: "" },
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Qualified", value: "qualified" },
            { label: "Demo booked", value: "demo_booked" },
            { label: "Converted", value: "converted" },
            { label: "Lost", value: "lost" },
          ]},
          { key: "teamSize", label: "Size", options: [
            { label: "All", value: "" },
            { label: "<10", value: "<10" },
            { label: "10-50", value: "10-50" },
            { label: "50-200", value: "50-200" },
            { label: "200-1000", value: "200-1000" },
            { label: "1000+", value: "1000+" },
          ]},
        ]}
        total={total}
        pageSize={pageSize}
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Lead</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Company</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Size</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Message</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Source</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
              <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">When</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-sm">
                  <div className="font-medium text-gray-900">{l.name}</div>
                  <a href={`mailto:${l.email}`} className="text-xs text-indigo-600 hover:text-indigo-800">{l.email}</a>
                </td>
                <td className="px-3 py-3 text-sm text-gray-700">{l.company || "—"}</td>
                <td className="px-3 py-3 text-xs text-gray-600">{l.teamSize || "—"}</td>
                <td className="px-3 py-3 text-xs text-gray-600 max-w-md">
                  <div className="line-clamp-2">{l.message}</div>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {l.source}
                  {l.utmSource && <div className="text-gray-400">utm: {l.utmSource}</div>}
                </td>
                <td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[l.status] || statusBadge.new}`}>{l.status.replace("_", " ")}</span></td>
                <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDistanceToNow(l.createdAt, { addSuffix: true })}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-sm text-gray-500">
                {q || status || teamSize
                  ? <>No leads match these filters. <a href="/sup-min/leads" className="text-indigo-600 hover:text-indigo-800 font-medium">Clear</a></>
                  : "No leads yet. Public contact form posts here."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
