'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Copy, Eye, EyeOff, Trash2, Plus, Loader2, Check } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'

interface ApiKey {
  id: string;
  name: string;
  key: string;
  usage: number;
  created: string;
  status: 'active' | 'revoked';
}

export default function ApiKeysPage() {
  const queryClient = useQueryClient()
  const [visibleKeys, setVisibleKeys] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: apiKeys, isLoading, isError, refetch } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: () => apiClient.get('/keys')
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => apiClient.post('/keys', { name }),
    onSuccess: (data) => {
      setNewlyCreatedSecret(data.secret)
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    }
  })

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => apiClient.delete(`/keys/${keyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    }
  })

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    )
  }

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) return
    createMutation.mutate(keyName)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setKeyName('')
    setNewlyCreatedSecret(null)
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
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Key
          </Button>
        </div>

        {/* API Keys List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Unable to load API keys.
              <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
                Retry
              </Button>
            </div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys found. Click "Generate Key" to create one.
            </div>
          ) : (
            apiKeys.map((apiKey) => (
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
                        <Badge variant="outline" className={apiKey.status === 'active' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Key Display */}
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm flex items-center justify-between">
                      <span>
                        {visibleKeys.includes(apiKey.id)
                          ? apiKey.key
                          : apiKey.key.slice(0, 8) + '••••••••••••••••'}
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
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(apiKey.key)}>
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
                    {apiKey.status === 'active' && (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive"
                          onClick={() => revokeMutation.mutate(apiKey.id)}
                          disabled={revokeMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Revoke
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal for Key Generation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl border border-border">
            {!newlyCreatedSecret ? (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <h2 className="text-xl font-bold">Generate API Key</h2>
                <p className="text-sm text-muted-foreground">
                  Give your key a descriptive name to identify its usage.
                </p>
                <Input
                  placeholder="Key Name (e.g. Judge Demo Key)"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Generate Key'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-green-500">API Key Created Successfully</h2>
                <p className="text-sm text-muted-foreground">
                  IMPORTANT: Copy the key now. You will not be able to see the full secret again.
                </p>
                <div className="p-3 bg-muted rounded font-mono text-sm break-all flex items-center justify-between gap-2">
                  <span>{newlyCreatedSecret}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(newlyCreatedSecret)}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleCloseModal}>Done</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
