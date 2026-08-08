import React, { useEffect } from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { useRealtimePlaygroundStore, ExecutionMode } from '@/store/useRealtimePlaygroundStore';
import { SCENARIOS } from '@/services/mockVerificationEngine';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const DemoHeader = () => {
  const { activeScenarioId, setScenario, ablatedLayers: mockAblated, toggleAblation: toggleMockAblation, machineState: mockState } = useMockPlaygroundStore();
  const { 
    executionMode, 
    setExecutionMode, 
    ollamaStatus, 
    modelName, 
    connectionStatus, 
    checkOllamaHealth,
    ablatedLayers: realtimeAblated,
    toggleAblation: toggleRealtimeAblation,
    machineState: realtimeState,
    sessionId
  } = useRealtimePlaygroundStore();

  const isRunning = (executionMode === 'REAL-TIME') 
    ? (realtimeState !== 'IDLE' && realtimeState !== 'COMPLETE' && realtimeState !== 'ERROR')
    : (mockState !== 'IDLE' && mockState !== 'COMPLETE');

  useEffect(() => {
    checkOllamaHealth();
  }, [checkOllamaHealth]);

  const currentAblated = executionMode === 'REAL-TIME' ? realtimeAblated : mockAblated;
  const toggleAblation = (layerId: string) => {
    toggleMockAblation(layerId);
    toggleRealtimeAblation(layerId);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-border bg-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">ARGUS VERIFICATION PLAYGROUND</h1>
            
            {/* Mode Indicator Badge */}
            <div className="flex items-center gap-2 bg-background border border-border px-2.5 py-1 rounded-full text-xs font-mono">
              <span className="text-muted-foreground">Mode:</span>
              <span className={`font-semibold ${executionMode === 'REAL-TIME' ? 'text-green-400' : 'text-amber-400'}`}>
                {executionMode}
              </span>
            </div>

            {/* Ollama Status Badge */}
            {executionMode === 'REAL-TIME' && (
              <div className="flex items-center gap-2 bg-background border border-border px-2.5 py-1 rounded-full text-xs font-mono">
                <span className="text-muted-foreground">Ollama:</span>
                <span className={`flex items-center gap-1 font-semibold ${ollamaStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`inline-block w-2 h-2 rounded-full ${ollamaStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {ollamaStatus}
                </span>
                <span className="text-muted-foreground border-l border-border pl-2">({modelName})</span>
              </div>
            )}

            {/* Session & Connection Status */}
            {executionMode === 'REAL-TIME' && sessionId && (
              <div className="flex items-center gap-2 bg-background border border-border px-2.5 py-1 rounded-full text-xs font-mono">
                <span className="text-muted-foreground">Session:</span>
                <span className="text-foreground">{sessionId}</span>
                <span className={`ml-1 font-semibold ${connectionStatus === 'LIVE' ? 'text-green-400' : 'text-amber-400'}`}>
                  ● {connectionStatus}
                </span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">Real-time local AI verification engine powered by LangGraph & Ollama.</p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border gap-1">
          <Button
            variant={executionMode === 'REAL-TIME' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setExecutionMode('REAL-TIME')}
            className={`text-xs font-semibold px-3 ${executionMode === 'REAL-TIME' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            ● REAL-TIME
          </Button>
          <Button
            variant={executionMode === 'DEMO' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setExecutionMode('DEMO')}
            className={`text-xs font-semibold px-3 ${executionMode === 'DEMO' ? 'bg-amber-600 text-white' : 'text-muted-foreground'}`}
          >
            DEMO / MOCK
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Scenarios (Used for preset prompts in Real-time or full mock in Demo) */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {executionMode === 'REAL-TIME' ? 'Preset Test Prompts' : 'Judge Demo Scenarios'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(SCENARIOS).map((s) => (
              <Button
                key={s.id}
                variant={activeScenarioId === s.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScenario(s.id)}
                disabled={isRunning}
                className={activeScenarioId === s.id ? 'bg-primary text-primary-foreground text-xs' : 'text-xs'}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Live Ablation */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Pipeline Ablation</h3>
          <div className="flex flex-wrap gap-4 bg-muted/30 p-2.5 rounded-md border border-border text-sm">
            <div className="flex items-center space-x-2">
              <Switch 
                id="ablation-symbolic" 
                checked={!currentAblated.includes('symbolic')}
                onCheckedChange={() => toggleAblation('symbolic')}
                disabled={isRunning}
              />
              <Label htmlFor="ablation-symbolic" className="text-xs">Symbolic Engine</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="ablation-temporal" 
                checked={!currentAblated.includes('temporal')}
                onCheckedChange={() => toggleAblation('temporal')}
                disabled={isRunning}
              />
              <Label htmlFor="ablation-temporal" className="text-xs">Temporal Check</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
