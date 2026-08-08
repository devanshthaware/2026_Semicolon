import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { BookOpen } from 'lucide-react';

export function Section9_EvidenceViewer() {
  const { events } = useStreamingStore();
  const retrievals = events.filter(e => e.type === 'retrieval');

  return (
    <Card className="border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-lg font-semibold flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-orange-500" />
          Retrieved Evidence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[150px]">
          {retrievals.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-full text-muted-foreground text-sm border border-dashed rounded-md bg-muted/10">
              Waiting for evidence retrieval...
            </div>
          ) : (
            retrievals.map((ret, idx) => (
              <div key={idx} className="border rounded-md p-4 bg-muted/10 text-sm overflow-hidden flex flex-col transition-all hover:bg-muted/30 hover:border-border/80">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground truncate mr-2" title={ret.payload.source}>
                    {ret.payload.source}
                  </span>
                  <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-bold border border-orange-500/20 whitespace-nowrap">
                    Score: {ret.payload.score}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-4 flex-1">
                  "{ret.payload.snippet}"
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
