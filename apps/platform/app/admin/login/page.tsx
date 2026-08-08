'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('hackytricky8.30@gmail.com')
  const [password, setPassword] = useState('Admin@123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid administrator credentials or access denied.')
        setLoading(false);
      } else {
        window.location.assign('/admin')
      }
    } catch (err) {
      setError('An unexpected error occurred during admin authentication.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-center items-center p-4 text-foreground">
      {/* Background Graphic */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <Card className="w-full max-w-md border-border bg-card shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-extrabold tracking-tight font-mono">
            ARGUS ADMIN PORTAL
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Administrator Sign In — Operational Control Plane
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="admin-email" className="text-xs font-semibold">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="bg-muted/40 border-border font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-password" className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-muted/40 border-border font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs py-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-border pt-4 text-[11px] text-muted-foreground">
            <span>Standard user dashboard? </span>
            <a href="/login" className="text-primary hover:underline font-semibold">
              Go to User Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
