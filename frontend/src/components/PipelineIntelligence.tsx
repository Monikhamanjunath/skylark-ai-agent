import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { ExecutiveTable } from './ExecutiveTable';
import type { ColumnDef } from './ExecutiveTable';
import { fetchPipelineData } from '../lib/api';

export const PipelineIntelligence: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineData()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnDef<any>[] = [
    { key: 'deal_id', header: 'Deal ID', accessor: d => d.deal_id, sortable: true },
    { key: 'deal_name', header: 'Deal Name', accessor: d => d.deal_name, sortable: true, render: d => <span className="font-semibold text-white">{d.deal_name}</span> },
    { key: 'client_name', header: 'Client', accessor: d => d.client_name, sortable: true },
    { key: 'sector', header: 'Sector', accessor: d => d.sector, sortable: true, render: d => <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">{d.sector}</span> },
    { key: 'stage', header: 'Stage', accessor: d => d.stage, sortable: true, render: d => (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${d.stage?.includes('Won') ? 'bg-emerald-950 text-emerald-300 border-emerald-800/40' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
        {d.stage}
      </span>
    )},
    { key: 'val_inr', header: 'TCV Value', accessor: d => d.val_inr, sortable: true, render: d => <span className="font-mono font-bold text-white">₹{(d.val_inr / 100000).toFixed(1)}L</span> },
    { key: 'close_date', header: 'Close Date', accessor: d => d.close_date, sortable: true, render: d => <span className="font-mono text-slate-400">{d.close_date}</span> }
  ];

  if (loading) {
    return <div className="skeleton rounded-2xl h-96 w-full" />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Pipeline Intelligence & Funnel Analytics</h1>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full">
            Total Pipeline TCV: ₹{((data?.pipeline_tcv || 0)/10000000).toFixed(2)} Cr
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Total Active Deals</span>
            <span className="text-white font-bold text-sm">{data?.total_deals || 0} Deals</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Closed Won TCV</span>
            <span className="text-emerald-400 font-bold text-sm">₹{((data?.closed_won_tcv || 0)/10000000).toFixed(2)} Cr</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Win Rate</span>
            <span className="text-cyan-400 font-bold text-sm">{data?.win_rate_pct || 37.5}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Avg Sales Cycle</span>
            <span className="text-amber-400 font-bold text-sm">{data?.avg_sales_cycle_days || 18.5} Days</span>
          </div>
        </div>
      </motion.div>

      {/* Enterprise Table */}
      <ExecutiveTable
        title="Deal Tracker & Pipeline Database"
        subtitle="Search, filter by stage/sector, pin columns, copy rows, or export to CSV."
        data={data?.deals_list || []}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
};
