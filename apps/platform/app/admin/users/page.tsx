'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function UserManagementPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ userId, role, status }: { userId: string; role?: string; status?: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, status })
      })
      if (!res.ok) throw new Error('Failed to update user')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] })
    }
  })

  const users = data?.users || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage platform user accounts, administrative roles, and active access status
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh List
          </Button>
        </div>

        <Card className="border border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 py-3 border-b border-border">
            <CardTitle className="text-xs font-mono font-bold uppercase text-muted-foreground flex items-center justify-between">
              <span>REGISTERED USERS ({users.length})</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                <span className="text-xs text-muted-foreground mt-2 block font-mono">Loading users...</span>
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-xs text-rose-400">
                Failed to load users from database.
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground font-mono">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/20 border-b border-border text-[11px] font-mono text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors font-mono">
                        <td className="py-3 px-4 font-bold text-foreground">{u.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[10px] ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary border-primary/40' : 'bg-muted text-muted-foreground'}`}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {u.status === 'ACTIVE' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ userId: u.id, status: 'SUSPENDED' })}
                              className="h-7 text-[10px] text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ userId: u.id, status: 'ACTIVE' })}
                              className="h-7 text-[10px] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                            >
                              Activate
                            </Button>
                          )}

                          {u.role === 'USER' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ userId: u.id, role: 'ADMIN' })}
                              className="h-7 text-[10px]"
                            >
                              Make Admin
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updateMutation.isPending}
                              onClick={() => updateMutation.mutate({ userId: u.id, role: 'USER' })}
                              className="h-7 text-[10px]"
                            >
                              Make User
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
