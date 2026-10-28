import React from "react";
import { LuCheck } from "react-icons/lu";

const ClassicPreview = () => (
  <div className="h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
    <div className="flex h-6 items-center gap-1 bg-teal-600 px-2">
      <span className="h-3 w-3 rounded-full bg-white/80" />
      <span className="h-1.5 w-16 rounded bg-white/70" />
    </div>
    <div className="mx-auto mt-2 w-3/4 space-y-1.5 rounded-md bg-white p-2 shadow">
      <span className="mx-auto block h-1.5 w-1/2 rounded bg-gray-300" />
      <span className="block h-10 rounded bg-gray-200" />
      <span className="block h-2.5 rounded bg-teal-600" />
      <span className="block h-2.5 rounded bg-teal-600" />
    </div>
  </div>
);

const ModernPreview = () => (
  <div className="relative h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
    <div className="flex h-6 items-center justify-between border-b border-slate-200 bg-white px-2">
      <span className="h-1.5 w-12 rounded bg-slate-300" />
      <span className="h-3 w-3 rounded-full bg-teal-500" />
    </div>
    <div className="mx-2 mt-2 flex gap-2">
      <div className="relative h-14 flex-1 rounded-xl bg-slate-800">
        <span className="absolute inset-3 rounded-md border-2 border-dashed border-teal-400" />
      </div>
      <div className="flex w-1/3 flex-col gap-1">
        <span className="h-6 rounded-lg bg-emerald-100 ring-1 ring-emerald-300" />
        <span className="h-3 rounded bg-slate-200" />
        <span className="h-3 rounded bg-slate-200" />
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-around border-t border-slate-200 bg-white">
      <span className="h-2 w-2 rounded-full bg-teal-500" />
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      <span className="h-2 w-2 rounded-full bg-slate-300" />
    </div>
  </div>
);

const OPTIONS = [
  {
    value: 1,
    label: "Version 1",
    title: "Classic",
    description: "The original design you already know.",
    Preview: ClassicPreview,
  },
  {
    value: 2,
    label: "Version 2",
    title: "New design",
    description: "Built for phones: bigger scan results, type-an-ID on the same screen, live stats.",
    Preview: ModernPreview,
    badge: "New",
  },
];

// Two selectable cards for choosing the UI design; used by first-login prompt and both Settings pages
const VersionPicker = ({ value, onSelect, disabled }) => (
  <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Design version">
    {OPTIONS.map((option) => {
      const { value: v, label, title, description, Preview, badge } = option;
      const selected = value === v;
      return (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={disabled}
          onClick={() => onSelect(v)}
          className={`relative rounded-2xl border-2 bg-white p-3 text-left transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
            selected ? "border-teal-600 ring-4 ring-teal-600/15" : "border-gray-200 hover:border-teal-300"
          }`}
        >
          <Preview />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
            {badge && (
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">{badge}</span>
            )}
          </div>
          <p className="mt-0.5 text-base font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
          {selected && (
            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
              <LuCheck className="h-4 w-4" />
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export default VersionPicker;
