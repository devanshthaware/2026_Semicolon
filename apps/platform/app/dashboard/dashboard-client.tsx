'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const lineChartData = [
  { time: '00:00', requests: 400 },
  { time: '04:00', requests: 3000 },
  { time: '08:00', requests: 2000 },
  { time: '12:00', requests: 2780 },
  { time: '16:00', requests: 1890 },
  { time: '20:00', requests: 2390 },
  { time: '24:00', requests: 3490 },
]

const distributionData = [
  { name: 'High', value: 45 },
  { name: 'Medium', value: 30 },
  { name: 'Low', value: 25 },
]

const recentSessions = [
  { id: 1, prompt: 'CEO of OpenAI', status: 'verified', trust: 97 },
  { id: 2, prompt: 'GDP of India', status: 'verified', trust: 95 },
  { id: 3, prompt: 'Mars Radius', status: 'warning', trust: 73 },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Last 24 Hours</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">18,420</span>
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  12%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">from last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">96.3%</span>
                <Badge variant="outline" className="text-green-600 border-green-300">+2.1%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">verification rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">94%</span>
                <span className="text-sm text-muted-foreground">overall</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">trust score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">182ms</span>
                <span className="text-sm text-muted-foreground">p95</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">response time</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* API Requests Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>API Requests Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="requests" stroke="var(--primary)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trust Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Trust Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Verification Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{session.prompt}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {session.status === 'verified' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="text-sm">{session.trust}%</span>
                    </div>
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
