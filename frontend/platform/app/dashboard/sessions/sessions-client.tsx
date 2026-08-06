'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'

const sessions = [
  {
    id: 184,
    prompt: 'What is the capital of France?',
    trust: 97,
    status: 'verified',
    claims: [
      { text: 'Paris is the capital', status: 'verified' },
      { text: 'Located on the Seine', status: 'verified' },
    ],
  },
  {
    id: 183,
    prompt: 'What is the GDP of India?',
    trust: 95,
    status: 'verified',
    claims: [
      { text: 'GDP is approximately $3.7 trillion', status: 'verified' },
      { text: 'Second largest economy', status: 'warning' },
    ],
  },
  {
    id: 182,
    prompt: 'What is the radius of Mars?',
    trust: 73,
    status: 'warning',
    claims: [
      { text: 'Radius approximately 3,390 km', status: 'verified' },
      { text: 'Half the size of Earth', status: 'warning' },
    ],
  },
]

export default function SessionsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

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
          <Button variant="outline" size="sm">All</Button>
          <Button variant="outline" size="sm">✓ Verified</Button>
          <Button variant="outline" size="sm">⚠ Warning</Button>
          <Button variant="outline" size="sm">✗ Failed</Button>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Session #{session.id}</p>
                      <p className="text-sm text-muted-foreground">{session.prompt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={session.status === 'verified' ? 'text-green-600 border-green-300' : 'text-yellow-600 border-yellow-300'}>
                      {session.trust}% Trust
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
                        {session.claims.map((claim, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            {claim.status === 'verified' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="text-sm">{claim.text}</span>
                          </div>
                        ))}
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
