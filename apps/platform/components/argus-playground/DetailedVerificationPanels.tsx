import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore } from '@/store/useRealtimePlaygroundStore';
import { ExtractedClaimsPanel } from './ExtractedClaimsPanel';
import { EvidenceVerificationPanel } from './EvidenceVerificationPanel';
import { CorrectionPanel } from './CorrectionPanel';
import { ExecutionTimelinePanel } from './ExecutionTimelinePanel';
import { ReceiptPanel } from './ReceiptPanel';

export const DetailedVerificationPanels = () => {
  const mockStore = useMockPlaygroundStore();
  const realtimeStore = useRealtimePlaygroundStore();

  const isRealtime = realtimeStore.executionMode === 'REAL-TIME';

  if (!isRealtime) {
    const { scenario, elapsedMs, machineState } = mockStore;
    if (machineState === 'IDLE' || machineState === 'PROMPT_READY') return null;

    const showRetrieval = elapsedMs >= 900;
    const showSymbolic = elapsedMs >= 1400;
    const showReceipt = elapsedMs >= 2600;

    const rawClaim = scenario.claims[0] as any;
    const mockClaim = rawClaim ? {
      id: rawClaim.id || 'clm_1',
      text: rawClaim.originalText || rawClaim.text || '',
      type: rawClaim.type || 'factual',
      routing: ['Hybrid Retrieval', 'NLI', 'Symbolic Engine'],
      verdict: rawClaim.verdict || 'CONTRADICTED',
      evidence: rawClaim.evidence ? [{
        source: rawClaim.evidence.source || 'Q3 Financial Report',
        snippet: rawClaim.evidence.relevantPassage || rawClaim.evidence.snippet || '',
        score: rawClaim.evidence.score || 0.94,
        relation: 'contradicts'
      }] : [],
      signals: {
        retrieval: showRetrieval ? 'EVIDENCE_FOUND' : 'SKIPPED',
        nli: 'CONTRADICTS',
        symbolic: showSymbolic ? 'CONTRADICTED' : 'SKIPPED',
        temporal: 'SKIPPED'
      }
    } : null;

    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <ExtractedClaimsPanel 
              claims={mockClaim ? [mockClaim] : []}
              selectedClaimId={mockClaim?.id || null}
              onSelectClaim={() => {}}
            />
          </div>
          <div className="lg:col-span-7">
            <EvidenceVerificationPanel claim={mockClaim} />
          </div>
        </div>

        <ReceiptPanel receipt={{
          receipt_id: scenario.receipt.receiptId,
          session_id: 'sess_demo_mock',
          model: 'Qwen 2.5 0.5B (Mock)',
          raw_trust: scenario.finalTrust,
          calibrated_status: 'NOT CONFIGURED',
          executed_layers: ['Retrieval', 'NLI', 'Symbolic Engine'],
          signature_status: 'UNSIGNED (LOCAL DEV)'
        }} />
      </div>
    );
  }

  // Real-Time Detailed Panels
  const { 
    claims, 
    selectedClaimId, 
    setSelectedClaimId, 
    corrections, 
    receipt, 
    events, 
    ablatedLayers,
    machineState 
  } = realtimeStore;

  if (machineState === 'IDLE') return null;

  // Resolve selected claim object
  const selectedClaim = claims.find(c => c.id === selectedClaimId) || claims[0] || null;

  return (
    <div className="space-y-6 mt-6">
      {/* Row 1: Extracted Claims List + Interactive Evidence & Verification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ExtractedClaimsPanel
            claims={claims}
            selectedClaimId={selectedClaim?.id || null}
            onSelectClaim={(id) => setSelectedClaimId(id)}
          />
        </div>
        <div className="lg:col-span-7">
          <EvidenceVerificationPanel claim={selectedClaim} />
        </div>
      </div>

      {/* Row 2: Model Correction Panel & Execution Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <CorrectionPanel corrections={corrections} />
        </div>
        <div className="lg:col-span-7">
          <ExecutionTimelinePanel events={events} ablatedLayers={ablatedLayers} />
        </div>
      </div>

      {/* Row 3: Verification Receipt */}
      <ReceiptPanel receipt={receipt} />
    </div>
  );
};

