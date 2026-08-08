import React, { useState, useEffect } from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const PromptPanel = () => {
  const { scenario, machineState, runVerification, reset } = useMockPlaygroundStore();
  const [localPrompt, setLocalPrompt] = useState(scenario.prompt);
  const isRunning = machineState !== 'IDLE' && machineState !== 'COMPLETE';

  // Sync with scenario changes
  useEffect(() => {
    if (machineState === 'IDLE') {
      setLocalPrompt(scenario.prompt);
    }
  }, [scenario.prompt, machineState]);

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Prompt</h2>
      </div>
      <Textarea
        value={localPrompt}
        onChange={(e) => setLocalPrompt(e.target.value)}
        disabled={isRunning}
        className="min-h-[100px] resize-none font-medium text-lg bg-background/50 border-border focus-visible:ring-1"
        placeholder="Enter a prompt to verify..."
      />
      <div className="flex gap-3 justify-end mt-2">
        <Button variant="outline" onClick={reset} disabled={isRunning || machineState === 'IDLE'}>
          Clear / New
        </Button>
        <Button 
          onClick={runVerification} 
          disabled={isRunning || !localPrompt.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
        >
          {isRunning ? 'Running Verification...' : 'Run Verification'}
        </Button>
      </div>
    </div>
  );
};
