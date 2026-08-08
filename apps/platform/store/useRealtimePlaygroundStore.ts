import { create } from 'zustand';

export type ExecutionMode = 'REAL-TIME' | 'DEMO';
export type PlaygroundMachineState = 
  | 'IDLE' 
  | 'GENERATING' 
  | 'CLAIM_EXTRACTION' 
  | 'PIPELINE_RUNNING' 
  | 'COMPLETE' 
  | 'ERROR';

export interface ClaimItem {
  id: string;
  text: string;
  type: string;
  routing?: string[];
  verdict: string;
  trust?: number;
  evidence?: any[];
  signals?: {
    retrieval?: string;
    nli?: string;
    symbolic?: string;
    temporal?: string;
    critic?: string;
    cross_model?: string;
    semantic?: string;
  };
  diagnostics?: any;
}

interface RealtimePlaygroundStore {
  // Config & Status
  executionMode: ExecutionMode;
  ollamaStatus: 'CONNECTED' | 'OFFLINE' | 'CHECKING';
  modelName: string;
  connectionStatus: 'LIVE' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';
  
  // Verification Run State
  machineState: PlaygroundMachineState;
  sessionId: string | null;
  prompt: string;
  responseText: string;
  claims: ClaimItem[];
  selectedClaimId: string | null;
  ablatedLayers: string[];
  trustScore: number | null;
  receipt: any | null;
  corrections: any[];
  events: any[];
  errorMessage: string | null;
  
  // Actions
  setExecutionMode: (mode: ExecutionMode) => void;
  setSelectedClaimId: (id: string | null) => void;
  toggleAblation: (layerId: string) => void;
  checkOllamaHealth: () => Promise<void>;
  runVerification: (inputPrompt: string) => Promise<void>;
  stopVerification: () => void;
  reset: () => void;
}

let activeEventSource: EventSource | null = null;

export const useRealtimePlaygroundStore = create<RealtimePlaygroundStore>((set, get) => ({
  executionMode: 'REAL-TIME',
  ollamaStatus: 'CHECKING',
  modelName: 'qwen2.5:0.5b',
  connectionStatus: 'DISCONNECTED',
  
  machineState: 'IDLE',
  sessionId: null,
  prompt: '',
  responseText: '',
  claims: [],
  selectedClaimId: null,
  ablatedLayers: [],
  trustScore: null,
  receipt: null,
  corrections: [],
  events: [],
  errorMessage: null,

  setExecutionMode: (mode) => set({ executionMode: mode }),

  setSelectedClaimId: (id) => set({ selectedClaimId: id }),

  toggleAblation: (layerId) => {
    const current = get().ablatedLayers;
    const updated = current.includes(layerId)
      ? current.filter(id => id !== layerId)
      : [...current, layerId];
    set({ ablatedLayers: updated });
  },

  checkOllamaHealth: async () => {
    try {
      const res = await fetch('http://localhost:8000/v1/health/ollama');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'connected') {
          set({
            ollamaStatus: 'CONNECTED',
            modelName: data.default_model || 'qwen2.5:0.5b'
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Ollama health check failed:", e);
    }
    set({ ollamaStatus: 'OFFLINE' });
  },

  runVerification: async (inputPrompt: string) => {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }

    set({
      prompt: inputPrompt,
      responseText: '',
      claims: [],
      selectedClaimId: null,
      trustScore: null,
      receipt: null,
      corrections: [],
      events: [],
      errorMessage: null,
      machineState: 'GENERATING',
      connectionStatus: 'CONNECTING'
    });

    let createdSessionId: string | null = null;

    try {
      // 1. Create DB session in Postgres
      const initRes = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt })
      });
      if (initRes.ok) {
        const initData = await initRes.json();
        createdSessionId = initData.sessionId;
        set({ sessionId: createdSessionId });
      }
    } catch (err) {
      console.warn("Failed to create postgres session:", err);
    }

    const sessId = createdSessionId || `sess_${Date.now()}`;
    const ablatedStr = get().ablatedLayers.join(',');
    const streamUrl = `http://localhost:8000/v1/verify/${sessId}/stream?prompt=${encodeURIComponent(inputPrompt)}&ablated=${encodeURIComponent(ablatedStr)}`;

    const es = new EventSource(streamUrl);
    activeEventSource = es;

    set({ connectionStatus: 'LIVE' });

    es.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.type;
        const payload = data.payload || {};

        set(state => ({ events: [...state.events, data] }));

        switch (eventType) {
          case 'response.token':
            set(state => ({
              responseText: state.responseText + (payload.text || '')
            }));
            break;

          case 'claim.extraction.started':
            set({ machineState: 'CLAIM_EXTRACTION' });
            break;

          case 'claim.extracted':
            set(state => {
              const exists = state.claims.some(c => c.id === payload.id);
              if (exists) return state;
              const newClaims = [...state.claims, {
                id: payload.id,
                text: payload.text,
                type: payload.type || 'factual',
                routing: payload.routing || [],
                verdict: 'UNVERIFIED'
              }];
              return {
                claims: newClaims,
                // Automatically select first extracted claim if none is selected yet
                selectedClaimId: state.selectedClaimId || payload.id
              };
            });
            break;

          case 'routing.started':
            set({ machineState: 'PIPELINE_RUNNING' });
            break;

          case 'layer.completed':
            set(state => ({
              claims: state.claims.map(c => 
                c.id === payload.claim_id
                  ? { 
                      ...c, 
                      verdict: payload.status, 
                      trust: payload.trust,
                      evidence: payload.evidence || c.evidence,
                      signals: payload.signals || c.signals
                    }
                  : c
              )
            }));
            break;

          case 'correction.completed':
            set(state => ({
              corrections: [...state.corrections, payload]
            }));
            break;

          case 'fusion.completed':
            set({ trustScore: payload.trust_score });
            break;

          case 'receipt.created':
            set({ receipt: payload });
            break;

          case 'verification.completed':
            set({ machineState: 'COMPLETE', trustScore: payload.trust_score });
            es.close();
            activeEventSource = null;

            // Persist completion back to Postgres
            if (createdSessionId) {
              try {
                await fetch(`/api/v1/verify/${createdSessionId}/complete`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    response: get().responseText,
                    trustScore: payload.trust_score,
                    verdict: payload.verdict,
                    claims: get().claims,
                    receipt: get().receipt
                  })
                });
              } catch (perr) {
                console.warn("Failed to persist session completion:", perr);
              }
            }
            break;

          case 'verification.error':
            set({
              machineState: 'ERROR',
              errorMessage: payload.message || "Verification process failed.",
              connectionStatus: 'ERROR'
            });
            es.close();
            activeEventSource = null;
            break;
        }
      } catch (parseErr) {
        console.error("Error parsing SSE event:", parseErr);
      }
    };

    es.onerror = (err) => {
      console.error("SSE stream connection error:", err);
      set({
        machineState: 'ERROR',
        errorMessage: "Local verification stream disconnected. Check backend server.",
        connectionStatus: 'DISCONNECTED'
      });
      es.close();
      activeEventSource = null;
    };
  },

  stopVerification: () => {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    set({
      machineState: 'IDLE',
      connectionStatus: 'DISCONNECTED'
    });
  },

  reset: () => {
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    set({
      machineState: 'IDLE',
      sessionId: null,
      prompt: '',
      responseText: '',
      claims: [],
      selectedClaimId: null,
      trustScore: null,
      receipt: null,
      corrections: [],
      events: [],
      errorMessage: null,
      connectionStatus: 'DISCONNECTED'
    });
  }
}));
