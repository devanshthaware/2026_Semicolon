import re


def extract_claims(response: str) -> list[str]:
    """Replace with a structured claim extractor for production documents."""
    return [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", response) if sentence.strip()][:8]
