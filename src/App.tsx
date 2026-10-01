import React, { useEffect, useMemo, useState } from 'react';
import { LogEntry, FieldSuggestionsMap, ActivityEvent, AppUser } from './types';
import { Navbar } from './components/Navbar';
import { LogsToolbar, StatusFilter } from './components/LogsToolbar';
import { LogForm } from './components/LogForm';
import { LogSheetView } from './components/LogSheetView';
import { SuggestionsModal } from './components/SuggestionsModal';
import { BackupModal } from './components/BackupModal';
import { ActivityModal } from './components/ActivityModal';
import { AdminPanel } from './components/AdminPanel';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import {
  loadLogs, saveLog, deleteLog, clearAllLogs, loadSuggestions, saveSuggestions,
  loadActivity, subscribeToCloud, restoreLogs, getAccessToken, importLocalBrowserData,
} from './utils/cloud';
import { exportAppBackup } from './utils/storage';
import { Plus } from 'lucide-react';

interface AppProps {
  onLock?: () => void;
  currentUser: AppUser;
  initialAdminPanelOpen?: boolean;
}

export default function App({ onLock, currentUser, initialAdminPanelOpen = false }: AppProps) {
  const user = currentUser;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [suggestions, setSuggestions] = useState<FieldSuggestionsMap>({} as FieldSuggestionsMap);
  const [selectedLogId, setSelectedLogId] = useState('');
  const [currentView, setCurrentView] = useState<'sheet' | 'form'>('sheet');
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(initialAdminPanelOpen && currentUser.role === 'admin');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  const refreshLogs = async () => {
    try {
      const data = await loadLogs();
      setLogs(data);
      setSelectedLogId(current => current && data.some(l => l.id === current) ? current : (data[0]?.id || ''));
    } catch (e) {
      console.error(e);
      showToast('Could not refresh shared logs');
    }
  };

  const refreshActivity = async () => {
    try { setActivity(await loadActivity()); } catch (e) { console.error(e); }
  };

  const refreshSuggestions = async () => {
    try { setSuggestions(await loadSuggestions()); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([loadLogs(), loadActivity(), loadSuggestions()])
      .then(([loadedLogs, loadedActivity, loadedSuggestions]) => {
        if (!alive) return;
        setLogs(loadedLogs);
        setActivity(loadedActivity);
        setSuggestions(loadedSuggestions);
        setSelectedLogId(loadedLogs[0]?.id || '');
      })
      .catch((e) => {
        console.error(e);
        if (alive) showToast(e?.message || 'Could not load shared data');
      })
      .finally(() => { if (alive) setLoading(false); });

    const unsubscribe = subscribeToCloud(refreshLogs, refreshActivity, refreshSuggestions);
    return () => { alive = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    let armed = false;
    let timer: number | undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        armed = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => { armed = false; }, 1200);
        return;
      }
      if (armed && e.key.toLowerCase() === 't') {
        armed = false;
        window.clearTimeout(timer);
        if (user.role === 'admin') setIsAdminPanelOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.clearTimeout(timer);
    };
  }, [user.role]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2600);
  };

  const nextLogNo = useMemo(() => {
    if (!logs.length) return 1;
    return Math.max(...logs.map(l => {
      const n = typeof l.logNo === 'number' ? l.logNo : parseInt(String(l.logNo), 10);
      return Number.isFinite(n) ? n : 0;
    })) + 1;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      const s = (log.status || '').toLowerCase();
      if (statusFilter === 'pending' && !s.includes('pending') && !s.includes('waiting')) return false;
      if (statusFilter === 'in_progress' && !s.includes('progress')) return false;
      if (statusFilter === 'resolved' && !s.includes('resolved') && !s.includes('closed')) return false;
      if (!query) return true;
      return [
        log.logNo, log.date, log.resellerName, log.callerPhone, log.requestType,
        log.customerName, log.nmsId, log.issueFound, log.missingWrongDetails,
        log.actionTaken, log.reasonForAction, log.status, log.remarks, log.mac,
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }, [logs, searchTerm, statusFilter]);

  const displayLogs = useMemo(() => {
    const num = (l: LogEntry) => {
      const n = typeof l.logNo === 'number' ? l.logNo : parseInt(String(l.logNo), 10);
      return Number.isFinite(n) ? n : 0;
    };
    return [...filteredLogs].sort((a,b) => num(a)-num(b));
  }, [filteredLogs]);

  const scrollToLog = (id: string) => {
    window.setTimeout(() => document.getElementById(`log-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const handleSaveLog = async (entry: LogEntry, andCreateAnother = false) => {
    try {
      const existing = logs.find(l => l.id === entry.id) || null;
      const saved = await saveLog(entry, user, existing);
      await Promise.all([refreshLogs(), refreshActivity(), refreshSuggestions()]);
      setSelectedLogId(saved.id);
      scrollToLog(saved.id);
      setSearchTerm('');
      setStatusFilter('all');
      showToast(`Log #${saved.logNo} saved`);
      if (!andCreateAnother) {
        setEditingLog(null);
        setCurrentView('sheet');
      }
    } catch (e: any) {
      showToast(e?.message || 'Could not save log');
    }
  };

  const handleEdit = (log: LogEntry) => {
    setEditingLog(log);
    setCurrentView('form');
  };

  const handleDuplicate = (log: LogEntry) => {
    const now = new Date().toISOString();
    setEditingLog({
      ...log,
      id: crypto.randomUUID(),
      logNo: nextLogNo,
      date: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
      createdAt: now,
      updatedAt: now,
      createdBy: user.displayName,
      updatedBy: user.displayName,
      history: [],
    });
    setCurrentView('form');
    showToast(`Duplicated to Log #${nextLogNo}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLog(id, user);
      await Promise.all([refreshLogs(), refreshActivity()]);
      showToast('Log deleted');
    } catch (e: any) {
      showToast(e?.message || 'Could not delete log');
    }
  };

  const handleClearAllLogs = async () => {
    try {
      await clearAllLogs(user);
      await Promise.all([refreshLogs(), refreshActivity()]);
      setSelectedLogId('');
      setCurrentView('sheet');
      showToast('All shared logs cleared');
    } catch (e: any) {
      showToast(e?.message || 'Could not clear logs');
    }
  };

  const handleRestoreBackup = async (importedLogs: LogEntry[], importedSuggestions: FieldSuggestionsMap, merge: boolean) => {
    try {
      const total = await restoreLogs(importedLogs, merge, user);
      await saveSuggestions(importedSuggestions);
      await Promise.all([refreshLogs(), refreshActivity(), refreshSuggestions()]);
      showToast(`Restored ${total} shared logs`);
    } catch (e: any) {
      showToast(e?.message || 'Could not restore backup');
    }
  };

  const handleUpdateSuggestions = async (updated: FieldSuggestionsMap) => {
    try {
      await saveSuggestions(updated);
      setSuggestions(updated);
      showToast('Saved values updated');
    } catch (e: any) {
      showToast(e?.message || 'Could not update saved values');
    }
  };

  const handleImportLocal = async () => {
    try {
      const total = await importLocalBrowserData(user);
      await refreshLogs();
      await refreshActivity();
      showToast(total ? `Imported ${total} local logs into shared storage` : 'No old local logs found');
    } catch (e: any) {
      showToast(e?.message || 'Could not import local data');
    }
  };

  const handleChangePassword = async (password: string) => {
    const { supabase } = await import('./utils/supabase');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    showToast('Password changed');
    setIsPasswordModalOpen(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-500">Loading shared Pace-IT data…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        logsCount={logs.length}
        onOpenSuggestions={() => setIsSuggestionsModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onNewLog={() => { setEditingLog(null); setCurrentView('form'); }}
        onLock={onLock}
        userName={user.displayName}
        onOpenActivity={() => setIsActivityModalOpen(true)}
        onChangePassword={() => setIsPasswordModalOpen(true)}
      />

      <main className="flex-1 w-full p-3 sm:p-4">
        {toastMessage && <div className="fixed bottom-4 right-4 z-50 bg-brand-800 text-white text-xs px-3 py-1.5 rounded shadow-lg">{toastMessage}</div>}

        {currentView === 'form' && (
          <LogForm
            initialData={editingLog}
            nextLogNo={nextLogNo}
            suggestions={suggestions}
            onSave={handleSaveLog}
            onCancel={() => { setEditingLog(null); setCurrentView('sheet'); }}
          />
        )}

        {currentView === 'sheet' && logs.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 text-center py-16 px-4">
            <p className="text-sm text-slate-500 mb-4">No shared logs yet.</p>
            <button onClick={() => { setEditingLog(null); setCurrentView('form'); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-800 hover:bg-brand-900 rounded">
              <Plus className="w-3.5 h-3.5" /> Create the first log
            </button>
          </div>
        )}

        {currentView === 'sheet' && logs.length > 0 && (
          <div>
            <LogsToolbar totalCount={logs.length} filteredLogs={displayLogs} searchTerm={searchTerm}
              onSearchChange={setSearchTerm} statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter} onJumpToLog={scrollToLog} />
            {displayLogs.length > 0 ? (
              <div className="space-y-6">
                {displayLogs.map(log => <LogSheetView key={log.id} log={log} onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete} />)}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 text-center py-16 px-4"><p className="text-sm text-slate-500">No logs match your search or filter.</p></div>
            )}
          </div>
        )}
      </main>

      <SuggestionsModal isOpen={isSuggestionsModalOpen} onClose={() => setIsSuggestionsModalOpen(false)} suggestions={suggestions} onUpdateSuggestions={handleUpdateSuggestions} />
      <ActivityModal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} events={activity} />
      <BackupModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} logs={logs} suggestions={suggestions} onRestore={handleRestoreBackup} onClearAllLogs={handleClearAllLogs} />
      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} currentUser={user} onToast={showToast} onImportLocal={handleImportLocal} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onSave={handleChangePassword} />
    </div>
  );
}
