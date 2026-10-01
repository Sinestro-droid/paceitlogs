import React, { useState } from 'react';
import { LogEntry } from '../types';
import { FileText, FileSpreadsheet, Printer, Edit3, Copy, Trash2, Check } from 'lucide-react';
import { exportSingleLogPdf } from '../utils/exportPdf';
import { exportSingleLogExcel } from '../utils/exportExcel';
import { formatStamp } from '../utils/activity';
import { ConfirmDialog } from './ConfirmDialog';

interface LogSheetViewProps {
  log: LogEntry;
  onEdit?: (log: LogEntry) => void;
  onDuplicate?: (log: LogEntry) => void;
  onDelete?: (id: string) => void;
}

export const LogSheetView: React.FC<LogSheetViewProps> = ({
  log,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [copiedMac, setCopiedMac] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleCopyMac = () => {
    if (log.mac) {
      navigator.clipboard.writeText(log.mac);
      setCopiedMac(true);
      setTimeout(() => setCopiedMac(false), 2000);
    }
  };

  // Print only this log, even though every log is on the page
  const handlePrint = () => {
    const el = document.getElementById(`log-${log.id}`);
    el?.classList.add('print-target');
    document.body.classList.add('print-single');

    const cleanup = () => {
      el?.classList.remove('print-target');
      document.body.classList.remove('print-single');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const tableRows = [
    { label: 'Date', value: log.date },
    { label: 'Reseller Name', value: log.resellerName },
    { label: 'Caller Phone', value: log.callerPhone },
    { label: 'Request Type', value: log.requestType },
    { label: 'Customer Name', value: log.customerName },
    { label: 'NMS ID / Customer ID', value: log.nmsId },
    { label: 'Issue Found', value: log.issueFound },
    { label: 'Missing / Wrong Details', value: log.missingWrongDetails },
    { label: 'Action Taken', value: log.actionTaken },
    { label: 'REASON for Action (why I did it)', value: log.reasonForAction },
    { label: 'Reseller Informed?', value: log.resellerInformed },
    { label: 'Follow-up Needed?', value: log.followUpNeeded },
    { label: 'Status', value: log.status },
    { label: 'Supervisor Informed / Approved By', value: log.supervisorInformed },
    { label: 'Remarks', value: log.remarks },
    { label: 'Mac', value: log.mac, isMac: true },
  ];

  return (
    <>
      <div id={`log-${log.id}`} className="sheet-wrap w-full scroll-mt-24">
        {/* Actions Toolbar */}
        <div className="no-print flex items-center justify-between gap-3 mb-4 bg-white p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-semibold text-slate-800">
              Log #{log.logNo}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 truncate max-w-xs">
              {log.customerName || 'Log Sheet'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(log)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {onDuplicate && (
              <button
                onClick={() => onDuplicate(log)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={() => exportSingleLogExcel(log)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 border border-slate-200 hover:bg-slate-50 rounded transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => exportSingleLogPdf(log)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-brand-800 hover:bg-brand-900 rounded transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            {onDelete && (
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded transition-colors"
                title="Delete this log"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Sheet matching reference document */}
        <div className="bg-white p-6 sm:p-10 rounded-lg border border-slate-300 shadow-xs print:shadow-none print:border-none print:p-0">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Reseller Request Log - New User ID & Forms
            </h1>
          </div>

          {/* Log No */}
          <div className="mb-2.5">
            <h2 className="text-sm font-bold text-slate-900">
              Log No. {log.logNo}
            </h2>
          </div>

          {/* Document Table */}
          <div className="border border-slate-300 overflow-hidden">
            <table className="w-full border-collapse text-left text-xs">
              <tbody>
                {tableRows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-slate-300 last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="w-[30%] py-2 px-3.5 bg-brand-800 text-white font-semibold align-middle text-xs select-none border-r border-slate-300"
                    >
                      {row.label}
                    </th>

                    <td className="py-2 px-3.5 bg-white text-slate-800 align-middle leading-normal font-normal">
                      {row.isMac ? (
                        <div className="flex items-center justify-between group">
                          <span className="font-mono text-slate-900">
                            {row.value || ''}
                          </span>
                          {row.value && (
                            <button
                              type="button"
                              onClick={handleCopyMac}
                              className="no-print opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-0.5"
                              title="Copy MAC"
                            >
                              {copiedMac ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span>{row.value || ''}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Who created / last changed this log (not printed) */}
        <div className="no-print mt-3 text-xs text-slate-500 px-1">
          <p>
            Created by <span className="font-medium text-slate-700">{log.createdBy || 'unknown'}</span>
            {log.createdAt && <> on {formatStamp(log.createdAt)}</>}
            {log.updatedBy && log.history && log.history.some((h) => h.action === 'edited') && (
              <>
                {' '}
                &middot; Last edited by <span className="font-medium text-slate-700">{log.updatedBy}</span>
                {' '}on {formatStamp(log.updatedAt)}
              </>
            )}
          </p>

          {log.history && log.history.length > 0 && (
            <details className="mt-1.5">
              <summary className="cursor-pointer text-brand-700 hover:text-brand-800 select-none">
                History ({log.history.length})
              </summary>
              <ul className="mt-2 space-y-2 bg-white border border-slate-200 rounded-lg p-3">
                {[...log.history].reverse().map((h, i) => (
                  <li key={i} className="text-[11px]">
                    <p className="text-slate-700">
                      <span className="font-semibold">{h.by}</span> {h.action}{' '}
                      <span className="text-slate-400">{formatStamp(h.at)}</span>
                    </p>
                    {h.changes && h.changes.length > 0 && (
                      <ul className="mt-1 ml-3 space-y-0.5 text-slate-500">
                        {h.changes.map((c, j) => (
                          <li key={j} className="break-words">
                            <span className="text-slate-700">{c.field}:</span>{' '}
                            <span className="line-through">{c.from || 'empty'}</span> →{' '}
                            <span className="text-slate-800">{c.to || 'empty'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Log Entry?"
        message={`Are you sure you want to delete Log #${log.logNo}? This will permanently remove this entry.`}
        confirmLabel="Delete"
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          if (onDelete) onDelete(log.id);
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
};
