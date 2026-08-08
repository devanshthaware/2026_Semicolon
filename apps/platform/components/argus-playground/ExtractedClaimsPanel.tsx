import React from 'react';
import { useRealtimePlaygroundStore, ClaimItem } from '@/store/useRealtimePlaygroundStore';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface ExtractedClaimsPanelProps {
  claims: ClaimItem[];
  selectedClaimId: string | null;
  onSelectClaim: (id: string) => void;
}

export const ExtractedClaimsPanel: React.FC<ExtractedClaimsPanelProps> = ({
  claims,
  selectedClaimId,
  onSelectClaim
}) => {
  if (!claims || claims.length === 0) {
    return (
      <div className="p-5 border rounded-lg bg-card text-card-foreground flex flex-col items-center justify-center min-h-[220px]">
        <Cpu className="w-8 h-8 text-muted-foreground/40 mb-2 animate-pulse" />
        <p className="text-xs text-muted-foreground italic">Extracting claims & cost-aware routing live...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">EXTRACTED CLAIMS & ROUTING</h3>
        </div>
        <span className="text-[10px] font-mono bg-muted/40 text-muted-foreground px-2 py-0.5 rounded border border-border">
          {claims.length} CLAIMS DETECTED
        </span>
      </div>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {claims.map((c, idx) => {
          const isSelected = selectedClaimId === c.id;
          const claimNum = `C${idx + 1}`;
          
          let verdictColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
          let icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;

          if (c.verdict === 'GROUNDED' || c.verdict === 'SUPPORTED' || c.verdict === 'VERIFIED') {
            verdictColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
          } else if (c.verdict === 'CONTRADICTED' || c.verdict === 'FAILED') {
            verdictColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            icon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
          }

          const routingSteps = c.routing && c.routing.length > 0 
            ? c.routing 
            : c.type === 'numeric' ? ['Python Arithmetic'] : c.type === 'logical' ? ['Z3 Logic'] : ['Hybrid Retrieval', 'NLI'];

          return (
            <div
              key={c.id || idx}
              onClick={() => onSelectClaim(c.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                isSelected 
                  ? 'border-primary bg-primary/10 shadow-sm' 
                  : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-background px-2 py-0.5 rounded border border-border text-foreground">
                    {claimNum}
                  </span>
                  <span className="text-[10px] font-mono uppercase font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {c.type}
                  </span>
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${verdictColor}`}>
                  {icon}
                  {c.verdict}
                </span>
              </div>

              <p className="text-xs text-foreground font-medium leading-snug">
                "{c.text}"
              </p>

              {/* Claim Routing Visualization */}
              <div className="pt-1.5 border-t border-border/50 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                <span className="text-muted-foreground/70">Route:</span>
                {routingSteps.map((step, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <span className="bg-background/80 px-1.5 py-0.5 rounded border border-border text-foreground/80">
                      {step}
                    </span>
                    {sIdx < routingSteps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
