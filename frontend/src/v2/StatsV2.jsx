import React, { useMemo, useState } from "react";
import { LuActivity, LuDoorOpen, LuRefreshCw, LuSearch, LuTicket, LuUserCheck } from "react-icons/lu";
import api from "./api";
import { Alert, Button, Card, Input, PageHeader, ProgressBar, Spinner, StatCard } from "./ui";
import usePolling from "./usePolling";
import { formatTimeIST } from "../shared/format";

const fetchStats = async () => {
  const [analytics, me] = await Promise.all([api.get("/scan/analytics"), api.get("/auth/me")]);
  return { ...analytics.data, me: me.data };
};

const StatsV2 = () => {
  const { data, error, loading, refresh, updatedAt } = usePolling(fetchStats, 30000);
  const [filter, setFilter] = useState("");

  const departments = useMemo(() => {
    const list = data?.byDepartment || [];
    const q = filter.trim().toLowerCase();
    return q ? list.filter((d) => d.department.toLowerCase().includes(q)) : list;
  }, [data, filter]);

  const pct = data?.total ? Math.round((data.count / data.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Live stats"
        subtitle={updatedAt ? `Updated ${formatTimeIST(updatedAt)} · refreshes every 30 seconds` : "Loading…"}
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
            <StatCard label="Inside now" value={data.count} hint={`${pct}% of registered`} icon={LuDoorOpen} accent="green" />
            <StatCard label="Registered" value={data.total} hint={`${data.total - data.count} not arrived yet`} icon={LuTicket} />
            <StatCard label="Entered last hour" value={data.enteredLastHour ?? 0} icon={LuActivity} accent="sky" />
            <StatCard
              label="You let in today"
              value={data.me.stats.today.entered}
              hint={`${data.me.stats.today.scans} scans by you today`}
              icon={LuUserCheck}
              accent="amber"
            />
          </div>

          <Card className="mt-4 p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-slate-600">Overall arrival</p>
              <p className="text-sm font-semibold text-slate-900">
                {data.count} / {data.total}
              </p>
            </div>
            <ProgressBar value={data.count} max={data.total} className="mt-2 h-3" />
          </Card>

          <Card className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
              <h2 className="font-semibold text-slate-900">By department</h2>
              <div className="relative w-full sm:w-64">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Find a department"
                  aria-label="Filter departments"
                  className="h-10 pl-9"
                />
              </div>
            </div>
            {departments.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">No departments match "{filter}".</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <li key={d.department} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 sm:grid-cols-[12rem_1fr_5rem]">
                    <span className="truncate text-sm font-medium text-slate-800">{d.department}</span>
                    <span className="text-right text-sm tabular-nums text-slate-600 sm:order-last">
                      {d.inside} / {d.total}
                    </span>
                    <ProgressBar value={d.inside} max={d.total} className="col-span-2 sm:col-span-1" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default StatsV2;
