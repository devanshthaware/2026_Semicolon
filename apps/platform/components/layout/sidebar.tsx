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
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/dashboard/playground', label: 'Playground', icon: <Gamepad2 className="h-5 w-5" /> },
  { href: '/dashboard/sessions', label: 'Sessions', icon: <History className="h-5 w-5" /> },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: <Key className="h-5 w-5" /> },
  { href: '/dashboard/pricing', label: 'Pricing', icon: <CreditCard className="h-5 w-5" /> },
  { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { href: '/dashboard/docs', label: 'Docs', icon: <BookOpen className="h-5 w-5" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

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
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>
    </div>
  )
}
