import re
import os
import requests

class OllamaClaimExtractor:
    """P001 - Base LLM for Claim Extraction using local Ollama"""
    
    def __init__(self, model_name: str = "qwen2.5:0.5b"):
        self.model_name = os.getenv("OLLAMA_MODEL", model_name)
        # host.docker.internal allows docker container to reach Ollama on host machine
        self.ollama_url = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")

    def extract(self, response: str) -> list[str]:
        prompt = (
            "Extract the core factual claims from the following text. "
            "Return each claim on a new line starting with a dash (-). "
            "Do not include any conversational filler.\n\n"
            f"Text: {response}"
        )
        
        try:
            res = requests.post(
                self.ollama_url,
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=10
            )
            if res.status_code == 200:
                data = res.json()
                generated_text = data.get("response", "")
                
                # Parse lines starting with a dash
                claims = []
                for line in generated_text.split('\n'):
                    line = line.strip()
                    if line.startswith('-'):
                        claims.append(line.lstrip('- ').strip())
                
                if claims:
                    return claims[:8]
        except Exception as e:
            print(f"Ollama Extraction Failed: {e}. Falling back to regex.")
            
        # Fallback to simple regex if Ollama fails or is not running
        return [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", response) if sentence.strip()][:8]

def extract_claims(response: str) -> list[str]:
    """P001 Base LLM Claim Extraction."""
    extractor = OllamaClaimExtractor()
    return extractor.extract(response)
