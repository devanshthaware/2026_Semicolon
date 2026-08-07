import { create } from 'zustand';

export interface StreamEvent {
  id: string;
  type: 'token' | 'claim_extracted' | 'agent_start' | 'agent_end' | 'retrieval' | 'trust_update' | 'receipt' | 'workflow_complete';
  payload: any;
  timestamp: string;
}

interface StreamingState {
  isStreaming: boolean;
  events: StreamEvent[];
  trustScore: number | null;
  claims: any[];
  agents: any[];
  currentTokens: string;
  
  setIsStreaming: (isStreaming: boolean) => void;
  addEvent: (event: StreamEvent) => void;
  setTrustScore: (score: number) => void;
  addClaim: (claim: any) => void;
  addAgentActivity: (agent: any) => void;
  appendTokens: (tokens: string) => void;
  resetStream: () => void;
}

export const useStreamingStore = create<StreamingState>((set) => ({
  isStreaming: false,
  events: [],
  trustScore: null,
  claims: [],
  agents: [],
  currentTokens: '',

  setIsStreaming: (isStreaming) => set({ isStreaming }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  setTrustScore: (trustScore) => set({ trustScore }),
  addClaim: (claim) => set((state) => ({ claims: [...state.claims, claim] })),
  addAgentActivity: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  appendTokens: (tokens) => set((state) => ({ currentTokens: state.currentTokens + tokens })),
  resetStream: () => set({
    isStreaming: false,
    events: [],
    trustScore: null,
    claims: [],
    agents: [],
    currentTokens: '',
  }),
}));
