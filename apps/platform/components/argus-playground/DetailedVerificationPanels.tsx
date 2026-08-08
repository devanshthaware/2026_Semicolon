import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';

export const DetailedVerificationPanels = () => {
  const { scenario, elapsedMs, machineState } = useMockPlaygroundStore();
  
  if (machineState === 'IDLE' || machineState === 'PROMPT_READY') {
    return null;
  }

  // Determine visibility based on timeline events (approximate)
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
      
      {/* Evidence Panel */}
      <div className={`p-4 border rounded-lg bg-card ${showRetrieval ? 'opacity-100' : 'opacity-50'}`}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Retrieved Evidence</h3>
        {showRetrieval ? (
          claim.evidence ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Source:</span> <span className="font-mono text-primary">{claim.evidence.source}</span></p>
              <p><span className="text-muted-foreground">Published:</span> <span className="font-mono">{claim.evidence.published}</span></p>
              <div className="mt-2 p-2 bg-muted/30 border border-border rounded italic text-muted-foreground">
                "{claim.evidence.relevantPassage}"
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No evidence retrieved.</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">Waiting for retrieval...</p>
        )}
      </div>

      {/* Symbolic Verification Panel */}
      <div className={`p-4 border rounded-lg bg-card ${showSymbolic ? 'opacity-100' : 'opacity-50'}`}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Symbolic Verification</h3>
        {showSymbolic ? (
          symbolicLayer && symbolicLayer.isVisible ? (
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded border ${symbolicLayer.result === 'CONTRADICTED' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-green-500/10 border-green-500/30 text-green-500'}`}>
                <p className="font-bold">{symbolicLayer.result}</p>
                <p className="font-mono mt-1 text-xs">{symbolicLayer.details || 'Arithmetic verified.'}</p>
              </div>
              {claim.correctionAttempt1 && (
                <div className="mt-3 p-2 border border-blue-500/30 bg-blue-500/10 rounded">
                  <p className="text-xs font-bold text-blue-500 mb-1">CORRECTION APPLIED</p>
                  <p className="font-mono text-blue-400">{claim.correctionAttempt1}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">SKIPPED / NOT APPLICABLE</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">Waiting for symbolic checks...</p>
        )}
      </div>

      {/* Temporal Verification Panel */}
      <div className={`p-4 border rounded-lg bg-card ${showTemporal ? 'opacity-100' : 'opacity-50'}`}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Temporal Validity</h3>
        {showTemporal ? (
          temporalLayer && temporalLayer.isVisible ? (
             <div className="space-y-2 text-sm">
             <div className={`p-2 rounded border ${temporalLayer.result === 'FLAGGED' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-green-500/10 border-green-500/30 text-green-500'}`}>
               <p className="font-bold">{temporalLayer.result === 'FLAGGED' ? '⚠ STALE EVIDENCE' : 'CURRENT'}</p>
               <p className="font-mono mt-1 text-xs">{temporalLayer.details || 'Evidence is temporally valid.'}</p>
             </div>
           </div>
          ) : (
            <p className="text-sm text-muted-foreground">SKIPPED / NOT APPLICABLE</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">Waiting for temporal checks...</p>
        )}
      </div>

      {/* Cross-Model Agreement Panel */}
      <div className={`p-4 border rounded-lg bg-card ${showCrossModel ? 'opacity-100' : 'opacity-50'}`}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Cross-Model Agreement</h3>
        {showCrossModel ? (
          crossModelLayer && crossModelLayer.isVisible ? (
            <div className="space-y-2 text-sm">
             <div className={`p-2 rounded border ${crossModelLayer.result === 'FLAGGED' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-green-500/10 border-green-500/30 text-green-500'}`}>
               <p className="font-bold">{crossModelLayer.result === 'FLAGGED' ? 'DISAGREEMENT DETECTED' : 'AGREEMENT'}</p>
               <p className="font-mono mt-1 text-xs">{crossModelLayer.details}</p>
             </div>
           </div>
          ) : (
            <p className="text-sm text-muted-foreground">SKIPPED / NOT APPLICABLE</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">Waiting for cross-model checks...</p>
        )}
      </div>

      {/* Receipt Panel */}
      <div className={`col-span-1 md:col-span-2 p-4 border rounded-lg bg-card ${showReceipt ? 'opacity-100' : 'opacity-50'}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Receipt</h3>
          {showReceipt && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded border border-green-500/30">✓ SIGNATURE VALID</span>}
        </div>
        
        {showReceipt ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground italic">
              "Receipt verifies that the Argus verification process ran with integrity. It does not independently prove that the underlying claim is true."
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono bg-background/50 p-3 rounded border border-border">
              <div><span className="text-muted-foreground">Receipt ID:</span> <span className="text-primary">{scenario.receipt.receiptId}</span></div>
              <div><span className="text-muted-foreground">Session ID:</span> {scenario.receipt.sessionId}</div>
              <div><span className="text-muted-foreground">Timestamp:</span> {scenario.receipt.timestamp}</div>
              <div><span className="text-muted-foreground">Trust Score:</span> {scenario.receipt.trustScore}%</div>
              <div className="col-span-2 break-all"><span className="text-muted-foreground">Manifest Hash:</span> {scenario.receipt.manifestHash}</div>
              <div className="col-span-2 break-all"><span className="text-muted-foreground">Signature:</span> {scenario.receipt.signature}</div>
            </div>
            <button className="w-full mt-2 py-1.5 text-xs font-bold uppercase tracking-wider border border-primary/50 text-primary hover:bg-primary/10 rounded transition-colors">
              Verify Cryptographic Receipt
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">Awaiting pipeline completion...</p>
        )}
      </div>
      
    </div>
  );
};
