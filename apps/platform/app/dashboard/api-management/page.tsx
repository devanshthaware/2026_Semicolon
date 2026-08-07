'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export default function ApiManagementPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1500)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-muted-foreground">Configure API settings and routing</p>
        </div>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ratelimit">Requests per Minute</Label>
              <Input
                id="ratelimit"
                type="number"
                defaultValue="1000"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum requests allowed per minute across all API keys
            </p>
          </CardContent>
        </Card>

        {/* Model Routing */}
        <Card>
          <CardHeader>
            <CardTitle>Model Routing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {['Small', 'Large', 'Cross Models'].map((model) => (
                <div key={model} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <span className="font-medium">{model}</span>
                  <select className="border border-border rounded px-2 py-1 bg-background text-sm">
                    <option>Auto</option>
                    <option>Llama</option>
                    <option>Qwen</option>
                    <option>Mistral</option>
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map((layer) => (
              <div key={layer} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{layer} Confidence</Label>
                  <span className="text-sm font-mono">80%</span>
                </div>
                <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Streaming</Label>
                <p className="text-xs text-muted-foreground">Stream verification results in real-time</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Webhooks</Label>
                <p className="text-xs text-muted-foreground">Send verification events to your webhook</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Analytics</Label>
                <p className="text-xs text-muted-foreground">Collect usage analytics</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
