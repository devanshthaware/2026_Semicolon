import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { Loader2 } from 'lucide-react';

export function Section2_StreamingResponse() {
  const { currentTokens, isStreaming } = useStreamingStore();

  return (
    <Card className="h-full flex flex-col border-border bg-card shadow-sm">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-lg font-semibold flex items-center">
          <div className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          Live LLM Output
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[300px]">
        {isStreaming && !currentTokens && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground animate-pulse">Initializing Verification Pipeline...</span>
            </div>
          </div>
        )}
        <div className="p-6 text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap">
          {currentTokens ? (
            <>{currentTokens}<span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 align-middle" /></>
          ) : (
            !isStreaming && <span className="text-muted-foreground/60 italic font-sans">Awaiting prompt execution. The response will stream here before being captured by the verification agents...</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
