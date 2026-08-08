import React from 'react';
import { ClaimItem } from '@/store/useRealtimePlaygroundStore';
import { Database, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Minus, FileText, Info } from 'lucide-react';

interface EvidenceVerificationPanelProps {
  claim: ClaimItem | null;
}

export const EvidenceVerificationPanel: React.FC<EvidenceVerificationPanelProps> = ({ claim }) => {
  if (!claim) {
    return (
      <div className="p-5 border rounded-lg bg-card text-card-foreground flex flex-col items-center justify-center min-h-[320px]">
        <Info className="w-8 h-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">Select a claim on the left to view evidence & verification signals.</p>
      </div>
    );
  }

  const evidenceList = claim.evidence || [];
  const signals = claim.signals || {};

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">EVIDENCE & VERIFICATION</h3>
        </div>
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/30 font-semibold">
          CLAIM {claim.id}
        </span>
      </div>

      {/* Selected Claim Box */}
      <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Selected Claim ({claim.type})</span>
          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
            claim.verdict === 'GROUNDED' || claim.verdict === 'SUPPORTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
            claim.verdict === 'CONTRADICTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
            'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {claim.verdict}
          </span>
        </div>
        <p className="text-xs font-medium text-foreground font-sans">
          "{claim.text}"
        </p>
      </div>

      {/* Retrieved Evidence Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retrieved Evidence</h4>
        {evidenceList.length > 0 ? (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {evidenceList.map((ev, i) => (
              <div key={i} className="p-3 bg-background/70 border border-border rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-primary flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    {ev.source || 'Indexed Corpus'}
                  </span>
                  {ev.score !== undefined && (
                    <span className="text-[10px] font-mono text-muted-foreground">Score: {ev.score}</span>
                  )}
                </div>
                <p className="text-muted-foreground italic text-[11px] bg-muted/20 p-2 rounded border border-border">
                  "{ev.snippet}"
                </p>
                {ev.relation && (
                  <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">NLI Relation:</span>
                    <span className={`font-bold ${
                      ev.relation === 'entails' ? 'text-emerald-400' :
                      ev.relation === 'contradicts' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {ev.relation.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-muted/20 border border-dashed border-border rounded-lg text-center">
            <p className="text-xs text-muted-foreground font-mono">NO EVIDENCE FOUND IN RETRIEVAL INDEX</p>
          </div>
        )}
      </div>

      {/* Verification Signals Matrix */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Signals</h4>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          
          {/* Retrieval Signal */}
          <div className="p-2 bg-muted/20 border border-border rounded flex justify-between items-center">
            <span className="text-muted-foreground">Retrieval</span>
            {signals.retrieval === 'EVIDENCE_FOUND' ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Evidence Found
              </span>
            ) : signals.retrieval === 'NO_EVIDENCE' ? (
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3 h-3" /> No Evidence
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">
                <Minus className="w-3 h-3" /> SKIPPED
              </span>
            )}
          </div>

          {/* NLI Signal */}
          <div className="p-2 bg-muted/20 border border-border rounded flex justify-between items-center">
            <span className="text-muted-foreground">NLI Model</span>
            {signals.nli === 'ENTAILS' ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Entailed
              </span>
            ) : signals.nli === 'CONTRADICTS' ? (
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <XCircle className="w-3 h-3" /> Contradiction
              </span>
            ) : signals.nli === 'NEUTRAL' ? (
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3 h-3" /> Neutral
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">
                <Minus className="w-3 h-3" /> SKIPPED
              </span>
            )}
          </div>

          {/* Symbolic Signal */}
          <div className="p-2 bg-muted/20 border border-border rounded flex justify-between items-center">
            <span className="text-muted-foreground">Symbolic Engine</span>
            {signals.symbolic === 'GROUNDED' ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Valid Math
              </span>
            ) : signals.symbolic === 'CONTRADICTED' ? (
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <XCircle className="w-3 h-3" /> Math Error
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">
                <Minus className="w-3 h-3" /> SKIPPED
              </span>
            )}
          </div>

          {/* Temporal Signal */}
          <div className="p-2 bg-muted/20 border border-border rounded flex justify-between items-center">
            <span className="text-muted-foreground">Temporal Check</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Minus className="w-3 h-3" /> SKIPPED
            </span>
          </div>

          {/* Adversarial Critic */}
          <div className="p-2 bg-muted/20 border border-border rounded flex justify-between items-center">
            <span className="text-muted-foreground">Adversarial Critic</span>
            <span className="text-muted-foreground/60">NOT CONFIGURED</span>
          </div>

          {/* Cross-Model Verification */}
          <div className="p-2 bg-muted/20 border border-border rounded flex justify-between items-center">
            <span className="text-muted-foreground">Cross-Model</span>
            <span className="text-muted-foreground/60">NOT CONFIGURED</span>
          </div>

        </div>
      </div>

      {/* Final Claim Result */}
      <div className="p-3 bg-muted/30 border border-border rounded-lg flex justify-between items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Final Claim Result</span>
        <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
          claim.verdict === 'GROUNDED' || claim.verdict === 'SUPPORTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
          claim.verdict === 'CONTRADICTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        }`}>
          {claim.verdict}
        </span>
      </div>
    </div>
  );
};
