'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Stores & Hooks
import { useVerificationStream } from '@/hooks/useVerificationStream';
import { useStreamingStore } from '@/store/useStreamingStore';

// Visualizations
import { TrustGauge } from '@/components/visualizations/TrustGauge';
import { AgentTimeline } from '@/components/visualizations/AgentTimeline';
import { ClaimTree } from '@/components/visualizations/ClaimTree';
import { EvidenceViewer } from '@/components/visualizations/EvidenceViewer';

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Hook connects to SSE stream automatically when activeSessionId is set
  useVerificationStream(activeSessionId);

  const { isStreaming, currentTokens, trustScore, claims, agents, events, resetStream } = useStreamingStore();

  const handleVerify = () => {
    resetStream();
    // In a full implementation, this would POST to the backend to create a session
    // and then set the activeSessionId to the returned ID to begin SSE.
    // For now, we simulate starting a session with a unique ID:
    const mockSessionId = 'session_' + Date.now();
    setActiveSessionId(mockSessionId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verification Playground</h1>
          <p className="text-muted-foreground">Test the real-time LLM verification pipeline.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Input & Live Output */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter a statement or claim to verify..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 resize-none"
                  disabled={isStreaming}
                />
                <Button onClick={handleVerify} disabled={!prompt || isStreaming} className="w-full">
                  {isStreaming ? 'Verifying in Real-time...' : 'Run Verification'}
                </Button>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Streaming Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-64 rounded-lg border border-border bg-muted p-4 text-sm relative">
                  {isStreaming && !currentTokens && (
                     <div className="flex items-center justify-center h-full absolute inset-0">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                     </div>
                  )}
                  {currentTokens ? (
                    <p className="text-foreground whitespace-pre-wrap">{currentTokens}</p>
                  ) : (
                    !isStreaming && <p className="text-muted-foreground">LLM response tokens will stream here...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Key Visualizations */}
          <div className="space-y-6">
            <TrustGauge score={trustScore} />
            <AgentTimeline activities={agents} />
          </div>
        </div>

        {/* Bottom Panel: Claims & Evidence */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ClaimTree claims={claims} />
          
          {/* Since we don't have distinct retrieved evidence in the store yet, we map events loosely for now */}
          <EvidenceViewer 
            evidence={events
              .filter(e => e.type === 'retrieval')
              .map((e, idx) => ({
                id: String(idx),
                source: e.payload.source || 'Unknown Source',
                content: e.payload.snippet || 'Retrieved context snippet...',
                relevanceScore: e.payload.score || 0.0
              }))} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
