import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Save, FolderOpen, X } from 'lucide-react';

interface PromptEditorProps {
  prompt: string;
  setPrompt: (v: string) => void;
  onVerify: () => void;
  isStreaming: boolean;
}

export function Section1_PromptEditor({ prompt, setPrompt, onVerify, isStreaming }: PromptEditorProps) {
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant. Always verify your claims.');
  const [temperature, setTemperature] = useState([0.7]);
  const [model, setModel] = useState('qwen2.5:0.5b');

  return (
    <Card className="border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Prompt Editor</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8" title="Load Prompt">
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" title="Save Prompt">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Model Settings</Label>
          <div className="grid grid-cols-2 gap-4">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qwen2.5:0.5b">Qwen 2.5 (0.5b)</SelectItem>
                <SelectItem value="llama3:8b">Llama 3 (8b)</SelectItem>
                <SelectItem value="mistral:7b">Mistral (7b)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-col justify-center space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Temp</span>
                <span>{temperature?.[0]?.toFixed(2) ?? '0.70'}</span>
              </div>
              <Slider 
                value={temperature} 
                onValueChange={(val: any) => {
                  if (Array.isArray(val)) setTemperature(val);
                  else if (typeof val === 'number') setTemperature([val]);
                }} 
                max={2} 
                step={0.1} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">System Prompt</Label>
          <Input 
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="text-sm bg-muted/50" 
            placeholder="System instructions..."
          />
        </div>

        <div className="space-y-2 flex-1 flex flex-col">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">User Prompt</Label>
          <Textarea
            placeholder="Enter a statement or claim to verify..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 min-h-[120px] resize-none text-sm bg-muted/50"
            disabled={isStreaming}
          />
        </div>

      </CardContent>
      <CardFooter className="pt-2">
        {isStreaming ? (
          <Button variant="destructive" className="w-full font-semibold" onClick={() => window.location.reload()}>
            <X className="mr-2 h-4 w-4" /> Cancel Execution
          </Button>
        ) : (
          <Button onClick={onVerify} disabled={!prompt} className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white">
            <Play className="mr-2 h-4 w-4" /> Run Verification
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
