import * as XLSX from 'xlsx';
import { LogEntry } from '../types';

/**
 * Export multiple logs to an Excel (.xlsx) spreadsheet
 */
export function exportBatchLogsExcel(logs: LogEntry[], filenamePrefix = 'Pace-IT_Reseller_Logs'): void {
  const wb = XLSX.utils.book_new();

  // Map rows with clean, human-readable column headers matching the document
  const rows = logs.map((log) => ({
    'Log No.': log.logNo,
    'Date': log.date,
    'Reseller Name': log.resellerName,
    'Caller Phone': log.callerPhone,
    'Request Type': log.requestType,
    'Customer Name': log.customerName,
    'NMS ID / Customer ID': log.nmsId || '',
    'Issue Found': log.issueFound,
    'Missing / Wrong Details': log.missingWrongDetails,
    'Action Taken': log.actionTaken,
    'REASON for Action (why I did it)': log.reasonForAction,
    'Reseller Informed?': log.resellerInformed,
    'Follow-up Needed?': log.followUpNeeded,
    'Status': log.status,
    'Supervisor Informed / Approved By': log.supervisorInformed,
    'Remarks': log.remarks,
    'Mac Address': log.mac,
    'Created At': log.createdAt,
    'Created By': log.createdBy || '',
    'Last Edited By': log.updatedBy || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set appropriate column widths for clean readability in Excel
  ws['!cols'] = [
    { wch: 8 },  // Log No.
    { wch: 14 }, // Date
    { wch: 22 }, // Reseller Name
    { wch: 18 }, // Caller Phone
    { wch: 18 }, // Request Type
    { wch: 32 }, // Customer Name
    { wch: 20 }, // NMS ID / Customer ID
    { wch: 30 }, // Issue Found
    { wch: 40 }, // Missing / Wrong Details
    { wch: 40 }, // Action Taken
    { wch: 45 }, // REASON for Action
    { wch: 18 }, // Reseller Informed
    { wch: 18 }, // Follow-up Needed
    { wch: 26 }, // Status
    { wch: 30 }, // Supervisor Informed
    { wch: 45 }, // Remarks
    { wch: 20 }, // Mac
    { wch: 22 }, // Created At
    { wch: 18 }, // Created By
    { wch: 18 }, // Last Edited By
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Reseller Logs');

  const filename = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Export a single log to an Excel (.xlsx) file as a key-value form sheet
 */
export function exportSingleLogExcel(log: LogEntry): void {
  const wb = XLSX.utils.book_new();

  const data = [
    ['Reseller Request Log - New User ID & Forms', ''],
    [`Log No. ${log.logNo}`, ''],
    ['Field', 'Recorded Details'],
    ['Date', log.date || ''],
    ['Reseller Name', log.resellerName || ''],
    ['Caller Phone', log.callerPhone || ''],
    ['Request Type', log.requestType || ''],
    ['Customer Name', log.customerName || ''],
    ['NMS ID / Customer ID', log.nmsId || ''],
    ['Issue Found', log.issueFound || ''],
    ['Missing / Wrong Details', log.missingWrongDetails || ''],
    ['Action Taken', log.actionTaken || ''],
    ['REASON for Action (why I did it)', log.reasonForAction || ''],
    ['Reseller Informed?', log.resellerInformed || ''],
    ['Follow-up Needed?', log.followUpNeeded || ''],
    ['Status', log.status || ''],
    ['Supervisor Informed / Approved By', log.supervisorInformed || ''],
    ['Remarks', log.remarks || ''],
    ['Mac', log.mac || ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 35 },
    { wch: 65 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Log_${log.logNo}`);

  const sanitizedCustomer = (log.customerName || 'Log')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 20);
  XLSX.writeFile(wb, `Pace-IT_Log_${log.logNo}_${sanitizedCustomer}.xlsx`);
}
