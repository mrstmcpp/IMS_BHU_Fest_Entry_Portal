import React, { useEffect, useState } from "react";
import api, { errorMessage } from "./api";
import { cx, inputClass } from "./cx";
import { Alert, Button, Card, Input, PageHeader, PasswordInput } from "./ui";

// Splits on commas and new lines (so a column pasted from Excel works); keeps spaces inside an ID
const parseIds = (text) => text.split(/[,\n\r\t]+/).map((s) => s.trim()).filter(Boolean);

const Section = ({ id, highlight, title, description, danger, children }) => (
  <Card
    id={id}
    className={cx(
      "scroll-mt-20 p-5",
      danger && "border-rose-200",
      highlight && (danger ? "ring-4 ring-rose-500/15" : "ring-4 ring-teal-500/15")
    )}
  >
    <h2 className={cx("text-lg font-semibold", danger ? "text-rose-700" : "text-slate-900")}>{title}</h2>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    <div className="mt-4">{children}</div>
  </Card>
);

const useAction = () => {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const run = async (fn) => {
    setBusy(true);
    setResult(null);
    try {
      const { data } = await fn();
      const count = data.modifiedCount !== undefined && !/\d/.test(data.message) ? ` (${data.modifiedCount} passes reset)` : "";
      setResult({ tone: "success", text: data.message + count });
      return true;
    } catch (err) {
      const status = err.response?.status;
      setResult({ tone: status === 409 || status === 404 ? "warning" : "error", text: errorMessage(err) });
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, result, run };
};

const ResetEntriesV2 = ({ focus = "one" }) => {
  const [oneId, setOneId] = useState("");
  const [manyIds, setManyIds] = useState("");
  const [secret, setSecret] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const one = useAction();
  const many = useAction();
  const all = useAction();
  const parsed = parseIds(manyIds);

  useEffect(() => {
    if (focus !== "one") document.getElementById(`reset-${focus}`)?.scrollIntoView({ behavior: "smooth" });
  }, [focus]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader
        title="Reset entries"
        subtitle="Clear a pass's scan so the person can enter again (e.g. they stepped out)."
        back={{ to: "/mrstm", label: "Dashboard" }}
      />

      <Section id="reset-one" highlight={focus === "one"} title="Reset one pass" description="For a single person who needs to re-enter.">
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await one.run(() => api.post("/mrstm/freeEntry", { elixirPassId: oneId.trim() }))) setOneId("");
          }}
        >
          <Input value={oneId} onChange={(e) => setOneId(e.target.value)} placeholder="Elixir ID, e.g. MED12" aria-label="Elixir ID to reset" required />
          <Button type="submit" loading={one.busy}>Reset</Button>
        </form>
        {one.result && <Alert tone={one.result.tone} className="mt-3">{one.result.text}</Alert>}
      </Section>

      <Section id="reset-multiple" highlight={focus === "multiple"} title="Reset several passes" description="Paste IDs separated by commas or new lines.">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await many.run(() => api.post("/mrstm/freeMultipleEntries", { elixirPassIds: parsed }))) setManyIds("");
          }}
        >
          <textarea
            value={manyIds}
            onChange={(e) => setManyIds(e.target.value)}
            rows={4}
            placeholder={"MED12, MED13\nPEDIA4"}
            aria-label="Elixir IDs to reset"
            className={cx(inputClass, "h-auto py-2")}
            required
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500">{parsed.length} ID{parsed.length === 1 ? "" : "s"}</span>
            <Button type="submit" loading={many.busy} disabled={parsed.length === 0}>
              Reset {parsed.length || ""}
            </Button>
          </div>
        </form>
        {many.result && <Alert tone={many.result.tone} className="mt-3">{many.result.text}</Alert>}
      </Section>

      <Section
        id="reset-all"
        highlight={focus === "all"}
        danger
        title="Reset everyone"
        description="Clears every scan so all passes can be used again. Use only between fest days."
      >
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await all.run(() => api.post("/mrstm/freeAllEntries", { secretCode: secret }))) {
              setSecret("");
              setConfirmed(false);
            }
          }}
        >
          <PasswordInput value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret code" aria-label="Secret code" required />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="h-4 w-4 accent-rose-600" />
            I understand everyone will be able to enter again.
          </label>
          <Button type="submit" variant="danger" loading={all.busy} disabled={!confirmed}>
            Reset all entries
          </Button>
        </form>
        {all.result && <Alert tone={all.result.tone} className="mt-3">{all.result.text}</Alert>}
      </Section>
    </div>
  );
};

export default ResetEntriesV2;
