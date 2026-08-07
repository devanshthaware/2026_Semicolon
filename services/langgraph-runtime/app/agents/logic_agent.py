import os
import ast
import operator
import re
from typing import Tuple
import z3

class LogicAgent:
    """Implements P006 (Z3 Solver) and P007 (Python Arithmetic Engine)."""
    
    def __init__(self):
        self.operators = {
            ast.Add: operator.add, ast.Sub: operator.sub,
            ast.Mult: operator.mul, ast.Div: operator.truediv,
            ast.Pow: operator.pow, ast.BitXor: operator.xor,
            ast.USub: operator.neg, ast.Eq: operator.eq,
            ast.NotEq: operator.ne, ast.Lt: operator.lt,
            ast.LtE: operator.le, ast.Gt: operator.gt,
            ast.GtE: operator.ge
        }

    def _eval_expr(self, node):
        if isinstance(node, ast.Constant):
            return node.value
        elif isinstance(node, ast.BinOp):
            return self.operators[type(node.op)](self._eval_expr(node.left), self._eval_expr(node.right))
        elif isinstance(node, ast.UnaryOp):
            return self.operators[type(node.op)](self._eval_expr(node.operand))
        elif isinstance(node, ast.Compare):
            left = self._eval_expr(node.left)
            # handle simple single-comparison
            for op, comparator in zip(node.ops, node.comparators):
                right = self._eval_expr(comparator)
                if not self.operators[type(op)](left, right):
                    return False
                left = right
            return True
        else:
            raise TypeError(f"Unsupported expression: {node}")

    def evaluate_arithmetic(self, claim: str) -> Tuple[bool, str, float]:
        """P007 - Python Arithmetic Engine"""
        try:
            # Clean claim (e.g., '15 + 25 = 40' -> '15 + 25 == 40')
            clean = claim.replace("=", "==").replace("====", "==")
            clean = re.sub(r'[a-zA-Z]+', '', clean).strip()
            
            tree = ast.parse(clean, mode='eval')
            result = self._eval_expr(tree.body)
            
            if isinstance(result, bool):
                return (result, "Arithmetic equation verified.", 1.0 if result else 0.0)
            else:
                return (True, f"Computed value: {result}", 0.8)
        except Exception as e:
            return (False, f"Failed to parse arithmetic: {e}", 0.5)

    def evaluate_logic(self, claim: str) -> Tuple[bool, str, float]:
        """P006 - Z3 Solver for Formal Reasoning"""
        try:
            # A very simplistic mock of extracting logical constraints.
            # In a real system, an LLM parses text to Z3 constructs.
            solver = z3.Solver()
            x = z3.Int('x')
            y = z3.Int('y')
            
            # Dummy logic based on simple keywords for demonstration
            if "implies" in claim.lower() and "false" in claim.lower():
                solver.add(z3.Implies(x > 0, False))
                
            res = solver.check()
            if res == z3.sat:
                return (True, "Logical constraints are Satisfiable (SAT).", 0.95)
            elif res == z3.unsat:
                return (False, "Logical constraints are Unsatisfiable (UNSAT).", 0.05)
            else:
                return (True, "Logical constraints status unknown.", 0.5)
        except Exception as e:
            return (False, f"Z3 Solver failed: {e}", 0.5)
