'use client'

import React from 'react'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import { Loader2 } from 'lucide-react'

const COLORS = ['#0f172a', '#1e293b', '#64748b', '#cbd5e1']

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiClient.get('/analytics')
  })
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
            <Button variant="outline">7 Days</Button>
            <Button variant="outline">30 Days</Button>
            <Button>90 Days</Button>
          </div>
        </div>

        {/* Main Charts */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError || !data ? (
          <div className="text-center py-16 text-destructive">
            Failed to load analytics data.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>API Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.requestsData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="var(--primary)" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trust Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Trust Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.trustScoreData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="score" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Latency */}
              <Card>
                <CardHeader>
                  <CardTitle>Latency Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.latencyData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="ms" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Model Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Usage</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.modelUsage || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(data.modelUsage || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
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
