"use client";

import { FormEvent, useState } from "react";
import { TruthLayer, type VerifyResult } from "@truthlayer/sdk";

const examples = {
  General: { prompt: "What is the capital of France?", response: "Paris is the capital of France. It is known for the Eiffel Tower." },
  Healthcare: { prompt: "Can you summarize a patient-facing explanation?", response: "This information is educational and should not replace advice from a licensed clinician." },
  Legal: { prompt: "Explain this contract clause in plain language.", response: "This clause should be reviewed by a qualified lawyer before a decision is made." },
  Finance: { prompt: "Explain an investment risk disclosure.", response: "Past performance does not guarantee future results, and investments can lose value." }
};

export default function Showcase() {
  const [domain, setDomain] = useState<keyof typeof examples>("General");
  const [prompt, setPrompt] = useState(examples.General.prompt);
  const [response, setResponse] = useState(examples.General.response);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function chooseDomain(next: keyof typeof examples) {
    setDomain(next);
    setPrompt(examples[next].prompt);
    setResponse(examples[next].response);
    setResult(null);
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const client = new TruthLayer({ baseUrl: process.env.NEXT_PUBLIC_TRUTHLAYER_URL ?? "http://localhost:3000" });
      setResult(await client.verify({ input: prompt, response }));
    } catch {
      setError("Could not reach the TruthLayer platform. Start it on port 3000, then try again.");
    } finally {
      setLoading(false);
    }
  }

  return <main>
    <nav><a className="logo" href="#top"><i>◈</i> Luma Assistant</a><span>Powered by <b>TruthLayer SDK</b></span><a href="http://localhost:3000" target="_blank">Open platform ↗</a></nav>
    <section className="intro" id="top"><p>SDK SHOWCASE</p><h1>One SDK.<br />Every high-stakes answer.</h1><div className="tabs">{Object.keys(examples).map((name) => <button className={domain === name ? "selected" : ""} key={name} onClick={() => chooseDomain(name as keyof typeof examples)}>{name}</button>)}</div></section>
    <section className="workspace"><form onSubmit={verify}><label>USER QUESTION<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label><label>AI RESPONSE<textarea value={response} onChange={(event) => setResponse(event.target.value)} /></label><button disabled={loading}>{loading ? "Verifying with TruthLayer…" : "Send to TruthLayer →"}</button>{error && <p className="error">{error}</p>}</form><aside>{result ? <Receipt result={result} /> : <EmptyReceipt />}</aside></section>
    <section className="integration"><p>THE INTEGRATION</p><pre>{'import { TruthLayer } from "@truthlayer/sdk";\n\nconst truthlayer = new TruthLayer({\n  baseUrl: "https://api.truthlayer.ai"\n});\n\nconst receipt = await truthlayer.verify({\n  input: userQuestion,\n  response: modelResponse\n});'}</pre><span>This showcase calls the public API exclusively through <code>@truthlayer/sdk</code>.</span></section>
  </main>;
}

function EmptyReceipt() { return <div className="empty"><span>◈</span><h2>Verification receipt</h2><p>Send an answer to see claim-level trust, evidence, and layered signals returned by TruthLayer.</p></div>; }

function Receipt({ result }: { result: VerifyResult }) {
  return <div className="receipt"><p>TRUTHLAYER RECEIPT</p><strong>{Math.round(result.trust * 100)}%</strong><span className={`badge ${result.verdict}`}>{result.verdict}</span><small>{result.claims.length} claims · {result.receipt.version}</small><hr />{result.claims.map((claim) => <article key={claim.id}><b>{Math.round(claim.trust * 100)}%</b><div>{claim.text}<small>{claim.evidence[0]?.source} · {claim.evidence[0]?.relation}</small></div></article>)}</div>;
}
