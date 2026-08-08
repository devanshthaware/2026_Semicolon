import React from 'react';
import { useMockPlaygroundStore } from '@/store/useMockPlaygroundStore';
import { SCENARIOS } from '@/services/mockVerificationEngine';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const DemoHeader = () => {
  const { activeScenarioId, setScenario, ablatedLayers, toggleAblation, machineState } = useMockPlaygroundStore();
  const isRunning = machineState !== 'IDLE' && machineState !== 'COMPLETE';

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-border bg-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">ARGUS VERIFICATION PLAYGROUND</h1>
            <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded border border-primary/30 uppercase">
              Demo Mode · Mock Verification Data
            </span>
          </div>
          <p className="text-muted-foreground mt-1">Real-time AI hallucination detection and verification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Scenarios */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Judge Demo Scenarios</h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(SCENARIOS).map((s) => (
              <Button
                key={s.id}
                variant={activeScenarioId === s.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScenario(s.id)}
                disabled={isRunning}
                className={activeScenarioId === s.id ? 'bg-primary text-primary-foreground' : ''}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Ablation */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Ablation</h3>
          <div className="flex flex-wrap gap-4 bg-muted/30 p-3 rounded-md border border-border">
            <div className="flex items-center space-x-2">
              <Switch 
                id="ablation-symbolic" 
                checked={!ablatedLayers.includes('symbolic')}
                onChange={() => toggleAblation('symbolic')}
                disabled={isRunning}
              />
              <Label htmlFor="ablation-symbolic">Symbolic Verification</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="ablation-temporal" 
                checked={!ablatedLayers.includes('temporal')}
                onChange={() => toggleAblation('temporal')}
                disabled={isRunning}
              />
              <Label htmlFor="ablation-temporal">Temporal Verification</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
