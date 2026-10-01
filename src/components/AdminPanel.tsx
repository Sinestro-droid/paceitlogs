import React, { useEffect, useState } from 'react';
import { X, UserPlus, Shield, KeyRound, UserX, UserCheck, Upload } from 'lucide-react';
import { AppUser, AdminUserSummary } from '../types';
import { changePassword } from '../utils/auth';
import { getAccessToken } from '../utils/cloud';
import { createUserAccount, disableUserAccount, listUsers } from '../utils/cloud';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onToast: (message: string) => void;
  onImportLocal: () => void;
}

export const AdminPanel: React.FC<Props> = ({ isOpen, onClose, currentUser, onToast, onImportLocal }) => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try { setUsers(await listUsers()); } catch (e: any) { setError(e?.message || 'Could not load users.'); }
  };
  useEffect(() => { if (isOpen && currentUser.role === 'admin') load(); }, [isOpen, currentUser.role]);

  if (!isOpen || currentUser.role !== 'admin') return null;

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('New user password must be at least 8 characters.');
    setBusy(true); setError('');
    try {
      const token = await getAccessToken();
      await createUserAccount(token, username, password, displayName || username);
      setUsername(''); setDisplayName(''); setPassword('');
      await load();
      onToast('User account created');
    } catch (e: any) { setError(e?.message || 'Could not create user.'); }
    finally { setBusy(false); }
  };

  const toggle = async (u: AdminUserSummary) => {
    setBusy(true); setError('');
    try {
      const token = await getAccessToken();
      await disableUserAccount(token, u.id, !u.disabled);
      await load();
      onToast(u.disabled ? `${u.username} enabled` : `${u.username} disabled`);
    } catch (e: any) { setError(e?.message || 'Could not update account.'); }
    finally { setBusy(false); }
  };

  const changeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.length < 8) return setError('Admin password must be at least 8 characters.');
    if (adminPassword !== confirm) return setError('Passwords do not match.');
    setBusy(true); setError('');
    try {
      await changePassword(adminPassword);
      setAdminPassword(''); setConfirm('');
      onToast('Admin password changed');
    } catch (e: any) { setError(e?.message || 'Could not change admin password.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="no-print fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand-800" /><h2 className="font-semibold text-slate-900">Administrator</h2></div>
            <p className="text-xs text-slate-500 mt-1">Hidden admin panel · press Esc then T to open</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-900 rounded"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5">{error}</div>}

          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Create colleague account</h3>
            <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="Username / ID" className="h-10 px-3 text-xs border rounded" />
              <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Display name" className="h-10 px-3 text-xs border rounded" />
              <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" minLength={8} placeholder="Initial password" className="h-10 px-3 text-xs border rounded" />
              <button disabled={busy} className="h-10 inline-flex items-center justify-center gap-1.5 bg-brand-800 text-white rounded text-xs font-medium disabled:opacity-60"><UserPlus className="w-3.5 h-3.5" />Create ID</button>
            </form>
            <p className="text-[11px] text-slate-400 mt-2">The colleague logs in with this username and password. They can change their password from the Password button in the top bar.</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Accounts</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_90px_90px] bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500"><span>User</span><span>ID</span><span>Status</span><span></span></div>
              {users.map(u => (
                <div key={u.id} className="grid grid-cols-[1fr_1fr_90px_90px] items-center px-3 py-2.5 border-t border-slate-100 text-xs">
                  <span className="font-medium text-slate-800">{u.displayName}</span>
                  <span className="font-mono text-slate-500">{u.username}</span>
                  <span className={u.disabled ? 'text-rose-600' : 'text-emerald-600'}>{u.disabled ? 'Disabled' : 'Active'}</span>
                  <button disabled={busy || u.id === currentUser.id} onClick={() => toggle(u)} className="justify-self-end inline-flex items-center gap-1 text-[11px] px-2 py-1 border rounded hover:bg-slate-50 disabled:opacity-40">
                    {u.disabled ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}{u.disabled ? 'Enable' : 'Disable'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <form onSubmit={changeAdminPassword} className="border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" />Change admin password</h3>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">The initial administrator password is <b>admin</b>. Change it before using this in production.</p>
              <input value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} type="password" minLength={8} required placeholder="New admin password" className="w-full h-9 px-3 text-xs border rounded mb-2" />
              <input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" minLength={8} required placeholder="Repeat new password" className="w-full h-9 px-3 text-xs border rounded mb-2" />
              <button disabled={busy} className="w-full h-9 bg-slate-900 text-white rounded text-xs">Change admin password</button>
            </form>

            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" />One-time local migration</h3>
              <p className="text-[11px] text-slate-600 mt-1 mb-3">Imports old logs from this browser into the shared database. Use this from the computer that contains the existing data.</p>
              <button onClick={onImportLocal} className="w-full h-9 border border-amber-300 bg-white text-amber-900 rounded text-xs">Import this browser's old logs</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
