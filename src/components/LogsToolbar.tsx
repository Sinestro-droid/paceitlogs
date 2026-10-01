import React from 'react';
import { LogEntry } from '../types';
import { Search, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { exportBatchLogsPdf } from '../utils/exportPdf';
import { exportBatchLogsExcel } from '../utils/exportExcel';

export type StatusFilter = 'all' | 'pending' | 'in_progress' | 'resolved';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

interface LogsToolbarProps {
  totalCount: number;
  filteredLogs: LogEntry[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  onJumpToLog: (id: string) => void;
}

export const LogsToolbar: React.FC<LogsToolbarProps> = ({
  totalCount,
  filteredLogs,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onJumpToLog,
}) => {
  return (
    <div className="no-print sticky top-2 z-20 mb-4 bg-white shadow-sm p-3 rounded-lg border border-slate-200 flex flex-col xl:flex-row xl:items-center gap-3">
      {/* Search */}
      <div className="relative w-full xl:w-72">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search logs..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/20 transition-colors"
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded text-xs self-start xl:self-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onStatusFilterChange(f.key)}
            className={`px-2.5 py-1 rounded transition-colors ${
              statusFilter === f.key
                ? 'bg-white text-brand-800 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-wrap items-center justify-between xl:justify-end gap-3">
        {/* Count and jump-to */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
            {filteredLogs.length === totalCount
              ? `${totalCount} logs`
              : `${filteredLogs.length} of ${totalCount} logs`}
          </span>

          {filteredLogs.length > 0 && (
            <select
              value=""
              onChange={(e) => e.target.value && onJumpToLog(e.target.value)}
              className="max-w-[260px] text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-600"
            >
              <option value="">Jump to log...</option>
              {filteredLogs.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.logNo} — {item.customerName || item.resellerName || 'Untitled'}
                  {item.nmsId ? ` (${item.nmsId})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Batch exports (respect current search and filter) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors disabled:opacity-40"
            title="Print all logs shown below"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print all</span>
          </button>

          <button
            type="button"
            onClick={() => exportBatchLogsExcel(filteredLogs)}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors disabled:opacity-40"
            title="Export the logs shown by the current search and filter"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export all (Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => exportBatchLogsPdf(filteredLogs)}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded transition-colors disabled:opacity-40"
            title="Export the logs shown by the current search and filter"
          >
            <FileText className="w-3.5 h-3.5 text-brand-700" />
            <span>Export all (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
