import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { ExecutiveControlRoom } from './components/ExecutiveControlRoom';
import { PipelineIntelligence } from './components/PipelineIntelligence';
import { OperationsView } from './components/OperationsView';
import { CrossBoardInsights } from './components/CrossBoardInsights';
import { LeadershipBriefStudio } from './components/LeadershipBriefStudio';
import { DataHealthCenter } from './components/DataHealthCenter';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { IndiaProjectMap } from './components/IndiaProjectMap';
import { RelationshipGraph } from './components/RelationshipGraph';
import { DemoTour } from './components/DemoTour';
import { fetchControlRoomData } from './lib/api';
import type { ControlRoomData } from './types';

/* ── Skeleton loading overlay ─────────────────────────────── */
const LoadingSkeleton = () => (
  <div className="space-y-6 animate-fadeIn pb-12">
    <div className="skeleton rounded-2xl h-64 w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton rounded-xl h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="skeleton rounded-xl h-56" />
      <div className="skeleton rounded-xl h-56" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="skeleton rounded-xl h-72" />
      <div className="skeleton rounded-xl h-72" />
    </div>
  </div>
);

/* ── Error banner ─────────────────────────────────────────── */
const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 p-4 rounded-xl flex items-start gap-3 border border-amber-800/40 bg-amber-950/20"
  >
    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-amber-300">Monday.com Sync Unavailable</p>
      <p className="text-xs text-slate-400 mt-0.5">{message}</p>
      <p className="text-xs text-slate-500 mt-1">
        The platform is operating in degraded mode. Live data cannot be refreshed until the connection is restored.
      </p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/70 text-amber-300 text-xs font-medium transition-colors shrink-0"
    >
      <RefreshCw className="w-3.5 h-3.5" />
      Retry
    </button>
  </motion.div>
);

/* ── Page transition wrapper ───────────────────────────────── */
const PageView: React.FC<{ children: React.ReactNode; tabKey: string }> = ({ children, tabKey }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════ */
export function App() {
  const [activeTab, setActiveTab] = useState('control-room');
  const [controlData, setControlData] = useState<ControlRoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchControlRoomData();
      setControlData(data);
    } catch (err: any) {
      setError(
        err.message?.includes('fetch')
          ? 'Cannot reach backend server. Make sure uvicorn is running on http://localhost:8000'
          : err.message || 'Unknown error fetching platform data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isLive = controlData?.live_status?.is_live ?? false;
  const healthPct = controlData?.health_score?.health_score_pct ?? 98;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050506', color: '#FFFFFF' }}>

      {/* ── Navigation Bar ──────────────────────────────────── */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLive={isLive}
        healthScorePct={healthPct}
        onOpenCmdK={() => setIsCmdKOpen(true)}
        onGenerateBriefClick={() => setActiveTab('briefs')}
        onStartDemoTour={() => setIsDemoTourOpen(true)}
      />

      {/* ── Command Palette ─────────────────────────────────── */}
      <AnimatePresence>
        {isCmdKOpen && (
          <CommandPalette
            isOpen={isCmdKOpen}
            onClose={() => setIsCmdKOpen(false)}
            onNavigate={(tab) => { setActiveTab(tab); setIsCmdKOpen(false); }}
          />
        )}
      </AnimatePresence>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Error Banner */}
        {error && !loading && (
          <ErrorBanner message={error} onRetry={loadData} />
        )}

        {/* Loading Skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Page Views */}
        {!loading && (
          <PageView tabKey={activeTab}>
            {activeTab === 'control-room' && controlData && (
              <ExecutiveControlRoom
                data={controlData}
                onNavigateTab={setActiveTab}
              />
            )}
            {activeTab === 'control-room' && !controlData && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-3">
                <WifiOff className="w-12 h-12 text-slate-700" />
                <p className="text-sm">Unable to load dashboard data.</p>
                <button onClick={loadData} className="text-cyan-400 text-xs hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            {activeTab === 'pipeline' && <PipelineIntelligence />}
            {activeTab === 'operations' && <OperationsView />}
            {activeTab === 'reconciliation' && <CrossBoardInsights />}
            {activeTab === 'scenario' && <ScenarioSimulator />}
            {activeTab === 'map' && <IndiaProjectMap />}
            {activeTab === 'graph' && <RelationshipGraph />}
            {activeTab === 'briefs' && <LeadershipBriefStudio />}
            {activeTab === 'data-health' && <DataHealthCenter />}
          </PageView>
        )}
      </main>

      {/* ── Demo Tour ───────────────────────────────────────── */}
      <AnimatePresence>
        {isDemoTourOpen && (
          <DemoTour
            onNavigate={(tab) => setActiveTab(tab)}
            onClose={() => setIsDemoTourOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-900 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px] text-slate-600 font-mono">
          <span>Skylark Drones · Founder Executive Intelligence Agent v1.0</span>
          <span className="flex items-center gap-1.5">
            {isLive
              ? <><Wifi className="w-3 h-3 text-emerald-500" /> Live Monday.com Sync</>
              : <><WifiOff className="w-3 h-3 text-amber-500" /> Monday Offline · Cached Dataset</>}
          </span>
        </div>
      </footer>

    </div>
  );
}

export default App;
