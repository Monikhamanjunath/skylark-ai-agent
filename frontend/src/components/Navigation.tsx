import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  GitMerge,
  FileText,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronDown,
  Globe,
  Share2,
  Sliders,
  Play,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLive: boolean;
  healthScorePct: number;
  onOpenCmdK: () => void;
  onGenerateBriefClick: () => void;
  onStartDemoTour?: () => void;
}

const navItems = [
  { id: 'control-room',   label: 'Control Room',    icon: LayoutDashboard },
  { id: 'pipeline',       label: 'Pipeline',         icon: TrendingUp },
  { id: 'operations',     label: 'Operations',       icon: Layers },
  { id: 'reconciliation', label: 'Cross Board',      icon: GitMerge },
  { id: 'scenario',       label: 'Scenarios',        icon: Sliders },
  { id: 'map',            label: 'Project Map',      icon: Globe },
  { id: 'graph',          label: 'Graph',            icon: Share2 },
  { id: 'briefs',         label: 'Reports',          icon: FileText },
  { id: 'data-health',    label: 'Data Health',      icon: ShieldCheck },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isLive,
  healthScorePct,
  onOpenCmdK,
  onGenerateBriefClick,
  onStartDemoTour,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: '#050506',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Brand ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #6366F1)', boxShadow: '0 0 16px rgba(6,182,212,0.25)' }}
            >
              S
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white tracking-tight">Skylark Executive</span>
                <span
                  className="px-1.5 py-0.5 text-[9px] font-mono uppercase rounded"
                  style={{ background: '#0E1F2E', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.3)' }}
                >
                  AI AGENT
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Decision Intelligence Platform</p>
            </div>
          </div>

          {/* ── Desktop Nav Links ──────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    color: isActive ? '#FFFFFF' : '#737373',
                    background: isActive ? '#0E0E12' : 'transparent',
                    border: isActive ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: isActive ? '#06B6D4' : '#475569' }}
                  />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: '#06B6D4' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── Right Side Controls ────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Live Sync Pill */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono"
              style={{
                background: '#0B0B0D',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                color: isLive ? '#10B981' : '#F59E0B',
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'animate-live-pulse' : ''}`}
                style={{
                  background: isLive ? '#10B981' : '#F59E0B',
                }}
              />
              {isLive ? 'Live' : 'Cached'}
            </div>

            {/* Data Health Pill */}
            <button
              onClick={() => setActiveTab('data-health')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#34D399',
              }}
            >
              <ShieldCheck className="w-3 h-3" style={{ color: '#10B981' }} />
              {healthScorePct}%
            </button>

            {/* Cmd+K Search */}
            <button
              onClick={onOpenCmdK}
              id="cmd-k-button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: '#111827',
                border: '1px solid #1E293B',
                color: '#64748B',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#334155'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1E293B'; (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Ask AI...</span>
              <kbd
                className="hidden lg:inline px-1.5 py-0.5 text-[9px] font-mono rounded"
                style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid #334155' }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Demo Tour button */}
            {onStartDemoTour && (
              <button
                onClick={onStartDemoTour}
                id="demo-tour-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  color: '#A78BFA',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.15)'; }}
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tour</span>
              </button>
            )}

            {/* Generate Brief CTA */}
            <button
              onClick={onGenerateBriefClick}
              id="generate-brief-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #06B6D4, #6366F1)',
                boxShadow: '0 2px 12px rgba(6,182,212,0.25)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Brief</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(p => !p)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden pb-3 space-y-1 border-t border-slate-800 pt-3 overflow-hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
                  style={{
                    color: isActive ? '#F1F5F9' : '#64748B',
                    background: isActive ? 'rgba(26,34,54,0.8)' : 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? '#06B6D4' : '#475569' }} />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>
    </header>
  );
};
