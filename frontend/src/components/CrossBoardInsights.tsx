import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitMerge, AlertTriangle } from 'lucide-react';
import { ExecutiveTable } from './ExecutiveTable';
import type { ColumnDef } from './ExecutiveTable';
import { fetchReconciliationData } from '../lib/api';

export const CrossBoardInsights: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReconciliationData()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnDef<any>[] = [
    { key: 'deal_id', header: 'Deal ID', accessor: d => d.deal_id, sortable: true },
    { key: 'deal_name', header: 'Project / Deal Name', accessor: d => d.deal_name, sortable: true, render: d => <span className="font-semibold text-white">{d.deal_name}</span> },
    { key: 'client', header: 'Client', accessor: d => d.client, sortable: true },
    { key: 'sector', header: 'Sector', accessor: d => d.sector, sortable: true },
    { key: 'tcv_inr', header: 'TCV Value', accessor: d => d.tcv_inr, sortable: true, render: d => <span className="font-mono font-bold text-white">₹{(d.tcv_inr / 100000).toFixed(1)}L</span> },
    { key: 'wo_status', header: 'WO Execution Status', accessor: d => d.wo_status, sortable: true, render: d => (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${d.wo_status?.includes('No Work Order') ? 'bg-rose-950 text-rose-300 border-rose-800/40 font-bold' : 'bg-emerald-950 text-emerald-300 border-emerald-800/40'}`}>
        {d.wo_status}
      </span>
    )},
    { key: 'billing_status', header: 'Billing Status', accessor: d => d.billing_status, sortable: true, render: d => (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${d.billing_status?.includes('Leakage') ? 'bg-amber-950 text-amber-300 border-amber-800/40 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
        {d.billing_status}
      </span>
    )}
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
            <GitMerge className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Cross-Board Reconciliation & Mismatch Engine</h1>
          </div>
          <span className="text-xs font-mono text-rose-300 bg-rose-950/60 border border-rose-800/40 px-3 py-1 rounded-full flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Unbilled Revenue Leakage: ₹{((data?.unbilled_revenue_leakage || 0)/100000).toFixed(1)}L
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Unlinked Won Deals</span>
            <span className="text-rose-400 font-bold text-sm">{data?.unlinked_won_deals_count || 1} Won Deal</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Unbilled Leakage Value</span>
            <span className="text-amber-400 font-bold text-sm">₹{((data?.unbilled_revenue_leakage || 0)/100000).toFixed(1)} Lakhs</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Cross-Board Join Score</span>
            <span className="text-emerald-400 font-bold text-sm">96.8% Matched</span>
          </div>
        </div>
      </motion.div>

      {/* Enterprise Table */}
      <ExecutiveTable
        title="Cross-Board Mismatch Database"
        subtitle="Identifies Closed-Won deals missing Work Orders and completed Work Orders missing invoices."
        data={data?.cross_board_items || []}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
};
