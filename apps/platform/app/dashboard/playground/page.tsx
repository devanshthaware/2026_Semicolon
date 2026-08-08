'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useVerificationStream } from '@/hooks/useVerificationStream';
import { useStreamingStore } from '@/store/useStreamingStore';

// Placeholders for modular sections
import { Section1_PromptEditor } from '@/components/playground/Section1_PromptEditor';
import { Section2_StreamingResponse } from '@/components/playground/Section2_StreamingResponse';
import { Section3_VerificationPipeline } from '@/components/playground/Section3_VerificationPipeline';
import { Section4_ExecutionGraph } from '@/components/playground/Section4_ExecutionGraph';
import { Section5_StateInspector } from '@/components/playground/Section5_StateInspector';
import { Section6_ClaimExtraction } from '@/components/playground/Section6_ClaimExtraction';
import { Section7_ClaimDependency } from '@/components/playground/Section7_ClaimDependency';
import { Section8_RetrievalPipeline } from '@/components/playground/Section8_RetrievalPipeline';
import { Section9_EvidenceViewer } from '@/components/playground/Section9_EvidenceViewer';
import { Section10_SemanticProbe } from '@/components/playground/Section10_SemanticProbe';
import { Section11_CrossModelAgreement } from '@/components/playground/Section11_CrossModelAgreement';
import { Section12_SymbolicVerification } from '@/components/playground/Section12_SymbolicVerification';
import { Section13_TemporalVerification } from '@/components/playground/Section13_TemporalVerification';
import { Section14_SignalFusion } from '@/components/playground/Section14_SignalFusion';
import { Section15_TrustCalibration } from '@/components/playground/Section15_TrustCalibration';
import { Section16_TrustDashboard } from '@/components/playground/Section16_TrustDashboard';
import { Section17_AgentTimeline } from '@/components/playground/Section17_AgentTimeline';
import { Section18_PerformanceCharts } from '@/components/playground/Section18_PerformanceCharts';
import { Section19_LangSmithTrace } from '@/components/playground/Section19_LangSmithTrace';
import { Section20_LiveLogs } from '@/components/playground/Section20_LiveLogs';
import { Section21_VerificationReceipt } from '@/components/playground/Section21_VerificationReceipt';
import { Section22_DeveloperTools } from '@/components/playground/Section22_DeveloperTools';
import { RightSidePanel } from '@/components/playground/RightSidePanel';
import { BottomHealthPanel } from '@/components/playground/BottomHealthPanel';

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useVerificationStream(activeSessionId, prompt);
  const { isStreaming, resetStream } = useStreamingStore();

  const handleVerify = () => {
    resetStream();
    setActiveSessionId('session_' + Date.now());
  };

  return (
    <DashboardLayout fullWidth={true}>
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
        
        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Verification Playground</h1>
              <p className="text-muted-foreground mt-1">Real-time AI Verification Operating System.</p>
            </div>
            <Section22_DeveloperTools />
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Left/Center Column (Span 9) */}
            <div className="col-span-12 xl:col-span-9 space-y-6">
              
              {/* Top Row: Input, Streaming Output, Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <Section1_PromptEditor prompt={prompt} setPrompt={setPrompt} onVerify={handleVerify} isStreaming={isStreaming} />
                  <Section10_SemanticProbe />
                </div>
                <div className="lg:col-span-2">
                  <Section2_StreamingResponse />
                </div>
              </div>

              {/* Real-time Verification Pipeline */}
              <Section3_VerificationPipeline />

              {/* Complex Analysis Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Section14_SignalFusion />
                <Section15_TrustCalibration />
              </div>

              {/* Claims & Retrieval Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Section6_ClaimExtraction />
                  <Section7_ClaimDependency />
                </div>
                <div className="space-y-6">
                  <Section8_RetrievalPipeline />
                  <Section9_EvidenceViewer />
                </div>
              </div>

              {/* Alternative Verification Modalities */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Section11_CrossModelAgreement />
                <Section12_SymbolicVerification />
                <Section13_TemporalVerification />
              </div>

              {/* DAG & Timelines */}
              <Section4_ExecutionGraph />
              <Section17_AgentTimeline />
              
              {/* Telemetry & Receipts */}
              <Section18_PerformanceCharts />
              <Section19_LangSmithTrace />
              <Section20_LiveLogs />
              <Section21_VerificationReceipt />

            </div>

            {/* Right Column (Span 3) */}
            <div className="col-span-12 xl:col-span-3 space-y-6 relative">
              <div className="sticky top-0 space-y-6">
                <Section16_TrustDashboard />
                <RightSidePanel />
                <Section5_StateInspector />
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Status Bar */}
        <BottomHealthPanel />
        
      </div>
    </DashboardLayout>
  );
}
