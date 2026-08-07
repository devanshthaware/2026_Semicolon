"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IngestForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text, sourceName: "Dashboard Uploads" })
      });
      if (res.ok) {
        setOpen(false);
        setTitle("");
        setText("");
        router.refresh();
      } else {
        alert("Failed to ingest document");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return <button className="primary" style={{ marginTop: 0 }} onClick={() => setOpen(true)}>Add Document</button>;
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div className="auth-card" style={{ width: "600px" }}>
        <h2>Add Document to Evidence Base</h2>
        <form onSubmit={handleSubmit}>
          <label>Document Title</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)} disabled={loading} />
          
          <label>Raw Text Content</label>
          <textarea required value={text} onChange={e => setText(e.target.value)} disabled={loading} style={{ height: "200px" }} />
          
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="submit" className="primary" disabled={loading}>{loading ? "Processing..." : "Ingest Document"}</button>
            <button type="button" className="secondary" onClick={() => setOpen(false)} disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
