'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const systemMetrics = [
  { label: 'CPU', value: 34, status: 'healthy' },
  { label: 'GPU', value: 61, status: 'healthy' },
  { label: 'Memory', value: 48, status: 'healthy' },
  { label: 'Queue', value: 12, status: 'healthy', unit: 'jobs' },
]

const models = [
  { name: 'Llama', status: 'online', requests: 4200 },
  { name: 'Qwen', status: 'online', requests: 3100 },
  { name: 'Mistral', status: 'online', requests: 2800 },
  { name: 'GPT API', status: 'degraded', requests: 1850 },
]

const systemData = [
  { time: '00:00', cpu: 34, gpu: 61, memory: 48 },
  { time: '04:00', cpu: 42, gpu: 68, memory: 52 },
  { time: '08:00', cpu: 38, gpu: 55, memory: 46 },
  { time: '12:00', cpu: 45, gpu: 72, memory: 58 },
  { time: '16:00', cpu: 41, gpu: 64, memory: 50 },
  { time: '20:00', cpu: 39, gpu: 59, memory: 49 },
  { time: '24:00', cpu: 34, gpu: 61, memory: 48 },
]

const requestsData = [
  { time: '00:00', requests: 2400 },
  { time: '04:00', requests: 3000 },
  { time: '08:00', requests: 2800 },
  { time: '12:00', requests: 3500 },
  { time: '16:00', requests: 3200 },
  { time: '20:00', requests: 2900 },
  { time: '24:00', requests: 2600 },
]

const logs = [
  { level: 'INFO', message: 'Service restarted successfully', time: '2:34 PM' },
  { level: 'WARNING', message: 'GPU utilization above 60%', time: '1:12 PM' },
  { level: 'ERROR', message: 'GPT API timeout - retrying connection', time: '12:45 PM' },
]

export default function SystemHealthPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Health</h1>
            <p className="text-muted-foreground">Infrastructure monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {systemMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{metric.value}%</span>
                    <Badge
                      variant="outline"
                      className={metric.status === 'healthy' ? 'text-green-600 border-green-300' : 'text-yellow-600 border-yellow-300'}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Model Status */}
        <Card>
          <CardHeader>
            <CardTitle>Model Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {models.map((model) => (
                <div key={model.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      model.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.requests} requests</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={model.status === 'online' ? 'text-green-600 border-green-300' : 'text-yellow-600 border-yellow-300'}
                  >
                    {model.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* System Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>System Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={systemData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpu" stackId="1" fill="var(--primary)" stroke="var(--primary)" />
                  <Area type="monotone" dataKey="gpu" stackId="1" fill="var(--secondary)" stroke="var(--secondary)" />
                  <Area type="monotone" dataKey="memory" stackId="1" fill="var(--muted)" stroke="var(--muted)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Requests Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={requestsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="var(--primary)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <div className="mt-1">
                    {log.level === 'ERROR' ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : log.level === 'WARNING' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        [{log.level}]
                      </Badge>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                    <p className="text-sm mt-1">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
