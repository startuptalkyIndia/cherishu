"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Package, ClipboardList } from "lucide-react";

type P = { id: string; name: string; providerSku: string | null; pointsCost: number; currencyValue: number | null; isActive: boolean; type: string };
type O = { id: string; ref: string; userName: string; userEmail: string; productName: string; status: string; commission: number; points: number; createdAt: string };

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  FULFILLED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function MerchantDetail({ merchantId, products: initProducts, orders }: { merchantId: string; products: P[]; orders: O[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"catalog" | "orders">("catalog");
  const [products, _setProducts] = useState(initProducts);
  const [csv, setCsv] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function importCatalog() {
    setImporting(true); setResult(null);
    const res = await fetch(`/api/sup-min/merchants/${merchantId}/catalog`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csv,
    });
    const data = await res.json();
    setImporting(false);
    setResult(data);
    if (res.ok) {
      setCsv("");
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
        <button onClick={() => setTab("catalog")} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${tab === "catalog" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
          <Package className="w-4 h-4" /> Catalog ({products.length})
        </button>
        <button onClick={() => setTab("orders")} className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${tab === "orders" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
          <ClipboardList className="w-4 h-4" /> Orders ({orders.length})
        </button>
      </div>

      {tab === "catalog" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Upload className="w-4 h-4 text-indigo-600" /> Bulk import from CSV</h3>
            <p className="text-xs text-gray-500 mb-3">Paste the merchant's product feed. Columns: <code className="bg-gray-100 px-1 rounded">name,sku,description,pointsCost,currencyValue,currency,type,imageUrl,category,featured</code>. type = GIFT_CARD | EXPERIENCE | MERCHANDISE | CASHBACK | CHARITY | CUSTOM_SWAG | VOUCHER | SUBSCRIPTION | TRAVEL.</p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8} placeholder={"name,sku,description,pointsCost,currencyValue,currency,type,imageUrl,category,featured\nRed Roses Bouquet,FNP-RR-001,Dozen red roses hand-tied,799,799,INR,MERCHANDISE,,Flowers,true"} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono" />
            <div className="flex justify-between items-center mt-3">
              <div>
                {result && (
                  <div className="text-sm">
                    <span className="text-green-700 font-medium">+{result.created} added</span>
                    {result.skipped > 0 && <span className="text-yellow-600 ml-2">· {result.skipped} skipped</span>}
                    {result.errors?.length > 0 && <span className="text-red-600 ml-2">· {result.errors.length} errors</span>}
                  </div>
                )}
              </div>
              <button onClick={importCatalog} disabled={importing || !csv.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import
              </button>
            </div>
            {result?.errors?.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto text-xs bg-red-50 text-red-700 rounded-lg p-3">
                <ul className="list-disc pl-4 space-y-0.5">
                  {result.errors.slice(0, 20).map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Product</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">SKU</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Type</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Cost</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Value</th>
                  <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-900 font-medium">{p.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-700"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.providerSku || "—"}</code></td>
                    <td className="px-3 py-3 text-sm text-gray-700">{p.type}</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{p.pointsCost} pts</td>
                    <td className="px-3 py-3 text-sm text-gray-700">{p.currencyValue ? `₹${p.currencyValue}` : "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-gray-500">No products yet. Import a catalog above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Ref</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Recipient</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Product</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Points</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Commission</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">Status</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-xs uppercase">When</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-xs font-mono text-gray-700">{o.ref}</td>
                  <td className="px-3 py-3 text-sm text-gray-900">{o.userName}<div className="text-xs text-gray-500">{o.userEmail}</div></td>
                  <td className="px-3 py-3 text-sm text-gray-700">{o.productName}</td>
                  <td className="px-3 py-3 text-sm text-gray-700">{o.points}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-green-700">₹{o.commission.toFixed(0)}</td>
                  <td className="px-3 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[o.status]}`}>{o.status}</span></td>
                  <td className="px-3 py-3 text-xs text-gray-500">{o.createdAt}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-gray-500">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
