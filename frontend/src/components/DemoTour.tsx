import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Star,
  Zap,
  BarChart2,
  Globe,
  Share2,
  Sliders,
  Shield,
  Brain,
  Layers,
  Target,
} from 'lucide-react';

interface TourStep {
  id: number;
  tab: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  narrative: string;
  spotlight_items: string[];
  wow_factor: string;
  ceo_prompt: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    tab: 'control-room',
    title: 'Executive Control Room',
    subtitle: 'Bloomberg-Terminal Grade Morning Brief',
    icon: BarChart2,
    color: '#06B6D4',
    narrative:
      'This is the nerve center of the Skylark Founder Operating System. Every morning, the founder receives a deterministic intelligence brief — zero guessing, zero hallucination. Every number is computed from live Monday.com GraphQL data.',
    spotlight_items: [
      '8 real-time KPI cards with explainability modals (click the ℹ️ icon)',
      'Morning Brief with financial snapshot, critical risks, and CEO action list',
      'Executive Notification Center with severity-classified alerts',
      'Decision History comparing today vs yesterday across all metrics',
      'Interactive trend charts with revenue + leakage forecasting',
    ],
    wow_factor: 'Click any KPI card ℹ️ to see the full formula, root cause, and recommended action',
    ceo_prompt: 'Show me our revenue leakage today',
  },
  {
    id: 2,
    tab: 'pipeline',
    title: 'Pipeline Intelligence',
    subtitle: 'Full Deal Funnel with Enterprise Table',
    icon: Target,
    color: '#10B981',
    narrative:
      'Every deal in the Skylark pipeline is visible here — with stage, sector, client, and value. The enterprise table supports real-time search, column sorting, and sector filtering. The AI understands which deals are at risk.',
    spotlight_items: [
      'Sector-wise pipeline breakdown with visual distribution bars',
      'Live deal count, Win Rate %, and Avg Sales Cycle metrics',
      'Enterprise table with column headers, sort, and pagination',
      'Stage funnel visualization showing pipeline conversion flow',
    ],
    wow_factor: 'Sort deals by value descending to see the highest-impact opportunities',
    ceo_prompt: 'Which deals are in negotiation stage right now?',
  },
  {
    id: 3,
    tab: 'operations',
    title: 'Operations Intelligence',
    subtitle: 'Real-time Delivery SLA & TAT Tracking',
    icon: Layers,
    color: '#F59E0B',
    narrative:
      'The Operations view tracks every drone deployment work order — from dispatch to delivery. Delayed WOs are automatically flagged. The AI uses this data to identify crew reallocation opportunities and SLA breaches.',
    spotlight_items: [
      'Work Order Tracker with execution status and TAT metrics',
      'Delayed WO alerts with financial impact estimates',
      'Average turnaround time with SLA benchmark comparison',
      'Crew reallocation recommendations based on site completion data',
    ],
    wow_factor: 'The platform identifies which WOs are dragging down the Health Score in real time',
    ceo_prompt: 'How many work orders are delayed and what is the financial impact?',
  },
  {
    id: 4,
    tab: 'reconciliation',
    title: 'Cross-Board Intelligence',
    subtitle: 'Deal ↔ Work Order Reconciliation Engine',
    icon: Shield,
    color: '#6366F1',
    narrative:
      'This is the most powerful feature for a drone operations business. The platform automatically detects when a Closed Won deal has no corresponding Work Order — preventing revenue from slipping through operational gaps.',
    spotlight_items: [
      'Unlinked Won Deals detection (Deal won but WO never created)',
      'Unbilled completed Work Orders (service delivered but not invoiced)',
      'Revenue Leakage quantification in INR with client attribution',
      'Direct Monday.com deep-links to open the flagged item instantly',
    ],
    wow_factor: '₹36 Lakhs of unbilled revenue was detected and flagged automatically',
    ceo_prompt: 'Show me all deals that have been won but have no work order',
  },
  {
    id: 5,
    tab: 'scenario',
    title: 'Scenario Simulator',
    subtitle: 'Executive What-If Decision Engine',
    icon: Sliders,
    color: '#EC4899',
    narrative:
      'The Scenario Simulator is unique to this platform. No AI model guesses outcomes — instead, the engine clones the real dataset and applies mathematically deterministic delta transformations. Every projection is 100% verifiable.',
    spotlight_items: [
      'Win Rate Increase scenario — projects new revenue if BD improves by X%',
      'Leakage Recovery scenario — shows impact of clearing unbilled work',
      'TAT Reduction scenario — projects health score improvement from faster delivery',
      'Pipeline Expansion scenario — models revenue if new deals close',
    ],
    wow_factor: 'Select "Leakage Recovery 100%" and watch the Health Score jump instantly',
    ceo_prompt: 'What happens to our business health if we recover all leakage today?',
  },
  {
    id: 6,
    tab: 'map',
    title: 'India Project Map',
    subtitle: 'Geo-Intelligence: National Drone Footprint',
    icon: Globe,
    color: '#06B6D4',
    narrative:
      'Every drone project Skylark is running across India is plotted geographically. The map is revenue-weighted — larger dots mean higher project value. Sectors are color-coded, and project details appear on click.',
    spotlight_items: [
      'SVG-based India map with geo-coded project locations across 10 states',
      'Revenue-weighted project dots (size = deal value)',
      'Sector filter pills to isolate Mining, Powerline, Renewables etc.',
      'Click any dot to see location, sector, value, and status',
    ],
    wow_factor: 'Filter to "Mining" to see how concentrated the eastern India drone pipeline is',
    ceo_prompt: 'Where are our active drone projects on the map?',
  },
  {
    id: 7,
    tab: 'graph',
    title: 'Relationship Graph',
    subtitle: 'Force-Directed Business Network Intelligence',
    icon: Share2,
    color: '#8B5CF6',
    narrative:
      'The Relationship Graph visualizes how Skylark connects to every client, sector, and deal type. The physics-based force simulation gives an intuitive sense of deal weight and client centrality.',
    spotlight_items: [
      'Live force-directed simulation with physics-based node positioning',
      'Node size reflects revenue value; edge thickness reflects deal strength',
      'Click any node for deal details, anomalies, and executive context',
      'Hover edges to see the specific relationship and deal value',
    ],
    wow_factor: 'Click the Adani Solar node — the platform shows the ₹145L deal with the missing WO alert',
    ceo_prompt: 'Show me which clients have the most revenue at risk',
  },
  {
    id: 8,
    tab: 'data-health',
    title: 'Data Health Center',
    subtitle: 'Resilience Engine Audit Trail',
    icon: Brain,
    color: '#10B981',
    narrative:
      'The Resilience Engine is what ensures zero hallucination. It auto-cleanses date formats, canonicalizes client names, repairs missing values, and deduplicates records — then logs every action in a transparent audit trail.',
    spotlight_items: [
      'Live data quality score with per-dimension breakdown',
      'Full repair audit log: every cleansing action is documented',
      'Animated health metrics: dates normalized, currencies fixed, duplicates merged',
      'Confidence score: how much the AI can trust the underlying dataset',
    ],
    wow_factor: 'Every KPI card shows "Confidence: 96%" — this is computed here, not assumed',
    ceo_prompt: 'What repairs did the system make to our data today?',
  },
];

interface DemoTourProps {
  onNavigate: (tab: string) => void;
  onClose: () => void;
}

export const DemoTour: React.FC<DemoTourProps> = ({ onNavigate, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(new Set());

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  useEffect(() => {
    if (started) {
      onNavigate(step.tab);
      setVisited((v) => new Set([...v, currentStep]));
    }
  }, [currentStep, started, onNavigate, step.tab]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((c) => c - 1);
  };

  const handleStart = () => {
    setStarted(true);
    setVisited(new Set([0]));
    onNavigate(TOUR_STEPS[0].tab);
  };

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(9,13,22,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 max-w-lg w-full border border-cyan-800/30 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Executive Demo Tour</h2>
          <p className="text-slate-400 text-sm mb-2">
            Skylark Founder Executive Intelligence Platform
          </p>
          <p className="text-slate-500 text-xs font-mono mb-6">
            A guided walkthrough of all 8 platform modules
          </p>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {TOUR_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl"
                  style={{ background: `${s.color}11`, border: `1px solid ${s.color}22` }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                  <span className="text-[9px] text-slate-500 font-mono text-center leading-tight">
                    {s.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm hover:bg-slate-800/50 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleStart}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)' }}
            >
              <Play className="w-4 h-4" />
              Start Tour
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(9,13,22,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-8 max-w-md w-full border border-emerald-800/30 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Tour Complete</h2>
          <p className="text-slate-400 text-sm mb-4">
            You've explored all 8 modules of the Skylark Founder Executive Intelligence Platform.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            {[
              { label: '8 Modules', desc: 'Executive-grade intelligence views' },
              { label: '100% Deterministic', desc: 'Zero AI hallucination across all metrics' },
              { label: '₹36L Detected', desc: 'Unbilled revenue leakage auto-flagged' },
              { label: 'Real-time Data', desc: 'Live Monday.com GraphQL sync' },
            ].map(({ label, desc }) => (
              <div key={label} className="bg-emerald-950/20 border border-emerald-800/20 rounded-xl p-3">
                <p className="text-emerald-400 font-bold text-sm font-mono">{label}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            Return to Platform
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div
        className="glass-panel rounded-2xl border shadow-2xl overflow-hidden"
        style={{ borderColor: `${step.color}33` }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <motion.div
            className="h-full"
            style={{ background: step.color }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl shrink-0"
                style={{ background: `${step.color}22`, border: `1px solid ${step.color}44` }}
              >
                <StepIcon className="w-5 h-5" style={{ color: step.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">
                    Step {currentStep + 1}/{TOUR_STEPS.length}
                  </span>
                  {visited.has(currentStep) && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-100">{step.title}</h3>
                <p className="text-xs text-slate-500 font-mono">{step.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Narrative */}
          <p className="text-sm text-slate-400 leading-relaxed mb-4">{step.narrative}</p>

          {/* Spotlight items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
            {step.spotlight_items.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-slate-500 font-mono">
                <Zap className="w-3 h-3 shrink-0 mt-0.5" style={{ color: step.color }} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Wow factor */}
          <div
            className="rounded-xl p-3 mb-4 text-xs font-mono"
            style={{ background: `${step.color}0A`, border: `1px solid ${step.color}33` }}
          >
            <span className="font-bold" style={{ color: step.color }}>★ Try this: </span>
            <span className="text-slate-400">{step.wow_factor}</span>
          </div>

          {/* CEO Prompt suggestion */}
          <div className="bg-slate-900/60 rounded-xl p-3 mb-4 border border-slate-800/50">
            <p className="text-[10px] text-slate-500 font-mono mb-1">Ask the AI Agent (Ctrl+K):</p>
            <p className="text-xs text-cyan-400 font-mono italic">"{step.ceo_prompt}"</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm border border-slate-700 text-slate-400 hover:bg-slate-800/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {/* Step dots */}
            <div className="flex-1 flex items-center justify-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i === currentStep ? step.color : visited.has(i) ? '#334155' : '#1e293b',
                    width: i === currentStep ? 20 : 6,
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: currentStep === TOUR_STEPS.length - 1
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : `linear-gradient(135deg, ${step.color}33, ${step.color}55)`,
                border: `1px solid ${step.color}44`,
                color: currentStep === TOUR_STEPS.length - 1 ? '#fff' : step.color,
              }}
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoTour;
