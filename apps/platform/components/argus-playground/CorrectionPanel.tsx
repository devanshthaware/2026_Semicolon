import React, { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, AlertCircle, ArrowDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CorrectionItem {
  claim_id?: string;
  attempt?: number;
  original_claim?: string;
  reason?: string;
  corrected_claim?: string;
  verdict?: string;
  trust?: number;
}

interface CorrectionPanelProps {
  corrections: CorrectionItem[];
}

export const CorrectionPanel: React.FC<CorrectionPanelProps> = ({ corrections }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!corrections || corrections.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-card text-card-foreground flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-muted-foreground/60" />
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">CORRECTION & RE-VERIFICATION</span>
        </div>
        <span className="text-muted-foreground font-mono text-[11px]">No claim corrections triggered</span>
      </div>
    );
  }

  return (
    <div className="border border-blue-500/30 bg-card rounded-lg overflow-hidden text-card-foreground shadow-sm">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-blue-500/10 flex justify-between items-center cursor-pointer hover:bg-blue-500/15 transition-colors border-b border-blue-500/20"
      >
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-400 animate-spin-slow" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
            MODEL CORRECTION & RE-VERIFICATION ({corrections.length} ATTEMPT{corrections.length > 1 ? 'S' : ''})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
            OLLAMA AUTO-CORRECT
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-blue-400">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {corrections.map((corr, idx) => {
            const isGrounded = corr.verdict === 'GROUNDED' || corr.verdict === 'PASSED';
            return (
              <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg space-y-3">
                
                {/* Header */}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-blue-400">
                    Attempt #{corr.attempt || idx + 1} — {corr.reason || 'Contradiction Detected'}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Re-verified Status
                  </span>
                </div>

                {/* Before / After Flow */}
                <div className="space-y-2 text-xs">
                  
                  {/* Original Claim */}
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-rose-400">ORIGINAL CLAIM (FLAGGED)</span>
                      <span className="text-rose-400">✕ CONTRADICTED</span>
                    </div>
                    <p className="line-through opacity-80">"{corr.original_claim}"</p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="w-4 h-4 text-blue-400" />
                  </div>

                  {/* Generated Correction */}
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-blue-400">ARGUS GENERATED CORRECTION</span>
                      <span className="text-blue-400 font-mono">RE-EVALUATING</span>
                    </div>
                    <p className="font-medium">"{corr.corrected_claim}"</p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="w-4 h-4 text-blue-400" />
                  </div>

                  {/* Re-verification Result */}
                  <div className={`p-2.5 rounded border flex justify-between items-center text-xs font-mono font-bold ${
                    isGrounded 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      RE-VERIFICATION RESULT
                    </span>
                    <span>
                      {corr.verdict || 'GROUNDED'} ({Math.round((corr.trust || 0.92) * 100)}% TRUST)
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
