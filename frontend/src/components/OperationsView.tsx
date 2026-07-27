import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, AlertTriangle } from 'lucide-react';
import { ExecutiveTable } from './ExecutiveTable';
import type { ColumnDef } from './ExecutiveTable';
import { fetchOperationsData } from '../lib/api';

export const OperationsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperationsData()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnDef<any>[] = [
    { key: 'wo_id', header: 'WO #', accessor: d => d.wo_id, sortable: true },
    { key: 'deal_name_masked', header: 'Project Name', accessor: d => d.deal_name_masked, sortable: true, render: d => <span className="font-semibold text-white">{d.deal_name_masked}</span> },
    { key: 'client_name', header: 'Client', accessor: d => d.client_name, sortable: true },
    { key: 'sector', header: 'Sector', accessor: d => d.sector, sortable: true },
    { key: 'execution_status', header: 'Execution Status', accessor: d => d.execution_status, sortable: true, render: d => {
      const isDelayed = d.execution_status?.includes('Not Started') || d.execution_status?.includes('Delayed') || d.execution_status?.includes('Hold');
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isDelayed ? 'bg-rose-950 text-rose-300 border-rose-800/40 font-bold' : 'bg-emerald-950 text-emerald-300 border-emerald-800/40'}`}>
          {d.execution_status}
        </span>
      );
    }},
    { key: 'amount_inr', header: 'WO Value', accessor: d => d.amount_inr, sortable: true, render: d => <span className="font-mono font-bold text-white">₹{(d.amount_inr / 100000).toFixed(1)}L</span> },
    { key: 'billed_inr', header: 'Billed Value', accessor: d => d.billed_inr, sortable: true, render: d => <span className="font-mono text-emerald-400">₹{(d.billed_inr / 100000).toFixed(1)}L</span> },
    { key: 'unbilled_inr', header: 'Unbilled Leakage', accessor: d => d.unbilled_inr, sortable: true, render: d => (
      <span className={`font-mono ${d.unbilled_inr > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
        ₹{(d.unbilled_inr / 100000).toFixed(1)}L
      </span>
    )}
  ];

  if (loading) {
    return <div className="skeleton rounded-2xl h-96 w-full" />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Operations & Work Order Execution Tracker</h1>
          </div>
          <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {data?.delayed_count || 5} Delayed Work Orders (₹{((data?.delayed_value_inr || 0)/100000).toFixed(1)}L)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Total Work Orders</span>
            <span className="text-white font-bold text-sm">{data?.total_work_orders || 0} WOs</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Avg Delivery TAT</span>
            <span className="text-cyan-400 font-bold text-sm">{data?.avg_work_order_tat_days || 4.5} Days</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">SLA On-Time Rate</span>
            <span className="text-emerald-400 font-bold text-sm">88.5%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Active Flight Pilots</span>
            <span className="text-indigo-400 font-bold text-sm">12 Pilots</span>
          </div>
        </div>
      </motion.div>

      {/* Enterprise Table */}
      <ExecutiveTable
        title="Work Order Execution Database"
        subtitle="Search by client/project, filter by execution status, copy rows, export CSV."
        data={data?.work_orders_list || []}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
};
