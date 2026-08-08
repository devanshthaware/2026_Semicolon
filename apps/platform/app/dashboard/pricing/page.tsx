'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Check,
  Zap,
  Shield,
  Cpu,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
  FileCheck,
  Calculator,
  Lock,
  Globe,
  TrendingDown,
  Scale,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Mail,
  CreditCard,
  X
} from 'lucide-react'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [claimVolume, setClaimVolume] = useState<number>(50000)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Interactive Modals State
  const [isProModalOpen, setIsProModalOpen] = useState(false)
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false)
  const [salesSubmitted, setSalesSubmitted] = useState(false)

  // Cost Calculator Math
  const costPer1k = 0.85 // $0.85 per 1,000 verified claims
  const estimatedArgusCost = Math.round((claimVolume / 1000) * costPer1k)
  const estimatedBaselineCost = Math.round((claimVolume / 1000) * 4.50) // Baseline always-large-model cost

  const tiers = [
    {
      id: 'developer',
      name: 'DEVELOPER',
      badge: 'EXPERIMENTATION',
      priceDisplay: '$0',
      pricePeriod: 'Free forever',
      description: 'For local development, experimentation, and evaluation.',
      highlight: false,
      features: [
        'Local / development usage',
        'Interactive Playground console',
        'Basic SDK access (Python, TS, Go)',
        'Limited verification volume (10k/mo)',
        'Basic session tracking',
        'Basic diagnostics & analytics'
      ],
      ctaText: 'Get Started',
      ctaHref: '/dashboard/playground',
      ctaVariant: 'outline' as const
    },
    {
      id: 'pro',
      name: 'PRO',
      badge: 'MOST POPULAR',
      priceDisplay: isAnnual ? '$63' : '$79',
      pricePeriod: isAnnual ? '/ month (billed annually)' : '/ month',
      demoPriceNote: 'Proposed demo tier rate',
      description: 'For production AI applications and small development teams.',
      highlight: true,
      features: [
        '100,000 Verified Claims / month included',
        'Production REST API & SDK Integration',
        'Advanced multi-layer verification',
        'Session history & session replay',
        'Advanced analytics & latency tracking',
        'API Key management & rate limiting',
        'Usage monitoring & cost alerts',
        'Standard email & community support'
      ],
      ctaText: 'Start Pro',
      ctaAction: () => setIsProModalOpen(true),
      ctaVariant: 'default' as const
    },
    {
      id: 'enterprise',
      name: 'ENTERPRISE',
      badge: 'HIGH-VOLUME & REGULATED',
      priceDisplay: 'Custom',
      pricePeriod: 'Starting at $499/month',
      description: 'For regulated, high-volume, and private AI deployments.',
      highlight: false,
      features: [
        'High-volume verification SLA',
        'Private deployment options (VPC / On-Prem)',
        'Advanced auditability & signed receipts',
        'Custom verification configuration',
        'Custom model routing & gateways',
        'Advanced API controls & role-based access',
        'Dedicated SLA & 24/7 priority support',
        'Enterprise security (SOC2 / HIPAA readiness)',
        'Custom calibration & evaluation support'
      ],
      ctaText: 'Contact Sales',
      ctaAction: () => setIsSalesModalOpen(true),
      ctaVariant: 'outline' as const
    }
  ]

  const featureMatrix = [
    {
      category: 'Verification Core Features',
      items: [
        { name: 'Verification Volume Limit', dev: '10,000 / mo', pro: '100,000 / mo', ent: 'Custom High-Volume', status: 'AVAILABLE' },
        { name: 'Claim-Level Extraction & Verification', dev: 'Basic', pro: 'Full Pipeline', ent: 'Custom Parsers', status: 'AVAILABLE' },
        { name: 'Retrieval + NLI Layer', dev: 'Local Vector', pro: 'Cloud Hybrid Index', ent: 'Dedicated Enterprise Index', status: 'AVAILABLE' },
        { name: 'Symbolic Python + Z3 Engine', dev: 'Available', pro: 'Available', ent: 'Available', status: 'AVAILABLE' },
        { name: 'Temporal Verification Layer', dev: 'Beta', pro: 'Beta', ent: 'Custom Temporal Rules', status: 'BETA' },
        { name: 'Adversarial Self-Critique', dev: '—', pro: 'Beta', ent: 'Full Agentic Critique', status: 'BETA' },
        { name: 'Cross-Model Verification', dev: '—', pro: 'Beta', ent: 'Custom Gateway Ensemble', status: 'BETA' }
      ]
    },
    {
      category: 'Correction & Calibration Infrastructure',
      items: [
        { name: 'LLM Correction + Re-verification', dev: 'Manual', pro: 'Automated Cascade', ent: 'Custom Fine-Tuned Cascade', status: 'AVAILABLE' },
        { name: 'Trust Scoring & Signal Fusion', dev: 'Raw Trust', pro: 'Raw + Signal Breakdown', ent: 'Custom Signal Weights', status: 'AVAILABLE' },
        { name: 'Conformal Calibration (90%+)', dev: '—', pro: 'Planned', ent: 'Guaranteed Coverage SLA', status: 'RESEARCH' },
        { name: 'Signed Verification Receipts', dev: 'Local Unsigned', pro: 'Cryptographic Signature', ent: 'Custom HSM Key Pair', status: 'AVAILABLE' }
      ]
    },
    {
      category: 'Developer & Operational Controls',
      items: [
        { name: 'API / SDK Integration (TS, Python, Go)', dev: 'Available', pro: 'Available', ent: 'Available + Dedicated SDK Support', status: 'AVAILABLE' },
        { name: 'Analytics & Latency Telemetry', dev: '7 Days', pro: '90 Days', ent: 'Unlimited Historical Retention', status: 'AVAILABLE' },
        { name: 'API Key Management & Scopes', dev: 'Single Key', pro: 'Multi-Key Roles', ent: 'Granular Scoped Permissions', status: 'AVAILABLE' },
        { name: 'Private VPC & On-Prem Deployment', dev: '—', pro: '—', ent: 'Enterprise Option', status: 'PLANNED' },
        { name: 'Dedicated Enterprise Support & SLA', dev: 'Community', pro: 'Priority Email', ent: '24/7 Dedicated Solutions Engineer', status: 'AVAILABLE' }
      ]
    }
  ]

  const faqs = [
    {
      q: 'How is Argus different from RAG?',
      a: 'RAG retrieves evidence, but Argus uses multiple verification signals including retrieval-grounded NLI, symbolic checks for numeric/logical claims, temporal validity, adversarial verification, and calibrated fusion.'
    },
    {
      q: 'Does Argus replace my LLM?',
      a: 'No. Argus is designed as a model-agnostic middleware layer that can sit around an existing LLM application.'
    },
    {
      q: 'What is a verified claim?',
      a: 'An atomic claim extracted from an LLM response and processed through the Argus verification pipeline.'
    },
    {
      q: 'Does Argus guarantee that an answer is true?',
      a: 'No. Argus produces verification signals and calibrated trust estimates. A verification receipt proves that the verification process ran and records what happened; it does not mathematically prove the underlying claim is true.'
    },
    {
      q: 'How does Argus control verification cost?',
      a: 'Argus uses a cost-aware cascade. Less expensive checks run first and more expensive verification layers are triggered when uncertainty, disagreement, or risk warrants escalation.'
    },
    {
      q: 'Which models does Argus support?',
      a: 'Argus is designed around a model gateway so verification logic is decoupled from a single model family. The current deployment uses the models configured in the Argus environment.'
    },
    {
      q: 'Can Argus be deployed privately?',
      a: 'Private deployment is an enterprise deployment option.'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-16">
        
        {/* SECTION 1: PRODUCT POSITIONING & HERO */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto pt-6">
          <Badge variant="outline" className="px-4 py-1 text-xs font-mono text-primary bg-primary/10 border-primary/30 rounded-full flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> ARGUS VERIFICATION INFRASTRUCTURE
          </Badge>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            AI Verification Infrastructure Built for Scale
          </h1>

          <p className="text-lg md:text-xl font-medium text-foreground/90 max-w-2xl">
            "Verify, correct, and audit LLM outputs with a model-agnostic verification layer."
          </p>

          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Argus sits between your AI application and its users, verifying claims in real time and producing an auditable verification record.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center gap-3 bg-card border border-border p-1.5 rounded-full shadow-sm mt-4">
            <span 
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${!isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly Billing
            </span>
            <div className="flex items-center px-1">
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} id="billing-switch" />
            </div>
            <span 
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-all flex items-center gap-1.5 ${isAnnual ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual Billing
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* SECTION 3: PRICING UNIT EXPLANATION */}
        <Card className="border border-primary/20 bg-primary/5 p-4 md:p-5 max-w-3xl mx-auto rounded-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-primary shrink-0" />
              <div>
                <span className="font-bold text-foreground block">PRIMARY PRICING METRIC: VERIFIED CLAIMS</span>
                <span className="text-muted-foreground">
                  Argus pricing is based on verified claims processed through the verification pipeline, not simply raw API HTTP requests.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="bg-background border-border text-foreground font-mono shrink-0">
              Claim-Level Billing
            </Badge>
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
            <strong className="text-foreground">What counts as a verified claim?</strong> A verified claim is an atomic claim extracted from an LLM response and processed through the Argus verification workflow.
          </div>
        </Card>

        {/* SECTION 2 & 10: PRICING TIERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`flex flex-col justify-between relative transition-all duration-300 ${
                tier.highlight 
                  ? 'border-primary shadow-xl shadow-primary/10 bg-card scale-105 z-10' 
                  : 'border-border bg-card/60 hover:border-primary/40'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3.5 py-0.5 rounded-full shadow-md">
                  {tier.badge}
                </div>
              )}

              <div>
                <CardHeader className="pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <CardTitle className="text-xl font-bold tracking-tight">{tier.name}</CardTitle>
                    {!tier.highlight && (
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs min-h-[36px] leading-relaxed text-muted-foreground">
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price Header */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl md:text-5xl font-extrabold font-mono text-foreground">
                        {tier.priceDisplay}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {tier.pricePeriod}
                      </span>
                    </div>
                    {tier.demoPriceNote && (
                      <p className="text-[10px] text-muted-foreground/70 italic">
                        *{tier.demoPriceNote}
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 text-xs">
                    <p className="font-semibold text-foreground uppercase tracking-wider text-[10px] text-muted-foreground">Tier Features</p>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-foreground/90">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pb-6 pt-4">
                {tier.ctaHref ? (
                  <Link href={tier.ctaHref} className="w-full">
                    <Button variant={tier.ctaVariant} className="w-full font-semibold">
                      {tier.ctaText}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant={tier.ctaVariant} 
                    onClick={tier.ctaAction} 
                    className={`w-full font-semibold ${tier.highlight ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                  >
                    {tier.ctaText}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* SECTION 4 & 6: INTERACTIVE COST CALCULATOR & COST METRIC */}
        <Card className="border border-primary/30 bg-card p-6 md:p-8 space-y-6 max-w-5xl mx-auto shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Interactive Verification Cost Calculator</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estimate monthly verification costs based on processing verified claims through the Argus pipeline.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs text-amber-400 border-amber-500/30 bg-amber-500/10">
                ESTIMATE
              </Badge>
              <Badge variant="outline" className="font-mono text-xs text-blue-400 border-blue-500/30 bg-blue-500/10">
                Benchmarking in progress
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground font-bold">MONTHLY VERIFIED CLAIMS:</span>
                <span className="text-primary font-bold text-base bg-primary/10 px-3.5 py-1 rounded border border-primary/30">
                  {claimVolume.toLocaleString()} claims / mo
                </span>
              </div>

              <Slider
                value={[claimVolume]}
                onValueChange={(val) => {
                  const num = Array.isArray(val) ? val[0] : val
                  if (typeof num === 'number') setClaimVolume(num)
                }}
                min={10000}
                max={500000}
                step={10000}
                className="py-2"
              />

              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>10,000 claims</span>
                <span>250,000 claims</span>
                <span>500,000 claims</span>
              </div>
            </div>

            {/* Calculations Column */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-1">
                <span className="text-muted-foreground text-[10px] block uppercase font-bold">ESTIMATED MONTHLY COST</span>
                <p className="text-2xl font-extrabold text-foreground">${estimatedArgusCost.toLocaleString()}</p>
                <span className="text-[10px] text-muted-foreground block">Based on $0.85 / 1k claims</span>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-1">
                <span className="text-primary text-[10px] block uppercase font-bold">COST PER 1,000 CLAIMS</span>
                <p className="text-2xl font-extrabold text-primary">$0.85</p>
                <span className="text-[10px] text-muted-foreground block">Estimated cost metric</span>
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 5: COST-AWARE CASCADE EXPLANATION */}
        <div className="max-w-5xl mx-auto space-y-6 pt-4">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="px-3 py-0.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
              TECHNICAL ADVANTAGE
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Why Argus Costs Less to Verify at Scale
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
              Argus does not run every expensive verification layer on every claim. The cascade escalates only when uncertainty or disagreement warrants it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Traditional Baseline Card */}
            <Card className="border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Traditional LLM Verification</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-muted-foreground bg-background/50 p-4 rounded-lg border border-border">
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300">
                  Always use expensive large-model verification on 100% of claims
                </div>
                <div className="text-center text-muted-foreground py-1">↓</div>
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300">
                  High API Token Costs & High Latency
                </div>
              </div>
            </Card>

            {/* Argus Cascade Card */}
            <Card className="border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Argus Cost-Aware Cascade</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-muted-foreground bg-background/50 p-4 rounded-lg border border-border">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-300">
                  Cheap deterministic checks first (Python arithmetic / Z3 logic)
                </div>
                <div className="text-center text-muted-foreground py-1">↓</div>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-300">
                  Escalate to Retrieval & NLI only when uncertainty warrants it
                </div>
                <div className="text-center text-muted-foreground py-1">↓</div>
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-200 font-bold text-center">
                  Lower Verification Cost & Faster Latency
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* SECTION 8: WHY ARGUS? INFRASTRUCTURE COMPARISON */}
        <div className="max-w-5xl mx-auto space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Argus?</h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
              Argus turns LLM verification from a prompt-level trick into an infrastructure layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Flow */}
            <Card className="p-6 bg-card border-border space-y-3">
              <span className="text-xs font-mono text-muted-foreground font-bold uppercase">Traditional LLM App</span>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="px-2.5 py-1 bg-muted rounded border border-border">Generate</span>
                <span>→</span>
                <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20 font-bold">Trust the Answer</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                Relies on prompt engineering alone, creating blind trust in non-deterministic model outputs without independent claim checking.
              </p>
            </Card>

            {/* Argus Infrastructure Flow */}
            <Card className="p-6 bg-primary/5 border-primary/30 space-y-3">
              <span className="text-xs font-mono text-primary font-bold uppercase">Argus Verification Middleware</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-foreground">
                <span className="px-2 py-0.5 bg-muted rounded">Generate</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-bold">Extract Claims</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-bold">Verify</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-bold">Correct</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-bold">Re-verify</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded font-bold">Calibrate</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">Signed Receipt</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                Extracts atomic claims, runs multi-signal verification, corrects contradictions, and generates an auditable cryptographic receipt.
              </p>
            </Card>
          </div>
        </div>

        {/* SECTION 11: BUSINESS MODEL EXPLANATION */}
        <Card className="max-w-5xl mx-auto p-6 md:p-8 border border-border bg-card/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">How Argus Makes Money</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-1">
              <span className="font-bold text-foreground block font-mono">1. Usage-Based Verification</span>
              <p className="text-muted-foreground">Pay dynamically based on verified claim volume processed.</p>
            </div>
            <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-1">
              <span className="font-bold text-foreground block font-mono">2. Pro Subscription</span>
              <p className="text-muted-foreground">Production API/SDK keys, analytics telemetry, and higher limits.</p>
            </div>
            <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-1">
              <span className="font-bold text-foreground block font-mono">3. Enterprise Contracts</span>
              <p className="text-muted-foreground">High-volume SLAs, private VPC deployments, and support.</p>
            </div>
            <div className="p-3.5 bg-muted/20 border border-border rounded-lg space-y-1">
              <span className="font-bold text-foreground block font-mono">4. Developer Ecosystem</span>
              <p className="text-muted-foreground">Open SDK adoption leading seamlessly into production scale.</p>
            </div>
          </div>
        </Card>

        {/* SECTION 7 & 14: FEATURE COMPARISON WITH MATURITY LABELS */}
        <div className="max-w-6xl mx-auto space-y-6 pt-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Detailed Feature Comparison</h2>
            <p className="text-xs text-muted-foreground">Compare technical verification capabilities across Argus deployment tiers</p>
          </div>

          <div className="border border-border rounded-xl bg-card overflow-hidden text-xs">
            {featureMatrix.map((section, sIdx) => (
              <div key={sIdx} className="border-b border-border last:border-b-0">
                <div className="bg-muted/40 px-4 py-2.5 font-bold uppercase tracking-wider text-muted-foreground font-mono text-[11px] flex justify-between items-center">
                  <span>{section.category}</span>
                </div>

                <div className="divide-y divide-border">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                      <div className="col-span-5 font-medium text-foreground flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.status === 'AVAILABLE' && <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">AVAILABLE</span>}
                        {item.status === 'BETA' && <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">BETA</span>}
                        {item.status === 'RESEARCH' && <span className="text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">RESEARCH</span>}
                        {item.status === 'PLANNED' && <span className="text-[9px] font-mono font-bold bg-muted text-muted-foreground border border-border px-1.5 py-0.2 rounded">PLANNED</span>}
                      </div>
                      <div className="col-span-2 font-mono text-center text-muted-foreground">{item.dev}</div>
                      <div className="col-span-2 font-mono text-center text-primary font-bold">{item.pro}</div>
                      <div className="col-span-3 font-mono text-center text-emerald-400 font-bold">{item.ent}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 9: FREQUENTLY ASKED QUESTIONS */}
        <div className="max-w-4xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Technical and pricing answers for developers and technical leads</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div 
                  key={idx} 
                  className="border border-border rounded-lg bg-card overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex justify-between items-center text-left text-sm font-semibold text-foreground hover:bg-muted/20"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* SECTION 12: BOTTOM CTA */}
        <Card className="max-w-5xl mx-auto border border-primary/40 bg-gradient-to-r from-primary/10 via-card to-primary/10 p-8 text-center space-y-4 rounded-2xl shadow-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Ready to make your AI outputs verifiable?
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto">
            Start with the Playground, integrate the SDK, or talk to us about enterprise deployment.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/dashboard/playground">
              <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
                Try Argus Free
              </Button>
            </Link>
            <Link href="/dashboard/playground">
              <Button variant="outline" size="default" className="font-semibold px-6">
                Explore Playground
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="default" 
              onClick={() => setIsSalesModalOpen(true)} 
              className="font-semibold px-6 border-primary/40 hover:bg-primary/10"
            >
              Contact Sales
            </Button>
          </div>
        </Card>

      </div>

      {/* PRO CHECKOUT MODAL OVERLAY */}
      {isProModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl space-y-4 relative">
            <button 
              onClick={() => setIsProModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <CreditCard className="w-5 h-5 text-primary" /> Start Argus Pro Plan
              </h3>
              <p className="text-xs text-muted-foreground">
                Subscribe to Pro Tier ($79/mo) for 100,000 verified claims/month.
              </p>
            </div>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-lg space-y-1">
                <span className="font-bold text-foreground block font-mono">Plan Summary: Argus Pro</span>
                <span className="text-muted-foreground block font-mono">100,000 Verified Claims / month included</span>
                <span className="text-primary font-bold font-mono text-sm block pt-1">$79.00 / month</span>
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                * Note: Stripe payment gateway integration is currently in demonstration mode. Clicking confirm will allocate your local Pro API sandbox key.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsProModalOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-primary text-primary-foreground font-semibold" onClick={() => setIsProModalOpen(false)}>
                Confirm Pro Subscription
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT SALES MODAL OVERLAY */}
      {isSalesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 shadow-2xl space-y-4 relative">
            <button 
              onClick={() => setIsSalesModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Building2 className="w-5 h-5 text-primary" /> Contact Enterprise Sales
              </h3>
              <p className="text-xs text-muted-foreground">
                Speak with an Argus verification engineer about private VPC deployment and custom SLA.
              </p>
            </div>

            {salesSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-foreground text-base">Inquiry Submitted!</h4>
                <p className="text-xs text-muted-foreground">Our enterprise solutions team will contact you within 24 hours.</p>
                <Button variant="outline" size="sm" onClick={() => { setSalesSubmitted(false); setIsSalesModalOpen(false); }}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSalesSubmitted(true); }} className="space-y-4 py-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Work Email</label>
                  <Input required type="email" placeholder="name@company.com" className="bg-muted/40 border-border font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Estimated Monthly Claim Volume</label>
                  <Input placeholder="e.g. 500,000 claims/month" className="bg-muted/40 border-border font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Deployment Preference</label>
                  <select className="w-full h-9 rounded-md border border-border bg-muted/40 px-3 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="cloud">Managed Argus Cloud</option>
                    <option value="vpc">Dedicated Private VPC</option>
                    <option value="onprem">On-Premises / Air-Gapped Cluster</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsSalesModalOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">Submit Sales Inquiry</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
