import { supabase } from './supabase';
import { ActivityEvent, AppUser, FieldSuggestionsMap, LogEntry, LogFieldKey } from '../types';
import { diffLogs } from './activity';
import { INITIAL_SUGGESTIONS } from './storage';

const LOG_FIELDS: LogFieldKey[] = [
  'resellerName','callerPhone','requestType','customerName','nmsId','issueFound',
  'missingWrongDetails','actionTaken','reasonForAction','resellerInformed',
  'followUpNeeded','status','supervisorInformed','remarks','mac',
];

function normalizeLog(row: any): LogEntry {
  const data = (row.data || {}) as Partial<LogEntry>;
  return {
    ...(data as LogEntry),
    id: row.id,
    logNo: row.log_no ?? data.logNo ?? '',
    createdAt: row.created_at || data.createdAt || '',
    updatedAt: row.updated_at || data.updatedAt || row.created_at || '',
    createdBy: row.created_by_name || data.createdBy,
    updatedBy: row.updated_by_name || data.updatedBy,
    history: Array.isArray(data.history) ? data.history : [],
  };
}

export async function loadLogs(): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('log_no', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeLog);
}

export async function saveLog(entry: LogEntry, user: AppUser, existing?: LogEntry | null): Promise<LogEntry> {
  const now = new Date().toISOString();
  let saved: LogEntry;

  if (existing) {
    const changes = diffLogs(existing, entry);
    const history = [...(existing.history || [])];
    const stamped: LogEntry = {
      ...entry,
      id: existing.id,
      createdAt: existing.createdAt,
      createdBy: existing.createdBy,
      updatedAt: changes.length ? now : existing.updatedAt,
      updatedBy: changes.length ? user.displayName : existing.updatedBy,
      history,
    };

    if (changes.length) {
      stamped.history.push({ at: now, by: user.displayName, action: 'edited', changes });
    }

    const { data, error } = await supabase
      .from('logs')
      .update({
        log_no: stamped.logNo,
        data: stamped,
        updated_at: stamped.updatedAt,
        updated_by: user.id,
      })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    saved = normalizeLog(data);
  } else {
    const id = entry.id || crypto.randomUUID();
    const created: LogEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
      createdBy: user.displayName,
      updatedBy: user.displayName,
      history: [{ at: now, by: user.displayName, action: 'created' }],
    };
    const { data, error } = await supabase
      .from('logs')
      .insert({
        id,
        log_no: created.logNo,
        data: created,
        created_at: now,
        updated_at: now,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('*')
      .single();
    if (error) throw error;
    saved = normalizeLog(data);
  }

  if (!existing || diffLogs(existing, saved).length > 0) {
    await addCloudActivity({
      by: user.displayName,
      action: existing ? 'edited' : 'created',
      logNo: saved.logNo,
      customer: saved.customerName,
      detail: existing ? diffLogs(existing, saved).map(c => c.field).join(', ') : undefined,
    });
  }

  await harvestSuggestions(saved);
  return saved;
}

export async function deleteLog(id: string, user: AppUser): Promise<void> {
  const { data: target, error: readError } = await supabase.from('logs').select('*').eq('id', id).single();
  if (readError) throw readError;
  const log = normalizeLog(target);

  const { error } = await supabase.from('logs').delete().eq('id', id);
  if (error) throw error;

  await addCloudActivity({
    by: user.displayName,
    action: 'deleted',
    logNo: log.logNo,
    customer: log.customerName,
  });
}

export async function clearAllLogs(user: AppUser): Promise<void> {
  const { count, error: countError } = await supabase
    .from('logs')
    .select('id', { count: 'exact', head: true });
  if (countError) throw countError;

  const { error } = await supabase.from('logs').delete().not('id', 'is', null);
  if (error) throw error;

  await addCloudActivity({
    by: user.displayName,
    action: 'cleared',
    detail: `${count || 0} logs removed`,
  });
}

export async function loadActivity(): Promise<ActivityEvent[]> {
  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .order('at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    at: r.at,
    by: r.by_name || r.by,
    action: r.action,
    logNo: r.log_no,
    customer: r.customer,
    detail: r.detail,
  }));
}

export async function addCloudActivity(event: Omit<ActivityEvent, 'id' | 'at'>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('activity').insert({
    by: user.id,
    by_name: event.by,
    action: event.action,
    log_no: event.logNo ?? null,
    customer: event.customer ?? null,
    detail: event.detail ?? null,
  });
  if (error) throw error;
}

export async function loadSuggestions(): Promise<FieldSuggestionsMap> {
  const { data, error } = await supabase.from('suggestions').select('field, values');
  if (error) throw error;
  const merged: FieldSuggestionsMap = { ...INITIAL_SUGGESTIONS };
  for (const row of data || []) {
    if (LOG_FIELDS.includes(row.field as LogFieldKey) && Array.isArray(row.values)) {
      merged[row.field as LogFieldKey] = Array.from(new Set([
        ...(row.values as string[]),
        ...(INITIAL_SUGGESTIONS[row.field as LogFieldKey] || []),
      ]));
    }
  }
  return merged;
}

export async function saveSuggestions(suggestions: FieldSuggestionsMap): Promise<void> {
  const rows = LOG_FIELDS.map(field => ({ field, values: suggestions[field] || [] }));
  const { error } = await supabase.from('suggestions').upsert(rows, { onConflict: 'field' });
  if (error) throw error;
}

export async function harvestSuggestions(entry: Partial<LogEntry>): Promise<FieldSuggestionsMap> {
  const current = await loadSuggestions();
  for (const field of LOG_FIELDS) {
    const value = String(entry[field] || '').trim();
    if (!value) continue;
    const existing = current[field] || [];
    current[field] = [value, ...existing.filter(item => item.toLowerCase() !== value.toLowerCase())];
  }
  await saveSuggestions(current);
  return current;
}

export function subscribeToCloud(onLogs: () => void, onActivity: () => void, onSuggestions: () => void) {
  const channel = supabase.channel('pace-it-shared')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, onLogs)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, onActivity)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, onSuggestions)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function restoreLogs(imported: LogEntry[], merge: boolean, user: AppUser): Promise<number> {
  if (!merge) {
    const { error } = await supabase.from('logs').delete().not('id', 'is', null);
    if (error) throw error;
  }
  const rows = imported.map((l) => ({
    id: l.id || crypto.randomUUID(),
    log_no: l.logNo,
    data: l,
    created_at: l.createdAt || new Date().toISOString(),
    updated_at: l.updatedAt || new Date().toISOString(),
    created_by: user.id,
    updated_by: user.id,
  }));
  if (rows.length) {
    const { error } = await supabase.from('logs').upsert(rows);
    if (error) throw error;
  }
  await addCloudActivity({ by: user.displayName, action: 'restored', detail: `${imported.length} logs imported (${merge ? 'merged' : 'replaced'})` });
  return (await loadLogs()).length;
}

export async function importLocalBrowserData(user: AppUser): Promise<number> {
  const raw = localStorage.getItem('pace_it_logs_v1');
  if (!raw) return 0;
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.length) return 0;
  return restoreLogs(parsed, true, user);
}

export async function listUsers(): Promise<any[]> {
  const { data, error } = await supabase.from('profiles')
    .select('id, username, display_name, role, created_at, disabled')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createUserAccount(_accessToken: string, username: string, password: string, displayName: string) {
  const { data, error } = await supabase.rpc('admin_create_user', {
    p_username: username,
    p_password: password,
    p_display_name: displayName,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function disableUserAccount(_accessToken: string, userId: string, disabled: boolean) {
  const { data, error } = await supabase.rpc('admin_set_user_disabled', {
    p_user_id: userId,
    p_disabled: disabled,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please log in again.');
  return session.access_token;
}
