import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { CheckCircle2, Circle, AlertTriangle, XCircle, ArrowDown } from 'lucide-react';

export const PipelineVisualizer = () => {
  const { scenario, machineState, elapsedMs } = useMockPlaygroundStore();
  
  if (machineState === 'IDLE' || machineState === 'PROMPT_READY') {
    return (
      <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-sm">Pipeline waiting...</p>
      </div>
    );
  }

  // Helper to determine status based on timeline elapsedMs
  const getStepStatus = (stepTimeMs: number) => {
    if (elapsedMs < stepTimeMs) return 'WAITING';
    if (elapsedMs < stepTimeMs + 200) return 'RUNNING'; // Simulated 200ms run time
    return 'COMPLETED';
  };

  const getStepIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'RUNNING') return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const getStepColor = (status: string) => {
    if (status === 'COMPLETED') return 'border-green-500/50 bg-green-500/10 text-green-400';
    if (status === 'RUNNING') return 'border-blue-500 bg-blue-500/10 text-blue-400';
    return 'border-border bg-muted/20 text-muted-foreground';
  };

  // We map the timeline events to visually distinct nodes
  return (
    <div className="flex flex-col items-center gap-2 p-6 border rounded-lg bg-card text-card-foreground">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground w-full text-left mb-4">Live Verification Pipeline</h2>
      
      {scenario.timeline.map((event, index) => {
        const status = getStepStatus(event.timeMs);
        const isLast = index === scenario.timeline.length - 1;
        
        return (
          <React.Fragment key={index}>
            <div className={`w-full max-w-sm p-3 rounded-md border flex items-center gap-4 transition-all duration-300 ${getStepColor(status)}`}>
              {getStepIcon(status)}
              <span className="font-mono text-sm tracking-tight font-medium uppercase">{event.event}</span>
            </div>
            {!isLast && (
              <ArrowDown className={`w-4 h-4 ${elapsedMs > event.timeMs ? 'text-primary' : 'text-muted-foreground'} transition-colors duration-300`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
