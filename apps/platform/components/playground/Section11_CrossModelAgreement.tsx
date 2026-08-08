import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Section11_CrossModelAgreement(props: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section11_CrossModelAgreement</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
           <div className="p-3 border rounded text-center bg-green-500/10 border-green-500/30"><div className="text-xs font-bold text-green-500">Qwen 2.5</div><div className="text-[10px] mt-1 text-muted-foreground">AGREES</div></div>
           <div className="p-3 border rounded text-center bg-green-500/10 border-green-500/30"><div className="text-xs font-bold text-green-500">Llama 3</div><div className="text-[10px] mt-1 text-muted-foreground">AGREES</div></div>
           <div className="p-3 border rounded text-center bg-orange-500/10 border-orange-500/30"><div className="text-xs font-bold text-orange-500">Mistral</div><div className="text-[10px] mt-1 text-muted-foreground">NEUTRAL</div></div>
           <div className="p-3 border rounded text-center bg-green-500/10 border-green-500/30"><div className="text-xs font-bold text-green-500">Gemma 2</div><div className="text-[10px] mt-1 text-muted-foreground">AGREES</div></div>
        </div>
    
      </CardContent>
    </Card>
  );
}
