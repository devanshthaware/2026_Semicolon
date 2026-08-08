'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, RefreshCw, Loader2 } from 'lucide-react'

export default function AuditLogsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/audit-logs')
      if (!res.ok) throw new Error('Failed to fetch audit logs')
      return res.json()
    }
  })

  const auditLogs = data?.auditLogs || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Security Audit Logs</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auditable security log of all administrative actions, role changes, and key revocations
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Audit Trail
          </Button>
        </div>

        <Card className="border border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 py-3 border-b border-border">
            <CardTitle className="text-xs font-mono font-bold uppercase text-muted-foreground">
              SECURITY AUDIT TRAIL ({auditLogs.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                <span className="text-xs text-muted-foreground mt-2 block font-mono">Loading audit logs...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-mono">
                No security audit events recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/20 border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Admin User</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Resource</th>
                      <th className="py-3 px-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{log.admin}</td>
                        <td className="py-3 px-4 text-primary font-bold">{log.action}</td>
                        <td className="py-3 px-4 text-muted-foreground">{log.target || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {log.result}
                          </span>
                        </td>
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
