'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4 text-foreground">
      <Card className="w-full max-w-md border-rose-500/30 bg-card shadow-2xl text-center space-y-4 p-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <CardTitle className="text-xl font-extrabold tracking-tight text-rose-400 font-mono">
            ACCESS DENIED
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            You do not have administrator permissions to view this control plane.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/dashboard">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
