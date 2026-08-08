import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Section21_VerificationReceipt(props: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section21_VerificationReceipt</CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="border-t pt-4 mt-4">
           <div className="flex justify-between items-center">
             <div className="text-xs text-muted-foreground font-mono">Receipt Hash: 0x4f...9a2</div>
             <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-[10px] uppercase font-bold">Verified Immutable</div>
           </div>
        </div>
    
      </CardContent>
    </Card>
  );
}
