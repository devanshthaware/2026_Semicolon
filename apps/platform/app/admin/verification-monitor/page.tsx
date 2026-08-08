'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { Radio, RefreshCw, Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export default function VerificationMonitorPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-verification-activity'],
    queryFn: async () => {
      const res = await fetch('/api/admin/verification-monitor')
      if (!res.ok) throw new Error('Failed to fetch verification activity')
      return res.json()
    },
    refetchInterval: 5000
  })

  const sessions = data?.sessions || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Verification Stream Monitor</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time stream of claim verification executions across all system organizations
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Stream
          </Button>
        </div>

        <Card className="border border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 py-3 border-b border-border">
            <CardTitle className="text-xs font-mono font-bold uppercase text-muted-foreground">
              RECENT VERIFICATION SESSIONS ({sessions.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                <span className="text-xs text-muted-foreground mt-2 block font-mono">Connecting to verification stream...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-mono">
                No verification sessions recorded yet. Run prompts in the Playground to stream sessions.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/20 border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">Session ID</th>
                      <th className="py-3 px-4">User / Org</th>
                      <th className="py-3 px-4">Prompt</th>
                      <th className="py-3 px-4">Verdict</th>
                      <th className="py-3 px-4">Trust Score</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {sessions.map((s: any) => (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-primary font-bold">{s.externalId || s.id.slice(0, 12)}</td>
                        <td className="py-3 px-4 text-muted-foreground">{s.user}</td>
                        <td className="py-3 px-4 text-foreground max-w-xs truncate">{s.prompt}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.verdict === 'GROUNDED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : s.verdict === 'REVIEW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                            {s.verdict}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground">{Math.round((s.trust || 0) * 100)}%</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(s.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
