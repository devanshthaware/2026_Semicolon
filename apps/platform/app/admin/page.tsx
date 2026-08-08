'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Activity,
  Server,
  Database,
  Radio,
  Boxes,
  ShieldCheck,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const res = await fetch('/api/admin/system-health')
      if (!res.ok) throw new Error('Failed to fetch health')
      return res.json()
    },
    refetchInterval: 10000
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    }
  })

  const { data: verificationData, isLoading: verificationsLoading } = useQuery({
    queryKey: ['admin-verification-monitor'],
    queryFn: async () => {
      const res = await fetch('/api/admin/verification-monitor')
      if (!res.ok) throw new Error('Failed to fetch verifications')
      return res.json()
    }
  })

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['admin-models'],
    queryFn: async () => {
      const res = await fetch('/api/admin/models')
      if (!res.ok) throw new Error('Failed to fetch models')
      return res.json()
    }
  })

  const users = usersData?.users || []
  const totalUsers = users.length
  const activeUsers = users.filter((u: any) => u.status === 'ACTIVE').length
  const verifications = verificationData?.sessions || []
  const verificationsToday = verifications.length
  const models = modelsData?.models || []

  const services = healthData?.services || {}

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Argus Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time operational control plane and system status monitor
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchHealth()}
            className="text-xs font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Telemetry
          </Button>
        </div>

        {/* Real System Telemetry Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase">TOTAL USERS</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
              {usersLoading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : totalUsers}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{activeUsers} Active</span>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase">VERIFICATIONS</span>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-foreground">
              {verificationsLoading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : verificationsToday}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Sessions Tracked</span>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase">OLLAMA STATUS</span>
              <Server className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {healthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : services.ollama?.status === 'CONNECTED' ? (
                <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> CONNECTED
                </span>
              ) : (
                <span className="text-sm font-bold font-mono text-rose-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> OFFLINE
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">http://localhost:11434</span>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase">DATABASE</span>
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {healthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : services.database?.status === 'HEALTHY' ? (
                <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> HEALTHY
                </span>
              ) : (
                <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> DEGRADED
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">PostgreSQL</span>
          </Card>
        </div>

        {/* Live System Health Matrix & Active Models */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Infrastructure Health Status */}
          <Card className="p-5 bg-card border-border space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> SYSTEM SERVICE STATUS
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">LIVE POLLING (10s)</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2.5 bg-muted/20 border border-border rounded-lg">
                <span className="font-semibold text-foreground">Ollama Inference Service</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${services.ollama?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {services.ollama?.status || 'CHECKING'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-muted/20 border border-border rounded-lg">
                <span className="font-semibold text-foreground">FastAPI LangGraph Service</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${services.fastapi?.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {services.fastapi?.status || 'CHECKING'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-muted/20 border border-border rounded-lg">
                <span className="font-semibold text-foreground">WebSocket EventStream</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {services.websocket?.status || 'CONNECTED'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-muted/20 border border-border rounded-lg">
                <span className="font-semibold text-foreground">PostgreSQL Database</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${services.database?.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {services.database?.status || 'HEALTHY'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-muted/20 border border-border rounded-lg">
                <span className="font-semibold text-foreground">Redis Cache Layer</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                  NOT CONFIGURED
                </span>
              </div>
            </div>
          </Card>

          {/* Active Configured Models */}
          <Card className="p-5 bg-card border-border space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Boxes className="w-4 h-4 text-primary" /> CONFIGURED OLLAMA MODELS
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">
                {models.length} Model(s) Loaded
              </span>
            </div>

            {modelsLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
              </div>
            ) : models.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No Ollama models detected. Verify Ollama service on http://localhost:11434.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs font-mono">
                {models.map((m: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-muted/20 border border-border rounded-lg">
                    <div>
                      <span className="font-bold text-foreground block">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">Size: {m.size}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
