import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { CheckCircle2, Circle, Loader2, PlayCircle } from 'lucide-react';

const stages = [
  { id: 'extract', name: 'Claim Extraction' },
  { id: 'retrieve', name: 'Evidence Retrieval' },
  { id: 'evaluate', name: 'NLI Evaluation' },
  { id: 'fusion', name: 'Signal Fusion' }
];

export function Section3_VerificationPipeline() {
  const { isStreaming, events } = useStreamingStore();

  // Determine current stage based on events
  let currentStageIndex = -1;
  
  if (isStreaming) {
    currentStageIndex = 0; // default to first stage if streaming
    
    // Check if extraction is done
    if (events.some(e => e.type === 'claim_extracted')) {
      currentStageIndex = 1;
    }
    
    // Check if retrieval started
    if (events.some(e => e.type === 'retrieval')) {
      currentStageIndex = 2;
    }
    
    // Check if trust update happened
    if (events.some(e => e.type === 'trust_update')) {
      currentStageIndex = 3;
    }
  } else if (events.some(e => e.type === 'workflow_complete')) {
    currentStageIndex = 4; // all done
  }

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-muted/20">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Execution Pipeline</h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
          {isStreaming ? 'PROCESSING' : currentStageIndex === 4 ? 'COMPLETED' : 'IDLE'}
        </span>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between relative">
          
          {/* Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 ease-in-out"
              style={{ width: `${Math.min(100, Math.max(0, (currentStageIndex / (stages.length - 1)) * 100))}%` }}
            />
          </div>

          {/* Nodes */}
          {stages.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx || currentStageIndex === 4;
            const isCurrent = currentStageIndex === idx;
            const isPending = currentStageIndex < idx && currentStageIndex !== 4;

            return (
              <div key={stage.id} className="relative flex flex-col items-center z-10">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 bg-background transition-colors duration-500 ${
                    isCompleted ? 'border-green-500 text-green-500' : 
                    isCurrent ? 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                    'border-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isCurrent ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6 opacity-50" />
                  )}
                </div>
                <span className={`mt-3 text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-blue-500' : 'text-muted-foreground'}`}>
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
