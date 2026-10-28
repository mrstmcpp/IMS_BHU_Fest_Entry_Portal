import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../reusables/Header";
import Footer from "../reusables/Footer";
import VersionPicker from "../shared/VersionPicker";

const SettingsPage = ({ uiVersion, onChangeVersion, onLogout }) => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const username = localStorage.getItem("username");
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin")) || false;

  const choose = async (v) => {
    if (v === uiVersion) return;
    setSaving(true);
    setMessage("");
    try {
      await onChangeVersion(v);
    } catch {
      setMessage("Couldn't save your choice. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />

      <div className="flex flex-col items-center justify-center flex-grow px-4 py-8">
        <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Settings</h2>

          <div className="p-4 rounded-lg bg-gray-100">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="text-lg font-semibold text-gray-900">
              {username} <span className="text-sm font-normal text-gray-600">({isAdmin ? "Admin" : "Scanner"})</span>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Design version</h3>
            <p className="mb-3 text-sm text-gray-600">Saved to your account, so it follows you to any device.</p>
            <VersionPicker value={uiVersion} onSelect={choose} disabled={saving} />
            {message && <p className="mt-3 text-sm text-rose-600">{message}</p>}
          </div>

          <Link to="/scan">
            <button className="w-full px-4 py-2 cursor-pointer text-sm font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm hover:bg-gray-600">
              ← Back to scanner
            </button>
          </Link>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
