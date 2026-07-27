import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'company' | 'client' | 'sector' | 'deal';
  value?: number;
  color: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  strength: number;
  color: string;
}

interface SelectedNode extends GraphNode {
  connections: string[];
}

const GRAPH_NODES: GraphNode[] = [
  // Company Center
  { id: 'skylark', label: 'Skylark Drones', type: 'company', color: '#06B6D4', radius: 36, x: 0, y: 0, vx: 0, vy: 0 },
  // Sectors
  { id: 'mining', label: 'Mining', type: 'sector', value: 18000000, color: '#F59E0B', radius: 22, x: -150, y: -100, vx: 0, vy: 0 },
  { id: 'powerline', label: 'Powerline', type: 'sector', value: 12000000, color: '#06B6D4', radius: 20, x: 150, y: -100, vx: 0, vy: 0 },
  { id: 'renewables', label: 'Renewables', type: 'sector', value: 9500000, color: '#10B981', radius: 18, x: 0, y: -160, vx: 0, vy: 0 },
  { id: 'dsp', label: 'DSP', type: 'sector', value: 5500000, color: '#6366F1', radius: 16, x: -170, y: 80, vx: 0, vy: 0 },
  { id: 'railways', label: 'Railways', type: 'sector', value: 3000000, color: '#EC4899', radius: 14, x: 170, y: 80, vx: 0, vy: 0 },
  // Clients
  { id: 'adani', label: 'Adani Solar', type: 'client', value: 14500000, color: '#10B981', radius: 24, x: -80, y: -220, vx: 0, vy: 0 },
  { id: 'ultratech', label: 'UltraTech', type: 'client', value: 12640000, color: '#10B981', radius: 22, x: -240, y: -30, vx: 0, vy: 0 },
  { id: 'coalindia', label: 'Coal India', type: 'client', value: 9800000, color: '#F59E0B', radius: 20, x: -220, y: -160, vx: 0, vy: 0 },
  { id: 'jindal', label: 'Jindal Steel', type: 'client', value: 6500000, color: '#F59E0B', radius: 17, x: -80, y: 180, vx: 0, vy: 0 },
  { id: 'tatapower', label: 'Tata Power', type: 'client', value: 4600000, color: '#06B6D4', radius: 15, x: 220, y: -160, vx: 0, vy: 0 },
  { id: 'bpcl', label: 'BPCL', type: 'client', value: 3800000, color: '#6366F1', radius: 14, x: 240, y: 30, vx: 0, vy: 0 },
  { id: 'ircon', label: 'IRCON', type: 'client', value: 3000000, color: '#EC4899', radius: 13, x: 80, y: 200, vx: 0, vy: 0 },
];

const GRAPH_EDGES: GraphEdge[] = [
  // Skylark → Sectors
  { source: 'skylark', target: 'mining', label: '₹180L TCV', strength: 0.9, color: '#F59E0B' },
  { source: 'skylark', target: 'powerline', label: '₹120L TCV', strength: 0.8, color: '#06B6D4' },
  { source: 'skylark', target: 'renewables', label: '₹95L TCV', strength: 0.7, color: '#10B981' },
  { source: 'skylark', target: 'dsp', label: '₹55L TCV', strength: 0.5, color: '#6366F1' },
  { source: 'skylark', target: 'railways', label: '₹30L TCV', strength: 0.4, color: '#EC4899' },
  // Clients → Sectors
  { source: 'adani', target: 'renewables', label: 'Solar Survey', strength: 0.8, color: '#10B981' },
  { source: 'ultratech', target: 'mining', label: 'Volumetric', strength: 0.9, color: '#F59E0B' },
  { source: 'coalindia', target: 'mining', label: 'Mine Survey', strength: 0.85, color: '#F59E0B' },
  { source: 'jindal', target: 'mining', label: 'Stockpile', strength: 0.6, color: '#F59E0B' },
  { source: 'tatapower', target: 'powerline', label: 'Line Insp.', strength: 0.7, color: '#06B6D4' },
  { source: 'bpcl', target: 'dsp', label: 'Pipeline', strength: 0.6, color: '#6366F1' },
  { source: 'ircon', target: 'railways', label: 'Track Map', strength: 0.7, color: '#EC4899' },
  // Cross connections
  { source: 'adani', target: 'skylark', label: '₹145L', strength: 0.7, color: '#10B981' },
  { source: 'ultratech', target: 'skylark', label: '₹126L', strength: 0.75, color: '#F59E0B' },
  { source: 'coalindia', target: 'skylark', label: '₹98L', strength: 0.6, color: '#F59E0B' },
];

const W = 700, H = 500;
const CX = W / 2, CY = H / 2;

function runForceStep(nodes: GraphNode[], edges: GraphEdge[], zoom: number): GraphNode[] {
  const newNodes = nodes.map((n) => ({ ...n }));
  const nodeMap: Record<string, GraphNode> = {};
  newNodes.forEach((n) => { nodeMap[n.id] = n; });

  // Center gravity
  const gravity = 0.04;
  newNodes.forEach((n) => {
    n.vx += (0 - n.x) * gravity;
    n.vy += (0 - n.y) * gravity;
  });

  // Repulsion
  for (let i = 0; i < newNodes.length; i++) {
    for (let j = i + 1; j < newNodes.length; j++) {
      const a = newNodes[i], b = newNodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 3000 / (dist * dist);
      const nx = (dx / dist) * force, ny = (dy / dist) * force;
      a.vx -= nx; a.vy -= ny;
      b.vx += nx; b.vy += ny;
    }
  }

  // Spring attraction from edges
  edges.forEach((e) => {
    const a = nodeMap[e.source], b = nodeMap[e.target];
    if (!a || !b) return;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const target_dist = 140 / e.strength;
    const force = (dist - target_dist) * 0.04;
    const nx = (dx / dist) * force, ny = (dy / dist) * force;
    a.vx += nx; a.vy += ny;
    b.vx -= nx; b.vy -= ny;
  });

  // Apply velocity with damping
  const damping = 0.85;
  newNodes.forEach((n) => {
    n.vx *= damping; n.vy *= damping;
    n.x += n.vx; n.y += n.vy;
    // Bounds
    const maxR = (W / 2 - n.radius - 20) / zoom;
    n.x = Math.max(-maxR, Math.min(maxR, n.x));
    n.y = Math.max(-maxR, Math.min(maxR * (H / W), n.y));
  });

  return newNodes;
}

const NODE_INFO: Record<string, { description: string; deals: string[]; metrics: Array<{ label: string; value: string }> }> = {
  skylark: {
    description: 'Skylark Drones — Executive Operations Hub',
    deals: ['16 Active Deals Across 5 Sectors', '₹4.8 Cr Total Pipeline TCV'],
    metrics: [{ label: 'Win Rate', value: '37.5%' }, { label: 'Avg TAT', value: '4.5 days' }],
  },
  adani: {
    description: 'Adani Solar — Rajasthan Solar Farm Survey (⚠️ WO Missing)',
    deals: ['D-109: Rajasthan Site Survey (₹145L)', '2 Active Sites — Renewables'],
    metrics: [{ label: 'TCV', value: '₹145L' }, { label: 'Status', value: '⚠️ WO Pending' }],
  },
  ultratech: {
    description: 'UltraTech Cement — Volumetric Survey (⚠️ Unbilled ₹36L)',
    deals: ['D-102: Volumetric Survey (₹126.4L)', '3 WOs Completed but Unbilled'],
    metrics: [{ label: 'TCV', value: '₹126.4L' }, { label: 'Leakage', value: '₹36L unbilled' }],
  },
  coalindia: {
    description: 'Coal India Limited — Mine Mapping & Stock Audit',
    deals: ['D-87: Jharkhand Mine Survey (₹98L)', 'PO Confirmation Pending for Block II'],
    metrics: [{ label: 'TCV', value: '₹98L' }, { label: 'Status', value: 'PO Pending' }],
  },
};

export const RelationshipGraph: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(() =>
    GRAPH_NODES.map((n) => ({ ...n }))
  );
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [running, setRunning] = useState(true);
  const rafRef = useRef<number | null>(null);
  const nodeMapRef = useRef<Record<string, GraphNode>>({});

  // Build node map ref
  useEffect(() => {
    nodes.forEach((n) => { nodeMapRef.current[n.id] = n; });
  }, [nodes]);

  // Force simulation loop
  const tick = useCallback(() => {
    setNodes((prev) => runForceStep(prev, GRAPH_EDGES, zoom));
    rafRef.current = requestAnimationFrame(tick);
  }, [zoom]);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, tick]);

  const handleNodeClick = (n: GraphNode) => {
    if (selectedNode?.id === n.id) {
      setSelectedNode(null);
      return;
    }
    const connections = GRAPH_EDGES
      .filter((e) => e.source === n.id || e.target === n.id)
      .map((e) => (e.source === n.id ? e.target : e.source));
    setSelectedNode({ ...n, connections });
  };

  const nodeMap: Record<string, GraphNode> = {};
  nodes.forEach((n) => { nodeMap[n.id] = n; });

  const isHighlighted = (n: GraphNode) =>
    !selectedNode || n.id === selectedNode.id || selectedNode.connections.includes(n.id);

  const isEdgeHighlighted = (e: GraphEdge) =>
    !selectedNode || e.source === selectedNode.id || e.target === selectedNode.id;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 border border-purple-800/30"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40">
              <Share2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Business Relationship Intelligence Graph</h2>
              <p className="text-xs text-slate-500 font-mono">
                Force-directed client–sector–deal relationship network · Click any node to explore
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setNodes(GRAPH_NODES.map((n) => ({ ...n, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20 })));
                setRunning(true);
              }}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel rounded-2xl border border-slate-800/50 overflow-hidden relative"
          style={{ minHeight: 500 }}
        >
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ background: 'transparent' }}
          >
            {/* Definitions */}
            <defs>
              {GRAPH_NODES.map((n) => (
                <radialGradient key={`grad-${n.id}`} id={`grad-${n.id}`}>
                  <stop offset="0%" stopColor={n.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={n.color} stopOpacity="0.4" />
                </radialGradient>
              ))}
            </defs>

            <g transform={`translate(${CX},${CY}) scale(${zoom})`}>
              {/* Edges */}
              {GRAPH_EDGES.map((e, i) => {
                const src = nodeMap[e.source];
                const tgt = nodeMap[e.target];
                if (!src || !tgt) return null;
                const highlighted = isEdgeHighlighted(e);
                const isHov = hoveredEdge === e;
                return (
                  <g key={i}>
                    <line
                      x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                      stroke={e.color}
                      strokeWidth={isHov ? 2.5 : highlighted ? 1.5 : 0.5}
                      strokeOpacity={highlighted ? (isHov ? 0.9 : 0.5) : 0.1}
                      strokeDasharray={highlighted ? 'none' : '4,4'}
                      onMouseEnter={() => setHoveredEdge(e)}
                      onMouseLeave={() => setHoveredEdge(null)}
                      style={{ cursor: 'default', transition: 'stroke-opacity 0.2s' }}
                    />
                    {isHov && (
                      <text
                        x={(src.x + tgt.x) / 2}
                        y={(src.y + tgt.y) / 2 - 6}
                        textAnchor="middle"
                        fontSize="9"
                        fill={e.color}
                        fontFamily="monospace"
                      >
                        {e.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((n) => {
                const highlighted = isHighlighted(n);
                const isSelected = selectedNode?.id === n.id;
                return (
                  <g
                    key={n.id}
                    onClick={() => handleNodeClick(n)}
                    style={{ cursor: 'pointer', opacity: highlighted ? 1 : 0.25, transition: 'opacity 0.25s' }}
                  >
                    {/* Glow ring */}
                    {isSelected && (
                      <circle
                        cx={n.x} cy={n.y} r={n.radius + 8}
                        fill="none"
                        stroke={n.color}
                        strokeWidth="2"
                        strokeOpacity="0.4"
                        style={{ animation: 'pulse 2s infinite' }}
                      />
                    )}
                    {/* Node circle */}
                    <circle
                      cx={n.x} cy={n.y} r={n.radius}
                      fill={`url(#grad-${n.id})`}
                      stroke={isSelected ? '#fff' : n.color}
                      strokeWidth={isSelected ? 2.5 : 1}
                      strokeOpacity={0.8}
                    />
                    {/* Label */}
                    <text
                      x={n.x} y={n.y + 3}
                      textAnchor="middle"
                      fontSize={n.id === 'skylark' ? '10' : '8'}
                      fill="#fff"
                      fontWeight="bold"
                      fontFamily="monospace"
                      style={{ pointerEvents: 'none' }}
                    >
                      {n.label.split(' ')[0]}
                    </text>
                    {n.type === 'client' && (
                      <text
                        x={n.x} y={n.y + 13}
                        textAnchor="middle"
                        fontSize="7"
                        fill="#94A3B8"
                        fontFamily="monospace"
                        style={{ pointerEvents: 'none' }}
                      >
                        {n.label.split(' ').slice(1).join(' ')}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Hint */}
          <div className="absolute bottom-3 left-3 text-[10px] text-slate-600 font-mono">
            Click node to explore · Hover edge to see relationship
          </div>
        </motion.div>

        {/* Right: node detail + legend */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Node Types</h4>
            <div className="space-y-2 text-xs font-mono">
              {[
                { label: 'Skylark (Hub)', color: '#06B6D4' },
                { label: 'Sector', color: '#F59E0B' },
                { label: 'Client', color: '#10B981' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-1 text-[10px] text-slate-600 font-mono">
              <p>Edge thickness = deal strength</p>
              <p>Node size = revenue value</p>
            </div>
          </div>

          {/* Selected Node Info */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="glass-panel rounded-xl p-4 border"
                style={{ borderColor: `${selectedNode.color}44` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-bold" style={{ color: selectedNode.color }}>
                    {selectedNode.label}
                  </h4>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {NODE_INFO[selectedNode.id] ? (
                  <>
                    <p className="text-xs text-slate-400 mb-3 font-mono leading-relaxed">
                      {NODE_INFO[selectedNode.id].description}
                    </p>
                    <div className="space-y-1 mb-3">
                      {NODE_INFO[selectedNode.id].deals.map((d, i) => (
                        <p key={i} className="text-[11px] text-slate-500 font-mono">• {d}</p>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {NODE_INFO[selectedNode.id].metrics.map((m, i) => (
                        <div key={i} className="bg-slate-900/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-slate-500">{m.label}</p>
                          <p className="text-xs font-bold font-mono" style={{ color: selectedNode.color }}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 font-mono space-y-1">
                    <p>Type: <span className="text-slate-300 capitalize">{selectedNode.type}</span></p>
                    <p>Connected to: <span className="text-slate-300">{selectedNode.connections.join(', ')}</span></p>
                    {selectedNode.value && (
                      <p>Value: <span className="text-emerald-400">₹{(selectedNode.value / 100000).toFixed(1)}L</span></p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedNode && (
            <div className="glass-panel rounded-xl p-4 border border-slate-800/40 text-center text-slate-600">
              <Share2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-mono">Click any node to explore relationships</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipGraph;
