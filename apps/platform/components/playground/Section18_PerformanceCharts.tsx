import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Section18_PerformanceCharts(props: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section18_PerformanceCharts</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="grid grid-cols-3 gap-4 h-[120px]">
           <div className="border rounded bg-muted/10 flex flex-col items-center justify-center"><div className="text-lg font-bold">12ms</div><div className="text-[10px] text-muted-foreground uppercase">Redis Latency</div></div>
           <div className="border rounded bg-muted/10 flex flex-col items-center justify-center"><div className="text-lg font-bold">84%</div><div className="text-[10px] text-muted-foreground uppercase">Cache Hit</div></div>
           <div className="border rounded bg-muted/10 flex flex-col items-center justify-center"><div className="text-lg font-bold">4.2GB</div><div className="text-[10px] text-muted-foreground uppercase">VRAM Usage</div></div>
        </div>
    
      </CardContent>
    </Card>
  );
}
