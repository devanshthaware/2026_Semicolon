import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { Clock } from 'lucide-react';

export function Section17_AgentTimeline() {
  const { agents } = useStreamingStore();

  return (
    <Card className="border-border bg-card shadow-sm col-span-12">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Clock className="w-5 h-5 mr-2 text-muted-foreground" />
          Agent Execution Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-16 w-full flex rounded-md overflow-hidden border bg-muted/10">
          {agents.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              Timeline will populate during execution...
            </div>
          ) : (
            agents.map((agent, idx) => {
              // Calculate width based on duration (mocking width for now, assuming even distribution)
              const widthStr = `${100 / agents.length}%`;
              const isRunning = agent.status === 'running';
              
              let bgColor = 'bg-blue-500/20 text-blue-500';
              if (agent.name.includes('Extractor')) bgColor = 'bg-purple-500/20 text-purple-500';
              if (agent.name.includes('Retriever')) bgColor = 'bg-orange-500/20 text-orange-500';
              if (agent.name.includes('Verifier')) bgColor = 'bg-green-500/20 text-green-500';

              return (
                <div 
                  key={idx} 
                  className={`h-full ${bgColor} border-r flex flex-col items-center justify-center truncate px-2 transition-all duration-300 ${isRunning ? 'animate-pulse' : ''}`}
                  style={{ width: widthStr }}
                  title={`${agent.name} - ${agent.status}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate w-full text-center">{agent.name.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-70 uppercase mt-1">{agent.status}</span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
