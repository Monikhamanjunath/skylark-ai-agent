import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  CheckCircle2,
  Activity,
  DollarSign,
  Target,
  Clock,
} from 'lucide-react';
import { runScenarioSimulation } from '../lib/api';

interface ScenarioResult {
  scenario_type: string;
  delta_value: number;
  simulation_notes: string[];
  base_health_score: number;
  simulated_health_score: number;
  health_delta: number;
  simulated_metrics: {
    win_rate_pct: number;
    closed_won_tcv: number;
    recognized_revenue: number;
    unbilled_revenue_leakage: number;
    revenue_realization_pct: number;
    total_pipeline_tcv: number;
    pipeline_conversion_rate: number;
    avg_work_order_tat_days: number;
    delayed_work_orders_count: number;
  };
}

const SCENARIOS = [
  {
    type: 'win_rate_increase',
    label: 'Win Rate Increase',
    icon: Target,
    color: '#10B981',
    bgColor: 'bg-emerald-950/50',
    borderColor: 'border-emerald-800/40',
    description: 'What if our BD team increases win rate by X%?',
    unit: '%',
    min: 5,
    max: 30,
    default: 10,
    step: 5,
  },
  {
    type: 'leakage_recovery',
    label: 'Leakage Recovery',
    icon: DollarSign,
    color: '#F59E0B',
    bgColor: 'bg-amber-950/50',
    borderColor: 'border-amber-800/40',
    description: 'What if we recover X% of unbilled revenue leakage?',
    unit: '%',
    min: 10,
    max: 100,
    default: 50,
    step: 10,
  },
  {
    type: 'tat_reduction',
    label: 'TAT Reduction',
    icon: Clock,
    color: '#06B6D4',
    bgColor: 'bg-cyan-950/50',
    borderColor: 'border-cyan-800/40',
    description: 'What if we reduce delivery TAT by X days?',
    unit: ' days',
    min: 0.5,
    max: 3,
    default: 1,
    step: 0.5,
  },
  {
    type: 'pipeline_expansion',
    label: 'Pipeline Expansion',
    icon: TrendingUp,
    color: '#6366F1',
    bgColor: 'bg-indigo-950/50',
    borderColor: 'border-indigo-800/40',
    description: 'What if our pipeline grows by X% through new deals?',
    unit: '%',
    min: 10,
    max: 50,
    default: 20,
    step: 10,
  },
];

const MetricDiff: React.FC<{
  label: string;
  base: string;
  simulated: string;
  better: boolean;
}> = ({ label, base, simulated, better }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
    <span className="text-xs text-slate-400 font-mono">{label}</span>
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 line-through font-mono">{base}</span>
      <span className={`text-xs font-bold font-mono ${better ? 'text-emerald-400' : 'text-rose-400'}`}>
        {simulated}
      </span>
      {better
        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
      }
    </div>
  </div>
);

const fmt = (n: number, decimals = 1) => n.toFixed(decimals);

export const ScenarioSimulator: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [deltaValue, setDeltaValue] = useState(activeScenario.default);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScenarioChange = (s: typeof SCENARIOS[0]) => {
    setActiveScenario(s);
    setDeltaValue(s.default);
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runScenarioSimulation(activeScenario.type, deltaValue);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const ScenarioIcon = activeScenario.icon;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 border border-indigo-800/30"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-800/40">
            <Sliders className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Executive Scenario Simulator</h2>
            <p className="text-xs text-slate-500 font-mono">
              Deterministic what-if analysis · Zero AI hallucination · All math is verifiable
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-3">
          Clone real business metrics and apply targeted delta transformations to project the exact financial and operational
          impact — before committing to any executive decision.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Scenario Picker */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Choose Scenario
            </h3>
            <div className="space-y-2">
              {SCENARIOS.map((s) => {
                const SIcon = s.icon;
                const isActive = activeScenario.type === s.type;
                return (
                  <button
                    key={s.type}
                    onClick={() => handleScenarioChange(s)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                      isActive
                        ? `${s.bgColor} ${s.borderColor}`
                        : 'bg-slate-900/40 border-slate-800/40 hover:bg-slate-800/40'
                    }`}
                  >
                    <SIcon className="w-4 h-4 shrink-0" style={{ color: isActive ? s.color : '#64748B' }} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                        {s.label}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{s.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delta Slider */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Delta Value
              </h3>
              <span
                className="text-xl font-bold font-mono tabular-nums"
                style={{ color: activeScenario.color }}
              >
                {deltaValue}{activeScenario.unit}
              </span>
            </div>
            <input
              type="range"
              min={activeScenario.min}
              max={activeScenario.max}
              step={activeScenario.step}
              value={deltaValue}
              onChange={(e) => setDeltaValue(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
              <span>{activeScenario.min}{activeScenario.unit}</span>
              <span>{activeScenario.max}{activeScenario.unit}</span>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: loading ? '#1e293b' : `linear-gradient(135deg, ${activeScenario.color}33, ${activeScenario.color}66)`,
              border: `1px solid ${activeScenario.color}44`,
              color: loading ? '#475569' : activeScenario.color,
            }}
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Simulating…</>
            ) : (
              <><Zap className="w-4 h-4" /> Run Simulation</>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}
        </motion.div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-xl border border-slate-800/50 flex flex-col items-center justify-center h-full min-h-[400px] text-slate-600"
              >
                <ScenarioIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm">Select a scenario and run simulation</p>
                <p className="text-xs mt-1 opacity-60">All projections are 100% deterministic</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel rounded-xl border border-slate-800/50 flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-full border-4 border-slate-800 animate-spin"
                    style={{ borderTopColor: activeScenario.color }}
                  />
                  <Activity
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
                    style={{ color: activeScenario.color }}
                  />
                </div>
                <p className="text-slate-400 text-sm font-semibold">Cloning base metrics…</p>
                <p className="text-slate-600 text-xs mt-1 font-mono">Applying Δ{deltaValue}{activeScenario.unit} to {activeScenario.label}</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Health Score Delta Hero Card */}
                <div
                  className="rounded-xl p-6 border"
                  style={{
                    background: `linear-gradient(135deg, ${activeScenario.color}11, ${activeScenario.color}05)`,
                    borderColor: `${activeScenario.color}33`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Simulation Complete</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Base Health Score</p>
                      <p className="text-3xl font-bold text-slate-400 font-mono">{fmt(result.base_health_score)}%</p>
                    </div>
                    <div className="text-center flex flex-col items-center justify-center">
                      <div
                        className="text-2xl font-bold font-mono px-4 py-1.5 rounded-xl border"
                        style={{
                          color: result.health_delta >= 0 ? '#10B981' : '#F43F5E',
                          borderColor: result.health_delta >= 0 ? '#10B98133' : '#F43F5E33',
                          background: result.health_delta >= 0 ? '#10B98111' : '#F43F5E11',
                        }}
                      >
                        {result.health_delta >= 0 ? '+' : ''}{fmt(result.health_delta)}%
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1 font-mono">HEALTH DELTA</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Projected Score</p>
                      <p
                        className="text-3xl font-bold font-mono"
                        style={{ color: activeScenario.color }}
                      >
                        {fmt(result.simulated_health_score)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulation Notes */}
                <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Simulation Findings
                  </h4>
                  <div className="space-y-2">
                    {result.simulation_notes.map((note, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 font-mono">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metric Comparison Grid */}
                <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Metric Projections (Base → Simulated)
                  </h4>
                  <MetricDiff
                    label="Win Rate"
                    base="—"
                    simulated={`${fmt(result.simulated_metrics.win_rate_pct)}%`}
                    better={result.simulated_metrics.win_rate_pct > 0}
                  />
                  <MetricDiff
                    label="Closed Won TCV"
                    base="—"
                    simulated={`₹${fmt(result.simulated_metrics.closed_won_tcv / 10000000, 2)} Cr`}
                    better
                  />
                  <MetricDiff
                    label="Recognized Revenue"
                    base="—"
                    simulated={`₹${fmt(result.simulated_metrics.recognized_revenue / 10000000, 2)} Cr`}
                    better
                  />
                  <MetricDiff
                    label="Revenue Realization %"
                    base="—"
                    simulated={`${fmt(result.simulated_metrics.revenue_realization_pct)}%`}
                    better
                  />
                  <MetricDiff
                    label="Unbilled Leakage"
                    base="—"
                    simulated={`₹${fmt(result.simulated_metrics.unbilled_revenue_leakage / 100000)} L`}
                    better={result.simulated_metrics.unbilled_revenue_leakage < 3600000}
                  />
                  <MetricDiff
                    label="Avg Delivery TAT"
                    base="—"
                    simulated={`${fmt(result.simulated_metrics.avg_work_order_tat_days)} days`}
                    better={result.simulated_metrics.avg_work_order_tat_days <= 4.5}
                  />
                  <MetricDiff
                    label="Delayed Work Orders"
                    base="—"
                    simulated={`${result.simulated_metrics.delayed_work_orders_count} WOs`}
                    better={result.simulated_metrics.delayed_work_orders_count < 5}
                  />
                </div>

                <p className="text-[11px] text-slate-600 font-mono text-center">
                  ✓ All projections are 100% deterministic · No AI assumptions · Based on verified Monday.com dataset
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
