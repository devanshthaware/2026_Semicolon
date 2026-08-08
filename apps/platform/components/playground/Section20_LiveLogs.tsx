import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { Terminal } from 'lucide-react';

export function Section20_LiveLogs() {
  const { events } = useStreamingStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <Card className="border-border bg-card shadow-sm col-span-12">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-muted-foreground" />
          Live Output Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="bg-black/90 text-green-400 p-4 font-mono text-[11px] h-[250px] overflow-y-auto leading-relaxed"
        >
          {events.length === 0 ? (
            <div className="text-muted-foreground/50 italic">Waiting for verification execution...</div>
          ) : (
            events.map((event, i) => (
              <div key={i} className="mb-1 border-b border-green-900/30 pb-1">
                <span className="text-gray-500 mr-2">[{new Date().toISOString().split('T')[1].split('Z')[0]}]</span>
                <span className="text-blue-400 font-bold mr-2">[{event.type.toUpperCase()}]</span>
                <span className="text-green-300 break-all">{JSON.stringify(event.payload)}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
