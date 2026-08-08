import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Section8_RetrievalPipeline(props: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section8_RetrievalPipeline</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
             <div className="w-1/3 text-xs font-semibold text-right text-muted-foreground">Vector Search (Qdrant)</div>
             <div className="w-2/3 h-2 bg-muted rounded-full overflow-hidden"><div className="w-[85%] h-full bg-blue-500"></div></div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-1/3 text-xs font-semibold text-right text-muted-foreground">BM25 (Elastic)</div>
             <div className="w-2/3 h-2 bg-muted rounded-full overflow-hidden"><div className="w-[45%] h-full bg-orange-500"></div></div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-1/3 text-xs font-semibold text-right text-muted-foreground">Cross-Encoder (BGE)</div>
             <div className="w-2/3 h-2 bg-muted rounded-full overflow-hidden"><div className="w-[92%] h-full bg-purple-500"></div></div>
          </div>
        </div>
    
      </CardContent>
    </Card>
  );
}
