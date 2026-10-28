import React, { useEffect, useState } from "react";
import { LuDownload, LuPlus } from "react-icons/lu";
import api, { errorMessage } from "./api";
import { cx } from "./cx";
import { Alert, Badge, Button, Card, Field, Input, PageHeader } from "./ui";
import { normalizePassId, todayISTInputValue } from "../shared/format";

const DESIGNATIONS = ["PROFESSOR", "FACULTY", "SR3", "SR2", "SR1", "SR", "JR3", "JR2", "JR1", "JR", "GUEST"];
const EMPTY = { elixirPassId: "", name: "", department: "", batch: "", isSpecial: false, validOn: "" };

const CreatePassV2 = () => {
  const [form, setForm] = useState(EMPTY);
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null); // { item, qrCodeData, message }

  useEffect(() => {
    api.get("/scan/analytics").then(({ data }) => setDepartments(data.byDepartment.map((d) => d.department))).catch(() => {});
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const normalizedId = normalizePassId(form.elixirPassId);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        elixirPassId: normalizedId,
        name: form.name.trim(),
        department: form.department.trim().toUpperCase(),
        batch: form.batch.trim().toUpperCase(),
        isSpecial: form.isSpecial,
      };
      if (form.isSpecial) payload.validOn = form.validOn;
      const { data } = await api.post("/scan/create", payload);
      setCreated(data);
    } catch (err) {
      setError(errorMessage(err, "Couldn't create the pass."));
    } finally {
      setSaving(false);
    }
  };

  const downloadQr = async () => {
    const id = created.item.elixirPassId;
    try {
      const blob = await (await fetch(created.qrCodeData)).blob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `ElixirPass-${id}.png` });
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(created.qrCodeData, "_blank", "noopener");
    }
  };

  if (created) {
    const { item } = created;
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Pass created" back={{ to: "/mrstm", label: "Dashboard" }} />
        <Card className="p-6 text-center">
          <Alert tone="success" className="text-left">{created.message}</Alert>
          <img src={created.qrCodeData} alt={`QR code for ${item.elixirPassId}`} className="mx-auto mt-5 h-56 w-56 rounded-xl border border-slate-200 bg-white p-2" />
          <p className="mt-4 text-xl font-bold text-slate-900">{item.name}</p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold">{item.elixirPassId}</span> · {item.department} · {item.batch}
          </p>
          {item.isSpecial && (
            <Badge tone="amber" className="mt-2">
              Special · valid {new Date(item.validOn).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
            </Badge>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={downloadQr}>
              <LuDownload className="h-4 w-4" /> Download QR
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => { setCreated(null); setForm(EMPTY); }}>
              <LuPlus className="h-4 w-4" /> Create another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Create a pass" subtitle="Adds a pass and gives you its QR code." back={{ to: "/mrstm", label: "Dashboard" }} />
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Elixir ID"
            htmlFor="pass-id"
            hint={form.elixirPassId && normalizedId !== form.elixirPassId ? `Will be saved as ${normalizedId}` : "Letters and numbers, e.g. MED54"}
          >
            <Input id="pass-id" value={form.elixirPassId} onChange={update("elixirPassId")} autoCapitalize="characters" autoComplete="off" required />
          </Field>
          <Field label="Full name" htmlFor="pass-name">
            <Input id="pass-name" value={form.name} onChange={update("name")} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Department" htmlFor="pass-dept">
              <Input id="pass-dept" list="dept-options" value={form.department} onChange={update("department")} required />
              <datalist id="dept-options">
                {departments.map((d) => <option key={d} value={d} />)}
              </datalist>
            </Field>
            <Field label="Designation" htmlFor="pass-batch">
              <Input id="pass-batch" list="designation-options" value={form.batch} onChange={update("batch")} required />
              <datalist id="designation-options">
                {DESIGNATIONS.map((d) => <option key={d} value={d} />)}
              </datalist>
            </Field>
          </div>

          <label className={cx("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition", form.isSpecial ? "border-amber-300 bg-amber-50" : "border-slate-200")}>
            <input type="checkbox" checked={form.isSpecial} onChange={update("isSpecial")} className="mt-0.5 h-5 w-5 accent-amber-500" />
            <span>
              <span className="block font-semibold text-slate-900">Special one-day pass</span>
              <span className="block text-sm text-slate-600">Only works on the date you choose.</span>
            </span>
          </label>
          {form.isSpecial && (
            <Field label="Valid on" htmlFor="pass-date">
              <Input id="pass-date" type="date" min={todayISTInputValue()} value={form.validOn} onChange={update("validOn")} required />
            </Field>
          )}

          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" size="lg" className="w-full" loading={saving}>
            Create pass
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreatePassV2;
