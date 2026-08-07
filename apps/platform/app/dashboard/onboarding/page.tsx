"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create organization");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome to Argus</h1>
        <p className="auth-copy">To get started, please create an organization.</p>
        
        {error && <div className="auth-error" style={{ marginBottom: "15px" }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <label>Organization Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. Acme Corp" 
            required 
            disabled={loading}
          />
          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Creating..." : "Create Organization"}
          </button>
        </form>
      </div>
    </div>
  );
}
