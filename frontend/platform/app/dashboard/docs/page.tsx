'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

const docSections = [
  'Getting Started',
  'Authentication',
  'SDK',
  'API',
  'Examples',
  'Errors',
]

const apiEndpoints = [
  {
    method: 'POST',
    path: '/verify',
    description: 'Verify a claim or output',
  },
  {
    method: 'GET',
    path: '/sessions/:id',
    description: 'Get verification session details',
  },
  {
    method: 'GET',
    path: '/analytics',
    description: 'Get analytics data',
  },
]

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground">API reference and guides</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {docSections.map((section) => (
                    <a
                      key={section}
                      href="#"
                      className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      {section}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Welcome to TruthLayer API. This guide will help you get started with verifying AI outputs and building trust.
                </p>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiEndpoints.map((endpoint, idx) => (
                  <div key={idx} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono">
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Example */}
            <Card>
              <CardHeader>
                <CardTitle>Example Request</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  {`curl -X POST https://api.truthlayer.com/verify \\
  -H "Authorization: Bearer sk_prod_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claim": "Paris is the capital of France",
    "context": "historical facts"
  }'`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
