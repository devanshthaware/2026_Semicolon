import math
from typing import List, Union

def kernel_language_entropy(samples: Union[List[str], List[List[float]]]) -> float:
    if not samples:
        return 0.0
        
    # If a matrix of floats is passed
    if isinstance(samples[0], list):
        matrix = samples
        n = len(matrix)
        # Mock entropy calculation from kernel matrix
        # E.g. trace or average off-diagonal
        off_diag_sum = sum(matrix[i][j] for i in range(n) for j in range(n) if i != j)
        num_off_diag = n * (n - 1)
        if num_off_diag == 0:
            return 0.0
        avg_sim = off_diag_sum / num_off_diag
        # low similarity -> high entropy
        return max(0.0, 1.0 - avg_sim)
        
    # If strings are passed
    lengths = [len(s) for s in samples]
    if not lengths:
        return 0.0
    mean = sum(lengths) / len(lengths)
    variance = sum((l - mean) ** 2 for l in lengths) / len(lengths)
    return min(1.0, math.log(1 + variance) / 10.0)

def normalized_kernel_consistency(entropy: float, num_samples: int = 0) -> float:
    if entropy is None:
        return 1.0
    return max(0.0, 1.0 - entropy)
