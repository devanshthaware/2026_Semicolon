'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = () => {
    setIsLoading(true)
    setTimeout(() => {
      setResponse('The claim has been verified across multiple sources. GPT output appears accurate with 94% confidence. Evidence shows strong consensus among credible sources.')
      setIsLoading(false)
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Playground</h1>
          <p className="text-muted-foreground">Test verification pipeline</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Prompt Section */}
          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter a claim to verify..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-96 resize-none"
              />
              <Button onClick={handleVerify} disabled={!prompt || isLoading} className="w-full">
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </CardContent>
          </Card>

          {/* Streaming Response */}
          <Card>
            <CardHeader>
              <CardTitle>Streaming Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-96 rounded-lg border border-border bg-muted p-4 text-sm">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-muted-foreground">Processing...</p>
                    </div>
                  </div>
                ) : response ? (
                  <p className="text-foreground whitespace-pre-wrap">{response}</p>
                ) : (
                  <p className="text-muted-foreground">Response will appear here...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Claim Extraction', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'Fusion', 'Trust Score'].map((stage, idx) => (
                <div key={stage} className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isLoading ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{stage}</p>
                  </div>
                  {idx !== 0 && <div className="h-px flex-1 bg-border" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Evidence Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {['Claim', 'Evidence', 'NLI', 'Result'].map((item) => (
                <div key={item} className="rounded-lg border border-border p-4 text-center">
                  <p className="text-sm font-medium">{item}</p>
                  <div className="mt-4 h-20 rounded bg-muted flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Data</p>
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
