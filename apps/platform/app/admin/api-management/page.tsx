'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Cpu, RefreshCw, Key, ShieldAlert, Loader2 } from 'lucide-react'

export default function AdminApiManagementPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/admin/api-keys')
      if (!res.ok) throw new Error('Failed to fetch API keys')
      return res.json()
    }
  })

  const revokeMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await fetch('/api/admin/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, action: 'REVOKE' })
      })
      if (!res.ok) throw new Error('Failed to revoke API key')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-api-keys'] })
    }
  })

  const apiKeys = data?.apiKeys || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">API Key Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              System-wide API key inspection and emergency revocation control plane
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Keys
          </Button>
        </div>

        <Card className="border border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 py-3 border-b border-border">
            <CardTitle className="text-xs font-mono font-bold uppercase text-muted-foreground">
              SYSTEM API KEYS ({apiKeys.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                <span className="text-xs text-muted-foreground mt-2 block font-mono">Loading API keys...</span>
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-xs text-rose-400 font-mono">
                Failed to load API keys from database.
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-mono">
                No system API keys found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/20 border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">Key Name</th>
                      <th className="py-3 px-4">Masked Secret</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Usage</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {apiKeys.map((key: any) => (
                      <tr key={key.id} className="hover:bg-muted/20 transition-colors font-mono">
                        <td className="py-3 px-4 font-bold text-foreground">{key.name}</td>
                        <td className="py-3 px-4 text-primary font-bold">{key.maskedKey}</td>
                        <td className="py-3 px-4 text-muted-foreground">{key.owner}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${key.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                            {key.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{key.usageCount} calls</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(key.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          {key.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={revokeMutation.isPending}
                              onClick={() => revokeMutation.mutate(key.id)}
                              className="h-7 text-[10px] text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                            >
                              Revoke Key
                            </Button>
                          )}
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
