'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Eye, EyeOff, Trash2, Plus } from 'lucide-react'

const apiKeys = [
  {
    id: 1,
    name: 'Production',
    key: 'sk_prod_xxxxxxxxxxxxx',
    usage: 12000,
    created: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Development',
    key: 'sk_test_xxxxxxxxxxxxx',
    usage: 321,
    created: '2024-02-20',
    status: 'active',
  },
]

export default function ApiKeysPage() {
  const [visibleKeys, setVisibleKeys] = React.useState<number[]>([])

  const toggleKeyVisibility = (id: number) => {
    setVisibleKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Keys</h1>
            <p className="text-muted-foreground">Manage your API keys and access</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate Key
          </Button>
        </div>

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <p className="text-sm text-muted-foreground">Created {apiKey.created}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        {apiKey.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Key Display */}
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm flex items-center justify-between">
                    <span>
                      {visibleKeys.includes(apiKey.id)
                        ? apiKey.key
                        : apiKey.key.slice(0, 8) + '*'.repeat(apiKey.key.length - 16) + apiKey.key.slice(-8)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.includes(apiKey.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="font-medium">{apiKey.usage.toLocaleString()} requests</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">Rotate</Button>
                    <Button size="sm" variant="outline" className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
