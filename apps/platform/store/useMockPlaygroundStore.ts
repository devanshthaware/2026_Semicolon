import { create } from 'zustand';
import { VerificationScenario, SCENARIOS, DEFAULT_SCENARIO, applyAblation, generateDynamicReceipt } from '@/services/mockVerificationEngine';

export type PlaygroundState = 
  | 'IDLE' 
  | 'PROMPT_READY' 
  | 'GENERATING' 
  | 'CLAIM_EXTRACTION' 
  | 'PIPELINE_RUNNING' 
  | 'COMPLETE' 
  | 'ERROR';

interface MockPlaygroundStore {
  // State
  machineState: PlaygroundState;
  activeScenarioId: string;
  scenario: VerificationScenario;
  ablatedLayers: string[];
  
  // Progress (for the timeline animation)
  elapsedMs: number;
  
  // Actions
  setScenario: (id: string) => void;
  toggleAblation: (layerId: string) => void;
  runVerification: () => void;
  reset: () => void;
  tick: (deltaMs: number) => void;
}

export const useMockPlaygroundStore = create<MockPlaygroundStore>((set, get) => ({
  machineState: 'IDLE',
  activeScenarioId: DEFAULT_SCENARIO.id,
  scenario: DEFAULT_SCENARIO,
  ablatedLayers: [],
  elapsedMs: 0,
  
  setScenario: async (id) => {
    const baseScenario = SCENARIOS[id] || DEFAULT_SCENARIO;
    const initialAblated = applyAblation(baseScenario, get().ablatedLayers);
    set({
      activeScenarioId: id,
      scenario: initialAblated,
      machineState: 'IDLE',
      elapsedMs: 0
    });

    const scenarioWithReceipt = await generateDynamicReceipt(initialAblated);
    if (get().activeScenarioId === id) {
      set({ scenario: scenarioWithReceipt });
    }
  },
  
  toggleAblation: async (layerId) => {
    const currentAblated = get().ablatedLayers;
    const newAblated = currentAblated.includes(layerId)
      ? currentAblated.filter(id => id !== layerId)
      : [...currentAblated, layerId];
      
    const baseScenario = SCENARIOS[get().activeScenarioId] || DEFAULT_SCENARIO;
    const initialAblated = applyAblation(baseScenario, newAblated);
    set({
      ablatedLayers: newAblated,
      scenario: initialAblated,
      machineState: 'IDLE',
      elapsedMs: 0
    });

    const scenarioWithReceipt = await generateDynamicReceipt(initialAblated);
    // ensure we haven't switched scenarios or changed ablations again while generating
    if (get().ablatedLayers === newAblated) {
      set({ scenario: scenarioWithReceipt });
    }
  },
  
  runVerification: async () => {
    set({ machineState: 'GENERATING', elapsedMs: 0 });
    const scenario = get().scenario;

    let realSessionId: string | null = null;
    try {
      // 1. Create real session in database
      const initRes = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scenario.prompt,
          response: scenario.initialResponse
        })
      });
      if (initRes.ok) {
        const initData = await initRes.json();
        realSessionId = initData.sessionId;
      }
    } catch (err) {
      console.warn("Failed to create backend session:", err);
    }
    
    // Start simulation loop
    const startTime = Date.now();
    const interval = setInterval(async () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      const maxTime = scenario.timeline[scenario.timeline.length - 1]?.timeMs || 3000;
      
      if (elapsed >= maxTime) {
        set({ machineState: 'COMPLETE', elapsedMs: maxTime });
        clearInterval(interval);

        // 2. Persist completion in database if session was created
        if (realSessionId) {
          try {
            await fetch(`/api/v1/verify/${realSessionId}/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                response: scenario.initialResponse,
                trustScore: scenario.metrics.overallScore,
                verdict: scenario.metrics.verdict,
                claims: scenario.claims.map(c => ({
                  text: c.text,
                  status: c.verdict === 'GROUNDED' ? 'verified' : c.verdict === 'CONTRADICTED' ? 'failed' : 'warning'
                })),
                receipt: scenario.receipt
              })
            });
          } catch (err) {
            console.warn("Failed to complete backend session:", err);
          }
        }
      } else {
        // Update detailed machine state based on elapsed time
        let currentState: PlaygroundState = 'PIPELINE_RUNNING';
        if (elapsed < 300) currentState = 'GENERATING';
        else if (elapsed < 600) currentState = 'CLAIM_EXTRACTION';
        
        set({ machineState: currentState, elapsedMs: elapsed });
      }
    }, 50);
  },
  
  reset: () => {
    set({ machineState: 'IDLE', elapsedMs: 0 });
  },
  
  tick: (deltaMs) => {
    set(state => ({ elapsedMs: state.elapsedMs + deltaMs }));
  }
}));
