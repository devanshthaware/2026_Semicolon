'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Terminal, 
  Key, 
  ShieldCheck, 
  Layers, 
  FileCode, 
  Copy, 
  Check, 
  BookOpen, 
  Zap, 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Code2,
  Lock,
  Package,
  Cpu,
  Globe,
  Sliders,
  Shield,
  Layers3
} from 'lucide-react'

type SectionId = 'installation' | 'quickstart' | 'streaming' | 'config' | 'auth' | 'middleware' | 'methods' | 'errors' | 'types' | 'serialization'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('installation')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const sections = [
    { id: 'installation', label: 'Installation & Setup', icon: Package },
    { id: 'quickstart', label: 'Quick Start', icon: BookOpen },
    { id: 'streaming', label: 'Streaming Verification', icon: Zap },
    { id: 'config', label: 'Configuration & Env', icon: Sliders },
    { id: 'auth', label: 'Authentication', icon: Key },
    { id: 'middleware', label: 'Custom Middleware', icon: Cpu },
    { id: 'methods', label: 'API Methods Reference', icon: Terminal },
    { id: 'errors', label: 'Typed Error Handling', icon: AlertTriangle },
    { id: 'types', label: 'TypeScript Definitions', icon: FileCode },
    { id: 'serialization', label: 'Serialization Utils', icon: Code2 },
  ]

  const filteredSections = sections.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
              <Package className="h-4 w-4 text-primary" />
              <span>@devdotdebuger/argus-sdk Documentation</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Argus SDK & API Guide</h1>
            <p className="text-muted-foreground text-sm">
              Official production-grade TypeScript SDK documentation for real-time claim verification & proof receipts.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <Badge variant="outline" className="text-xs border-primary/40 text-primary bg-primary/5 px-3 py-1">
              npm i @devdotdebuger/argus-sdk
            </Badge>
            <Badge variant="outline" className="text-xs border-green-500/30 text-green-500 bg-green-500/5 px-3 py-1">
              v1.0.0 Stable
            </Badge>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SDK methods, verifyStream, middleware, error handling, config..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background/50 border-border/80 text-sm font-mono"
          />
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Index */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              SDK Guide Index
            </div>
            <div className="space-y-1">
              {filteredSections.map((sec) => {
                const IconComponent = sec.icon
                const isActive = activeSection === sec.id
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as SectionId)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all text-left ${
                      isActive 
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm' 
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span>{sec.label}</span>
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isActive ? 'rotate-90' : 'opacity-40'}`} />
                  </button>
                )
              })}
            </div>

            {/* Quick Package Summary Box */}
            <Card className="mt-6 border-border/60 bg-muted/20">
              <CardContent className="p-4 space-y-3 text-xs font-mono">
                <span className="font-bold uppercase text-muted-foreground">Package Specs</span>
                <div className="space-y-1.5 text-muted-foreground">
                  <div>• Package: <code className="text-foreground">@devdotdebuger/argus-sdk</code></div>
                  <div>• License: <span className="text-foreground">Apache-2.0</span></div>
                  <div>• Runtime: <span className="text-foreground">Node.js 20+ & Browsers</span></div>
                  <div>• Module: <span className="text-foreground">ESM & CJS (Tree-shakeable)</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentation Content Area */}
          <div className="lg:col-span-3 space-y-8">

            {/* 1. INSTALLATION */}
            {activeSection === 'installation' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <CardTitle>Installation & Features</CardTitle>
                    </div>
                    <CardDescription>
                      Install <code className="font-mono text-primary">@devdotdebuger/argus-sdk</code> using your preferred package manager.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Terminal Command</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleCopy('npm install @devdotdebuger/argus-sdk', 'inst-npm')}
                          className="font-mono text-xs"
                        >
                          {copiedId === 'inst-npm' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto">
{`npm install @devdotdebuger/argus-sdk
# or
pnpm add @devdotdebuger/argus-sdk
# or
yarn add @devdotdebuger/argus-sdk`}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                      <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
                        <span className="font-bold text-foreground">✨ Fully Typed</span>
                        <p className="text-muted-foreground font-sans">Complete TypeScript definitions with Zod schema validation.</p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
                        <span className="font-bold text-foreground">🚀 Tree-Shakeable</span>
                        <p className="text-muted-foreground font-sans">ESM and CommonJS builds optimized for minimal bundle sizes.</p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
                        <span className="font-bold text-foreground">🔄 SSE Streaming</span>
                        <p className="text-muted-foreground font-sans">Real-time Server-Sent Events stream iterator support.</p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
                        <span className="font-bold text-foreground">🛡️ Typed Errors</span>
                        <p className="text-muted-foreground font-sans">Comprehensive error hierarchy for rate limits, auth, and timeouts.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 2. QUICK START */}
            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Basic Usage</CardTitle>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleCopy(`import { ArgusClient } from '@devdotdebuger/argus-sdk';

const client = new ArgusClient({
  apiKey: 'your-api-key',
});

const result = await client.verify({
  claim: 'Paris is the capital of France',
  evidence: ['https://example.com/evidence1', 'https://example.com/evidence2'],
});

console.log(result.trustScore); // 0.95`, 'qs-code')}
                        className="font-mono text-xs"
                      >
                        {copiedId === 'qs-code' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`import { ArgusClient } from '@devdotdebuger/argus-sdk';

const client = new ArgusClient({
  apiKey: 'argus_live_8f3a9e217c4b1209d84e',
});

const result = await client.verify({
  claim: 'Paris is the capital of France',
  evidence: ['https://example.com/evidence1', 'https://example.com/evidence2'],
});

console.log(result.trustScore); // 0.95 (GROUNDED)`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 3. STREAMING */}
            {activeSection === 'streaming' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      <CardTitle>Streaming Verification (`verifyStream`)</CardTitle>
                    </div>
                    <CardDescription>
                      Iterate over real-time Server-Sent Events as verification layers execute.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`const client = new ArgusClient({ apiKey: 'your-api-key' });

for await (const event of client.verifyStream({
  claim: 'Example claim',
  evidence: ['https://example.com/evidence1'],
})) {
  if (event.type === 'verification.completed') {
    console.log('Result:', event.result);
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 4. CONFIGURATION */}
            {activeSection === 'config' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-blue-500" />
                      <CardTitle>Configuration & Environment</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 text-xs font-mono">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed">
{`const client = new ArgusClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.argus.ai',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'X-Custom-Header': 'value',
  },
});

// Re-configure dynamically
client.configure({
  timeout: 60000,
});`}
                    </pre>

                    <div className="space-y-3">
                      <span className="font-bold uppercase text-muted-foreground">Supported Environment Variables</span>
                      <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto">
{`export ARGUS_API_KEY=your-api-key
export ARGUS_BASE_URL=https://api.argus.ai
export ARGUS_TIMEOUT=30000
export ARGUS_RETRIES=3
export ARGUS_RETRY_DELAY=1000`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 5. AUTHENTICATION */}
            {activeSection === 'auth' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-amber-500" />
                      <CardTitle>Authentication Modes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-mono">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed">
{`// 1. API Key Authentication (Recommended)
const client = new ArgusClient({
  apiKey: 'argus_live_8f3a9e217c4b1209d84e',
});

// 2. Bearer Token Authentication
const client = new ArgusClient({
  bearerToken: 'your-bearer-token',
});`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 6. MIDDLEWARE */}
            {activeSection === 'middleware' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-emerald-500" />
                      <CardTitle>Extensible Middleware System</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-mono">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed">
{`const client = new ArgusClient({ apiKey: 'your-api-key' });

// Add request logging middleware
client.use(async (context, next) => {
  console.log(\`→ \${context.request.method} \${context.request.url}\`);
  await next();
  console.log(\`← \${context.response?.status}\`);
});

// Add custom trace headers middleware
client.use(async (context, next) => {
  context.request.headers['X-Request-ID'] = crypto.randomUUID();
  await next();
});`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 7. API METHODS */}
            {activeSection === 'methods' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-mono text-base">Client API Methods Reference</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-xs font-mono">
                    <div className="space-y-4">
                      
                      <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                        <span className="font-bold text-primary text-sm">client.verify(params)</span>
                        <p className="text-muted-foreground font-sans">Verify a claim with supporting evidence array and priority.</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                        <span className="font-bold text-primary text-sm">client.verifyStream(params)</span>
                        <p className="text-muted-foreground font-sans">Stream real-time Server-Sent Events as verification finishes.</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                        <span className="font-bold text-primary text-sm">client.getReceipt(id)</span>
                        <p className="text-muted-foreground font-sans">Retrieve a cryptographic proof receipt for a verification ID.</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                        <span className="font-bold text-primary text-sm">client.getSession(id)</span>
                        <p className="text-muted-foreground font-sans">Fetch detailed verification session record.</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                        <span className="font-bold text-primary text-sm">client.health()</span>
                        <p className="text-muted-foreground font-sans">Check backend service status (<code className="text-green-500">status: "healthy"</code>).</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/40 border border-border space-y-2">
                        <span className="font-bold text-primary text-sm">client.analytics()</span>
                        <p className="text-muted-foreground font-sans">Retrieve organization request volume & average trust scores.</p>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 8. ERRORS */}
            {activeSection === 'errors' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <CardTitle>Typed Error Handling</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-mono">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed">
{`import {
  ArgusError,
  ApiError,
  AuthenticationError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  isTimeoutError,
  isRateLimitError,
} from '@devdotdebuger/argus-sdk';

try {
  await client.verify({ claim: '', evidence: [] });
} catch (error) {
  if (isTimeoutError(error)) {
    console.error('Request timed out');
  } else if (isRateLimitError(error)) {
    console.error(\`Rate limited. Retry after \${error.retryAfter}s\`);
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
  } else if (error instanceof ApiError) {
    console.error(\`API error: \${error.statusCode} - \${error.message}\`);
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 9. TYPES */}
            {activeSection === 'types' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-primary" />
                      <CardTitle>Exported TypeScript Definitions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-mono">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed">
{`import type {
  VerificationRequest,
  VerificationResponse,
  Receipt,
  Session,
  Analytics,
  Claim,
  Evidence,
  TrustScore,
  StreamingEvent,
  HealthResponse,
} from '@devdotdebuger/argus-sdk';`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 10. SERIALIZATION */}
            {activeSection === 'serialization' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-blue-500" />
                      <CardTitle>Serialization & Schema Utilities</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs font-mono">
                    <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed">
{`import { serialize, deserialize, parseWithSchema, safeSerialize } from '@devdotdebuger/argus-sdk';
import { z } from 'zod';

// Validate object with Zod schema
const schema = z.object({ key: z.string() });
const validated = parseWithSchema(obj, schema);

// Safe serialization (handles circular refs, Dates, Errors)
const safe = safeSerialize(complexObject);`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
