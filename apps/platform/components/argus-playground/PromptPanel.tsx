import React, { useState, useEffect } from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore } from '@/store/useRealtimePlaygroundStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const PromptPanel = () => {
  const mockStore = useMockPlaygroundStore();
  const realtimeStore = useRealtimePlaygroundStore();

  const isRealtime = realtimeStore.executionMode === 'REAL-TIME';

  const [localPrompt, setLocalPrompt] = useState(
    isRealtime ? (realtimeStore.prompt || mockStore.scenario.prompt) : mockStore.scenario.prompt
  );

  const isRunning = isRealtime
    ? (realtimeStore.machineState !== 'IDLE' && realtimeStore.machineState !== 'COMPLETE' && realtimeStore.machineState !== 'ERROR')
    : (mockStore.machineState !== 'IDLE' && mockStore.machineState !== 'COMPLETE');

  // Sync with preset scenario changes
  useEffect(() => {
    if (!isRunning) {
      setLocalPrompt(mockStore.scenario.prompt);
    }
  }, [mockStore.scenario.prompt, isRunning]);

  const handleRun = () => {
    if (isRealtime) {
      realtimeStore.runVerification(localPrompt);
    } else {
      mockStore.runVerification();
    }
  };

  const handleReset = () => {
    if (isRealtime) {
      realtimeStore.reset();
    } else {
      mockStore.reset();
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Prompt</h2>
        {isRealtime && realtimeStore.ollamaStatus === 'OFFLINE' && (
          <span className="text-xs text-rose-400 font-mono">Ollama Offline (check :11434)</span>
        )}
      </div>
      <Textarea
        value={localPrompt}
        onChange={(e) => setLocalPrompt(e.target.value)}
        disabled={isRunning}
        className="min-h-[100px] resize-none font-medium text-base bg-background/50 border-border focus-visible:ring-1"
        placeholder="Enter any prompt to generate & verify in real time..."
      />
      <div className="flex gap-3 justify-end mt-2">
        <Button 
          variant="outline" 
          onClick={handleReset} 
          disabled={isRunning}
          size="sm"
        >
          Clear / Reset
        </Button>
        <Button 
          onClick={handleRun} 
          disabled={isRunning || !localPrompt.trim()}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5"
        >
          {isRunning ? 'Running Verification...' : 'Run Verification'}
        </Button>
      </div>
    </div>
  );
};
