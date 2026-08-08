import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore } from '@/store/useRealtimePlaygroundStore';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

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
    let riskColor = 'text-emerald-400';
    let riskBg = 'bg-emerald-500/10 border-emerald-500/30';
    
    if (trustPercent < 60) {
      riskLevel = 'HIGH';
      riskColor = 'text-rose-400';
      riskBg = 'bg-rose-500/10 border-rose-500/30';
    } else if (trustPercent < 80) {
      riskLevel = 'MEDIUM';
      riskColor = 'text-amber-400';
      riskBg = 'bg-amber-500/10 border-amber-500/30';
    }

    return (
      <div className="flex flex-col gap-5 p-6 border rounded-lg bg-card text-card-foreground min-h-[400px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ARGUS TRUST (DEMO)</h2>
          <span className="text-xs font-mono text-amber-400">MOCK DATA</span>
        </div>
        <div className="flex flex-col items-center justify-center py-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase mb-1">RAW TRUST</span>
          <div className={`text-6xl font-bold font-mono tracking-tighter ${riskColor}`}>
            {trustPercent}%
          </div>
          <div className={`mt-2 px-4 py-1 rounded-full border text-xs font-bold tracking-widest ${riskBg} ${riskColor}`}>
            RISK: {riskLevel}
          </div>
        </div>

        <div className="space-y-2.5 w-full text-xs font-mono">
          <div className="flex justify-between items-center border-b border-border pb-1.5">
            <span className="text-muted-foreground">CALIBRATED TRUST</span>
            <span className="font-semibold text-amber-400">NOT CONFIGURED</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-1.5">
            <span className="text-muted-foreground">VERDICT</span>
            <span className="font-semibold uppercase text-foreground">{trustPercent < 60 ? 'FLAGGED' : trustPercent < 80 ? 'REVIEW' : 'GROUNDED'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-1.5">
            <span className="text-muted-foreground">CONFIDENCE INTERVAL</span>
            <span className="font-mono text-muted-foreground">UNAVAILABLE</span>
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
  let verdict = 'GROUNDED';

  if (scoreVal < 60) {
    riskLevel = 'HIGH';
    riskColor = 'text-rose-400';
    riskBg = 'bg-rose-500/10 border-rose-500/30';
    verdict = 'FLAGGED';
  } else if (scoreVal < 80) {
    riskLevel = 'MEDIUM';
    riskColor = 'text-amber-400';
    riskBg = 'bg-amber-500/10 border-amber-500/30';
    verdict = 'REVIEW';
  }

  // Compute "WHY FLAGGED?" details from actual claim signals
  const arithmeticError = claims.some(c => c.signals?.symbolic === 'CONTRADICTED');
  const nliContradiction = claims.some(c => c.signals?.nli === 'CONTRADICTS');
  const missingEvidence = claims.some(c => c.signals?.retrieval === 'NO_EVIDENCE');
  const evidenceFound = claims.some(c => c.signals?.retrieval === 'EVIDENCE_FOUND');
  const nliSupported = claims.some(c => c.signals?.nli === 'ENTAILS');

  let primaryReason = 'ALL CLAIMS VERIFIED GROUNDED';
  if (arithmeticError) primaryReason = 'NUMERIC CONTRADICTION DETECTED';
  else if (nliContradiction) primaryReason = 'EVIDENCE CONTRADICTION DETECTED';
  else if (missingEvidence) primaryReason = 'UNGROUNDED FACTUAL CLAIM';
  else if (verdict === 'REVIEW') primaryReason = 'BORDERLINE CONFIDENCE';

  return (
    <div className="flex flex-col gap-4 p-5 border rounded-lg bg-card text-card-foreground min-h-[400px] relative overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      
      <div className="flex justify-between items-center border-b border-border pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ARGUS TRUST</h2>
        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> FUSED SIGNALS
        </span>
      </div>

      {/* Main Score & Risk */}
      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">RAW TRUST</span>
        <div className={`text-5xl md:text-6xl font-bold font-mono tracking-tighter ${riskColor}`}>
          {scoreVal}%
        </div>
        <div className={`mt-2 px-3.5 py-0.5 rounded-full border text-[11px] font-bold tracking-widest ${riskBg} ${riskColor}`}>
          RISK: {riskLevel}
        </div>
      </div>

      {/* Trust & Calibration Key-Values */}
      <div className="space-y-2 text-xs font-mono border-y border-border py-2.5">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">CALIBRATED TRUST</span>
          <span className="font-semibold text-amber-400">
            {receipt?.calibrated_status === 'CALIBRATED' ? `${Math.round((receipt.calibrated_score || scoreVal) * 100)}%` : 'NOT CONFIGURED'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">VERDICT</span>
          <span className={`font-bold uppercase ${riskColor}`}>{verdict}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">CONFIDENCE INTERVAL</span>
          <span className="font-mono text-muted-foreground">
            {receipt?.conformal_interval && receipt.conformal_interval !== 'UNAVAILABLE' 
              ? JSON.stringify(receipt.conformal_interval) 
              : 'NOT CONFIGURED'}
          </span>
        </div>
      </div>

      {/* WHY FLAGGED / VERDICT EXPLANATION */}
      <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground font-bold uppercase text-[10px]">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          <span>WHY FLAGGED / VERDICT REASON</span>
        </div>

        <div className="space-y-1 text-[11px]">
          {arithmeticError ? (
            <div className="text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Arithmetic contradiction detected by Python Engine
            </div>
          ) : null}

          {nliContradiction ? (
            <div className="text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Evidence contradicts claim (DeBERTa NLI)
            </div>
          ) : null}

          {evidenceFound ? (
            <div className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Evidence retrieved from corpus
            </div>
          ) : null}

          {nliSupported ? (
            <div className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Entailment verified by NLI model
            </div>
          ) : null}

          <div className="text-amber-400 flex items-center gap-1.5 pt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Calibration unavailable (Local Dev Mode)
          </div>
        </div>

        <div className="pt-2 border-t border-border flex justify-between items-center text-[10px]">
          <span className="text-muted-foreground">Primary Reason:</span>
          <span className={`font-bold uppercase ${arithmeticError || nliContradiction ? 'text-rose-400' : 'text-emerald-400'}`}>
            {primaryReason}
          </span>
        </div>
      </div>
    </div>
  );
};

