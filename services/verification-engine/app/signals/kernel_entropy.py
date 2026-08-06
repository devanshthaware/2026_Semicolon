from __future__ import annotations

from math import log


def kernel_language_entropy(similarity_matrix: list[list[float]]) -> float | None:
    """Von Neumann entropy of a normalized semantic-kernel Gram matrix.

    NumPy is imported lazily so the base engine remains usable in constrained
    development environments.
    """
    if len(similarity_matrix) < 2:
        return None
    try:
        import numpy as np
    except ImportError:
        return None
    matrix = np.array(similarity_matrix, dtype=float)
    matrix = (matrix + matrix.T) / 2
    matrix = np.clip(matrix, 0, 1)
    trace = float(np.trace(matrix))
    if trace <= 0:
        return None
    eigenvalues = np.linalg.eigvalsh(matrix / trace)
    return float(-sum(value * log(value) for value in eigenvalues if value > 1e-12))


def normalized_kernel_consistency(kle: float | None, sample_count: int) -> float | None:
    if kle is None or sample_count < 2:
        return None
    return max(0.0, min(1.0, 1.0 - kle / log(sample_count)))
