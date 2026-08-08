import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { Code2 } from 'lucide-react';

export function Section5_StateInspector() {
  const { isStreaming, currentTokens, trustScore, claims, agents, events } = useStreamingStore();

  const stateObject = {
    status: isStreaming ? 'processing' : events.some(e => e.type === 'workflow_complete') ? 'completed' : 'idle',
    metrics: {
      trust_score: trustScore,
      total_claims_extracted: claims.length,
      agents_invoked: agents.length,
    },
    live_events: events.map(e => e.type),
    langgraph_state: {
      input: currentTokens?.substring(0, 50) + (currentTokens && currentTokens.length > 50 ? '...' : ''),
      claims: claims.map(c => c.text.substring(0, 30) + '...'),
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm h-[400px] flex flex-col">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-semibold flex items-center text-muted-foreground">
          <Code2 className="w-4 h-4 mr-2" />
          VerificationState
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-auto bg-black/95">
        <pre className="p-4 text-[10px] sm:text-xs font-mono leading-relaxed text-blue-400">
          {JSON.stringify(stateObject, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
