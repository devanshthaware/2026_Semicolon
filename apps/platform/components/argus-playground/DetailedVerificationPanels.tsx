import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore } from '@/store/useRealtimePlaygroundStore';

export const DetailedVerificationPanels = () => {
  const mockStore = useMockPlaygroundStore();
  const realtimeStore = useRealtimePlaygroundStore();

  const isRealtime = realtimeStore.executionMode === 'REAL-TIME';

  if (!isRealtime) {
    const { scenario, elapsedMs, machineState } = mockStore;
    if (machineState === 'IDLE' || machineState === 'PROMPT_READY') return null;

    const showRetrieval = elapsedMs >= 900;
    const showSymbolic = elapsedMs >= 1400;
    const showTemporal = elapsedMs >= 1400;
    const showCrossModel = elapsedMs >= 1400;
    const showReceipt = elapsedMs >= 2600;

    const claim = scenario.claims[0];
    if (!claim) return null;

    const symbolicLayer = claim.layers.find(l => l.id === 'symbolic');
    const temporalLayer = claim.layers.find(l => l.id === 'temporal');
    const crossModelLayer = claim.layers.find(l => l.id === 'cross-model');

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className={`p-4 border rounded-lg bg-card ${showRetrieval ? 'opacity-100' : 'opacity-50'}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Retrieved Evidence</h3>
          {showRetrieval && claim.evidence ? (
            <div className="space-y-2 text-xs">
              <p><span className="text-muted-foreground">Source:</span> <span className="font-mono text-primary">{claim.evidence.source}</span></p>
              <div className="mt-2 p-2 bg-muted/30 border border-border rounded italic text-muted-foreground">
                "{claim.evidence.relevantPassage}"
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No evidence retrieved.</p>
          )}
        </div>

        <div className={`p-4 border rounded-lg bg-card ${showSymbolic ? 'opacity-100' : 'opacity-50'}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Symbolic Verification</h3>
          {showSymbolic && symbolicLayer && symbolicLayer.isVisible ? (
            <div className="space-y-2 text-xs">
              <div className={`p-2 rounded border ${symbolicLayer.result === 'CONTRADICTED' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                <p className="font-bold">{symbolicLayer.result}</p>
                <p className="font-mono mt-1 text-xs">{symbolicLayer.details || 'Arithmetic verified.'}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">SKIPPED / NOT APPLICABLE</p>
          )}
        </div>

        <div className={`p-4 border rounded-lg bg-card ${showReceipt ? 'opacity-100' : 'opacity-50'}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Verification Receipt</h3>
          {showReceipt ? (
            <div className="space-y-2 text-xs font-mono bg-background/50 p-3 rounded border border-border">
              <div><span className="text-muted-foreground">Receipt ID:</span> <span className="text-primary">{scenario.receipt.receiptId}</span></div>
              <div><span className="text-muted-foreground">Trust Score:</span> {scenario.receipt.trustScore}%</div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Awaiting pipeline completion...</p>
          )}
        </div>
      </div>
    );
  }

  // Real-Time Detailed Panels
  const { claims, corrections, receipt, machineState } = realtimeStore;

  if (machineState === 'IDLE') return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {/* Real Extracted Claims & Evidence */}
      <div className="p-4 border rounded-lg bg-card col-span-1 md:col-span-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Extracted Claims & Real Evidence</h3>
        {claims.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {claims.map((c, idx) => (
              <div key={c.id || idx} className="p-3 bg-muted/20 border border-border rounded text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold font-mono text-foreground">Claim #{idx + 1} ({c.type})</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    c.verdict === 'GROUNDED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    c.verdict === 'CONTRADICTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {c.verdict}
                  </span>
                </div>
                <p className="text-foreground font-medium">"{c.text}"</p>
                {c.evidence && c.evidence.length > 0 && (
                  <div className="p-2 bg-background/60 rounded border border-border text-[11px] text-muted-foreground">
                    <span className="font-semibold text-primary">{c.evidence[0].source}:</span> "{c.evidence[0].snippet}"
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic animate-pulse">Extracting claims from Ollama output...</p>
        )}
      </div>

      {/* Model Corrections Panel */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ollama Model Corrections</h3>
        {corrections.length > 0 ? (
          <div className="space-y-3">
            {corrections.map((corr, i) => (
              <div key={i} className="p-3 border border-blue-500/30 bg-blue-500/10 rounded text-xs space-y-1.5">
                <p className="font-bold text-blue-400">CORRECTION APPLIED</p>
                <p className="text-muted-foreground line-through text-[11px]">"{corr.original_claim}"</p>
                <p className="font-medium text-blue-200">"{corr.corrected_claim}"</p>
                <span className="inline-block text-[10px] font-mono text-emerald-400">Re-verified: {corr.verdict}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No claim corrections triggered.</p>
        )}
      </div>

      {/* Real Verification Receipt */}
      <div className="col-span-1 md:col-span-3 p-4 border rounded-lg bg-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Real-Time Verification Receipt</h3>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-mono">
            {receipt?.signature_status || 'UNSIGNED (LOCAL DEV)'}
          </span>
        </div>

        {receipt ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono bg-background/50 p-3 rounded border border-border">
            <div><span className="text-muted-foreground">Receipt ID:</span> <span className="text-primary">{receipt.receipt_id}</span></div>
            <div><span className="text-muted-foreground">Session ID:</span> {receipt.session_id}</div>
            <div><span className="text-muted-foreground">Model:</span> {receipt.model}</div>
            <div><span className="text-muted-foreground">Raw Trust:</span> {Math.round(receipt.raw_trust * 100)}%</div>
            <div className="col-span-2"><span className="text-muted-foreground">Calibration:</span> {receipt.calibrated_status}</div>
            <div className="col-span-2"><span className="text-muted-foreground">Executed Layers:</span> {receipt.executed_layers?.join(", ")}</div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground animate-pulse">Awaiting verification receipt generation...</p>
        )}
      </div>
    </div>
  );
};
