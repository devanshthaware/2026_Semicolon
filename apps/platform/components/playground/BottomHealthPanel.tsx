import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BottomHealthPanel(props: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>BottomHealthPanel</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="h-10 border-t bg-card flex items-center px-4 justify-between text-xs text-muted-foreground">
           <div className="flex space-x-4">
             <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> API Gateway: Online</span>
             <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> LangGraph: Online</span>
             <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Model Service: Online</span>
           </div>
           <div>v0.2.0-engine</div>
        </div>
    
      </CardContent>
    </Card>
  );
}
