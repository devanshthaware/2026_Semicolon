'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Claim {
  id: string;
  text: string;
  type: string;
  confidence: number;
}

interface ClaimTreeProps {
  claims: Claim[];
}

export function ClaimTree({ claims }: ClaimTreeProps) {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Extracted Claims</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {claims.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No claims extracted yet...</div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-3 border rounded-lg bg-card text-card-foreground shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">{claim.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Conf: {(claim.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm font-medium">{claim.text}</p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
