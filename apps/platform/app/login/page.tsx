"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); 
    setLoading(true); 
    setMessage("");
    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Registration failed");
      }
      const outcome = await signIn("credentials", { email, password, redirect: false });
      if (outcome?.error) throw new Error("Invalid email or password");
      window.location.assign("/");
    } catch (error) { 
      setMessage(error instanceof Error ? error.message : "Unable to continue"); 
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 font-semibold tracking-tight text-xl">
        <span className="text-primary">◈</span> Argus
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-border/40">
        <CardHeader className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Developer Platform</p>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Start verifying"}
          </CardTitle>
          <CardDescription>
            {mode === "signin" 
              ? "Sign in to manage verification sessions and API keys." 
              : "Create your organization account. You can generate API keys after onboarding."}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={submit}>
          <CardContent className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name" 
                  className="bg-background/50"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required 
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                minLength={12} 
                placeholder="At least 12 characters" 
                required 
                className="bg-background/50"
              />
            </div>
            
            {message && (
              <p className="text-sm font-medium text-destructive">{message}</p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? "Please wait..." 
                : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => { 
                setMode(mode === "signin" ? "register" : "signin"); 
                setMessage(""); 
              }}
            >
              {mode === "signin" 
                ? "Need an account? Create one" 
                : "Already have an account? Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
