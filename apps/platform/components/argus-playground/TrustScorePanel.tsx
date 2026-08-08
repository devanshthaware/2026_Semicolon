import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';

export const TrustScorePanel = () => {
  const { scenario, elapsedMs, machineState } = useMockPlaygroundStore();
  const isComplete = machineState === 'COMPLETE';

  // We only reveal the final trust score when we reach 'Calibration' step in the timeline
  // The 'Calibration' step is usually around 2400ms
  const calibrationEvent = scenario.timeline.find(e => e.event === 'Calibration');
  const showScore = elapsedMs >= (calibrationEvent?.timeMs || 2400);

  if (!showScore && machineState !== 'COMPLETE') {
    return (
      <div className="flex flex-col gap-3 p-6 border rounded-lg bg-card text-card-foreground min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">Calculating Trust...</p>
      </div>
    );
  }

  const trustPercent = Math.round(scenario.finalTrust * 100);
  
  let riskLevel = 'LOW';
  let riskColor = 'text-green-500';
  let riskBg = 'bg-green-500/10 border-green-500/30';
  
  if (trustPercent < 60) {
    riskLevel = 'HIGH';
    riskColor = 'text-red-500';
    riskBg = 'bg-red-500/10 border-red-500/30';
  } else if (trustPercent < 80) {
    riskLevel = 'MEDIUM';
    riskColor = 'text-amber-500';
    riskBg = 'bg-amber-500/10 border-amber-500/30';
  }

  // Count claims by status
  const claimsCount = scenario.claims.length;
  const supported = scenario.claims.filter(c => c.finalVerdict === 'SUPPORTED').length;
  const corrected = scenario.claims.filter(c => c.finalVerdict === 'PASS' && c.correctionAttempt1).length;
  const uncertain = scenario.claims.filter(c => c.finalVerdict === 'UNCERTAIN' || c.finalVerdict === 'FLAGGED').length;
  const contradicted = scenario.claims.filter(c => c.finalVerdict === 'CONTRADICTED').length;

  return (
    <div className="flex flex-col gap-6 p-6 border rounded-lg bg-card text-card-foreground min-h-[400px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">FINAL ARGUS TRUST</h2>
      
      <div className="flex flex-col items-center justify-center py-6">
        <div className={`text-7xl font-bold font-mono tracking-tighter ${riskColor}`}>
          {trustPercent}%
        </div>
        <div className={`mt-4 px-4 py-1 rounded-full border text-sm font-bold tracking-widest ${riskBg} ${riskColor}`}>
          RISK: {riskLevel}
        </div>
      </div>

      <div className="space-y-4 w-full">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <span className="text-muted-foreground text-sm">Status</span>
          <span className="font-semibold text-sm">
            {trustPercent < 60 ? 'UNTRUSTWORTHY' : trustPercent < 80 ? 'REQUIRES ATTENTION' : 'VERIFIED'}
          </span>
        </div>
        
        <div className="flex justify-between items-center border-b border-border pb-2">
          <span className="text-muted-foreground text-sm">Confidence Interval</span>
          <span className="font-mono text-sm">{scenario.confidenceInterval}</span>
        </div>

        <div className="flex justify-between items-center border-b border-border pb-2">
          <span className="text-muted-foreground text-sm">Evidence Coverage</span>
          <span className="font-mono text-sm">{Math.round(scenario.evidenceCoverage * 100)}%</span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Claim Resolution</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between p-2 bg-muted/30 rounded border border-border">
            <span className="text-muted-foreground">Total</span>
            <span className="font-mono">{claimsCount}</span>
          </div>
          <div className="flex justify-between p-2 bg-green-500/10 rounded border border-green-500/20 text-green-500">
            <span>Supported</span>
            <span className="font-mono">{supported}</span>
          </div>
          <div className="flex justify-between p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-500">
            <span>Corrected</span>
            <span className="font-mono">{corrected}</span>
          </div>
          <div className="flex justify-between p-2 bg-amber-500/10 rounded border border-amber-500/20 text-amber-500">
            <span>Uncertain</span>
            <span className="font-mono">{uncertain}</span>
          </div>
          <div className="flex justify-between p-2 bg-red-500/10 rounded border border-red-500/20 text-red-500 col-span-2">
            <span>Contradicted</span>
            <span className="font-mono">{contradicted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
