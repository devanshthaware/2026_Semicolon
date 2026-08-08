import React, { useMemo } from 'react';
import { Clock, Layers, Zap, Cpu, CheckCircle2, Circle } from 'lucide-react';

interface ExecutionTimelinePanelProps {
  events: any[];
  ablatedLayers: string[];
}

export const ExecutionTimelinePanel: React.FC<ExecutionTimelinePanelProps> = ({
  events,
  ablatedLayers
}) => {
  // Compute timeline items & latencies relative to start timestamp
  const { timelineItems, latencies } = useMemo(() => {
    if (!events || events.length === 0) {
      return { timelineItems: [], latencies: {} };
    }

    const firstEvent = events[0];
    const startTime = new Date(firstEvent.timestamp || Date.now()).getTime();

    const items = events.map((ev, index) => {
      const evTime = new Date(ev.timestamp || Date.now()).getTime();
      const relativeMs = Math.max(0, evTime - startTime);
      const seconds = Math.floor(relativeMs / 1000);
      const millis = relativeMs % 1000;
      const formattedTime = `00:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0').slice(0, 2)}`;

      let label = ev.type;
      const payload = ev.payload || {};

      switch (ev.type) {
        case 'verification.started':
          label = 'Verification started';
          break;
        case 'response.started':
          label = 'Ollama generation started';
          break;
        case 'response.completed':
          label = 'Ollama token stream completed';
          break;
        case 'claim.extraction.started':
          label = 'Claim extraction started';
          break;
        case 'claim.extraction.completed':
          label = `Extracted ${payload.count || 0} claims`;
          break;
        case 'claim.extracted':
          label = `Claim Extracted: "${payload.text?.slice(0, 35)}..." (${payload.type})`;
          break;
        case 'routing.started':
          label = 'Cost-aware claim routing started';
          break;
        case 'layer.started':
          label = `Layer started for ${payload.claim_id} (${payload.type})`;
          break;
        case 'retrieval.completed':
          label = `Retrieval completed for ${payload.claim_id} (Score: ${payload.score})`;
          break;
        case 'nli.completed':
          label = `NLI completed for ${payload.claim_id} (${payload.relation})`;
          break;
        case 'layer.completed':
          label = `Layer completed for ${payload.claim_id} (${payload.layer}: ${payload.status})`;
          break;
        case 'correction.started':
          label = `Correction started (${payload.reason})`;
          break;
        case 'correction.completed':
          label = 'Correction completed by Ollama';
          break;
        case 'reverification.completed':
          label = `Re-verification completed (${payload.verdict})`;
          break;
        case 'fusion.completed':
          label = `Signal fusion completed (Trust: ${Math.round((payload.trust_score || 0) * 100)}%)`;
          break;
        case 'calibration.completed':
          label = `Conformal calibration (${payload.status})`;
          break;
        case 'receipt.created':
          label = `Verification receipt generated (${payload.receipt_id})`;
          break;
        case 'verification.completed':
          label = `Verification process complete (Verdict: ${payload.verdict})`;
          break;
      }

      return {
        timeStr: formattedTime,
        label,
        type: ev.type,
        relativeMs
      };
    });

    // Compute layer latencies from timestamps
    const computedLatencies: Record<string, number> = {};

    const findDelta = (startType: string, endType: string) => {
      const s = events.find(e => e.type === startType);
      const e = events.find(ev => ev.type === endType);
      if (s && e) {
        const t1 = new Date(s.timestamp).getTime();
        const t2 = new Date(e.timestamp).getTime();
        return Math.max(1, t2 - t1);
      }
      return null;
    };

    const extLatency = findDelta('claim.extraction.started', 'claim.extraction.completed');
    if (extLatency) computedLatencies['Claim Extraction'] = extLatency;

    const retStarted = events.find(e => e.type === 'retrieval.started');
    const retCompleted = events.find(e => e.type === 'retrieval.completed');
    if (retStarted && retCompleted) {
      computedLatencies['Retrieval'] = Math.max(1, new Date(retCompleted.timestamp).getTime() - new Date(retStarted.timestamp).getTime());
    }

    const nliCompleted = events.find(e => e.type === 'nli.completed');
    if (retCompleted && nliCompleted) {
      computedLatencies['NLI Model'] = Math.max(1, new Date(nliCompleted.timestamp).getTime() - new Date(retCompleted.timestamp).getTime());
    }

    const symLayer = events.find(e => e.type === 'layer.completed' && e.payload?.layer === 'symbolic');
    const layerStarted = events.find(e => e.type === 'layer.started');
    if (symLayer && layerStarted) {
      computedLatencies['Symbolic Engine'] = Math.max(1, new Date(symLayer.timestamp).getTime() - new Date(layerStarted.timestamp).getTime());
    }

    const fusionStarted = events.find(e => e.type === 'fusion.started');
    const fusionCompleted = events.find(e => e.type === 'fusion.completed');
    if (fusionStarted && fusionCompleted) {
      computedLatencies['Fusion Engine'] = Math.max(1, new Date(fusionCompleted.timestamp).getTime() - new Date(fusionStarted.timestamp).getTime());
    }

    return { timelineItems: items, latencies: computedLatencies };
  }, [events]);

  if (!events || events.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-card text-card-foreground flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground/60" />
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">EXECUTION TIMELINE & LATENCY</span>
        </div>
        <span className="text-muted-foreground font-mono text-[11px]">Awaiting backend execution events...</span>
      </div>
    );
  }

  const activeLayers = ['Ollama Stream', 'Claim Extractor', 'Cost Router', 'Retrieval/NLI', 'Symbolic Engine', 'Fusion Engine'].filter(
    l => !ablatedLayers.some(a => l.toLowerCase().includes(a))
  );

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">REAL-TIME EXECUTION TIMELINE</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3" /> LOCAL INFERENCE (OLLAMA)
          </span>
          <span className="text-[10px] font-mono bg-muted/30 text-muted-foreground px-2 py-0.5 rounded border border-border">
            {timelineItems.length} EVENTS
          </span>
        </div>
      </div>

      {/* Layer Latencies Summary Bar */}
      {Object.keys(latencies).length > 0 && (
        <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
          <h4 className="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider">LAYER EXECUTION LATENCY</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            {Object.entries(latencies).map(([layerName, msValue]) => (
              <div key={layerName} className="p-2 bg-background/80 rounded border border-border flex justify-between items-center">
                <span className="text-muted-foreground">{layerName}</span>
                <span className="text-emerald-400 font-bold">{msValue}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Event Stream List */}
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 font-mono text-xs">
        {timelineItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 bg-muted/10 hover:bg-muted/20 border border-border/40 rounded transition-colors">
            <span className="text-primary font-bold min-w-[64px] text-[11px]">
              {item.timeStr}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <span className="text-foreground/90 text-[11px] truncate">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Ablation Status Breakdown */}
      <div className="pt-2 border-t border-border flex flex-wrap justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">ACTIVE LAYERS:</span>
          <div className="flex flex-wrap gap-1 text-[10px]">
            {activeLayers.map((l, i) => (
              <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                ✓ {l}
              </span>
            ))}
          </div>
        </div>

        {ablatedLayers.length > 0 && (
          <div className="flex items-center gap-2 mt-1 md:mt-0">
            <span className="text-muted-foreground">DISABLED LAYERS:</span>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {ablatedLayers.map((l, i) => (
                <span key={i} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">
                  — {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
