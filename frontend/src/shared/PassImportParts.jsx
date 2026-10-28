import React, { useState } from "react";
import { IMPORT_COLUMNS } from "./passesExcel";

// Neutral styling so these fit both the classic (V1) and new (V2) designs

const IMPORT_STATUS = {
  new: { label: "New", summary: "new", className: "bg-emerald-100 text-emerald-700" },
  update: { label: "Will update", summary: "to update", className: "bg-sky-100 text-sky-700" },
  unchanged: { label: "No change", summary: "unchanged", className: "bg-slate-100 text-slate-600" },
  skip: { label: "Exists, skipped", summary: "skipped (already exist)", className: "bg-amber-100 text-amber-800" },
  error: { label: "Problem", summary: "with problems", className: "bg-rose-100 text-rose-700" },
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${IMPORT_STATUS[status].className}`}>
    {IMPORT_STATUS[status].label}
  </span>
);

export const FormatTable = () => (
  <div className="overflow-x-auto rounded-lg border border-slate-200">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="px-3 py-2 font-semibold">Column</th>
          <th className="px-3 py-2 font-semibold">Required</th>
          <th className="px-3 py-2 font-semibold">Example</th>
          <th className="hidden px-3 py-2 font-semibold sm:table-cell">Notes</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {IMPORT_COLUMNS.map((c) => (
          <tr key={c.key}>
            <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">{c.header}</td>
            <td className="px-3 py-2 text-slate-600">{c.required ? "Yes" : "No"}</td>
            <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-700">{c.example}</td>
            <td className="hidden px-3 py-2 text-slate-500 sm:table-cell">{c.help}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ImportSummary = ({ summary }) => (
  <div className="flex flex-wrap gap-2">
    {Object.keys(IMPORT_STATUS)
      .filter((status) => summary[status] > 0)
      .map((status) => (
        <span key={status} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${IMPORT_STATUS[status].className}`}>
          {summary[status]} {IMPORT_STATUS[status].summary}
        </span>
      ))}
  </div>
);

const MAX_VISIBLE = 200;

export const PreviewTable = ({ rows }) => {
  const counts = rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  const [chosen, setFilter] = useState(counts.error ? "error" : "all");
  const filter = counts[chosen] ? chosen : "all"; // e.g. after switching Skip/Update the old filter may be empty
  const filters = ["all", ...Object.keys(IMPORT_STATUS).filter((s) => counts[s])];
  const visible = (filter === "all" ? rows : rows.filter((r) => r.status === filter)).slice(0, MAX_VISIBLE);
  const total = filter === "all" ? rows.length : counts[filter] || 0;

  return (
    <div>
      {filters.length > 2 && (
        <div className="mb-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter rows">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                filter === f ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? `All (${rows.length})` : `${IMPORT_STATUS[f].label} (${counts[f]})`}
            </button>
          ))}
        </div>
      )}
      <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Row</th>
              <th className="px-3 py-2 font-semibold">Elixir ID</th>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="hidden px-3 py-2 font-semibold md:table-cell">Department</th>
              <th className="hidden px-3 py-2 font-semibold md:table-cell">Designation</th>
              <th className="px-3 py-2 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((r) => (
              <tr key={r.row} className="align-top">
                <td className="px-3 py-2 tabular-nums text-slate-500">{r.row}</td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">{r.elixirPassId || "—"}</td>
                <td className="px-3 py-2 text-slate-800">{r.name || "—"}</td>
                <td className="hidden px-3 py-2 text-slate-600 md:table-cell">{r.department || "—"}</td>
                <td className="hidden px-3 py-2 text-slate-600 md:table-cell">{r.designation || "—"}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={r.status} />
                  {(r.message || r.note) && (
                    <p className="mt-1 text-xs text-slate-500">{[r.message, r.note].filter(Boolean).join(" · ")}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > MAX_VISIBLE && (
        <p className="mt-2 text-xs text-slate-500">
          Showing the first {MAX_VISIBLE} of {total} rows.
        </p>
      )}
    </div>
  );
};
