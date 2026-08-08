import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore } from '@/store/useRealtimePlaygroundStore';
import { CheckCircle2, Circle, ArrowDown, AlertTriangle } from 'lucide-react';

export const PipelineVisualizer = () => {
  const mockStore = useMockPlaygroundStore();
  const realtimeStore = useRealtimePlaygroundStore();

  const isRealtime = realtimeStore.executionMode === 'REAL-TIME';

  if (!isRealtime) {
    const { scenario, machineState, elapsedMs } = mockStore;
    
    if (machineState === 'IDLE' || machineState === 'PROMPT_READY') {
      return (
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground text-sm">Pipeline waiting...</p>
        </div>
      );
    }

    const getStepStatus = (stepTimeMs: number) => {
      if (elapsedMs < stepTimeMs) return 'WAITING';
      if (elapsedMs < stepTimeMs + 200) return 'RUNNING';
      return 'COMPLETED';
    };

    const getStepIcon = (status: string) => {
      if (status === 'COMPLETED') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      if (status === 'RUNNING') return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      return <Circle className="w-5 h-5 text-muted-foreground" />;
    };

    const getStepColor = (status: string) => {
      if (status === 'COMPLETED') return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
      if (status === 'RUNNING') return 'border-blue-500 bg-blue-500/10 text-blue-400';
      return 'border-border bg-muted/20 text-muted-foreground';
    };

    return (
      <div className="flex flex-col items-center gap-2 p-6 border rounded-lg bg-card text-card-foreground">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-full text-left mb-4">Live Verification Pipeline (Mock)</h2>
        
        {scenario.timeline.map((event, index) => {
          const status = getStepStatus(event.timeMs);
          const isLast = index === scenario.timeline.length - 1;
          
          return (
            <React.Fragment key={index}>
              <div className={`w-full max-w-sm p-3 rounded-md border flex items-center gap-4 transition-all duration-300 ${getStepColor(status)}`}>
                {getStepIcon(status)}
                <span className="font-mono text-xs tracking-tight font-medium uppercase">{event.event}</span>
              </div>
              {!isLast && (
                <ArrowDown className={`w-4 h-4 ${elapsedMs > event.timeMs ? 'text-primary' : 'text-muted-foreground'} transition-colors duration-300`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Real-Time Pipeline Visualizer
  const { machineState, events, claims, corrections } = realtimeStore;

  if (machineState === 'IDLE') {
    return (
      <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card text-card-foreground items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-sm">Pipeline waiting for real-time verification run...</p>
      </div>
    );
  }

  const realtimeSteps = [
    { id: 'gen', label: '1. Ollama Token Stream', done: !!events.some(e => e.type === 'response.completed') || machineState === 'COMPLETE' },
    { id: 'ext', label: '2. Claim Extraction', done: !!events.some(e => e.type === 'claim.extraction.completed') || machineState === 'COMPLETE' },
    { id: 'route', label: '3. Cost-Aware Router', done: !!events.some(e => e.type === 'routing.started') || machineState === 'COMPLETE' },
    { id: 'layers', label: '4. Multi-Layer Verification', done: !!events.some(e => e.type === 'layer.completed') || machineState === 'COMPLETE' },
    { id: 'corr', label: '5. Model Correction & Re-verify', done: corrections.length > 0 || machineState === 'COMPLETE' },
    { id: 'fuse', label: '6. Signal Fusion & Calibration', done: !!events.some(e => e.type === 'fusion.completed') || machineState === 'COMPLETE' },
    { id: 'receipt', label: '7. Receipt & Postgres Persist', done: machineState === 'COMPLETE' }
  ];

  return (
    <div className="flex flex-col items-center gap-2 p-6 border rounded-lg bg-card text-card-foreground">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Real-Time LangGraph Pipeline</h2>
        <span className="text-xs font-mono text-emerald-400">● ACTIVE PIPELINE</span>
      </div>

      {realtimeSteps.map((step, index) => {
        const isDone = step.done;
        const isCurrent = !isDone && (index === 0 || realtimeSteps[index - 1].done);
        const isLast = index === realtimeSteps.length - 1;

        let borderClass = 'border-border bg-muted/20 text-muted-foreground';
        let icon = <Circle className="w-4 h-4 text-muted-foreground" />;

        if (isDone) {
          borderClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        } else if (isCurrent) {
          borderClass = 'border-blue-500 bg-blue-500/10 text-blue-300';
          icon = <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
        }

        return (
          <React.Fragment key={step.id}>
            <div className={`w-full max-w-sm p-3 rounded-md border flex items-center gap-3 transition-all duration-300 ${borderClass}`}>
              {icon}
              <span className="font-mono text-xs tracking-tight font-semibold uppercase">{step.label}</span>
            </div>
            {!isLast && (
              <ArrowDown className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-muted-foreground/40'} transition-colors duration-300`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
