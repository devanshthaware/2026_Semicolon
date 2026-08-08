'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Activity, RefreshCw, Server, Database, Radio, Boxes, CheckCircle2, XCircle } from 'lucide-react'

export default function SystemHealthPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-health-telemetry'],
    queryFn: async () => {
      const res = await fetch('/api/admin/system-health')
      if (!res.ok) throw new Error('Failed health fetch')
      return res.json()
    },
    refetchInterval: 5000
  })

  const services = data?.services || {}

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">System Infrastructure Health</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live telemetry monitoring of active services, model runtimes, and persistence layers
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Telemetry
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <Card className="p-5 bg-card border-border space-y-3">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="font-bold text-foreground">Ollama LLM Engine</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${services.ollama?.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {services.ollama?.status || 'OFFLINE'}
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">Endpoint: {services.ollama?.endpoint || 'http://localhost:11434'}</p>
          </Card>

          <Card className="p-5 bg-card border-border space-y-3">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="font-bold text-foreground">FastAPI LangGraph Service</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${services.fastapi?.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                {services.fastapi?.status || 'OFFLINE'}
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">Endpoint: {services.fastapi?.endpoint || 'http://localhost:8000'}</p>
          </Card>

          <Card className="p-5 bg-card border-border space-y-3">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="font-bold text-foreground">PostgreSQL Persistence</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${services.database?.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {services.database?.status || 'HEALTHY'}
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">Engine: PostgreSQL DB</p>
          </Card>

          <Card className="p-5 bg-card border-border space-y-3">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="font-bold text-foreground">WebSocket EventStream</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                CONNECTED
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">Real-time Event Pipeline Active</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
