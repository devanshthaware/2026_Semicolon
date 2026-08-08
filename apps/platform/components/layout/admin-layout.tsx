'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Cpu,
  Activity,
  Radio,
  Boxes,
  FileText,
  ShieldCheck,
  Settings,
  LogOut,
  ArrowLeft,
  ShieldAlert,
  Server,
  Wifi
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AdminNavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const adminNavItems: AdminNavItem[] = [
  { href: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/admin/users', label: 'User Management', icon: <Users className="h-4 w-4" /> },
  { href: '/admin/api-management', label: 'API Management', icon: <Cpu className="h-4 w-4" /> },
  { href: '/admin/system-health', label: 'System Health', icon: <Activity className="h-4 w-4" /> },
  { href: '/admin/verification-monitor', label: 'Verification Monitor', icon: <Radio className="h-4 w-4" /> },
  { href: '/admin/models', label: 'Model Management', icon: <Boxes className="h-4 w-4" /> },
  { href: '/admin/logs', label: 'System Logs', icon: <FileText className="h-4 w-4" /> },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: <ShieldCheck className="h-4 w-4" /> },
  { href: '/admin/settings', label: 'Admin Settings', icon: <Settings className="h-4 w-4" /> },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('CONNECTED')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen to Ollama/FastAPI health check periodically to maintain real-time status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/admin/system-health')
        if (res.ok) {
          setConnectionStatus('CONNECTED')
        } else {
          setConnectionStatus('DISCONNECTED')
        }
      } catch (err) {
        setConnectionStatus('DISCONNECTED')
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  const adminEmail = session?.user?.email || 'hackytricky8.30@gmail.com'

  if (!mounted) {
    return (
      <div className="flex h-screen w-full bg-background overflow-hidden text-foreground opacity-0">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between shrink-0">
        <div>
          {/* Header Branding */}
          <div className="p-4 border-b border-border space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                A
              </div>
              <span className="font-extrabold text-base tracking-tight text-foreground">ARGUS ADMIN</span>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pl-9">
              Control Center
            </p>
          </div>

          {/* Admin Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
              ADMIN CONTROL PLANE
            </div>

            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Navigation & Logout */}
        <div className="p-3 border-t border-border space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Back to User Dashboard</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground hidden sm:inline">
              OPERATIONAL CONTROL PLANE
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold bg-background">
              {connectionStatus === 'CONNECTED' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">REAL-TIME ● CONNECTED</span>
                </>
              )}
              {connectionStatus === 'DISCONNECTED' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-400">REAL-TIME ● DISCONNECTED</span>
                </>
              )}
              {connectionStatus === 'RECONNECTING' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-400">REAL-TIME ● RECONNECTING</span>
                </>
              )}
            </div>
          </div>

          {/* Admin User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-primary font-bold block uppercase tracking-wider">
                ADMINISTRATOR
              </span>
              <span className="text-xs font-mono text-foreground font-semibold">
                {adminEmail}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 text-primary font-mono font-bold flex items-center justify-center text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
