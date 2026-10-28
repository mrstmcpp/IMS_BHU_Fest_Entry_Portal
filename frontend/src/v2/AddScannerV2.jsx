import React, { useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "./api";
import { Alert, Button, Card, Field, Input, PageHeader, PasswordInput } from "./ui";

const AddScannerV2 = () => {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [status, setStatus] = useState(null); // { tone, text }
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const mismatch = form.confirm && form.password !== form.confirm;

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setSaving(true);
    setStatus(null);
    try {
      await api.post("/mrstm/secretRegister", { username: form.username.trim(), password: form.password });
      setCreated(form.username.trim());
      setForm({ username: "", password: "", confirm: "" });
    } catch (err) {
      setStatus({ tone: "error", text: errorMessage(err, "Couldn't create the account.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Add a scanner" subtitle="Scanner accounts can scan passes and see live stats." back={{ to: "/mrstm", label: "Dashboard" }} />

      {created ? (
        <Card className="p-6">
          <Alert tone="success" title={`Account "${created}" is ready`}>
            Share the username and password with them. They'll pick a design the first time they log in.
          </Alert>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => setCreated("")}>Add another</Button>
            <Link to="/mrstm" className="flex-1">
              <Button variant="secondary" className="w-full">Back to dashboard</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Username" htmlFor="new-username">
              <Input id="new-username" value={form.username} onChange={update("username")} autoComplete="off" required />
            </Field>
            <Field label="Password" htmlFor="new-password">
              <PasswordInput id="new-password" value={form.password} onChange={update("password")} autoComplete="new-password" required />
            </Field>
            <Field label="Confirm password" htmlFor="confirm-password" hint={mismatch ? "Passwords don't match yet." : undefined}>
              <PasswordInput id="confirm-password" value={form.confirm} onChange={update("confirm")} autoComplete="new-password" required />
            </Field>
            {status && <Alert tone={status.tone}>{status.text}</Alert>}
            <Button type="submit" size="lg" className="w-full" loading={saving} disabled={mismatch}>
              Create account
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AddScannerV2;
