import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreamingStore } from '@/store/useStreamingStore';
import { ListChecks } from 'lucide-react';

export function Section6_ClaimExtraction() {
  const { claims } = useStreamingStore();

  return (
    <Card className="border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-lg font-semibold flex items-center">
          <ListChecks className="w-5 h-5 mr-2 text-purple-500" />
          Extracted Claims
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3 min-h-[150px]">
          {claims.length === 0 ? (
            <div className="flex items-center justify-center h-[150px] text-muted-foreground text-sm border border-dashed rounded-md bg-muted/10">
              Waiting for extraction...
            </div>
          ) : (
            claims.map((claim, idx) => (
              <div key={claim.id} className="p-4 border rounded-md bg-muted/20 flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0 transition-all hover:bg-muted/40 hover:border-border/80">
                <span className="text-sm font-medium">
                  <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                  {claim.text}
                </span>
                <span className="text-xs bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full font-semibold uppercase tracking-wider self-start md:self-auto border border-purple-500/20">
                  Factual
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
