import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Info,
  Download,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  FileText,
  X,
  Activity,
  Zap,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import type { ControlRoomData } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

interface ExecutiveControlRoomProps {
  data: ControlRoomData;
  onNavigateTab: (tab: string) => void;
}

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};
const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const SECTOR_COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-lg px-3 py-2 text-xs shadow-xl font-mono">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color }} className="font-semibold">
          {p.name}: {p.value} {p.unit || ''}
        </p>
      ))}
    </div>
  );
};

const TrendBadge: React.FC<{ trend: string; type: 'positive' | 'negative' | 'neutral' }> = ({ trend, type }) => {
  const cfg = {
    positive: { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-800/40', Icon: TrendingUp },
    negative: { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-800/40', Icon: TrendingDown },
    neutral:  { bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700', Icon: Minus },
  }[type];
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {trend}
    </span>
  );
};

const MiniSparkline: React.FC<{ color?: string }> = ({ color = '#06B6D4' }) => (
  <svg className="w-14 h-5 shrink-0 opacity-80" viewBox="0 0 60 20" fill="none">
    <path
      d="M2 14 L12 10 L22 13 L32 7 L42 9 L58 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="58" cy="3" r="2.5" fill={color} />
  </svg>
);

export const ExecutiveControlRoom: React.FC<ExecutiveControlRoomProps> = ({
  data,
  onNavigateTab,
}) => {
  const [expandedKpiId, setExpandedKpiId] = useState<string | null>(null);
  const [selectedInfoKpi, setSelectedInfoKpi] = useState<any | null>(null);
  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);
  const [notifCategory, setNotifCategory] = useState<string>('ALL');
  const [clientLimit, setClientLimit] = useState<number>(5);
  const [clientSearch, setClientSearch] = useState('');

  const filteredNotifs = (data.notifications || []).filter(n =>
    notifCategory === 'ALL' ? true : n.category === notifCategory
  );

  const filteredClients = (data.client_rankings || []).filter(c =>
    c.client_name.toLowerCase().includes(clientSearch.toLowerCase())
  ).slice(0, clientLimit);

  const exportChartCSV = (chartName: string, chartData: any[]) => {
    const headers = Object.keys(chartData[0] || {}).join(',');
    const rows = chartData.map(r => Object.values(r).map(v => `"${v}"`).join(','));
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartName}_data.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-16">

      {/* ── 1. Founder Morning Brief 2.0 Centerpiece ──────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl p-7 glass-panel"
        style={{
          background: '#0B0B0D',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >

        <div className="relative space-y-6">

          {/* Top Title Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Founder Morning Brief 2.0 · Executive Briefing Center
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 rounded-full">
                  {data.morning_brief.date_str}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {data.morning_brief.greeting}.{' '}
                <span className="text-gradient-cyan">Here is your daily intelligence briefing.</span>
              </h1>
            </div>

            {/* Health Gauge & Explainable Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHealthBreakdown(p => !p)}
                className="flex items-center gap-3 p-2.5 px-3.5 rounded-xl border border-white/[0.04] bg-[#050506] hover:border-white/[0.15] transition-all text-left shadow-lg group"
              >
                {/* SVG Gauge Ring - Clean single-stroke #10B981 track */}
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-neutral-800"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      style={{ stroke: '#10B981' }}
                      className="transition-all duration-1000"
                      strokeDasharray={`${data.morning_brief.health_overview?.score_pct || 94}, 100`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <Shield className="w-3.5 h-3.5 text-emerald-400 absolute" />
                </div>
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-mono text-neutral-400 flex items-center gap-1">
                    Health Score
                    <Info className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-base font-bold font-mono text-white flex items-center gap-1">
                    <AnimatedNumber value={data.morning_brief.health_overview?.score_pct || 94} suffix="%" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('briefs')}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Export Brief
              </button>
            </div>
          </div>

          {/* 4 Performance Snapshots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#050506] border border-white/[0.04] space-y-1">
              <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-400 block">Financial Snapshot</span>
              <div className="text-lg font-bold font-mono text-white">{data.morning_brief.financial_snapshot?.pipeline_tcv || '₹4.8 Cr'}</div>
              <p className="text-[11px] text-neutral-400">Recognized: <span className="text-emerald-400 font-mono">{data.morning_brief.financial_snapshot?.recognized_revenue}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#050506] border border-white/[0.04] space-y-1">
              <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-400 block">Operational Execution</span>
              <div className="text-lg font-bold font-mono text-white">{data.morning_brief.operational_snapshot?.avg_tat_days || '4.5 days'} TAT</div>
              <p className="text-[11px] text-neutral-400">On-Time Rate: <span className="text-cyan-400 font-mono">{data.morning_brief.operational_snapshot?.on_time_rate || '88%'}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#050506] border border-white/[0.04] space-y-1">
              <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-400 block">Pipeline Dynamics</span>
              <div className="text-lg font-bold font-mono text-white">Win Rate {data.morning_brief.pipeline_highlights?.win_rate || '37.5%'}</div>
              <p className="text-[11px] text-neutral-400">Avg Cycle: <span className="text-amber-400 font-mono">{data.morning_brief.pipeline_highlights?.avg_sales_cycle || '18.5 days'}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#050506] border border-rose-950/40 space-y-1">
              <span className="text-[10px] tracking-widest uppercase font-mono text-rose-400 block">Revenue Leakage</span>
              <div className="text-lg font-bold font-mono text-rose-300">{data.morning_brief.financial_snapshot?.unbilled_leakage || '₹36.0 Lakhs'}</div>
              <p className="text-[11px] text-neutral-400">3 unbilled delivered work orders</p>
            </div>
          </div>

          {/* Attention & Action Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customers Requiring Attention */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                Attention Required Today
              </span>
              <div className="space-y-1.5">
                {(data.morning_brief.customers_requiring_attention || []).map((c, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended CEO Actions */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Recommended CEO Actions
              </span>
              <div className="space-y-1.5">
                {(data.morning_brief.recommended_ceo_actions || []).map((act, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Upcoming Deadlines
              </span>
              <div className="space-y-1.5">
                {(data.morning_brief.upcoming_deadlines || []).map((d, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start justify-between gap-1">
                    <span className="truncate">{d.task}</span>
                    <span className="text-[10px] font-mono text-cyan-400 shrink-0">{d.deadline}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Outlook Footer */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/30 text-xs text-slate-300 flex items-center justify-between gap-4 flex-wrap">
            <span className="font-medium">
              ⚡ <strong className="text-cyan-300">Executive Outlook:</strong> {data.morning_brief.executive_outlook}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Confidence Score: {data.morning_brief.confidence_score_pct || 96}% · Generated {data.morning_brief.generated_timestamp || '08:00 AM IST'}
            </span>
          </div>

        </div>
      </motion.div>

      {/* Explainable Health Score Drawer */}
      <AnimatePresence>
        {showHealthBreakdown && data.explainable_health && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl glass-panel border border-emerald-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Explainable Executive Health Score Contribution Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total Weighted Score: <strong className="text-emerald-400 font-mono">{data.explainable_health.overall_score_pct}%</strong> ({data.explainable_health.status_label})
                  </p>
                </div>
                <button onClick={() => setShowHealthBreakdown(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {data.explainable_health.contribution_breakdown.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">Weight: {item.weight_pct}%</span>
                      <span className="font-bold text-emerald-400 font-mono">+{item.earned_score} pts</span>
                    </div>
                    <h4 className="text-xs font-semibold text-white leading-tight">{item.dimension}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{item.status}</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${(item.earned_score / item.weight_pct) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. 8 KPI Cards with Info Modal (i) ──────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
            Executive KPI Benchmarks (8 Core Metrics)
          </h2>
          <span className="text-[11px] text-slate-500">Click ⓘ for formula modal · Click "Why?" for root cause</span>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {data.kpi_cards.map((card) => {
            const isExpanded = expandedKpiId === card.id;
            return (
              <motion.div
                key={card.id}
                variants={fadeUp}
                className="p-5 rounded-xl glass-panel glass-panel-hover flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium">{card.title}</span>
                      <button
                        onClick={() => setSelectedInfoKpi(card)}
                        className="p-0.5 text-slate-500 hover:text-cyan-400 transition-colors"
                        title="Explain formula & calculation logic"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <TrendBadge trend={card.trend} type={card.trend_type} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold font-mono text-white tracking-tight">
                      {card.metric}
                    </div>
                    <MiniSparkline color={card.trend_type === 'positive' ? '#10B981' : card.trend_type === 'negative' ? '#EF4444' : '#06B6D4'} />
                  </div>

                  {card.benchmark && (
                    <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                      <span>{card.benchmark}</span>
                      {card.delta && <span className="text-emerald-400">{card.delta}</span>}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <button
                    onClick={() => setExpandedKpiId(isExpanded ? null : card.id)}
                    className="flex items-center justify-between w-full text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Why?
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-cyan-900/30 text-xs space-y-2">
                          <p className="font-semibold text-slate-200">{card.why_title}</p>
                          <p className="text-slate-400 leading-relaxed">{card.why_description}</p>
                          <div className="text-[11px] font-mono text-amber-300">
                            🔍 Root Cause: {card.root_cause}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400">
                            ⚡ Action: {card.recommendation}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* KPI Formula Modal (i) */}
      <AnimatePresence>
        {selectedInfoKpi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setSelectedInfoKpi(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl glass-panel border border-cyan-900/50 p-6 space-y-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-semibold text-white">{selectedInfoKpi.title} — Calculation Logic</h3>
                </div>
                <button onClick={() => setSelectedInfoKpi(null)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Definition</span>
                  <p className="text-slate-200">{selectedInfoKpi.tooltip || 'Executive metric definition.'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono">
                  <span className="text-[10px] uppercase text-cyan-400">Mathematical Formula</span>
                  <p className="text-cyan-300 font-bold text-sm">{selectedInfoKpi.formula || 'SUM(val_inr)'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Data Source</span>
                    <span className="text-slate-200">{selectedInfoKpi.data_source || 'GraphQL Ingestion'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Last Updated</span>
                    <span className="text-slate-200">{selectedInfoKpi.last_updated || 'Just now'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 3. Executive Notification Center & Priority Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Executive Notification Center */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-xl glass-panel space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Executive Notification Center
            </h3>
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
              {['ALL', 'CRITICAL', 'WARNING', 'INFORMATION', 'RESOLVED'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setNotifCategory(cat)}
                  className={`px-2 py-0.5 rounded transition-colors ${notifCategory === cat ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotifs.map(n => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    n.category === 'CRITICAL' ? 'severity-critical' : n.category === 'WARNING' ? 'severity-warning' : 'severity-info'
                  }`}>
                    {n.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{n.timestamp}</span>
                </div>
                <h4 className="font-semibold text-white">{n.title}</h4>
                <p className="text-slate-400">{n.message}</p>
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                  <span className="text-cyan-400">{n.affected_area}</span>
                  <a href={n.monday_link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1">
                    Monday <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority Feed with Business Impact Estimator */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400 animate-pulse" />
              Outcome-Oriented Executive Priorities
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Business Impact Estimator</span>
          </div>

          <div className="space-y-3">
            {(data.priority_feed || []).map(prio => (
              <div key={prio.id} className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-rose-300 uppercase px-2 py-0.5 bg-rose-950/60 border border-rose-800/40 rounded">
                    PRIORITY {prio.rank} · {prio.impact_level}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">Recovery: {prio.financial_recovery || '₹36 Lakhs'}</span>
                </div>

                <h4 className="text-sm font-semibold text-white">{prio.title}</h4>
                <p className="text-xs text-slate-400">{prio.reason}</p>

                <div className="p-2.5 rounded-lg bg-slate-950/80 text-[11px] font-mono space-y-1 border border-slate-800">
                  <div className="text-emerald-300">⚡ Action: {prio.recommendation}</div>
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Team: {prio.responsible_team || 'Finance'}</span>
                    <span>Timeline: {prio.estimated_timeline_days || 5} Days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── 4. Dynamic Client Leaderboard ────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-xl glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Dynamic Client Revenue Leaderboard</h3>
            <p className="text-xs text-slate-400">Ranked by Total Contract Value (TCV) & Recognized Billed Value</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Client Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                placeholder="Search client..."
                className="pl-7 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none w-36 sm:w-48 font-sans"
              />
            </div>

            {/* Limit selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
              {[5, 10, 20].map(lim => (
                <button
                  key={lim}
                  onClick={() => setClientLimit(lim)}
                  className={`px-2 py-0.5 rounded ${clientLimit === lim ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Top {lim}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {filteredClients.map((client, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>RANK #{idx + 1}</span>
                <span className="text-cyan-400">{client.formatted_tcv}</span>
              </div>
              <h4 className="text-xs font-semibold text-white truncate">{client.client_name}</h4>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Billed:</span>
                  <span className="text-emerald-400">{client.formatted_billed}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${Math.min(100, (client.billed_inr / maxVal(client.tcv_inr)) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 5. Executive Analytics & Charts ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue Trend Area Chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Monthly Revenue & Pipeline Trend (₹ Lakhs)</h3>
            <div className="flex items-center gap-1 text-[11px]">
              <button onClick={() => exportChartCSV('Monthly_Trends', data.charts.monthly_trends)} className="p-1 text-slate-400 hover:text-white" title="Export CSV">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.monthly_trends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPipe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="period" stroke="#475569" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#475569" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue_lakhs" name="Recognized Revenue" stroke="#06B6D4" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="pipeline_lakhs" name="Pipeline TCV" stroke="#6366F1" fillOpacity={1} fill="url(#colorPipe)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Waterfall Chart */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Revenue Conversion Waterfall (₹ Lakhs)</h3>
            <button onClick={() => exportChartCSV('Waterfall', data.charts.revenue_waterfall)} className="p-1 text-slate-400 hover:text-white">
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.revenue_waterfall}>
                <XAxis dataKey="stage" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#475569" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value_lakhs" name="Value (₹L)" radius={[4, 4, 0, 0]}>
                  {data.charts.revenue_waterfall.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#EF4444' : SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* ── 6. Decision History & Insights Timeline ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Decision History (Yesterday vs Today) */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-xl glass-panel space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Executive State Comparison (Yesterday vs Today)
          </h3>

          <div className="space-y-2.5">
            {(data.decision_history?.metrics_delta || []).map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-300 font-semibold">{m.metric}</span>
                  <div className="text-[10px] text-slate-500">Yesterday: {m.yesterday}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{m.today}</div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    {m.delta} ({m.status})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily Executive Insights Timeline */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="p-5 rounded-xl glass-panel space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Chronological Daily Insights Stream
          </h3>

          <div className="relative pl-4 space-y-4 border-l border-slate-800">
            {(data.insights_timeline || []).map((item, idx) => (
              <div key={idx} className="relative space-y-1">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold">{item.time}</span>
                  <span className="text-slate-500 uppercase">{item.category}</span>
                </div>
                <p className="text-xs text-slate-300">{item.event}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </div>
  );
};

function maxVal(v: number) {
  return v || 1;
}
