import React, { useState } from "react";
import { LuLogOut } from "react-icons/lu";
import { Alert, Avatar, Badge, Button, Card, PageHeader } from "./ui";
import VersionPicker from "../shared/VersionPicker";

const SettingsV2 = ({ username, isAdmin, uiVersion, onChangeVersion, onLogout }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const choose = async (v) => {
    if (v === uiVersion) return;
    setSaving(true);
    setError("");
    try {
      await onChangeVersion(v);
    } catch {
      setError("Couldn't save your choice. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="Settings" />

      <Card className="flex items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={username} className="h-12 w-12 text-base" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{username}</p>
            <Badge tone={isAdmin ? "teal" : "slate"}>{isAdmin ? "Admin" : "Scanner"}</Badge>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onLogout}>
          <LuLogOut className="h-4 w-4" /> Log out
        </Button>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Design</h2>
        <p className="mt-1 text-sm text-slate-500">Saved to your account, so it follows you to any device.</p>
        <div className="mt-4">
          <VersionPicker value={uiVersion} onSelect={choose} disabled={saving} />
        </div>
        {error && <Alert tone="error" className="mt-3">{error}</Alert>}
      </Card>

      <Card className="p-5 text-sm text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">About</h2>
        <p className="mt-1">
          IMS Fest Entry Portal · created by{" "}
          <a href="https://mrstm.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 hover:underline">
            Satyam Prajapati
          </a>{" "}
          (mrstm.in)
        </p>
      </Card>
    </div>
  );
};

export default SettingsV2;
