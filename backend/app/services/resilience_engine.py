import re
from datetime import datetime
from typing import Dict, Any, List, Tuple
from difflib import SequenceMatcher

class ResilienceEngine:
    def __init__(self):
        self.reset_stats()

    def reset_stats(self):
        self.dates_normalized = 0
        self.currencies_normalized = 0
        self.missing_values_repaired = 0
        self.duplicate_clients_merged = 0
        self.warnings_remaining = 0
        self.canonical_clients: Dict[str, str] = {}
        self.audit_log: List[str] = []

    def log_action(self, msg: str):
        self.audit_log.append(msg)

    def normalize_date(self, raw_date_str: Any) -> Tuple[str, bool]:
        if not raw_date_str or str(raw_date_str).strip() in ["", "nan", "None", "null"]:
            self.missing_values_repaired += 1
            self.log_action("Repaired missing date string to fallback timestamp.")
            return "2026-01-15", True

        s = str(raw_date_str).strip()
        
        # Already YYYY-MM-DD
        if re.match(r"^\d{4}-\d{2}-\d{2}$", s):
            return s, False

        # ISO string with timestamp
        if "T" in s:
            s_part = s.split("T")[0]
            if re.match(r"^\d{4}-\d{2}-\d{2}$", s_part):
                self.dates_normalized += 1
                return s_part, True

        # DD/MM/YYYY or DD-MM-YYYY
        match_slash = re.match(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$", s)
        if match_slash:
            d, m, y = match_slash.groups()
            self.dates_normalized += 1
            return f"{y}-{int(m):02d}-{int(d):02d}", True

        # Try strptime fallbacks
        for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%d-%m-%Y", "%b %d, %Y", "%B %d, %Y", "%Y.%m.%d"]:
            try:
                dt = datetime.strptime(s, fmt)
                self.dates_normalized += 1
                return dt.strftime("%Y-%m-%d"), True
            except ValueError:
                pass

        self.warnings_remaining += 1
        self.log_action(f"Warning: Could not parse date format '{s}', using default '2026-01-15'.")
        return "2026-01-15", True

    def normalize_currency(self, val: Any) -> float:
        if val is None or str(val).strip() in ["", "nan", "None", "null"]:
            self.missing_values_repaired += 1
            return 0.0

        if isinstance(val, (int, float)):
            return float(val)

        s = str(val).strip().replace(",", "")
        
        # Extract numbers and multipliers
        lakh_match = re.search(r"([\d.]+)\s*(?:lakh|lakhs|l)", s, re.IGNORECASE)
        if lakh_match:
            self.currencies_normalized += 1
            return float(lakh_match.group(1)) * 100000.0

        cr_match = re.search(r"([\d.]+)\s*(?:cr|crore|crores)", s, re.IGNORECASE)
        if cr_match:
            self.currencies_normalized += 1
            return float(cr_match.group(1)) * 10000000.0

        # Strip non-numeric characters except dot
        clean_num = re.sub(r"[^\d.]", "", s)
        if clean_num:
            try:
                parsed = float(clean_num)
                if clean_num != s:
                    self.currencies_normalized += 1
                return parsed
            except ValueError:
                pass

        self.missing_values_repaired += 1
        return 0.0

    def fuzzy_match_client(self, raw_client_name: str) -> str:
        if not raw_client_name or str(raw_client_name).strip() in ["", "nan", "None"]:
            self.missing_values_repaired += 1
            return "Unknown Client"

        name = str(raw_client_name).strip()
        cleaned_base = re.sub(r"(?i)\s*(?:ltd|limited|pvt|private|inc|corp|india)\b", "", name).strip()

        # Check existing canonical clients for match > 0.85
        for existing in self.canonical_clients.keys():
            similarity = SequenceMatcher(None, cleaned_base.lower(), existing.lower()).ratio()
            if similarity > 0.85:
                if name != self.canonical_clients[existing]:
                    self.duplicate_clients_merged += 1
                    self.log_action(f"Merged duplicate client '{name}' into canonical entity '{self.canonical_clients[existing]}'.")
                return self.canonical_clients[existing]

        # Register new canonical client
        self.canonical_clients[cleaned_base] = name
        return name

    def clean_deals_dataset(self, raw_deals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        cleaned = []
        for d in raw_deals:
            deal_name = str(d.get("Deal Name") or d.get("name") or "Unnamed Deal").strip()
            raw_client = d.get("Client Code") or d.get("Customer Name Code") or d.get("client") or "Unknown"
            client_name = self.fuzzy_match_client(raw_client)
            
            raw_val = d.get("Masked Deal value") or d.get("value") or 0
            val_inr = self.normalize_currency(raw_val)
            
            raw_close = d.get("Close Date (A)") or d.get("Tentative Close Date") or d.get("close_date")
            close_date, _ = self.normalize_date(raw_close)
            
            stage = str(d.get("Deal Stage") or d.get("stage") or "Qualification").strip()
            status = str(d.get("Deal Status") or d.get("status") or "Open").strip()
            sector = str(d.get("Sector/service") or d.get("sector") or "Mining").strip()
            
            if sector in ["", "nan", "None"]:
                self.missing_values_repaired += 1
                sector = "Mining"

            cleaned.append({
                "deal_id": d.get("deal_id") or f"D-{len(cleaned)+101}",
                "monday_item_id": str(d.get("id") or d.get("monday_item_id") or f"6866571{len(cleaned)+100}"),
                "deal_name": deal_name,
                "client_name": client_name,
                "val_inr": val_inr,
                "stage": stage,
                "status": status,
                "sector": sector,
                "close_date": close_date,
                "created_date": d.get("Created Date") or "2025-10-01"
            })
        return cleaned

    def clean_work_orders_dataset(self, raw_wos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        cleaned = []
        for wo in raw_wos:
            wo_id = str(wo.get("Serial #") or wo.get("wo_id") or f"WO-{len(cleaned)+201}").strip()
            raw_client = wo.get("Customer Name Code") or wo.get("client") or "Unknown"
            client_name = self.fuzzy_match_client(raw_client)
            
            deal_name_masked = str(wo.get("Deal name masked") or wo.get("deal_name") or "Linked Project").strip()
            execution_status = str(wo.get("Execution Status") or wo.get("status") or "Completed").strip()
            wo_status_billed = str(wo.get("WO Status (billed)") or wo.get("billed_status") or "Not Billed").strip()
            sector = str(wo.get("Sector") or wo.get("sector") or "Mining").strip()
            
            raw_amount = wo.get("Amount in Rupees (Excl of GST) (Masked)") or wo.get("amount") or 0
            amount_inr = self.normalize_currency(raw_amount)
            
            raw_billed = wo.get("Billed Value in Rupees (Excl of GST.) (Masked)") or wo.get("billed_val") or 0
            billed_inr = self.normalize_currency(raw_billed)
            
            raw_start = wo.get("Probable Start Date") or wo.get("start_date")
            start_date, _ = self.normalize_date(raw_start)
            
            raw_end = wo.get("Probable End Date") or wo.get("end_date")
            end_date, _ = self.normalize_date(raw_end)

            cleaned.append({
                "wo_id": wo_id,
                "monday_item_id": str(wo.get("id") or wo.get("monday_item_id") or f"6866578{len(cleaned)+200}"),
                "deal_name_masked": deal_name_masked,
                "client_name": client_name,
                "sector": sector,
                "execution_status": execution_status,
                "wo_status_billed": wo_status_billed,
                "amount_inr": amount_inr,
                "billed_inr": billed_inr,
                "unbilled_inr": max(0.0, amount_inr - billed_inr),
                "start_date": start_date,
                "end_date": end_date
            })
        return cleaned

    def get_health_metrics(self) -> Dict[str, Any]:
        total_repairs = (
            self.dates_normalized + 
            self.currencies_normalized + 
            self.missing_values_repaired + 
            self.duplicate_clients_merged
        )
        
        # Calculate health score %: 100% minus minor deduction per remaining warning
        health_score = max(80, min(100, 100 - (self.warnings_remaining * 2)))

        return {
            "health_score_pct": health_score,
            "status_label": "Healthy" if health_score >= 90 else "Warning",
            "dates_normalized": self.dates_normalized,
            "currencies_normalized": self.currencies_normalized,
            "missing_values_repaired": self.missing_values_repaired,
            "duplicate_clients_merged": self.duplicate_clients_merged,
            "warnings_remaining": self.warnings_remaining,
            "total_repairs_count": total_repairs,
            "audit_logs": self.audit_log[-10:]  # last 10 log messages
        }

resilience_engine = ResilienceEngine()
