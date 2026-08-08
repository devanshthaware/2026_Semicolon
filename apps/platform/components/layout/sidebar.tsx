'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Gamepad2,
  History,
  Key,
  BarChart3,
  BookOpen,
  Settings,
  Users,
  Cpu,
  Network,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  section?: 'main' | 'admin'
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/playground', label: 'Playground', icon: <Gamepad2 className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <History className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: <Key className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/pricing', label: 'Pricing', icon: <CreditCard className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/docs', label: 'Docs', icon: <BookOpen className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, section: 'main' },
  { href: '/dashboard/users', label: 'Users', icon: <Users className="h-5 w-5" />, section: 'admin' },
  { href: '/dashboard/api-management', label: 'API Mgmt', icon: <Cpu className="h-5 w-5" />, section: 'admin' },
  { href: '/dashboard/system-health', label: 'System Health', icon: <Network className="h-5 w-5" />, section: 'admin' },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const mainItems = navItems.filter((item) => item.section === 'main')
  const adminItems = navItems.filter((item) => item.section === 'admin')

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
        pathname === item.href
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-muted'
      )}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  )

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          T
        </div>
        <span className="text-lg font-bold">Argus</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {/* Main Section */}
        <div className="space-y-1">
          {mainItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <div className="space-y-1 border-t border-border pt-4 mt-4">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Admin</div>
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        )}
      </nav>
    </div>
  )
}
