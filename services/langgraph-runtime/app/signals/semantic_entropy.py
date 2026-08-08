import math
from typing import Callable, List

def semantic_entropy(samples: List[str], equivalence_func: Callable[[str, str], bool]) -> float:
    if not samples:
        return 0.0
    # Group samples by equivalence
    clusters = []
    for sample in samples:
        found = False
        for cluster in clusters:
            if equivalence_func(cluster[0], sample):
                cluster.append(sample)
                found = True
                break
        if not found:
            clusters.append([sample])
    
    # Calculate entropy
    total = len(samples)
    entropy = 0.0
    for cluster in clusters:
        p = len(cluster) / total
        entropy -= p * math.log(p)
    return entropy

def normalized_consistency_score(entropy: float, num_samples: int) -> float:
    if num_samples <= 1:
        return 1.0
    max_entropy = math.log(num_samples)
    if max_entropy == 0:
        return 1.0
    # 1.0 means perfectly consistent (0 entropy), 0.0 means max entropy
    return max(0.0, 1.0 - (entropy / max_entropy))
