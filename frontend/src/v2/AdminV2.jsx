import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LuActivity,
  LuChevronRight,
  LuDoorOpen,
  LuFileDown,
  LuFileUp,
  LuRefreshCw,
  LuRotateCcw,
  LuScanLine,
  LuTicket,
  LuUserPlus,
  LuUsers,
} from "react-icons/lu";
import api from "./api";
import { cx } from "./cx";
import { Alert, Avatar, Badge, Button, Card, PageHeader, Spinner, StatCard } from "./ui";
import usePolling from "./usePolling";
import { formatTimeIST, timeAgo } from "../shared/format";

const RESULT_BADGES = {
  entered: ["green", "Let in"],
  already_scanned: ["amber", "Already used"],
  not_found: ["red", "Not found"],
  wrong_day: ["red", "Wrong day"],
};

const ACTIONS = [
  { to: "/meraj/secret-pass-creation", title: "Create pass", desc: "New or special pass with QR", icon: LuTicket },
  { to: "/mrstm/secret-register", title: "Add scanner", desc: "Create a scanner account", icon: LuUserPlus },
  { to: "/mrstm/passes/import", title: "Import passes", desc: "Many at once from Excel or CSV", icon: LuFileUp },
  { to: "/mrstm/passes", title: "Download all", desc: "Excel with every pass + QR", icon: LuFileDown },
  { to: "/mrstm/free-entry", title: "Reset entries", desc: "Let someone back in", icon: LuRotateCcw },
  { to: "/scan", title: "Open scanner", desc: "Scan or type a pass ID", icon: LuScanLine },
];

const fetchDashboard = async () => {
  const [activity, analytics] = await Promise.all([api.get("/mrstm/activity"), api.get("/scan/analytics")]);
  return { ...activity.data, analytics: analytics.data };
};

const Status = ({ user }) =>
  user.online ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      Online
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      {user.lastActiveAt ? `Seen ${timeAgo(user.lastActiveAt)}` : "Never signed in"}
    </span>
  );

const TeamTable = ({ users }) => (
  <>
    {/* Phones: one card per user */}
    <ul className="divide-y divide-slate-100 md:hidden">
      {users.map((u) => (
        <li key={u._id} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={u.username} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{u.username}</p>
                <Status user={u} />
              </div>
            </div>
            <Badge tone={u.isAdmin ? "teal" : "slate"}>{u.isAdmin ? "Admin" : "Scanner"}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-emerald-50 p-2">
              <p className="text-lg font-bold text-emerald-700">{u.stats.today.entered}</p>
              <p className="text-xs text-emerald-700/80">Let in today</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-lg font-bold text-slate-800">{u.stats.today.scans}</p>
              <p className="text-xs text-slate-500">Scans today</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-lg font-bold text-slate-800">{u.stats.entered}</p>
              <p className="text-xs text-slate-500">Let in total</p>
            </div>
          </div>
        </li>
      ))}
    </ul>

    {/* Tablets & desktop: table */}
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Let in today</th>
            <th className="px-4 py-3 text-right font-semibold">Scans today</th>
            <th className="px-4 py-3 text-right font-semibold">Let in total</th>
            <th className="px-4 py-3 text-right font-semibold">Scans total</th>
            <th className="px-4 py-3 text-right font-semibold">Rejected</th>
            <th className="px-4 py-3 font-semibold">Last scan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.username} className="h-8 w-8 text-xs" />
                  <div>
                    <p className="font-semibold text-slate-900">{u.username}</p>
                    <p className="text-xs text-slate-500">{u.isAdmin ? "Admin" : "Scanner"}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3"><Status user={u} /></td>
              <td className="px-4 py-3 text-right text-base font-bold tabular-nums text-emerald-700">{u.stats.today.entered}</td>
              <td className="px-4 py-3 text-right tabular-nums">{u.stats.today.scans}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{u.stats.entered}</td>
              <td className="px-4 py-3 text-right tabular-nums">{u.stats.scans}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-500">{u.stats.rejected}</td>
              <td className="px-4 py-3 text-slate-500">{u.stats.lastScanAt ? timeAgo(u.stats.lastScanAt) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

const AdminV2 = ({ section }) => {
  const { data, error, loading, refresh, updatedAt } = usePolling(fetchDashboard, 20000);

  useEffect(() => {
    if (section === "team" && data) document.getElementById("team")?.scrollIntoView({ behavior: "smooth" });
  }, [section, data]);

  const summary = data?.summary;
  const analytics = data?.analytics;

  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        subtitle={updatedAt ? `Live · updated ${formatTimeIST(updatedAt)}` : "Loading…"}
        actions={
          <Button variant="secondary" size="sm" onClick={refresh} loading={loading && !!data}>
            {!(loading && data) && <LuRefreshCw className="h-4 w-4" />} Refresh
          </Button>
        }
      />

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {!data ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Inside now" value={analytics.count} hint={`of ${analytics.total} registered`} icon={LuDoorOpen} accent="green" />
            <StatCard label="Online now" value={summary.onlineCount} hint={`of ${summary.totalUsers} accounts`} icon={LuUsers} accent="sky" />
            <StatCard label="Let in last hour" value={summary.enteredLastHour} hint={`${summary.scansLastHour} scans`} icon={LuActivity} />
            <StatCard label="Let in today" value={summary.todayEntered} hint={`${summary.todayScans} scans today`} icon={LuScanLine} accent="amber" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {ACTIONS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-slate-900">{a.title}</span>
                  <span className="hidden text-xs text-slate-500 sm:block">{a.desc}</span>
                </span>
                <LuChevronRight className="hidden h-4 w-4 text-slate-300 transition group-hover:text-teal-500 sm:block" />
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <Card id="team" className="scroll-mt-20 overflow-hidden xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Team activity</h2>
                  <p className="text-xs text-slate-500">
                    "Online" = active in the last {Math.round(data.onlineWindowSeconds / 60)} minutes
                  </p>
                </div>
                <Badge tone="green">{summary.onlineCount} online</Badge>
              </div>
              <TeamTable users={data.users} />
              <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
                Scan counts include only scans made since activity tracking was turned on.
              </p>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 p-4">
                <h2 className="font-semibold text-slate-900">Recent scans</h2>
                <p className="text-xs text-slate-500">Latest {data.recent.length} across all scanners</p>
              </div>
              {data.recent.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">No scans yet.</p>
              ) : (
                <ul className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto xl:max-h-[32rem]">
                  {data.recent.map((r) => {
                    const [tone, label] = RESULT_BADGES[r.result];
                    return (
                      <li key={r._id} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className={cx("truncate text-sm font-semibold", r.name ? "text-slate-900" : "text-slate-500")}>
                            {r.name || r.elixirPassId}
                          </p>
                          <p className="text-xs text-slate-500">
                            {r.elixirPassId} · by {r.username} · {timeAgo(r.createdAt)}
                          </p>
                        </div>
                        <Badge tone={tone}>{label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminV2;
