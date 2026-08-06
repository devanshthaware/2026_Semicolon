'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'
import { Button } from '@/components/ui/button'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <TopNav />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl py-6 px-4 lg:py-8 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
