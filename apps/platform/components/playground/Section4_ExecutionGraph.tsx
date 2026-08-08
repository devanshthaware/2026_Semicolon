import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { GitCommit, Search, ShieldCheck, Cpu, Box, Workflow } from 'lucide-react';

export function Section4_ExecutionGraph() {
  const { isStreaming, events, claims } = useStreamingStore();

  const isExtractionDone = events.some(e => e.type === 'claim_extracted');
  const isWorkflowDone = events.some(e => e.type === 'workflow_complete');

  return (
    <Card className="border-border bg-card shadow-sm col-span-12">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Workflow className="w-5 h-5 mr-2 text-blue-500" />
          LangGraph Execution Tree
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 flex flex-col items-center overflow-x-auto min-h-[400px]">
        
        {/* Start Node */}
        <div className="flex flex-col items-center">
          <div className={`px-4 py-2 rounded-lg border flex items-center shadow-sm ${isStreaming || isWorkflowDone ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-muted border-border text-muted-foreground'}`}>
            <Box className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold">User Prompt</span>
          </div>
          <div className={`w-0.5 h-8 ${isStreaming || isWorkflowDone ? 'bg-blue-500' : 'bg-border'}`} />
          
          <div className={`px-4 py-2 rounded-lg border flex items-center shadow-sm ${isExtractionDone || isWorkflowDone ? 'bg-purple-500/10 border-purple-500 text-purple-500' : isStreaming ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : 'bg-muted border-border text-muted-foreground'}`}>
            <Cpu className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold">Claim Extraction Agent</span>
          </div>
        </div>

        {/* Dynamic Claim Branches */}
        {claims.length > 0 && (
          <div className="flex flex-col items-center w-full mt-8 relative">
            <div className="absolute top-0 w-full flex justify-center">
              <div className="w-[80%] h-0.5 bg-border rounded-full" />
            </div>
            
            <div className="flex justify-between w-full max-w-4xl pt-8 relative">
              {claims.map((claim, idx) => {
                
                // Determine states for this specific claim branch
                const isRetrieving = events.some(e => e.type === 'agent_start' && e.payload.id === `ret_${idx + 1}`);
                const isRetrieved = events.some(e => e.type === 'agent_end' && e.payload.id === `ret_${idx + 1}`);
                const isVerifying = events.some(e => e.type === 'agent_start' && e.payload.id === `ver_${idx + 1}`);
                const isVerified = events.some(e => e.type === 'agent_end' && e.payload.id === `ver_${idx + 1}`);

                return (
                  <div key={claim.id} className="flex flex-col items-center flex-1 relative">
                    {/* Connector up to the horizontal bar */}
                    <div className="absolute -top-8 w-0.5 h-8 bg-border" />
                    
                    <div className="px-3 py-1.5 rounded-full border bg-background text-xs font-medium max-w-[120px] truncate mb-6 shadow-sm">
                      {claim.text}
                    </div>

                    <div className={`w-0.5 h-6 ${isRetrieving ? 'bg-blue-500' : 'bg-border'}`} />
                    
                    <div className={`p-2 rounded-full border shadow-sm ${isRetrieved ? 'bg-orange-500/10 border-orange-500 text-orange-500' : isRetrieving ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : 'bg-muted border-border text-muted-foreground'}`}>
                      <Search className="w-4 h-4" />
                    </div>
                    
                    <div className={`w-0.5 h-6 ${isRetrieved ? 'bg-border' : 'bg-transparent'}`} />

                    <div className={`p-2 rounded-full border shadow-sm ${isVerified ? 'bg-green-500/10 border-green-500 text-green-500' : isVerifying ? 'bg-blue-500 border-blue-500 text-white animate-pulse' : 'bg-muted border-border text-muted-foreground'}`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Fusion Connector */}
            {isWorkflowDone && (
              <div className="flex flex-col items-center w-full mt-8 relative">
                <div className="absolute top-0 w-[80%] h-0.5 bg-border rounded-full" />
                {claims.map((claim, idx) => (
                  <div key={`down-${claim.id}`} className="absolute top-0 w-0.5 h-8 bg-border" style={{ left: `${(idx + 0.5) * (100 / claims.length)}%` }} />
                ))}
                <div className="w-0.5 h-8 bg-border mt-0" />
                <div className="px-4 py-2 rounded-lg border bg-indigo-500/10 border-indigo-500 text-indigo-500 flex items-center shadow-sm">
                  <GitCommit className="w-4 h-4 mr-2" />
                  <span className="text-sm font-semibold">Signal Fusion Model</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!isExtractionDone && !isStreaming && (
           <div className="flex flex-col items-center w-full mt-8">
             <div className="px-4 py-2 rounded-lg border border-dashed text-muted-foreground text-sm">
               Awaiting claims...
             </div>
           </div>
        )}

      </CardContent>
    </Card>
  );
}
