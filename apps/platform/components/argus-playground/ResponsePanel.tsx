import React, { useMemo } from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore } from '@/store/useRealtimePlaygroundStore';

export const ResponsePanel = () => {
  const mockStore = useMockPlaygroundStore();
  const realtimeStore = useRealtimePlaygroundStore();

  const isRealtime = realtimeStore.executionMode === 'REAL-TIME';

  if (!isRealtime) {
    const { scenario, machineState, elapsedMs } = mockStore;
    const isVisible = machineState !== 'IDLE' && machineState !== 'PROMPT_READY';
    const isGenerating = machineState === 'GENERATING';
    const showClaims = elapsedMs >= 500;

    let text = scenario.mockResponseText;
    if (showClaims) {
      scenario.claims.forEach(claim => {
        const parts = text.split(claim.originalText);
        if (parts.length > 1) {
          text = parts.join(`<span class="bg-primary/20 border border-primary/50 text-primary px-1 rounded cursor-pointer hover:bg-primary/30 transition-colors" title="Claim Type: ${claim.type}">${claim.originalText}</span>`);
        }
      });
    }

    if (!isVisible) {
      return (
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground min-h-[150px] items-center justify-center border-dashed">
          <p className="text-muted-foreground text-sm">Waiting for verification to start...</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground min-h-[150px] relative">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ARGUS AI RESPONSE (MOCK)</h2>
          {isGenerating ? (
            <span className="text-xs text-blue-400 font-mono animate-pulse">GENERATING...</span>
          ) : (
            <span className="text-xs text-green-400 font-mono">GENERATED</span>
          )}
        </div>
        <div className="mt-2 text-base leading-relaxed">
          {isGenerating ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: text }} />
          )}
        </div>
      </div>
    );
  }

  // Real-Time Response Panel
  const { machineState, responseText, claims, errorMessage } = realtimeStore;
  const isIdle = machineState === 'IDLE';
  const isGenerating = machineState === 'GENERATING';
  const isError = machineState === 'ERROR';

  const highlightedRealtimeText = useMemo(() => {
    if (!responseText) return '';
    let text = responseText;
    if (claims && claims.length > 0) {
      claims.forEach(c => {
        if (c.text && text.includes(c.text)) {
          const parts = text.split(c.text);
          const badgeColor = c.verdict === 'GROUNDED' 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
            : c.verdict === 'CONTRADICTED' 
            ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' 
            : 'bg-amber-500/20 border-amber-500/50 text-amber-300';

          text = parts.join(`<span class="${badgeColor} border px-1 py-0.5 rounded transition-all cursor-pointer" title="Claim (${c.type}): ${c.verdict}">${c.text}</span>`);
        }
      });
    }
    return text;
  }, [responseText, claims]);

  if (isIdle) {
    return (
      <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground min-h-[150px] items-center justify-center border-dashed">
        <p className="text-muted-foreground text-sm">Enter a prompt above and click "Run Verification" to stream real Ollama output.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3 p-4 border border-rose-500/40 bg-rose-950/20 rounded-lg text-card-foreground min-h-[150px]">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-400">VERIFICATION ERROR</h2>
          <span className="text-xs font-mono text-rose-400">FAILED</span>
        </div>
        <p className="text-sm text-rose-300 mt-2">{errorMessage || "Verification pipeline error."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground min-h-[150px] relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ARGUS REAL-TIME OLLAMA RESPONSE</h2>
        {isGenerating ? (
          <span className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            STREAMING TOKENS...
          </span>
        ) : (
          <span className="text-xs text-emerald-400 font-mono">● LIVE STREAMED</span>
        )}
      </div>
      <div className="mt-2 text-base leading-relaxed font-sans whitespace-pre-wrap">
        {responseText ? (
          <div dangerouslySetInnerHTML={{ __html: highlightedRealtimeText || responseText }} />
        ) : (
          <div className="animate-pulse space-y-2 py-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        )}
      </div>
    </div>
  );
};
