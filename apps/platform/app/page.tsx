"use client";

import { FormEvent, useState } from "react";

type Result = {
  trust: number;
  verdict: string;
  claims: Array<{ id: string; text: string; trust: number; verdict: string; evidence: Array<{ source: string; snippet: string; relation: string }> }>;
  layers: Record<string, number>;
  receipt: { issuedAt: string; version: string };
};

const initialResponse = "Paris is the capital of France. It is known for the Eiffel Tower.";

export default function PlatformHome() {
  const [input, setInput] = useState("What is the capital of France?");
  const [response, setResponse] = useState(initialResponse);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const apiResponse = await fetch("/api/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, response, mode: "standard" })
    });
    setResult(await apiResponse.json());
    setLoading(false);
  }

  return <main className="shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span>◈</span> TruthLayer</a>
      <p className="eyebrow">VERIFY</p>
      <a className="active" href="#playground">Playground</a>
      <a href="#sessions">Sessions</a>
      <a href="#api">API Keys</a>
      <a href="#analytics">Analytics</a>
      <p className="eyebrow side-spacer">DEVELOPER</p>
      <a href="#docs">Docs</a>
      <a href="#settings">Settings</a>
      <div className="sidebar-footer"><span className="status-dot" /> API operational</div>
    </aside>
    <section className="content" id="top">
      <header><div><p className="eyebrow">VERIFICATION INFRASTRUCTURE</p><h1>Make every claim accountable.</h1></div><button className="secondary">View API docs ↗</button></header>
      <section className="metrics" id="analytics">
        <Metric label="VERIFIED CLAIMS" value="24,804" detail="↑ 18.4% this week" />
        <Metric label="AVG. TRUST" value="94.2%" detail="Calibrated at 90%" />
        <Metric label="P95 LATENCY" value="182ms" detail="Development target" />
      </section>
      <section className="hero-card" id="playground">
        <div className="section-heading"><div><p className="eyebrow">LIVE PLAYGROUND</p><h2>Inspect a response before it reaches your user.</h2></div><span className="pill">Development verifier</span></div>
        <form onSubmit={verify} className="verify-grid">
          <label>Prompt<textarea value={input} onChange={(event) => setInput(event.target.value)} /></label>
          <label>Model response<textarea value={response} onChange={(event) => setResponse(event.target.value)} /></label>
          <button className="primary" disabled={loading}>{loading ? "Verifying…" : "Verify response →"}</button>
        </form>
      </section>
      {result && <Results result={result} />}
      <section className="architecture" id="api"><p className="eyebrow">THE DIFFERENCE</p><h2>More than retrieval. A layered trust system.</h2><div className="layer-grid"><Layer n="01" title="Uncertainty" text="Probe model confidence where internals are available." /><Layer n="02" title="Consistency" text="Measure semantic divergence across sampled answers." /><Layer n="03" title="Grounding" text="Check claims against retrieved evidence and NLI." /><Layer n="04" title="Calibration" text="Turn scores into confidence backed by measured coverage." /></div></section>
    </section>
  </main>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="metric"><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>; }
function Layer({ n, title, text }: { n: string; title: string; text: string }) { return <article className="layer"><span>{n}</span><h3>{title}</h3><p>{text}</p></article>; }
function Results({ result }: { result: Result }) { return <section className="results" id="sessions"><div className="score"><p className="eyebrow">OVERALL TRUST</p><strong>{Math.round(result.trust * 100)}%</strong><span className={`verdict ${result.verdict}`}>{result.verdict}</span><small>Receipt v{result.receipt.version} · {new Date(result.receipt.issuedAt).toLocaleTimeString()}</small></div><div className="claims"><p className="eyebrow">CLAIM RECEIPT</p>{result.claims.map((claim) => <article key={claim.id} className="claim"><div><span className={`claim-dot ${claim.verdict}`} /> <b>{Math.round(claim.trust * 100)}%</b> {claim.text}</div><small>{claim.evidence[0]?.source}: {claim.evidence[0]?.relation}</small></article>)}</div><div className="layers"><p className="eyebrow">LAYER SIGNALS</p>{Object.entries(result.layers).map(([key, value]) => <div className="signal" key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><b>{Math.round(value * 100)}%</b></div>)}</div></section>; }
