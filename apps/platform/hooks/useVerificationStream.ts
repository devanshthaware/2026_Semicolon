'use client';

import { useEffect, useRef } from 'react';
import { useStreamingStore, StreamEvent } from '../store/useStreamingStore';

export function useVerificationStream(sessionId: string | null) {
  const {
    setIsStreaming,
    addEvent,
    setTrustScore,
    addClaim,
    addAgentActivity,
    appendTokens,
    resetStream,
  } = useStreamingStore();

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) {
      resetStream();
      return;
    }

    setIsStreaming(true);
    // Connect to the local API Gateway (assuming it runs on localhost:8000 for local dev)
    const url = `http://localhost:8000/api/v1/verify/${sessionId}/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        addEvent(data);

        switch (data.type) {
          case 'token':
            appendTokens(data.payload.text);
            break;
          case 'claim_extracted':
            addClaim(data.payload);
            break;
          case 'agent_start':
          case 'agent_end':
            addAgentActivity(data.payload);
            break;
          case 'trust_update':
            setTrustScore(data.payload.score);
            break;
          case 'workflow_complete':
            setIsStreaming(false);
            eventSource.close();
            break;
        }
      } catch (error) {
        console.error('Failed to parse SSE event', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error', error);
      setIsStreaming(false);
      eventSource.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId, setIsStreaming, addEvent, setTrustScore, addClaim, addAgentActivity, appendTokens, resetStream]);
}
