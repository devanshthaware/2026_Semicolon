'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
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
import { useQuery } from '@tanstack/react-query'
import { getDashboardMetrics } from '../actions/dashboard'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => getDashboardMetrics(),
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  })

  // Show a loading state while the initial data is being fetched
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center text-destructive">
          Error loading dashboard data: {error.message}
        </div>
      </DashboardLayout>
    )
  }

  if (!data) return null;

  const {
    totalCalls,
    verifiedRate,
    avgTrust,
    distributionData,
    recentSessions,
    lineChartData
  } = data

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Real-time metrics</p>
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
                <span className="text-3xl font-bold">{totalCalls.toLocaleString()}</span>
                {/* Keeping the trend static for now as it requires complex historical comparison */}
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  Live
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">total calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{verifiedRate}%</span>
                <Badge variant="outline" className="text-green-600 border-green-300">Live</Badge>
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
                <span className="text-3xl font-bold">{avgTrust}%</span>
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
                <span className="text-sm text-muted-foreground">p95 (estimated)</span>
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
              <CardTitle>API Requests Timeline (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
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
                  <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
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
              {recentSessions.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-4">No recent sessions found.</div>
              ) : (
                recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                    <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap mr-4">
                      <p className="font-medium truncate">{session.prompt}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-2">
                        {session.status === 'verified' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : session.status === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="text-sm w-10 text-right">{session.trust}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
