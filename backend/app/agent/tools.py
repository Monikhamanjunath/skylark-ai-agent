from typing import Dict, Any, List
from app.services.bi_engine import bi_engine
from app.services.resilience_engine import resilience_engine
from app.services.priority_engine import priority_engine

class RevenueIntelligenceTool:
    name = "Revenue Intelligence Tool"
    
    def run(self, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        metrics = bi_engine.compute_all_metrics(deals, work_orders)
        return {
            "tool_name": self.name,
            "pipeline_tcv_inr": metrics["total_pipeline_tcv"],
            "recognized_revenue_inr": metrics["recognized_revenue"],
            "unbilled_revenue_leakage_inr": metrics["unbilled_revenue_leakage"],
            "formatted_pipeline": f"₹{metrics['total_pipeline_tcv']/10000000:.2f} Cr",
            "formatted_recognized": f"₹{metrics['recognized_revenue']/10000000:.2f} Cr",
            "formatted_leakage": f"₹{metrics['unbilled_revenue_leakage']/100000:.1f} Lakhs",
            "revenue_realization_pct": metrics["revenue_realization_pct"]
        }

class PipelineIntelligenceTool:
    name = "Pipeline Intelligence Tool"
    
    def run(self, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        metrics = bi_engine.compute_all_metrics(deals, work_orders)
        return {
            "tool_name": self.name,
            "total_deals_count": metrics["total_deals_count"],
            "closed_won_tcv": metrics["closed_won_tcv"],
            "win_rate_pct": metrics["win_rate_pct"],
            "avg_sales_cycle_days": metrics["avg_sales_cycle_days"],
            "stage_breakdown": metrics["stage_breakdown"],
            "sector_breakdown": metrics["sector_breakdown"]
        }

class OperationsIntelligenceTool:
    name = "Operations Intelligence Tool"
    
    def run(self, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        metrics = bi_engine.compute_all_metrics(deals, work_orders)
        return {
            "tool_name": self.name,
            "total_wos_count": metrics["total_wos_count"],
            "delayed_wos_count": metrics["delayed_work_orders_count"],
            "delayed_wos_value_inr": metrics["delayed_work_orders_value"],
            "avg_work_order_tat_days": metrics["avg_work_order_tat_days"],
            "formatted_delayed_val": f"₹{metrics['delayed_work_orders_value']/100000:.1f} Lakhs"
        }

class CrossBoardReconciliationTool:
    name = "Cross Board Reconciliation Tool"
    
    def run(self, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        metrics = bi_engine.compute_all_metrics(deals, work_orders)
        return {
            "tool_name": self.name,
            "unlinked_won_deals_count": metrics["unlinked_won_deals_count"],
            "unlinked_won_deals": metrics["unlinked_won_deals"],
            "unbilled_leakage_inr": metrics["unbilled_revenue_leakage"]
        }

class SectorAnalyticsTool:
    name = "Sector Analytics Tool"
    
    def run(self, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        metrics = bi_engine.compute_all_metrics(deals, work_orders)
        return {
            "tool_name": self.name,
            "sector_breakdown": metrics["sector_breakdown"],
            "top_performing_sector": metrics["top_performing_sector"],
            "lowest_performing_sector": metrics["lowest_performing_sector"]
        }

class PriorityEngineTool:
    name = "Executive Priority Engine Tool"
    
    def run(self, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        metrics = bi_engine.compute_all_metrics(deals, work_orders)
        priorities = priority_engine.rank_executive_priorities(metrics, metrics["unlinked_won_deals"], [])
        return {
            "tool_name": self.name,
            "priorities": priorities
        }

class DataHealthTool:
    name = "Data Health Tool"
    
    def run(self, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        return resilience_engine.get_health_metrics()

class ExecutiveIntelligenceSearchTool:
    name = "Executive Intelligence Search Tool"

    def run(self, query: str, deals: List[Dict], work_orders: List[Dict]) -> Dict[str, Any]:
        q = query.lower()
        matched_deals = [
            d for d in deals
            if any(k in str(d.get(f, "")).lower() for k in q.split() for f in ["client_name", "deal_name", "sector", "stage", "monday_item_id"])
        ]
        matched_wos = [
            wo for wo in work_orders
            if any(k in str(wo.get(f, "")).lower() for k in q.split() for f in ["client_name", "deal_name_masked", "sector", "execution_status", "wo_id", "monday_item_id"])
        ]
        return {
            "tool_name": self.name,
            "query_string": query,
            "matched_deals_count": len(matched_deals),
            "matched_wos_count": len(matched_wos),
            "matched_deals": matched_deals[:5],
            "matched_wos": matched_wos[:5]
        }
