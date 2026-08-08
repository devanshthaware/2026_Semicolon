import React from 'react';
import { X, Cpu, ShieldCheck, Database, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RunConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
}

export const RunConfigModal: React.FC<RunConfigModalProps> = ({ isOpen, onClose, modelName }) => {
  if (!isOpen) return null;

  const stackItems = [
    {
      title: 'Generation Model',
      value: modelName || 'Qwen 2.5 0.5B (Ollama)',
      status: 'REAL / CONNECTED',
      icon: Cpu,
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'Embedding Model',
      value: 'BGE / BM25 Hybrid Retriever',
      status: 'REAL / CONNECTED',
      icon: Database,
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'NLI Entailment Classifier',
      value: 'DeBERTa-v3-MNLI',
      status: 'REAL / CONNECTED',
      icon: ShieldCheck,
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'Symbolic Verification Engine',
      value: 'Python Arithmetic + Z3 Logic Solver',
      status: 'REAL / CONNECTED',
      icon: Layers,
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      title: 'Conformal Calibration',
      value: 'Non-Conformity Calibrator (90% Coverage)',
      status: 'NOT CONFIGURED',
      icon: AlertCircle,
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      title: 'Adversarial Critic',
      value: 'LLM Self-Critique Agent',
      status: 'NOT CONFIGURED / SKIPPED',
      icon: Sparkles,
      statusColor: 'text-muted-foreground bg-muted/20 border-border'
    },
    {
      title: 'Cross-Model Consensus',
      value: 'Qwen + Llama + Mistral Ensemble',
      status: 'NOT CONFIGURED / SKIPPED',
      icon: Layers,
      statusColor: 'text-muted-foreground bg-muted/20 border-border'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-6 relative">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">ARGUS RUN CONFIGURATION</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Active model stack and verification layer configuration for this Argus session.
        </p>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {stackItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3 bg-muted/20 border border-border rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-background border border-border">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{item.value}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <Button size="sm" onClick={onClose} className="bg-primary text-primary-foreground font-semibold px-4">
            Close Config
          </Button>
        </div>
      </div>
    </div>
  );
};
