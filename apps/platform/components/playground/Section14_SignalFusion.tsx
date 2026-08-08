import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { Network } from 'lucide-react';

export function Section14_SignalFusion() {
  const { trustScore, isStreaming, events } = useStreamingStore();
  const isComplete = events.some(e => e.type === 'workflow_complete');

  return (
    <Card className="border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Network className="w-5 h-5 mr-2 text-indigo-500" />
          Signal Fusion & Trust Model
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        
        {/* Background Decorative Rings */}
        <div className={`absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none ${isStreaming ? 'animate-spin-slow' : ''}`}>
          <div className="w-[120%] pb-[120%] rounded-full border-2 border-dashed border-indigo-500/30 absolute" />
          <div className="w-[100%] pb-[100%] rounded-full border border-purple-500/20 absolute" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
        </div>

        <div className="z-10 text-center space-y-4">
          <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Aggregated Trust Score</div>
          
          <div className="relative inline-block">
            <div className={`text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter ${trustScore !== null ? 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500' : 'text-muted-foreground/30'}`}>
              {trustScore !== null ? (trustScore * 100).toFixed(1) : '---'}
            </div>
            {trustScore !== null && (
              <span className="absolute top-2 -right-6 text-2xl font-bold text-muted-foreground">%</span>
            )}
          </div>

          <div className="h-6">
            {trustScore !== null && isComplete && (
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                trustScore >= 0.82 ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                trustScore >= 0.56 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {trustScore >= 0.82 ? 'Grounded' : trustScore >= 0.56 ? 'Review Required' : 'Flagged Hallucination'}
              </span>
            )}
            {isStreaming && trustScore === null && (
              <span className="text-xs text-blue-500 animate-pulse font-medium">Aggregating signals...</span>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
