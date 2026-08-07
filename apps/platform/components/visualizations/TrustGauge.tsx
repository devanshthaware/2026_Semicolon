'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrustGaugeProps {
  score: number | null; // 0 to 100
}

export function TrustGauge({ score }: TrustGaugeProps) {
  const displayScore = score !== null ? score : 0;
  
  const data = [
    { name: 'Score', value: displayScore },
    { name: 'Remaining', value: 100 - displayScore }
  ];

  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // Green
    if (s >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const COLORS = [getColor(displayScore), 'hsl(var(--muted))'];

  return (
    <Card className="flex flex-col items-center justify-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Fusion Trust Score</CardTitle>
      </CardHeader>
      <CardContent className="w-full h-[200px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center justify-center bottom-4">
          <span className="text-3xl font-bold tracking-tighter">
            {score !== null ? `${score.toFixed(1)}%` : '--'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
