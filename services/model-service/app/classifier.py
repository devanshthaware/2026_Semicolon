import pickle
import os
import joblib

class ClaimClassifier:
    def __init__(self):
        self.path = "/artifacts/claim_type_classifier.pkl"
        self.model = None
        if os.path.exists(self.path):
            self.model = joblib.load(self.path)

    def classify(self, claim: str) -> str:
        if self.model:
            # Assumes it's a scikit-learn pipeline taking a list of strings
            try:
                prediction = self.model.predict([claim])[0]
                return prediction
            except Exception:
                pass
        
        # Fallback heuristic
        claim_lower = claim.lower()
        if any(op in claim for op in ["+", "-", "*", "/", "=", "<", ">", "equals", "divided by", "times"]):
            return "numeric"
        if "implies" in claim_lower or "therefore" in claim_lower or "all " in claim_lower or "if " in claim_lower:
            return "logical"
        return "factual"
