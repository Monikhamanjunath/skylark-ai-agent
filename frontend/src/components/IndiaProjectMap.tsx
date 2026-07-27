import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Activity, Layers, X } from 'lucide-react';
import { fetchMapData } from '../lib/api';

interface Project {
  id: string;
  location: string;
  state: string;
  lat: number;
  lng: number;
  sector: string;
  value_lakhs: number;
  status: string;
  color: string;
}

interface MapData {
  projects: Project[];
  total_active_states: number;
  top_sector: string;
  total_project_value_lakhs: number;
}

// Simplified India SVG path — simplified outline for rendering
// lat/lng to SVG coordinate mapping for India bounding box
// India bounding box: lat 8–37°N, lng 68–97°E
const LAT_MIN = 7.5, LAT_MAX = 37.5;
const LNG_MIN = 67.5, LNG_MAX = 97.5;
const SVG_W = 400, SVG_H = 480;

function geoToSvg(lat: number, lng: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_W;
  const y = SVG_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return [x, y];
}

// Simplified India outline polygon (key coastal and border points)
const INDIA_OUTLINE = [
  [77.5, 35.5], [79, 34.5], [80.5, 34], [81.5, 33.5], [82.5, 32.5], [83.5, 31.5],
  [84.5, 30.5], [86, 29.5], [87, 28], [88, 27], [89.5, 26.5], [91, 26],
  [92, 24.5], [93.5, 24], [94.5, 23], [95.5, 22.5], [96, 21.5], [95, 20.5],
  [94, 19], [93.5, 18], [92.5, 17], [91, 16], [89.5, 14.5], [88, 13.5],
  [86.5, 12.5], [85, 11.5], [83.5, 10.5], [82, 9.5], [80.5, 8.5], [79, 8.5],
  [77.5, 8.5], [76, 8.5], [74.5, 9], [73.5, 10], [72.5, 11], [72, 12],
  [71.5, 13.5], [71, 15], [70.5, 16.5], [70, 18.5], [69.5, 20.5], [69, 22],
  [68.5, 23.5], [68, 24.5], [68.5, 26], [69.5, 27.5], [70.5, 28.5], [71.5, 29.5],
  [72.5, 30.5], [73.5, 31.5], [74.5, 32.5], [75.5, 33.5], [76.5, 34.5], [77.5, 35.5]
].map(([lng, lat]) => geoToSvg(lat, lng));

const INDIA_PATH = 'M ' + INDIA_OUTLINE.map(([x, y]) => `${x},${y}`).join(' L ') + ' Z';

// State capital markers for reference
const STATE_MARKERS: Array<{ name: string; lat: number; lng: number }> = [
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
];

const SECTOR_COLORS: Record<string, string> = {
  Mining: '#F59E0B',
  Powerline: '#06B6D4',
  Renewables: '#10B981',
  DSP: '#6366F1',
  Railways: '#EC4899',
};

export const IndiaProjectMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [filterSector, setFilterSector] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchMapData()
      .then(setMapData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sectors = mapData ? [...new Set(mapData.projects.map((p) => p.sector))] : [];
  const filteredProjects = filterSector
    ? mapData?.projects.filter((p) => p.sector === filterSector) ?? []
    : mapData?.projects ?? [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 border border-cyan-800/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">India Project Intelligence Map</h2>
              <p className="text-xs text-slate-500 font-mono">
                Live drone deployment footprint · Sector-classified · Revenue-weighted
              </p>
            </div>
          </div>
          {mapData && (
            <div className="hidden sm:flex items-center gap-6 text-right">
              <div>
                <p className="text-xs text-slate-500">Active States</p>
                <p className="text-2xl font-bold text-cyan-400 font-mono">{mapData.total_active_states}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Project Value</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono">₹{mapData.total_project_value_lakhs}L</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Top Sector</p>
                <p className="text-lg font-bold text-amber-400 font-mono">{mapData.top_sector}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-4 border border-slate-800/50 relative overflow-hidden"
        >
          {/* Sector filter pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterSector(null)}
              className={`text-xs px-3 py-1 rounded-full border font-mono transition-colors ${
                !filterSector
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-900/40 border-slate-800/40 text-slate-500 hover:text-slate-300'
              }`}
            >
              All Sectors
            </button>
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSector(filterSector === s ? null : s)}
                className={`text-xs px-3 py-1 rounded-full border font-mono transition-colors`}
                style={{
                  background: filterSector === s ? `${SECTOR_COLORS[s]}22` : 'transparent',
                  borderColor: filterSector === s ? `${SECTOR_COLORS[s]}55` : '#334155',
                  color: filterSector === s ? SECTOR_COLORS[s] : '#64748B',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* SVG Map */}
          <div className="relative flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin" />
              </div>
            )}
            {error && (
              <div className="text-rose-400 text-sm font-mono p-8">{error}</div>
            )}
            {!loading && !error && (
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full max-w-md"
                style={{ filter: 'drop-shadow(0 0 40px rgba(6,182,212,0.08))' }}
              >
                {/* India fill */}
                <path
                  d={INDIA_PATH}
                  fill="#0f1a2e"
                  stroke="#1e3a5f"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                {/* Grid lines subtle */}
                {[72, 78, 84, 90, 96].map((lng) => {
                  const [x] = geoToSvg(0, lng);
                  return (
                    <line
                      key={`v${lng}`}
                      x1={x} y1={0} x2={x} y2={SVG_H}
                      stroke="#1e3a5f" strokeWidth="0.5" strokeDasharray="3,6"
                    />
                  );
                })}
                {[12, 18, 24, 30, 36].map((lat) => {
                  const [, y] = geoToSvg(lat, 0);
                  return (
                    <line
                      key={`h${lat}`}
                      x1={0} y1={y} x2={SVG_W} y2={y}
                      stroke="#1e3a5f" strokeWidth="0.5" strokeDasharray="3,6"
                    />
                  );
                })}

                {/* State capital markers */}
                {STATE_MARKERS.map((c) => {
                  const [x, y] = geoToSvg(c.lat, c.lng);
                  return (
                    <g key={c.name}>
                      <circle cx={x} cy={y} r={2} fill="#334155" />
                      <text x={x + 4} y={y + 3} fontSize="7" fill="#475569" fontFamily="monospace">
                        {c.name}
                      </text>
                    </g>
                  );
                })}

                {/* Project Dots */}
                {filteredProjects.map((p) => {
                  const [x, y] = geoToSvg(p.lat, p.lng);
                  const isSelected = selected?.id === p.id;
                  const isHovered = hoveredProject?.id === p.id;
                  const r = Math.max(8, Math.min(18, p.value_lakhs / 15));
                  return (
                    <g
                      key={p.id}
                      onClick={() => setSelected(isSelected ? null : p)}
                      onMouseEnter={() => setHoveredProject(p)}
                      onMouseLeave={() => setHoveredProject(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse ring */}
                      {(isSelected || isHovered) && (
                        <circle
                          cx={x} cy={y} r={r + 6}
                          fill="none"
                          stroke={p.color}
                          strokeWidth="1"
                          opacity="0.4"
                          style={{ animation: 'ping 1.5s infinite' }}
                        />
                      )}
                      {/* Outer glow */}
                      <circle
                        cx={x} cy={y} r={r + 3}
                        fill={p.color}
                        opacity="0.12"
                      />
                      {/* Main dot */}
                      <circle
                        cx={x} cy={y} r={r}
                        fill={p.color}
                        opacity={isSelected ? 1 : 0.8}
                        stroke={isSelected ? '#fff' : p.color}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                      {/* Value label */}
                      <text
                        x={x} y={y + 3}
                        fontSize="7"
                        fill="#fff"
                        textAnchor="middle"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {p.value_lakhs}L
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Hover tooltip overlay */}
          <AnimatePresence>
            {hoveredProject && !selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bottom-4 left-4 glass-panel rounded-xl p-3 border text-xs font-mono pointer-events-none"
                style={{ borderColor: `${hoveredProject.color}44` }}
              >
                <p className="font-bold" style={{ color: hoveredProject.color }}>{hoveredProject.location}</p>
                <p className="text-slate-400">{hoveredProject.sector} · ₹{hoveredProject.value_lakhs}L</p>
                <p className={hoveredProject.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}>
                  {hoveredProject.status}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Panel: Project list + selected detail */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Sector Legend
            </h4>
            <div className="space-y-2">
              {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
                <div key={sector} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-xs text-slate-400 font-mono">{sector}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/50 text-[10px] text-slate-600 font-mono">
              Dot size = project value
            </div>
          </div>

          {/* Selected Project Detail */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="glass-panel rounded-xl p-4 border"
                style={{ borderColor: `${selected.color}44` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: selected.color }} />
                    <h4 className="text-sm font-bold text-slate-100">{selected.location}</h4>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sector</span>
                    <span className="font-bold" style={{ color: selected.color }}>{selected.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Project Value</span>
                    <span className="text-emerald-400 font-bold">₹{selected.value_lakhs}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={selected.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}>
                      ● {selected.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">State</span>
                    <span className="text-slate-300">{selected.state}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects list */}
          {!loading && mapData && (
            <div className="glass-panel rounded-xl p-4 border border-slate-800/50">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Active Projects
              </h4>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all border ${
                      selected?.id === p.id
                        ? 'border-slate-600 bg-slate-800/60'
                        : 'border-transparent hover:border-slate-800 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-slate-300 font-mono">{p.location}</span>
                    </div>
                    <span className="text-slate-500 font-mono">₹{p.value_lakhs}L</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndiaProjectMap;
