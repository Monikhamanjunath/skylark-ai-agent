from typing import Dict, Any, List
from app.agent.tools import (
    RevenueIntelligenceTool,
    PipelineIntelligenceTool,
    OperationsIntelligenceTool,
    CrossBoardReconciliationTool,
    SectorAnalyticsTool,
    PriorityEngineTool,
    DataHealthTool,
    ExecutiveIntelligenceSearchTool
)

class ToolRouter:
    def __init__(self):
        self.revenue_tool = RevenueIntelligenceTool()
        self.pipeline_tool = PipelineIntelligenceTool()
        self.ops_tool = OperationsIntelligenceTool()
        self.recon_tool = CrossBoardReconciliationTool()
        self.sector_tool = SectorAnalyticsTool()
        self.priority_tool = PriorityEngineTool()
        self.health_tool = DataHealthTool()
        self.search_tool = ExecutiveIntelligenceSearchTool()

    def route_and_execute(
        self,
        query: str,
        deals: List[Dict[str, Any]],
        work_orders: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        q = query.lower().strip()
        executed_tools = []
        tool_results = {}

        # 1. Executive Intelligence Search (Client, Deal, Project, Pilot, Invoice, Monday Item ID)
        known_entities = ["ultratech", "adani", "coal india", "jindal", "tata", "mining", "powerline", "renewables", "68665"]
        if any(ent in q for ent in known_entities) or any(w in q for w in ["what is happening with", "search", "tell me about", "client", "project", "pilot", "invoice"]):
            search_res = self.search_tool.run(query, deals, work_orders)
            tool_results["search"] = search_res
            executed_tools.append(self.search_tool.name)

        # 2. Intent Detection Rules
        if any(w in q for w in ["sector", "mining", "powerline", "renewables", "dsp", "railways"]):
            tool_results["sector"] = self.sector_tool.run(deals, work_orders)
            if self.sector_tool.name not in executed_tools:
                executed_tools.append(self.sector_tool.name)

        if any(w in q for w in ["revenue", "leakage", "billing", "unbilled", "recognized", "cashflow"]):
            tool_results["revenue"] = self.revenue_tool.run(deals, work_orders)
            if self.revenue_tool.name not in executed_tools:
                executed_tools.append(self.revenue_tool.name)

        if any(w in q for w in ["pipeline", "deal", "stage", "funnel", "tcv", "win rate"]):
            tool_results["pipeline"] = self.pipeline_tool.run(deals, work_orders)
            if self.pipeline_tool.name not in executed_tools:
                executed_tools.append(self.pipeline_tool.name)

        if any(w in q for w in ["ops", "operation", "work order", "delayed", "tat", "delay", "blocked", "flight"]):
            tool_results["operations"] = self.ops_tool.run(deals, work_orders)
            if self.ops_tool.name not in executed_tools:
                executed_tools.append(self.ops_tool.name)

        if any(w in q for w in ["cross board", "reconciliation", "unlinked", "no work order", "mismatch", "risk"]):
            tool_results["reconciliation"] = self.recon_tool.run(deals, work_orders)
            if self.recon_tool.name not in executed_tools:
                executed_tools.append(self.recon_tool.name)

        if any(w in q for w in ["priority", "attention", "urgent", "action", "today"]):
            tool_results["priority"] = self.priority_tool.run(deals, work_orders)
            if self.priority_tool.name not in executed_tools:
                executed_tools.append(self.priority_tool.name)

        if any(w in q for w in ["health", "clean", "resilience", "duplicate", "data quality", "missing"]):
            tool_results["health"] = self.health_tool.run(deals, work_orders)
            if self.health_tool.name not in executed_tools:
                executed_tools.append(self.health_tool.name)

        # Default fallback: Revenue, Ops & Priorities
        if not executed_tools:
            tool_results["revenue"] = self.revenue_tool.run(deals, work_orders)
            tool_results["operations"] = self.ops_tool.run(deals, work_orders)
            tool_results["priority"] = self.priority_tool.run(deals, work_orders)
            executed_tools = [self.revenue_tool.name, self.ops_tool.name, self.priority_tool.name]

        # Always include Priority tool results for Decision Card generation
        if "priority" not in tool_results:
            tool_results["priority"] = self.priority_tool.run(deals, work_orders)

        return {
            "executed_tools": executed_tools,
            "results": tool_results
        }

tool_router = ToolRouter()
