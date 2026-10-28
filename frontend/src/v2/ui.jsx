import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuCircleX,
  LuEye,
  LuEyeOff,
  LuInfo,
  LuLoaderCircle,
  LuTriangleAlert,
} from "react-icons/lu";
import { cx, inputClass } from "./cx";

const BUTTON_VARIANTS = {
  primary: "bg-teal-600 text-white shadow-sm hover:bg-teal-700 focus-visible:ring-teal-500",
  secondary: "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400",
  subtle: "bg-teal-50 text-teal-700 hover:bg-teal-100 focus-visible:ring-teal-500",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
};

const BUTTON_SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-14 px-6 text-base",
};

export const Button = ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }) => (
  <button
    type="button"
    disabled={disabled || loading}
    className={cx(
      "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition cursor-pointer",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      BUTTON_VARIANTS[variant],
      BUTTON_SIZES[size],
      className
    )}
    {...props}
  >
    {loading && <LuLoaderCircle className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

export const Card = ({ className, children, ...props }) => (
  <div className={cx("rounded-2xl border border-slate-200 bg-white shadow-sm", className)} {...props}>
    {children}
  </div>
);

export const Field = ({ label, htmlFor, hint, children }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </div>
);

export const Input = ({ className, ...props }) => <input className={cx(inputClass, className)} {...props} />;

export const PasswordInput = ({ className, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} className={cx(inputClass, "pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        {visible ? <LuEyeOff className="h-5 w-5" /> : <LuEye className="h-5 w-5" />}
      </button>
    </div>
  );
};

const ALERT_TONES = {
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-800", Icon: LuCircleCheck },
  error: { box: "border-rose-200 bg-rose-50 text-rose-800", Icon: LuCircleX },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", Icon: LuTriangleAlert },
  info: { box: "border-sky-200 bg-sky-50 text-sky-800", Icon: LuInfo },
};

export const Alert = ({ tone = "info", title, children, className }) => {
  const { box, Icon } = ALERT_TONES[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex gap-3 rounded-xl border p-3 text-sm", box, className)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
    </div>
  );
};

const BADGE_TONES = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-rose-100 text-rose-700",
  teal: "bg-teal-100 text-teal-700",
  slate: "bg-slate-100 text-slate-600",
};

export const Badge = ({ tone = "slate", children, className }) => (
  <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", BADGE_TONES[tone], className)}>
    {children}
  </span>
);

export const Spinner = ({ className }) => <LuLoaderCircle className={cx("animate-spin text-teal-600", className || "h-6 w-6")} />;

export const StatCard = ({ label, value, hint, icon: Icon, accent = "teal" }) => {
  const accents = {
    teal: "bg-teal-50 text-teal-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={cx("flex h-9 w-9 items-center justify-center rounded-xl", accents[accent])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
};

export const PageHeader = ({ title, subtitle, actions, back }) => (
  <div className="mb-5">
    {back && (
      <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <LuArrowLeft className="h-4 w-4" /> {back.label}
      </Link>
    )}
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export const SegmentedControl = ({ options, value, onChange, label }) => (
  <div role="tablist" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-slate-100 p-1">
    {options.map(({ value: v, label: optionLabel, icon: Icon }) => (
      <button
        key={v}
        type="button"
        role="tab"
        aria-selected={value === v}
        onClick={() => onChange(v)}
        className={cx(
          "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition cursor-pointer",
          value === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {optionLabel}
      </button>
    ))}
  </div>
);

export const ProgressBar = ({ value, max, className }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
};

export const Avatar = ({ name = "", className }) => (
  <span className={cx("flex shrink-0 items-center justify-center rounded-full bg-teal-600 font-semibold uppercase text-white", className || "h-9 w-9 text-sm")}>
    {name.slice(0, 2)}
  </span>
);
