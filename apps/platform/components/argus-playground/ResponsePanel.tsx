import React, { useMemo } from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';

export const ResponsePanel = () => {
  const { scenario, machineState, elapsedMs } = useMockPlaygroundStore();

  const isVisible = machineState !== 'IDLE' && machineState !== 'PROMPT_READY';
  const isGenerating = machineState === 'GENERATING';

  // Highlight claims when extraction starts
  const showClaims = elapsedMs >= 500;

  // Simple string replacer to wrap claim text in a span
  const highlightedText = useMemo(() => {
    let text = scenario.mockResponseText;
    if (!showClaims) return text;

    scenario.claims.forEach(claim => {
      // Find and replace the original text with a styled span
      const parts = text.split(claim.originalText);
      if (parts.length > 1) {
        text = parts.join(`<span class="bg-primary/20 border border-primary/50 text-primary px-1 rounded cursor-pointer hover:bg-primary/30 transition-colors" title="Claim Type: ${claim.type}">${claim.originalText}</span>`);
      }
    });

    return text;
  }, [scenario.mockResponseText, scenario.claims, showClaims]);

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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">ARGUS AI RESPONSE</h2>
        {isGenerating ? (
          <span className="text-xs text-blue-400 font-mono animate-pulse">GENERATING...</span>
        ) : (
          <span className="text-xs text-green-400 font-mono">GENERATED</span>
        )}
      </div>
      <div className="mt-2 text-lg leading-relaxed">
        {isGenerating ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
        )}
      </div>
    </div>
  );
};
