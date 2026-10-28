import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LuCalendarX,
  LuCameraOff,
  LuCircleCheckBig,
  LuCircleX,
  LuHistory,
  LuKeyboard,
  LuScanLine,
  LuTriangleAlert,
  LuUserCheck,
  LuWifiOff,
} from "react-icons/lu";
import api, { errorMessage } from "./api";
import { cx } from "./cx";
import { Badge, Button, Card, Input, PageHeader, SegmentedControl, Spinner } from "./ui";
import useQrScanner from "./useQrScanner";
import { formatDateTimeIST, formatTimeIST } from "../shared/format";

const SCANNER_ELEMENT_ID = "qr-reader-v2";

const RESULT_STYLES = {
  entered: { tone: "border-emerald-400 bg-emerald-100", iconBox: "bg-emerald-600", Icon: LuCircleCheckBig, title: "Entry allowed", badge: ["green", "Let in"] },
  already: { tone: "border-amber-400 bg-amber-100", iconBox: "bg-amber-500", Icon: LuTriangleAlert, title: "Already entered", badge: ["amber", "Already used"] },
  wrong_day: { tone: "border-rose-400 bg-rose-100", iconBox: "bg-rose-600", Icon: LuCalendarX, title: "Not valid today", badge: ["red", "Wrong day"] },
  not_found: { tone: "border-rose-400 bg-rose-100", iconBox: "bg-rose-600", Icon: LuCircleX, title: "Pass not found", badge: ["red", "Not found"] },
  network: { tone: "border-slate-400 bg-slate-100", iconBox: "bg-slate-500", Icon: LuWifiOff, title: "No connection", badge: ["slate", "Not checked"] },
  error: { tone: "border-rose-400 bg-rose-100", iconBox: "bg-rose-600", Icon: LuCircleX, title: "Something went wrong", badge: ["red", "Error"] },
};

const kindFromError = (err) => {
  if (!err.response) return "network";
  return { 409: "already", 403: "wrong_day", 404: "not_found" }[err.response.status] || "error";
};

const Detail = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-0.5 font-semibold text-slate-900">{value || "—"}</dd>
  </div>
);

const ResultCard = ({ result, onNext, onRetry, nextLabel }) => {
  const style = RESULT_STYLES[result.kind];
  const { item } = result;
  let subtitle = result.message;
  if (result.kind === "entered") {
    subtitle = item?.isSpecial ? "Special pass — valid today." : "Welcome to the fest!";
  } else if (result.kind === "already" && item?.lastScannedAt) {
    subtitle = `Entered ${formatDateTimeIST(item.lastScannedAt)}${item.scannedBy ? ` · let in by ${item.scannedBy}` : ""}`;
  } else if (result.kind === "not_found") {
    subtitle = `No pass has the ID "${result.id}". Check the ID and try again.`;
  }

  return (
    <div className={cx("rounded-2xl border-2 p-5 shadow-sm", style.tone)} aria-live="assertive">
      <div className="flex items-start gap-4">
        <span className={cx("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white", style.iconBox)}>
          <style.Icon className="h-8 w-8" />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-bold text-slate-900">{style.title}</p>
          <p className="mt-1 text-sm text-slate-700">{subtitle}</p>
        </div>
      </div>

      {item && (
        <div className="mt-4 rounded-xl bg-white/70 p-4">
          <p className="text-lg font-bold text-slate-900">{item.name}</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Detail label="Pass ID" value={item.elixirPassId} />
            <Detail label="Department" value={item.department} />
            <Detail label="Designation" value={item.batch} />
          </dl>
          {item.isSpecial && <Badge tone="amber" className="mt-3">Special pass</Badge>}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {result.kind === "network" && (
          <Button size="lg" className="flex-1" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button size="lg" variant={result.kind === "network" ? "secondary" : "primary"} className="flex-1" onClick={onNext} autoFocus>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};

const CameraPanel = ({ status, error, onRetry, onTypeInstead }) => (
  <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 shadow-inner">
    <div id={SCANNER_ELEMENT_ID} />
    {status === "starting" && (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
        <Spinner className="h-8 w-8 text-teal-300" />
        <p className="text-sm">Starting camera…</p>
      </div>
    )}
    {status === "error" && (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
        <LuCameraOff className="h-10 w-10 text-slate-400" />
        <p className="text-sm text-slate-200">{error}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={onRetry}>Try again</Button>
          <Button size="sm" variant="secondary" onClick={onTypeInstead}>Type ID instead</Button>
        </div>
      </div>
    )}
    {status === "scanning" && (
      <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-medium text-white/80">
        Point the camera at the pass QR code
      </p>
    )}
  </div>
);

const ScanV2 = ({ initialMode = "camera" }) => {
  const [mode, setMode] = useState(initialMode);
  const [phase, setPhase] = useState("ready"); // ready | checking | result
  const [result, setResult] = useState(null);
  const [manualId, setManualId] = useState("");
  const [recent, setRecent] = useState([]);
  const [todayEntered, setTodayEntered] = useState(null);
  const manualInputRef = useRef(null);

  useEffect(() => {
    setMode(initialMode);
    setPhase("ready");
    setResult(null);
  }, [initialMode]);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setTodayEntered(data.stats.today.entered)).catch(() => {});
  }, []);

  const verify = useCallback(async (rawId) => {
    const id = String(rawId).trim();
    if (!id) return;
    setPhase("checking");
    let next;
    try {
      const { data } = await api.post("/scan", { elixirPassId: id });
      next = { kind: "entered", message: data.message, item: data.item, id };
      setTodayEntered((n) => (n ?? 0) + 1);
    } catch (err) {
      next = { kind: kindFromError(err), message: errorMessage(err), item: err.response?.data?.item, id };
    }
    navigator.vibrate?.(next.kind === "entered" ? 120 : [90, 60, 90, 60, 90]);
    setResult(next);
    setPhase("result");
    if (next.kind !== "network") {
      setRecent((list) => [{ ...next, at: Date.now() }, ...list].slice(0, 6));
    }
  }, []);

  const cameraActive = mode === "camera" && phase === "ready";
  const camera = useQrScanner(SCANNER_ELEMENT_ID, cameraActive, verify);

  const resetForNext = () => {
    setResult(null);
    setPhase("ready");
    if (mode === "manual") {
      setManualId("");
      setTimeout(() => manualInputRef.current?.focus(), 0);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setResult(null);
    setPhase("ready");
  };

  const submitManual = (e) => {
    e.preventDefault();
    verify(manualId);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Scan passes"
        subtitle="Scan a QR code or type the Elixir ID."
        actions={
          todayEntered !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <LuUserCheck className="h-4 w-4" /> You let in {todayEntered} today
            </span>
          )
        }
      />

      <SegmentedControl
        label="Scan method"
        value={mode}
        onChange={switchMode}
        options={[
          { value: "camera", label: "Camera", icon: LuScanLine },
          { value: "manual", label: "Type ID", icon: LuKeyboard },
        ]}
      />

      <div className="mt-4">
        {mode === "manual" && (
          <Card className="mb-4 p-4">
            <form onSubmit={submitManual} className="flex gap-2">
              <Input
                ref={manualInputRef}
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g. PEDIA12"
                aria-label="Elixir Pass ID"
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="h-12 flex-1 text-lg font-semibold uppercase tracking-wide"
              />
              <Button type="submit" size="lg" className="h-12" loading={phase === "checking"} disabled={!manualId.trim()}>
                Check
              </Button>
            </form>
            <p className="mt-2 text-xs text-slate-500">Spaces and lowercase are fine — "pedia 12" works too.</p>
          </Card>
        )}

        {phase === "result" && result ? (
          <ResultCard
            result={result}
            onRetry={() => verify(result.id)}
            onNext={resetForNext}
            nextLabel={mode === "camera" ? "Scan next" : "Check another ID"}
          />
        ) : phase === "checking" ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-slate-600">
            <Spinner className="h-8 w-8" />
            <p className="text-sm font-medium">Checking pass…</p>
          </Card>
        ) : (
          mode === "camera" && (
            <CameraPanel status={camera.status} error={camera.error} onRetry={camera.retry} onTypeInstead={() => switchMode("manual")} />
          )
        )}
      </div>

      {recent.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <LuHistory className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Recent on this device</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {recent.map((r) => {
              const [tone, label] = RESULT_STYLES[r.kind].badge;
              return (
                <li key={r.at} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{r.item?.name || r.id}</p>
                    <p className="text-xs text-slate-500">
                      {r.item?.elixirPassId || r.id} · {formatTimeIST(r.at)}
                    </p>
                  </div>
                  <Badge tone={tone}>{label}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default ScanV2;
