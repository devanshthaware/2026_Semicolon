'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import Link from 'next/link'

interface Claim {
  text: string;
  status: 'verified' | 'warning' | 'failed';
}

interface Session {
  id: string;
  prompt: string;
  trust: number;
  status: 'verified' | 'warning' | 'failed';
  claims: Claim[];
}

export default function SessionsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'verified' | 'warning' | 'failed'>('all')

  const { data: sessions, isLoading, isError, refetch } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: () => apiClient.get('/sessions')
  })

  const filteredSessions = sessions?.filter(session => {
    if (filter === 'all') return true
    return session.status === filter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Verification Sessions</h1>
          <p className="text-muted-foreground">View and manage verification history</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'verified' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('verified')}>✓ Verified</Button>
          <Button variant={filter === 'warning' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('warning')}>⚠ Warning</Button>
          <Button variant={filter === 'failed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('failed')}>✗ Failed</Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Unable to load verification sessions.
              <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
                Retry
              </Button>
            </div>
          ) : !filteredSessions || filteredSessions.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg space-y-3">
              <p className="text-muted-foreground font-medium">No verification sessions yet.</p>
              <Button asChild size="sm">
                <Link href="/dashboard/playground">Run your first verification in Playground</Link>
              </Button>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <Card
                key={session.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">Session #{session.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{session.prompt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={
                        session.status === 'verified' ? 'text-green-600 border-green-300' :
                        session.status === 'warning' ? 'text-yellow-600 border-yellow-300' : 'text-red-600 border-red-300'
                      }>
                        {Math.round(session.trust * 100)}% Trust
                      </Badge>
                      <ChevronRight className={`h-5 w-5 transition-transform ${expandedId === session.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === session.id && (
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      {/* Timeline */}
                      <div>
                        <h3 className="font-medium mb-3">Timeline</h3>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>Question</span>
                          <span>→</span>
                          <span>Claims</span>
                          <span>→</span>
                          <span>Verification</span>
                          <span>→</span>
                          <span>Receipt</span>
                        </div>
                      </div>

                      {/* Claims */}
                      <div>
                        <h3 className="font-medium mb-3">Claims</h3>
                        <div className="space-y-2">
                          {session.claims.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No specific claim items extracted.</p>
                          ) : (
                            session.claims.map((claim, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                {claim.status === 'verified' ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : claim.status === 'warning' ? (
                                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <span className="text-sm">{claim.text}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">Evidence</Button>
                        <Button size="sm" variant="outline">Layer Scores</Button>
                        <Button size="sm" variant="outline">Raw JSON</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
