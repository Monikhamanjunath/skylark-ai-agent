import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Download,
  Copy,
  ExternalLink,
  Eye,
  Pin,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (item: T) => any;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
  width?: string;
}

interface ExecutiveTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  pageSize?: number;
}

export function ExecutiveTable<T extends { id?: string; monday_item_id?: string; monday_link?: string }>({
  data,
  columns,
  title,
  subtitle,
  searchPlaceholder = 'Search records...',
  pageSize = 10,
}: ExecutiveTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, _setColumnFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach(col => { initial[col.key] = true; });
    return initial;
  });
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, boolean>>({});
  const [showColMenu, setShowColMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Global Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchesGlobal = columns.some(col => {
          const val = col.accessor(item);
          return val !== NoneAndEmpty(val) && String(val).toLowerCase().includes(s);
        });
        if (!matchesGlobal) return false;
      }
      // Column Filters
      for (const [colKey, filterVal] of Object.entries(columnFilters)) {
        if (filterVal) {
          const col = columns.find(c => c.key === colKey);
          if (col) {
            const val = String(col.accessor(item)).toLowerCase();
            if (!val.includes(filterVal.toLowerCase())) return false;
          }
        }
      }
      return true;
    });
  }, [data, searchTerm, columnFilters, columns]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = col.accessor(a);
      const valB = col.accessor(b);
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Actions
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else { setSortKey(null); setSortOrder('asc'); }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePinColumn = (key: string) => {
    setPinnedColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyRowToClipboard = (item: T, idx: number) => {
    const text = columns.map(c => `${c.header}: ${c.accessor(item)}`).join(', ');
    navigator.clipboard.writeText(text);
    setCopiedId(String(idx));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    const activeCols = columns.filter(c => visibleColumns[c.key]);
    const headers = activeCols.map(c => `"${c.header}"`).join(',');
    const rows = sortedData.map(item =>
      activeCols.map(c => `"${String(c.accessor(item)).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeColumns = useMemo(() => {
    const list = columns.filter(c => visibleColumns[c.key]);
    // Move pinned to front
    return list.sort((a, b) => {
      const pinA = pinnedColumns[a.key] ? 1 : 0;
      const pinB = pinnedColumns[b.key] ? 1 : 0;
      return pinB - pinA;
    });
  }, [columns, visibleColumns, pinnedColumns]);

  return (
    <div className="rounded-xl glass-panel border border-slate-800 flex flex-col overflow-hidden">
      {/* Header controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
        <div>
          {title && <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Global Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors font-sans"
            />
          </div>

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(p => !p)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Cols
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-30 space-y-1">
                <p className="text-[10px] font-mono uppercase text-slate-500 px-2 py-1">Toggle Columns</p>
                {columns.map(col => (
                  <label key={col.key} className="flex items-center justify-between px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded cursor-pointer">
                    <span className="truncate">{col.header}</span>
                    <input
                      type="checkbox"
                      checked={!!visibleColumns[col.key]}
                      onChange={() => toggleColumnVisibility(col.key)}
                      className="accent-cyan-500 rounded"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse executive-table">
          <thead className="bg-slate-950/80 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              {activeColumns.map(col => {
                const isPinned = pinnedColumns[col.key];
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold select-none ${
                      isPinned ? 'bg-slate-900 border-r border-slate-800' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div
                        onClick={() => col.sortable !== false && handleSort(col.key)}
                        className={`flex items-center gap-1 ${col.sortable !== false ? 'cursor-pointer hover:text-white' : ''}`}
                      >
                        <span>{col.header}</span>
                        {sortKey === col.key && (
                          sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />
                        )}
                      </div>
                      <button
                        onClick={() => togglePinColumn(col.key)}
                        title={isPinned ? 'Unpin column' : 'Pin column'}
                        className={`p-0.5 rounded hover:bg-slate-800 transition-colors ${isPinned ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="px-4 py-8 text-center text-slate-500 font-mono">
                  No matching executive records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors group">
                  {activeColumns.map(col => {
                    const isPinned = pinnedColumns[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-slate-200 font-sans ${isPinned ? 'bg-slate-900/80 font-semibold border-r border-slate-800' : ''}`}
                      >
                        {col.render ? col.render(item) : String(col.accessor(item))}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right font-mono">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => copyRowToClipboard(item, idx)}
                        title="Copy row details"
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedId === String(idx) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      {(item.monday_link || item.monday_item_id) && (
                        <a
                          href={item.monday_link || `https://skylarkdrones.monday.com/boards/items/${item.monday_item_id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open item in Monday.com"
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/60">
        <span>
          Showing {paginatedData.length ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NoneAndEmpty(val: any) {
  return val === NoneAndEmpty;
}
