import React, { useState } from "react";
import logo from "/logo.png";
import VersionPicker from "./VersionPicker";

// Shown once, right after a user's first login, until they pick a design
const ChooseVersionPage = ({ username, onChoose, onChooseLocally, onLogout }) => {
  const [selected, setSelected] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setSaving(true);
    setError("");
    try {
      await onChoose(selected);
    } catch {
      setError("Couldn't save your choice to your account. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold text-gray-900">IMS Fest Entry Portal</span>
        </div>

        <h1 className="mt-8 text-3xl font-bold text-gray-900">
          Welcome{username ? `, ${username}` : ""}! Pick your look
        </h1>
        <p className="mt-2 text-gray-600">
          Both designs do the same job. You can switch any time from <span className="font-semibold">Settings</span>.
        </p>

        <div className="mt-6">
          <VersionPicker value={selected} onSelect={setSelected} disabled={saving} />
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-600">
            {error}{" "}
            <button
              type="button"
              onClick={() => onChooseLocally(selected)}
              className="font-semibold underline cursor-pointer"
            >
              Use it on this device anyway
            </button>
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="h-12 rounded-xl bg-teal-600 px-8 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving…" : `Continue with Version ${selected}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseVersionPage;
