import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore } from '@/store/useRealtimePlaygroundStore';

export const TrustScorePanel = () => {
  const mockStore = useMockPlaygroundStore();
  const realtimeStore = useRealtimePlaygroundStore();

  const isRealtime = realtimeStore.executionMode === 'REAL-TIME';

  if (!isRealtime) {
    const { scenario, elapsedMs, machineState } = mockStore;
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
    let riskColor = 'text-emerald-500';
    let riskBg = 'bg-emerald-500/10 border-emerald-500/30';
    
    if (trustPercent < 60) {
      riskLevel = 'HIGH';
      riskColor = 'text-rose-500';
      riskBg = 'bg-rose-500/10 border-rose-500/30';
    } else if (trustPercent < 80) {
      riskLevel = 'MEDIUM';
      riskColor = 'text-amber-500';
      riskBg = 'bg-amber-500/10 border-amber-500/30';
    }

    return (
      <div className="flex flex-col gap-6 p-6 border rounded-lg bg-card text-card-foreground min-h-[400px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">FINAL ARGUS TRUST (MOCK)</h2>
        <div className="flex flex-col items-center justify-center py-4">
          <div className={`text-6xl font-bold font-mono tracking-tighter ${riskColor}`}>
            {trustPercent}%
          </div>
          <div className={`mt-3 px-4 py-1 rounded-full border text-xs font-bold tracking-widest ${riskBg} ${riskColor}`}>
            RISK: {riskLevel}
          </div>
        </div>
        <div className="space-y-3 w-full text-xs">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold">{trustPercent < 60 ? 'UNTRUSTWORTHY' : trustPercent < 80 ? 'REQUIRES ATTENTION' : 'VERIFIED'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-muted-foreground">Confidence Interval</span>
            <span className="font-mono">{scenario.confidenceInterval}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-muted-foreground">Evidence Coverage</span>
            <span className="font-mono">{Math.round(scenario.evidenceCoverage * 100)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Real-Time Trust Panel
  const { trustScore, receipt, machineState, claims } = realtimeStore;

  if (machineState === 'IDLE' || (!trustScore && machineState !== 'COMPLETE')) {
    return (
      <div className="flex flex-col gap-3 p-6 border rounded-lg bg-card text-card-foreground min-h-[400px] items-center justify-center">
        {machineState === 'IDLE' ? (
          <p className="text-muted-foreground text-sm">Trust score will compute live once verification runs.</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-xs uppercase tracking-widest animate-pulse">Calculating Real Trust Signals...</p>
          </div>
        )}
      </div>
    );
  }

  const scoreVal = trustScore ? Math.round(trustScore * 100) : 75;
  let riskLevel = 'LOW';
  let riskColor = 'text-emerald-400';
  let riskBg = 'bg-emerald-500/10 border-emerald-500/30';

  if (scoreVal < 60) {
    riskLevel = 'HIGH';
    riskColor = 'text-rose-400';
    riskBg = 'bg-rose-500/10 border-rose-500/30';
  } else if (scoreVal < 80) {
    riskLevel = 'MEDIUM';
    riskColor = 'text-amber-400';
    riskBg = 'bg-amber-500/10 border-amber-500/30';
  }

  const grounded = claims.filter(c => c.verdict === 'GROUNDED').length;
  const contradicted = claims.filter(c => c.verdict === 'CONTRADICTED').length;

  return (
    <div className="flex flex-col gap-5 p-6 border rounded-lg bg-card text-card-foreground min-h-[400px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">REAL-TIME ARGUS TRUST</h2>
        <span className="text-xs font-mono text-emerald-400">FUSED SCORE</span>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className={`text-6xl font-bold font-mono tracking-tighter ${riskColor}`}>
          {scoreVal}%
        </div>
        <div className={`mt-3 px-4 py-1 rounded-full border text-xs font-bold tracking-widest ${riskBg} ${riskColor}`}>
          RISK: {riskLevel}
        </div>
      </div>

      <div className="space-y-3 w-full text-xs">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <span className="text-muted-foreground">Verdict</span>
          <span className="font-semibold uppercase">{scoreVal >= 80 ? 'GROUNDED' : scoreVal >= 55 ? 'REVIEW' : 'FLAGGED'}</span>
        </div>

        <div className="flex justify-between items-center border-b border-border pb-2">
          <span className="text-muted-foreground">Conformal Calibration</span>
          <span className="font-mono text-amber-400">{receipt?.calibrated_status || 'UNCALIBRATED'}</span>
        </div>

        <div className="flex justify-between items-center border-b border-border pb-2">
          <span className="text-muted-foreground">Confidence Interval</span>
          <span className="font-mono">{receipt?.conformal_interval ? JSON.stringify(receipt.conformal_interval) : 'UNAVAILABLE'}</span>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Claim Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between p-2 bg-muted/30 rounded border border-border">
            <span className="text-muted-foreground">Extracted</span>
            <span className="font-mono">{claims.length}</span>
          </div>
          <div className="flex justify-between p-2 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400">
            <span>Grounded</span>
            <span className="font-mono">{grounded}</span>
          </div>
          <div className="flex justify-between p-2 bg-rose-500/10 rounded border border-rose-500/20 text-rose-400 col-span-2">
            <span>Contradicted</span>
            <span className="font-mono">{contradicted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
