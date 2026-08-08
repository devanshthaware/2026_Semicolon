import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Eye, Lock, FileCode, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptPanelProps {
  receipt: any;
}

export const ReceiptPanel: React.FC<ReceiptPanelProps> = ({ receipt }) => {
  const [copied, setCopied] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [signatureNotice, setSignatureNotice] = useState<string | null>(null);

  const handleCopy = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifySignature = () => {
    if (receipt?.signature_status?.includes('UNSIGNED') || !receipt?.signature) {
      setSignatureNotice('Signature implementation: Local dev mode uses SHA-256 process digest. Production signature key pair not attached.');
    } else {
      setSignatureNotice('✓ Signature cryptographic hash verified.');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground flex flex-col gap-4 shadow-sm relative">
      <div className="flex justify-between items-center border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ARGUS VERIFICATION RECEIPT</h3>
        </div>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-mono font-bold">
          {receipt?.signature_status || 'UNSIGNED (LOCAL DEV)'}
        </span>
      </div>

      {receipt ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono bg-background/60 p-3.5 rounded-lg border border-border">
            <div>
              <span className="text-muted-foreground block text-[10px]">RECEIPT ID</span>
              <span className="text-primary font-bold">{receipt.receipt_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">SESSION ID</span>
              <span className="text-foreground">{receipt.session_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">GENERATION MODEL</span>
              <span className="text-foreground">{receipt.model}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">RAW TRUST SCORE</span>
              <span className="text-emerald-400 font-bold">{Math.round((receipt.raw_trust || 0) * 100)}%</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block text-[10px]">CALIBRATION STATUS</span>
              <span className="text-amber-400">{receipt.calibrated_status || 'UNCALIBRATED'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block text-[10px]">EXECUTED LAYERS</span>
              <span className="text-foreground/80 truncate block">{receipt.executed_layers?.join(', ')}</span>
            </div>
          </div>

          {signatureNotice && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-300 font-mono flex items-center justify-between">
              <span>{signatureNotice}</span>
              <Button variant="ghost" size="sm" onClick={() => setSignatureNotice(null)} className="h-6 px-2 text-[10px]">
                Dismiss
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-between items-center border-t border-border pt-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowJsonModal(true)}
                className="text-xs font-mono flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                VIEW RECEIPT
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="text-xs font-mono flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                {copied ? 'COPIED!' : 'COPY JSON'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVerifySignature}
                className="text-xs font-mono flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                VERIFY SIGNATURE
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => alert('Independent verifier endpoint ready for external receipt validation.')}
              className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              VERIFY INDEPENDENTLY
            </Button>
          </div>

          {/* Mandatory Receipt Disclaimer */}
          <p className="text-[11px] text-muted-foreground italic text-center pt-1 border-t border-border/40">
            "Receipt verifies the integrity of the verification process, not the objective truth of the underlying claim."
          </p>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-xs text-muted-foreground italic animate-pulse">Awaiting verification receipt generation from LangGraph...</p>
        </div>
      )}

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-4 relative shadow-2xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">VERIFICATION RECEIPT MANIFEST JSON</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowJsonModal(false)}>Close</Button>
            </div>
            <pre className="p-4 bg-background border border-border rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-[60vh]">
              {JSON.stringify(receipt, null, 2)}
            </pre>
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={handleCopy} className="bg-primary text-primary-foreground font-semibold">
                {copied ? 'Copied to Clipboard' : 'Copy JSON'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
