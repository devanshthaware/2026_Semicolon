'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AgentActivity {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  details?: string;
  timestamp: string;
}

interface AgentTimelineProps {
  activities: AgentActivity[];
}

export function AgentTimeline({ activities }: AgentTimelineProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Live Agent Execution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">Waiting for agent activity...</div>
        ) : (
          <div className="relative border-l border-muted ml-3 space-y-6">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id + index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="relative pl-6"
              >
                <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${
                  activity.status === 'running' ? 'bg-blue-500 animate-pulse' :
                  activity.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{activity.name}</span>
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
                {activity.details && (
                  <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                )}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
