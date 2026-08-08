'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', range],
    queryFn: () => apiClient.get(`/analytics?range=${range}`)
  })

  const summary = data?.summary || {
    totalVerifications: 0,
    verified: 0,
    warnings: 0,
    failed: 0,
    averageTrustScore: 0,
    averageLatencyMs: 0,
    claimsChecked: 0,
    corrections: 0
  }

  const timeseries = data?.timeseries || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">View usage and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant={range === '7d' ? 'default' : 'outline'} onClick={() => setRange('7d')}>7 Days</Button>
            <Button variant={range === '30d' ? 'default' : 'outline'} onClick={() => setRange('30d')}>30 Days</Button>
            <Button variant={range === '90d' ? 'default' : 'outline'} onClick={() => setRange('90d')}>90 Days</Button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-destructive">
            Unable to load analytics data.
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Verifications</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{summary.totalVerifications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Trust</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{Math.round(summary.averageTrustScore * 100)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Claims Checked</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{summary.claimsChecked}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Corrections</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{summary.corrections}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Verification Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeseries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip />
                      <Line type="monotone" dataKey="verifications" stroke="var(--primary)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trust Score Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Trust Score Trend (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeseries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="trustScore" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
