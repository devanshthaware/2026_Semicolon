'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const users = [
  {
    id: 1,
    name: 'Omkar',
    role: 'Admin',
    status: 'active',
    projects: 'TruthLayer',
    lastLogin: 'Today',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Editor',
    status: 'active',
    projects: 'TruthLayer, Analytics',
    lastLogin: '2 hours ago',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Viewer',
    status: 'inactive',
    projects: 'TruthLayer',
    lastLogin: '3 days ago',
  },
]

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage team members and access</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-border font-medium text-sm text-muted-foreground">
                <div className="flex-1">Name</div>
                <div className="w-24">Role</div>
                <div className="w-24">Status</div>
                <div className="flex-1">Projects</div>
                <div className="flex-1">Last Login</div>
                <div className="w-10"></div>
              </div>

              {/* Rows */}
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div className="w-24">
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                  <div className="w-24">
                    <Badge
                      variant="outline"
                      className={user.status === 'active' ? 'text-green-600 border-green-300' : 'text-gray-600 border-gray-300'}
                    >
                      {user.status}
                    </Badge>
                  </div>
                  <div className="flex-1 text-sm">{user.projects}</div>
                  <div className="flex-1 text-sm text-muted-foreground">{user.lastLogin}</div>
                  <div className="w-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
