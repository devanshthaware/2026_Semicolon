from collections import Counter
from math import log
from typing import Callable


def semantic_entropy(samples: list[str], equivalent: Callable[[str, str], bool]) -> float | None:
    """Greedy semantic clustering, matching the core SE reference procedure."""
    if len(samples) < 2:
        return None
    clusters: list[list[str]] = []
    for sample in samples:
        for cluster in clusters:
            if equivalent(sample, cluster[0]):
                cluster.append(sample)
                break
        else:
            clusters.append([sample])
    probabilities = [len(cluster) / len(samples) for cluster in clusters]
    return -sum(p * log(p) for p in probabilities if p > 0)


def normalized_consistency_score(entropy: float | None, sample_count: int) -> float | None:
    if entropy is None or sample_count < 2:
        return None
    maximum = log(sample_count)
    return max(0.0, min(1.0, 1.0 - entropy / maximum)) if maximum else 1.0
