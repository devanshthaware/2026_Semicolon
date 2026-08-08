import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Section10_SemanticProbe(props: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section10_SemanticProbe</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="flex items-center justify-center space-x-8 py-4">
           <div className="flex flex-col items-center">
             <div className="text-3xl font-bold text-green-500">0.02</div>
             <div className="text-xs text-muted-foreground uppercase mt-1">Entropy</div>
           </div>
           <div className="h-12 w-px bg-border"></div>
           <div className="flex flex-col items-center">
             <div className="text-3xl font-bold text-blue-500">0.98</div>
             <div className="text-xs text-muted-foreground uppercase mt-1">Consistency</div>
           </div>
        </div>
    
      </CardContent>
    </Card>
  );
}
