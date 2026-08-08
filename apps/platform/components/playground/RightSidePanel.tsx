import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RightSidePanel(props: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>RightSidePanel</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-card">
            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">Active Workers</h4>
            <div className="flex items-center space-x-2 text-sm"><div className="w-2 h-2 rounded-full bg-green-500"></div><span>Retriever_01 (Idle)</span></div>
            <div className="flex items-center space-x-2 text-sm mt-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span>NLI_Model_GPU (Idle)</span></div>
          </div>
        </div>
    
      </CardContent>
    </Card>
  );
}
