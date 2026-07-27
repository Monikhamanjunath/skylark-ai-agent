import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  CornerDownLeft,
  Loader2,
  Zap,
  Building2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { queryAgent } from '../lib/api';
import type { AgentResponse, ClarificationResponse } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

const PRESET_CHIPS = [
  { label: 'UltraTech Cement deep dive', query: 'What is happening with UltraTech Cement?' },
  { label: 'Mining performance', query: 'How is Mining performing this quarter?' },
  { label: 'Delayed projects', query: 'Show delayed mining projects' },
  { label: 'Revenue leakage', query: 'Show revenue' },
  { label: 'Pipeline by sector', query: 'Show sectors' },
  { label: 'Blocked work orders', query: 'Show delayed projects' },
];

const ConfidenceBadge: React.FC<{ pct: number; label?: string }> = ({ pct, label }) => {
  const color = pct >= 90 ? '#10B981' : pct >= 75 ? '#F59E0B' : '#EF4444';
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold"
      style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}
    >
      <ShieldCheck className="w-3 h-3" />
      {pct}% Confidence {label ? `· ${label}` : ''}
    </div>
  );
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentResponse | null>(null);
  const [clarification, setClarification] = useState<ClarificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPipelineDetails, setShowPipelineDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const reset = () => {
    setAgentResult(null);
    setClarification(null);
    setError(null);
  };

  const runQuery = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    reset();

    try {
      const res = await queryAgent(prompt);
      if ('is_ambiguous' in res && res.is_ambiguous) {
        setClarification(res as ClarificationResponse);
      } else {
        setAgentResult(res as AgentResponse);
      }
    } catch (err: any) {
      setError(err.message || 'Executive Agent unavailable. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] px-4 modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -16 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-3xl rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(14,20,36,0.96)',
          border: '1px solid #334155',
          maxHeight: '86vh',
          backdropFilter: 'blur(20px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: '1px solid #1E293B' }}
        >
          {loading
            ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
            : <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runQuery(query); }}
            placeholder='Executive Intelligence Search... ("What is happening with UltraTech Cement?")'
            className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder-slate-600 font-sans"
          />
          {(agentResult || clarification) && (
            <button
              onClick={reset}
              className="text-[11px] text-slate-500 hover:text-slate-300 font-mono px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Idle Suggested Queries */}
          {!agentResult && !clarification && !loading && (
            <div className="p-5 space-y-4">
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                Executive Intelligence Search Presets
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuery(chip.query); runQuery(chip.query); }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all group bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-900/50"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{chip.label}</p>
                      <p className="text-[10px] text-slate-500 font-mono">"{chip.query}"</p>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-600 ml-auto group-hover:text-slate-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4">
              <div className="p-4 rounded-xl flex items-start gap-3 bg-rose-950/20 border border-rose-900/40">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-rose-300">Executive Agent Error</p>
                  <p className="text-xs text-slate-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ambiguity Clarification Engine */}
          <AnimatePresence>
            {clarification && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-4">
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300">Ambiguity Detected</p>
                    <p className="text-slate-400 mt-0.5">Please clarify your query dimension to execute deterministic BI tools.</p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white">{clarification.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {clarification.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setQuery(opt.query); runQuery(opt.query); }}
                      className="p-3.5 rounded-xl text-left bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all group"
                    >
                      <p className="text-xs font-semibold text-cyan-400 mb-1">{opt.label}</p>
                      <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        "{opt.query}" <CornerDownLeft className="w-3 h-3 text-slate-600" />
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Executive AI Response */}
          <AnimatePresence>
            {agentResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-5">

                {/* 1. Visual Reasoning Pipeline Telemetry */}
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowPipelineDetails(p => !p)}
                      className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Visual AI Reasoning Pipeline (7 Deterministic Stages)
                      <ChevronRight className={`w-3 h-3 transition-transform ${showPipelineDetails ? 'rotate-90' : ''}`} />
                    </button>
                    <ConfidenceBadge pct={agentResult.confidence.score_pct} label={agentResult.confidence.label} />
                  </div>

                  {showPipelineDetails && (
                    <div className="pt-2 space-y-1.5 border-t border-slate-800 text-[11px] font-mono">
                      {(agentResult.reasoning_pipeline || []).map(stg => (
                        <div key={stg.stage_id} className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            Stage {stg.stage_id}: {stg.name}
                          </span>
                          <span className="text-slate-500 text-[10px] truncate max-w-[240px]">{stg.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Entity Search Deep Dive Card */}
                {agentResult.entity_deep_dive && (
                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Executive Intelligence Search — Entity Deep Dive
                      </span>
                      <span className="text-xs font-mono font-bold text-white">{agentResult.entity_deep_dive.entity_name}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Deals Found</span>
                        <span className="text-cyan-300 font-bold">{agentResult.entity_deep_dive.matched_deals_count} Deals</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Work Orders</span>
                        <span className="text-cyan-300 font-bold">{agentResult.entity_deep_dive.matched_wos_count} WOs</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Total TCV</span>
                        <span className="text-emerald-400 font-bold">₹{(agentResult.entity_deep_dive.total_tcv_inr/100000).toFixed(1)}L</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Unbilled Leakage</span>
                        <span className="text-rose-400 font-bold">₹{(agentResult.entity_deep_dive.total_unbilled_inr/100000).toFixed(1)}L</span>
                      </div>
                    </div>

                    {agentResult.entity_deep_dive.deals_summary?.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Linked Deals & Work Orders:</span>
                        {agentResult.entity_deep_dive.deals_summary.map((ds, i) => (
                          <div key={i} className="text-slate-300 font-mono text-[11px]">· {ds}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. 7-Stage Executive Decision Framework Output */}
                {agentResult.decision_framework && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      7-Stage Executive Decision Framework Synthesis
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-slate-500 block">1. Situation</span>
                        <p className="text-slate-200">{agentResult.decision_framework.situation}</p>
                      </div>

                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-amber-400 block">2. Root Cause Analysis</span>
                        <p className="text-slate-200">{agentResult.decision_framework.root_cause}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                          <span className="text-[10px] font-mono uppercase text-rose-400 block">3. Financial Impact</span>
                          <p className="text-rose-300 font-bold font-mono">{agentResult.decision_framework.financial_impact}</p>
                        </div>
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 block">4. Expected Outcome</span>
                          <p className="text-emerald-300 font-bold font-mono">{agentResult.decision_framework.expected_outcome}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 font-mono">
                        ⚡ <strong>5. Recommended CEO Action:</strong> {agentResult.decision_framework.recommended_action}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Decision Cards with Business Impact Estimator */}
                {agentResult.decision_cards?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Executive Priority Cards</h4>
                    {agentResult.decision_cards.map((card, idx) => (
                      <div key={idx} className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Zap className="w-4 h-4 text-rose-400" />
                            {card.title}
                          </h5>
                          <span className="text-xs font-mono font-bold text-emerald-400">Recovery: {card.financial_recovery || card.value_at_risk}</span>
                        </div>
                        <p className="text-xs text-slate-300">{card.reason}</p>
                        <div className="p-2.5 rounded-lg bg-slate-950 text-[11px] font-mono text-emerald-300 border border-slate-800">
                          💡 Action: {card.recommendation}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                          <span>Team: {card.responsible_team || 'Finance'}</span>
                          <span>Timeline: {card.estimated_timeline_days || 5} Days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up Prompts */}
                <div className="pt-2 space-y-2 border-t border-slate-800">
                  <p className="text-[10px] font-mono uppercase text-slate-500">Suggested Follow-up Executive Queries</p>
                  <div className="flex flex-wrap gap-2">
                    {agentResult.suggested_follow_up_questions.map((fq, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(fq); runQuery(fq); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-cyan-300 bg-slate-900 border border-slate-800 transition-colors"
                      >
                        {fq}
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex items-center justify-between text-[10px] text-slate-600 font-mono border-t border-slate-800 bg-slate-950/40">
          <span><kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">↵</kbd> submit · <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">ESC</kbd> close</span>
          <span>Executive Intelligence Search · Zero AI Hallucination</span>
        </div>
      </motion.div>
    </div>
  );
};
