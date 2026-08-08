'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Shield, Server, Lock } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin System Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system-level session security, rate limits, and model gateway endpoints
          </p>
        </div>

        <Card className="p-6 bg-card border-border max-w-2xl space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Shield className="w-4 h-4 text-primary" /> Session Security & Rate Limits
            </h3>

            <div className="space-y-1.5">
              <label className="font-mono text-foreground font-semibold">JWT Session Timeout (minutes)</label>
              <Input defaultValue="60" readOnly className="bg-muted/40 border-border font-mono text-xs max-w-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-foreground font-semibold">Admin Login Rate Limit (attempts / min)</label>
              <Input defaultValue="5" readOnly className="bg-muted/40 border-border font-mono text-xs max-w-xs" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Server className="w-4 h-4 text-primary" /> Model Gateway Endpoints
            </h3>

            <div className="space-y-1.5">
              <label className="font-mono text-foreground font-semibold">Ollama Local Engine URL</label>
              <Input defaultValue="http://localhost:11434" readOnly className="bg-muted/40 border-border font-mono text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-foreground font-semibold">FastAPI LangGraph Runtime URL</label>
              <Input defaultValue="http://localhost:8000" readOnly className="bg-muted/40 border-border font-mono text-xs" />
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
