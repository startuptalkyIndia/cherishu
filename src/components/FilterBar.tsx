"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";

export type FilterOption = { label: string; value: string };
export type FilterSpec = {
  key: string;
  label: string;
  options: FilterOption[]; // first option's value="" = "All"
};

/**
 * URL-driven filter bar. Each filter + search + page lives as a query param.
 * Server-side pages read `searchParams` and build Prisma `where` clauses.
 */
export default function FilterBar({
  searchPlaceholder,
  searchKey = "q",
  filters = [],
  sort,
  total,
  pageSize = 50,
  children,
}: {
  searchPlaceholder?: string;
  searchKey?: string;
  filters?: FilterSpec[];
  sort?: { key: string; label: string; options: FilterOption[] };
  total?: number;
  pageSize?: number;
  children?: React.ReactNode; // right-side actions (export, add, etc.)
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [searchValue, setSearchValue] = useState(params.get(searchKey) || "");

  // Debounce search
  useEffect(() => {
    const current = params.get(searchKey) || "";
    if (searchValue === current) return;
    const t = setTimeout(() => setParam(searchKey, searchValue), 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      if (key !== "page") next.delete("page"); // reset to page 1 when filters change
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const clearAll = useCallback(() => {
    setSearchValue("");
    router.push(pathname);
  }, [pathname, router]);

  const anyActive =
    !!searchValue ||
    filters.some((f) => params.get(f.key)) ||
    (sort && params.get(sort.key));

  const page = parseInt(params.get("page") || "1");
  const pageCount = total !== undefined ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const hasPagination = total !== undefined && total > pageSize;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {searchPlaceholder && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchValue && (
              <button onClick={() => setSearchValue("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {filters.map((f) => {
          const val = params.get(f.key) || "";
          return (
            <div key={f.key} className="relative">
              <select
                value={val}
                onChange={(e) => setParam(f.key, e.target.value)}
                className={`appearance-none border rounded-lg pl-3 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${val ? "border-indigo-300 bg-indigo-50 text-indigo-700 font-medium" : "border-gray-300 text-gray-700"}`}
              >
                {f.options.map((o) => (
                  <option key={o.value || "_all"} value={o.value}>
                    {o.value ? `${f.label}: ${o.label}` : o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          );
        })}

        {sort && (
          <div className="relative">
            <select
              value={params.get(sort.key) || sort.options[0]?.value || ""}
              onChange={(e) => setParam(sort.key, e.target.value)}
              className="appearance-none border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-gray-700"
            >
              {sort.options.map((o) => (
                <option key={o.value} value={o.value}>{sort.label}: {o.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {anyActive && (
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {typeof total === "number" && (
            <span className="text-xs text-gray-500">
              {total.toLocaleString()} {total === 1 ? "result" : "results"}
            </span>
          )}
          {children}
        </div>
      </div>

      {hasPagination && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Page {page} of {pageCount} · Showing {Math.min(pageSize, total - (page - 1) * pageSize)} of {total.toLocaleString()}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setParam("page", String(page - 1))}
              disabled={page <= 1}
              className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => setParam("page", String(page + 1))}
              disabled={page >= pageCount}
              className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Server-side helper: parse searchParams for a paginated query.
 */
export function parseListParams(sp: Record<string, string | string[] | undefined>, defaults: { pageSize?: number } = {}) {
  const pageSize = defaults.pageSize || 50;
  const page = Math.max(1, parseInt((sp.page as string) || "1"));
  const q = ((sp.q as string) || "").trim();
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize, q };
}
