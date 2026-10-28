import React, { useState } from "react";
import { LuDoorOpen, LuScanLine, LuUsers } from "react-icons/lu";
import logo from "/logo.png";
import api, { errorMessage } from "./api";
import { Alert, Button, Card, Field, Input, PasswordInput } from "./ui";

const FEATURES = [
  { icon: LuScanLine, text: "Scan QR passes or type an ID" },
  { icon: LuDoorOpen, text: "See who's inside, live" },
  { icon: LuUsers, text: "Track every scanner's activity" },
];

const LoginV2 = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expired] = useState(() => {
    const flag = sessionStorage.getItem("sessionExpired");
    sessionStorage.removeItem("sessionExpired");
    return Boolean(flag);
  });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { username: username.trim(), password });
      onLoginSuccess(data);
    } catch (err) {
      setError(errorMessage(err, "Login failed. Please try again."));
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-600 to-teal-800 p-10 text-white md:flex">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-11 w-11 rounded-xl bg-white/90 object-contain p-1" />
          <span className="text-lg font-bold">IMS Fest Entry</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Fast, reliable entry for Elixir.</h1>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3 text-teal-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <feature.icon className="h-5 w-5" />
                </span>
                {feature.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-teal-100/80">
          Created by{" "}
          <a href="https://mrstm.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">
            Satyam Prajapati
          </a>
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <img src={logo} alt="" className="h-11 w-11 object-contain" />
            <span className="text-lg font-bold text-slate-900">IMS Fest Entry</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use the scanner account given to you by the organisers.</p>

          <Card className="mt-6 p-6">
            <form onSubmit={submit} className="space-y-4">
              {expired && <Alert tone="info">Your session expired. Please sign in again.</Alert>}
              <Field label="Username" htmlFor="login-username">
                <Input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoFocus
                  required
                />
              </Field>
              <Field label="Password" htmlFor="login-password">
                <PasswordInput
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>
              {error && <Alert tone="error">{error}</Alert>}
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginV2;
