"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Registration failed");
      }
      const outcome = await signIn("credentials", { email, password, redirect: false });
      if (outcome?.error) throw new Error("Invalid email or password");
      window.location.assign("/");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to continue"); } finally { setLoading(false); }
  }

  return <main className="auth-page"><section className="auth-card"><a className="brand" href="/"><span>◈</span> Argus</a><p className="eyebrow">DEVELOPER PLATFORM</p><h1>{mode === "signin" ? "Welcome back." : "Start verifying."}</h1><p className="auth-copy">{mode === "signin" ? "Sign in to manage verification sessions and API keys." : "Create your organization account. You can generate API keys after onboarding."}</p><form onSubmit={submit}>{mode === "register" && <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} placeholder="At least 12 characters" required /></label>{message && <p className="auth-error">{message}</p>}<button className="primary" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign in →" : "Create account →"}</button></form><button className="auth-switch" onClick={() => { setMode(mode === "signin" ? "register" : "signin"); setMessage(""); }}>{mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}</button></section></main>;
}
