export interface HealthMetrics {
  health_score_pct: number;
  status_label: string;
  dates_normalized: number;
  currencies_normalized: number;
  missing_values_repaired: number;
  duplicate_clients_merged: number;
  warnings_remaining: number;
  total_repairs_count: number;
  audit_logs: string[];
}

export interface ExplainableHealth {
  overall_score_pct: number;
  status_label: string;
  contribution_breakdown: Array<{
    dimension: string;
    weight_pct: number;
    earned_score: number;
    status: string;
  }>;
}

export interface MorningBrief {
  greeting: string;
  date_str: string;
  time_str: string;
  generated_timestamp?: string;
  summary: string;
  yesterday_highlights: string[];
  today_focus: string[];
  revenue_leakage_val: string;
  confidence_pct: number;
  business_health: string;
  health_overview?: { score_pct: number; status_label: string; confidence_pct: number };
  financial_snapshot?: { pipeline_tcv: string; recognized_revenue: string; unbilled_leakage: string; realization_pct: string };
  operational_snapshot?: { total_wos: number; delayed_wos: number; avg_tat_days: string; on_time_rate: string };
  pipeline_highlights?: { total_deals: number; win_rate: string; avg_sales_cycle: string; top_sector: string };
  critical_risks?: string[];
  major_wins?: string[];
  customers_requiring_attention?: string[];
  upcoming_deadlines?: Array<{ deadline: string; task: string }>;
  today_priorities?: string[];
  recommended_ceo_actions?: string[];
  executive_outlook?: string;
  confidence_score_pct?: number;
}

export interface KPICard {
  id: string;
  title: string;
  metric: string;
  trend: string;
  trend_type: "positive" | "negative" | "neutral";
  delta?: string;
  benchmark?: string;
  tooltip?: string;
  formula?: string;
  data_source?: string;
  last_updated?: string;
  confidence_pct?: number;
  why_title: string;
  why_description: string;
  root_cause: string;
  recommendation: string;
}

export interface PriorityItem {
  id: string;
  rank: number;
  title: string;
  client_name: string;
  issue_type: string;
  financial_impact_inr: number;
  impact_level: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  recommendation: string;
  monday_item_id?: string;
  financial_recovery?: string;
  expected_business_impact?: string;
  estimated_timeline_days?: number;
  responsible_team?: string;
  risk_reduction_level?: string;
}

export interface NotificationItem {
  id: string;
  category: "CRITICAL" | "WARNING" | "INFORMATION" | "RESOLVED";
  title: string;
  message: string;
  impact_val: string;
  affected_area: string;
  timestamp: string;
  monday_link: string;
}

export interface ClientRanking {
  client_name: string;
  tcv_inr: number;
  billed_inr: number;
  formatted_tcv: string;
  formatted_billed: string;
}

export interface DecisionCard {
  title: string;
  value_at_risk: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  business_impact: string;
  recommendation: string;
  confidence_pct: number;
  financial_recovery?: string;
  estimated_timeline_days?: number;
  responsible_team?: string;
  risk_reduction_level?: string;
}

export interface ClarificationOption {
  label: string;
  query: string;
}

export interface ClarificationResponse {
  is_ambiguous: boolean;
  question: string;
  options: ClarificationOption[];
}

export interface AgentResponse {
  intent: string;
  reasoning_pipeline?: Array<{ stage_id: number; name: string; status: string; detail: string }>;
  tools_executed: string[];
  executive_summary: string;
  decision_framework?: {
    situation: string;
    evidence: string;
    root_cause: string;
    business_impact: string;
    financial_impact: string;
    risk_level: string;
    recommended_action: string;
    expected_outcome: string;
    confidence_score_pct: number;
  };
  entity_deep_dive?: {
    entity_name: string;
    query: string;
    matched_deals_count: number;
    matched_wos_count: number;
    total_tcv_inr: number;
    total_unbilled_inr: number;
    deals_summary: string[];
    wos_summary: string[];
  };
  key_metrics: Array<{ label: string; value: string }>;
  evidence: {
    data_sources: string[];
    monday_sync_status: string;
    last_synced_at: string;
    data_health_score_pct: number;
    matched_records: string;
    audit_highlights: string[];
  };
  business_impact: string;
  recommended_actions: string[];
  decision_cards: DecisionCard[];
  confidence: {
    score_pct: number;
    label: string;
    reasons: string[];
  };
  suggested_follow_up_questions: string[];
}

export interface ControlRoomData {
  live_status: {
    is_live: boolean;
    label: string;
    last_synced_at: string;
  };
  health_score: HealthMetrics;
  explainable_health?: ExplainableHealth;
  morning_brief: MorningBrief;
  kpi_cards: KPICard[];
  priority_feed: PriorityItem[];
  notifications?: NotificationItem[];
  client_rankings?: ClientRanking[];
  decision_history?: {
    compared_to: string;
    metrics_delta: Array<{ metric: string; yesterday: string; today: string; delta: string; status: string; impact: string }>;
  };
  insights_timeline?: Array<{ time: string; event: string; category: string; severity: string }>;
  charts: {
    revenue_by_sector: Array<{ sector: string; value_lakhs: number }>;
    pipeline_stages: Array<{ stage: string; value_lakhs: number }>;
    work_order_status: Array<{ status: string; count: number }>;
    monthly_trends: Array<{ period: string; revenue_lakhs: number; pipeline_lakhs: number; leakage_lakhs: number; health_score: number }>;
    quarterly_trends: Array<{ quarter: string; revenue_lakhs: number; win_rate: number; delayed_wos: number }>;
    revenue_waterfall: Array<{ stage: string; value_lakhs: number }>;
  };
}
