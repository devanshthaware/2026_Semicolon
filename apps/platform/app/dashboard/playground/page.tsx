'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DemoHeader } from '@/components/argus-playground/DemoHeader';
import { PromptPanel } from '@/components/argus-playground/PromptPanel';
import { ResponsePanel } from '@/components/argus-playground/ResponsePanel';
import { PipelineVisualizer } from '@/components/argus-playground/PipelineVisualizer';
import { TrustScorePanel } from '@/components/argus-playground/TrustScorePanel';
import { DetailedVerificationPanels } from '@/components/argus-playground/DetailedVerificationPanels';

export default function PlaygroundPage() {
  return (
    <DashboardLayout fullWidth={true}>
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
        
        {/* Top Header with Scenarios and Ablation toggles */}
        <DemoHeader />

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column (Span 4): Prompt & Response */}
            <div className="col-span-1 md:col-span-12 lg:col-span-4 space-y-6 flex flex-col">
              <PromptPanel />
              <ResponsePanel />
            </div>
            
            {/* Center Column (Span 4): Pipeline Visualizer */}
            <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col">
              <PipelineVisualizer />
            </div>

            {/* Right Column (Span 4): Trust Score */}
            <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col">
              <TrustScorePanel />
            </div>

          </div>

          {/* Bottom Area: Detailed Layers & Receipt */}
          <DetailedVerificationPanels />

        </div>
      </div>
    </DashboardLayout>
  );
}
