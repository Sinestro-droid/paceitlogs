export interface LogEntry {
  id: string;
  logNo: number | string;
  date: string;
  resellerName: string;
  callerPhone: string;
  requestType: string;
  customerName: string;
  nmsId: string;
  issueFound: string;
  missingWrongDetails: string;
  actionTaken: string;
  reasonForAction: string;
  resellerInformed: string;
  followUpNeeded: string;
  status: string;
  supervisorInformed: string;
  remarks: string;
  mac: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  history?: LogChange[];
}

export interface LogChange {
  at: string;
  by: string;
  action: 'created' | 'edited';
  changes?: { field: string; from: string; to: string }[];
}

export interface ActivityEvent {
  id: string;
  at: string;
  by: string;
  action: 'created' | 'edited' | 'deleted' | 'cleared' | 'restored' | 'user_created' | 'user_disabled' | 'user_enabled';
  logNo?: number | string;
  customer?: string;
  detail?: string;
}

export type LogFieldKey = 
  | 'resellerName'
  | 'callerPhone'
  | 'requestType'
  | 'customerName'
  | 'nmsId'
  | 'issueFound'
  | 'missingWrongDetails'
  | 'actionTaken'
  | 'reasonForAction'
  | 'resellerInformed'
  | 'followUpNeeded'
  | 'status'
  | 'supervisorInformed'
  | 'remarks'
  | 'mac';

export interface FieldDefinition {
  key: LogFieldKey;
  label: string;
  placeholder: string;
  isTextarea?: boolean;
  rows?: number;
  type?: 'text' | 'tel' | 'date';
  helperText?: string;
}

export type FieldSuggestionsMap = Record<LogFieldKey, string[]>;

export const STANDARD_STATUSES = [
  'Pending - waiting for reseller',
  'In Progress',
  'Resolved',
  'Cancelled',
  'On Hold',
  'Escalated to Core Team',
] as const;


export interface AppUser {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'user';
}

export interface AdminUserSummary {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: string;
  disabled: boolean;
}
