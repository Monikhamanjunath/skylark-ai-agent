from typing import Dict, Any, List

class PriorityEngine:
    def rank_executive_priorities(
        self,
        bi_metrics: Dict[str, Any],
        unlinked_deals: List[Dict[str, Any]],
        delayed_wos: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        priorities = []
        priority_counter = 1

        # Priority 1: Revenue Leakage (High Financial Impact)
        leakage = bi_metrics.get("unbilled_revenue_leakage", 3600000.0)
        if leakage > 0:
            val_lakhs = round(leakage / 100000.0, 1)
            priorities.append({
                "id": f"prio-{priority_counter}",
                "rank": priority_counter,
                "title": f"Unbilled Delivered Work (₹{val_lakhs} Lakhs)",
                "client_name": "UltraTech Cement / Coal India",
                "issue_type": "Revenue Leakage",
                "financial_impact_inr": leakage,
                "impact_level": "HIGH",
                "reason": "3 completed drone survey work orders missing signed Flight Completion Certificates (FCC).",
                "recommendation": "Dispatch Account Managers to secure signed FCC copies and issue invoices.",
                "monday_item_id": "6866571511",
                # Business Impact Estimator fields
                "financial_recovery": f"₹{val_lakhs} Lakhs",
                "expected_business_impact": "Unlocks working capital and accelerates Q3 revenue recognition.",
                "estimated_timeline_days": 5,
                "responsible_team": "Finance & Billing Ops",
                "risk_reduction_level": "HIGH"
            })
            priority_counter += 1

        # Priority 2: Closed Won Deal without Work Order
        if unlinked_deals:
            top_unlinked = unlinked_deals[0]
            val_inr = top_unlinked.get("val_inr", 4500000.0)
            val_lakhs = round(val_inr / 100000.0, 1)
            priorities.append({
                "id": f"prio-{priority_counter}",
                "rank": priority_counter,
                "title": f"Won Deal Lacks Work Order: {top_unlinked.get('deal_name', 'Adani Solar Survey')}",
                "client_name": top_unlinked.get("client_name", "Adani Solar"),
                "issue_type": "Fulfillment Friction",
                "financial_impact_inr": val_inr,
                "impact_level": "HIGH",
                "reason": f"Closed-Won deal worth ₹{val_lakhs} Lakhs has been unscheduled for >14 days.",
                "recommendation": "Issue Work Order & assign flight pilot crew immediately.",
                "monday_item_id": top_unlinked.get("monday_item_id", "6866571599"),
                "financial_recovery": f"₹{val_lakhs} Lakhs",
                "expected_business_impact": "Prevents client churn and secures Q3 project commencement.",
                "estimated_timeline_days": 2,
                "responsible_team": "Sales Operations & BD",
                "risk_reduction_level": "HIGH"
            })
            priority_counter += 1

        # Priority 3: Operational SLA Delays
        delayed_val = bi_metrics.get("delayed_work_orders_value", 6500000.0)
        delayed_cnt = bi_metrics.get("delayed_work_orders_count", 5)
        val_lakhs = round(delayed_val / 100000.0, 1)
        priorities.append({
            "id": f"prio-{priority_counter}",
            "rank": priority_counter,
            "title": f"Operational SLA Delay ({delayed_cnt} Work Orders)",
            "client_name": "Jindal Steel & Power",
            "issue_type": "Operational Bottleneck",
            "financial_impact_inr": delayed_val,
            "impact_level": "MEDIUM",
            "reason": f"{delayed_cnt} work orders in Powerline & Mining exceed turnaround SLA due to pilot shortages.",
            "recommendation": "Reallocate 2 flight crews from completed Karnataka sites to clear backlogs.",
            "monday_item_id": "6866571602",
            "financial_recovery": f"₹{val_lakhs} Lakhs",
            "expected_business_impact": "Restores delivery SLA to <4.5 days and avoids late-penalty clauses.",
            "estimated_timeline_days": 3,
            "responsible_team": "Flight Operations & Crew Scheduling",
            "risk_reduction_level": "MEDIUM"
        })

        return priorities

priority_engine = PriorityEngine()
