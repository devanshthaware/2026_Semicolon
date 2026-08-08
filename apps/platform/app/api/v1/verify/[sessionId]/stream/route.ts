import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // Set up Server-Sent Events headers
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Mock Verification Pipeline Stream

        // 1. Stream some initial tokens (Simulating LLM thinking/generating)
        sendEvent({ type: 'token', payload: { text: 'Based ' } });
        await new Promise(r => setTimeout(r, 200));
        sendEvent({ type: 'token', payload: { text: 'on ' } });
        await new Promise(r => setTimeout(r, 200));
        sendEvent({ type: 'token', payload: { text: 'the ' } });
        await new Promise(r => setTimeout(r, 200));
        sendEvent({ type: 'token', payload: { text: 'provided ' } });
        await new Promise(r => setTimeout(r, 200));
        sendEvent({ type: 'token', payload: { text: 'evidence...\n\n' } });

        // 2. Claim Extraction
        sendEvent({ type: 'agent_start', payload: { id: 'agent_1', name: 'Claim Extractor', status: 'running', message: 'Extracting factual claims...' } });
        await new Promise(r => setTimeout(r, 800));
        sendEvent({ type: 'claim_extracted', payload: { id: 'claim_1', text: 'The company revenue grew by 45% in Q3.' } });
        sendEvent({ type: 'agent_end', payload: { id: 'agent_1', name: 'Claim Extractor', status: 'complete', message: 'Extracted 1 claim.' } });

        // 3. Retrieval Agent
        sendEvent({ type: 'agent_start', payload: { id: 'agent_2', name: 'Hybrid Retriever', status: 'running', message: 'Searching vector DB and BM25...' } });
        await new Promise(r => setTimeout(r, 1000));
        
        // Simulating a retrieval event (Even though the hook maps 'retrieval' events loosely)
        sendEvent({ 
          type: 'retrieval', 
          payload: { 
            source: 'Q3 Financial Report (PDF)', 
            snippet: '...Q3 revenue saw a massive spike, growing by 45% year-over-year...',
            score: 0.92 
          } 
        });

        sendEvent({ type: 'agent_end', payload: { id: 'agent_2', name: 'Hybrid Retriever', status: 'complete', message: 'Found highly relevant evidence.' } });

        // 4. Entailment / Verification
        sendEvent({ type: 'agent_start', payload: { id: 'agent_3', name: 'NLI Verifier (DeBERTa)', status: 'running', message: 'Checking entailment...' } });
        await new Promise(r => setTimeout(r, 1200));
        
        // Update trust score dynamically
        sendEvent({ type: 'trust_update', payload: { score: 0.45 } });
        await new Promise(r => setTimeout(r, 400));
        sendEvent({ type: 'trust_update', payload: { score: 0.88 } });
        await new Promise(r => setTimeout(r, 400));
        sendEvent({ type: 'trust_update', payload: { score: 0.96 } });

        sendEvent({ type: 'agent_end', payload: { id: 'agent_3', name: 'NLI Verifier', status: 'complete', message: 'Entailment confirmed (0.96)' } });

        // 5. Complete
        await new Promise(r => setTimeout(r, 500));
        sendEvent({ type: 'workflow_complete', payload: {} });
        
        controller.close();
      } catch (err) {
        console.error("Stream error", err);
        controller.error(err);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
