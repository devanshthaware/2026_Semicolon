'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Evidence {
  id: string;
  source: string;
  content: string;
  relevanceScore: number;
}

interface EvidenceViewerProps {
  evidence: Evidence[];
}

export function EvidenceViewer({ evidence }: EvidenceViewerProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Retrieved Evidence</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {evidence.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No evidence retrieved...</div>
        ) : (
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {evidence.map((item) => (
                <div key={item.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary truncate max-w-[200px]">
                      {item.source}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Score: {item.relevanceScore.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
