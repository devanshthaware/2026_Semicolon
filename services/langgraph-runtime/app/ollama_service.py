import os
import json
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional

class OllamaService:
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL") or os.getenv("OLLAMA_URL") or "http://localhost:11434"
        if not self.base_url.endswith("/"):
            self.base_url += "/"
        self.default_model = model or os.getenv("ARGUS_MODEL") or os.getenv("OLLAMA_MODEL") or "qwen2.5:0.5b"

    def _get_candidate_urls(self) -> List[str]:
        candidates = [self.base_url]
        if "host.docker.internal" not in self.base_url:
            candidates.append("http://host.docker.internal:11434/")
        if "localhost" not in self.base_url and "127.0.0.1" not in self.base_url:
            candidates.append("http://localhost:11434/")
        
        normalized = []
        for c in candidates:
            url = c if c.endswith("/") else c + "/"
            if url not in normalized:
                normalized.append(url)
        return normalized

    async def _resolve_model(self, requested_model: Optional[str] = None) -> str:
        if requested_model:
            return requested_model
        models = await self.list_models()
        if models:
            for m in models:
                if m.get("name") == self.default_model or m.get("model") == self.default_model:
                    return self.default_model
            first_model = models[0].get("name") or models[0].get("model")
            if first_model:
                return first_model
        return self.default_model

    async def health_check(self) -> Dict[str, Any]:
        """Verify Ollama connection across candidate URLs and return status."""
        last_error = "Unknown error"
        for url in self._get_candidate_urls():
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    res = await client.get(f"{url}api/tags")
                    if res.status_code == 200:
                        data = res.json()
                        models = [m.get("name") for m in data.get("models", [])]
                        self.base_url = url
                        return {
                            "status": "connected",
                            "base_url": url,
                            "models": models,
                            "default_model": await self._resolve_model()
                        }
            except Exception as e:
                last_error = str(e)
                continue

        return {"status": "offline", "base_url": self.base_url, "error": last_error}

    async def list_models(self) -> List[Dict[str, Any]]:
        """List all installed Ollama models."""
        for url in self._get_candidate_urls():
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    res = await client.get(f"{url}api/tags")
                    if res.status_code == 200:
                        self.base_url = url
                        return res.json().get("models", [])
            except Exception:
                continue
        return []

    async def generate(self, prompt: str, model: Optional[str] = None, system: Optional[str] = None, options: Optional[Dict[str, Any]] = None) -> str:
        """Non-streaming response generation."""
        target_model = await self._resolve_model(model)
        payload: Dict[str, Any] = {
            "model": target_model,
            "prompt": prompt,
            "stream": False
        }
        if system:
            payload["system"] = system
        if options:
            payload["options"] = options

        last_exc = None
        for url in self._get_candidate_urls():
            try:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    res = await client.post(f"{url}api/generate", json=payload)
                    res.raise_for_status()
                    self.base_url = url
                    return res.json().get("response", "")
            except Exception as e:
                last_exc = e
                continue
        raise last_exc or RuntimeError("All Ollama candidate endpoints failed")

    async def stream(self, prompt: str, model: Optional[str] = None, system: Optional[str] = None, options: Optional[Dict[str, Any]] = None) -> AsyncGenerator[str, None]:
        """Stream generated response tokens chunk by chunk."""
        target_model = await self._resolve_model(model)
        payload: Dict[str, Any] = {
            "model": target_model,
            "prompt": prompt,
            "stream": True
        }
        if system:
            payload["system"] = system
        if options:
            payload["options"] = options

        connected_url = None
        for url in self._get_candidate_urls():
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(f"{url}api/tags")
                    if res.status_code == 200:
                        connected_url = url
                        self.base_url = url
                        break
            except Exception:
                continue

        target_url = connected_url or self.base_url

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", f"{target_url}api/generate", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            chunk = data.get("response", "")
                            if chunk:
                                yield chunk
                        except json.JSONDecodeError:
                            continue
