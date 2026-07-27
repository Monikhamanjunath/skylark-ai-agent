from typing import Dict, Any, List, Optional

class ClarificationEngine:
    def check_ambiguity(self, query: str) -> Optional[Dict[str, Any]]:
        q = query.strip().lower()

        # Vague revenue query
        if q in ["show revenue", "revenue", "what is revenue", "tell me revenue"]:
            return {
                "is_ambiguous": True,
                "question": "Which revenue metric would you like to view?",
                "options": [
                    {"label": "Recognized Revenue", "query": "Show recognized revenue from completed work orders"},
                    {"label": "Pipeline Value (TCV)", "query": "Show total pipeline TCV value"},
                    {"label": "Unbilled Revenue Leakage", "query": "Show unbilled revenue leakage"},
                    {"label": "Revenue by Sector", "query": "Show revenue breakdown by sector"}
                ]
            }

        # Vague delayed projects query
        if q in ["show delayed projects", "delayed projects", "delays", "what is delayed"]:
            return {
                "is_ambiguous": True,
                "question": "Which delayed project category would you like to inspect?",
                "options": [
                    {"label": "All Delayed Work Orders", "query": "Show all delayed work orders"},
                    {"label": "Delayed Mining Projects", "query": "Show delayed mining sector projects"},
                    {"label": "High-Value Delays (> ₹25L)", "query": "Show delayed work orders above 25 lakhs"},
                    {"label": "Unlinked Won Deals", "query": "Show won deals without work orders"}
                ]
            }

        # Vague sector query
        if q in ["show sectors", "sectors", "sector performance"]:
            return {
                "is_ambiguous": True,
                "question": "Which sector dimension would you like to explore?",
                "options": [
                    {"label": "Sector Revenue Breakdown", "query": "Show revenue breakdown by sector"},
                    {"label": "Mining Sector Deep-Dive", "query": "How is Mining performing this quarter?"},
                    {"label": "Sector Operational Delays", "query": "Which sector has maximum delays?"}
                ]
            }

        return None

clarification_engine = ClarificationEngine()
