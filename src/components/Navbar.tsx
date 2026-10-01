import React from 'react';
import { Plus, Layers, Database, HardDrive, Lock, History, User } from 'lucide-react';

interface NavbarProps {
  currentView: 'sheet' | 'form';
  onNavigate: (view: 'sheet' | 'form') => void;
  logsCount: number;
  onOpenSuggestions: () => void;
  onOpenBackup: () => void;
  onNewLog: () => void;
  onLock?: () => void;
  userName?: string;
  onOpenActivity?: () => void;
  onChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  logsCount,
  onOpenSuggestions,
  onOpenBackup,
  onNewLog,
  onLock,
  userName,
  onOpenActivity,
  onChangePassword,
}) => {
  return (
    <header className="no-print bg-brand-800 border-b border-brand-900">
      <div className="w-full px-3 sm:px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('sheet')}
            className="flex items-center gap-2 text-left"
          >
            <span className="text-base font-bold tracking-tight text-white">
              Pace-IT
            </span>
            <span className="text-[11px] text-brand-200 font-mono hidden sm:inline">
              / Reseller Log System
            </span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('sheet')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              currentView === 'sheet'
                ? 'bg-white/15 text-white'
                : 'text-brand-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Logs</span>
            <span className="text-[10px] text-brand-200 font-mono">
              ({logsCount})
            </span>
          </button>

          <button
            onClick={onOpenSuggestions}
            className="px-3 py-1.5 text-xs font-medium rounded text-brand-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            title="Manage saved field suggestions"
          >
            <Database className="w-3.5 h-3.5 text-brand-300" />
            <span>Saved Values</span>
          </button>

          {onOpenActivity && (
            <button
              onClick={onOpenActivity}
              className="px-3 py-1.5 text-xs font-medium rounded text-brand-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              title="See who changed what"
            >
              <History className="w-3.5 h-3.5 text-brand-300" />
              <span>Activity</span>
            </button>
          )}

          <button
            onClick={onOpenBackup}
            className="px-3 py-1.5 text-xs font-medium rounded text-brand-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            title="Backup and restore data"
          >
            <HardDrive className="w-3.5 h-3.5 text-brand-300" />
            <span>Backup & Data</span>
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {userName && (
            <span
              className="hidden md:inline-flex items-center gap-1.5 px-2 text-xs text-brand-100 max-w-[180px]"
              title={`Signed in as ${userName}`}
            >
              <User className="w-3.5 h-3.5 text-brand-300 shrink-0" />
              <span className="truncate">{userName}</span>
            </span>
          )}

          {onChangePassword && (
            <button
              onClick={onChangePassword}
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-brand-100 hover:text-white hover:bg-white/10 rounded"
              title="Change your password"
            >
              Password
            </button>
          )}

          {onLock && (
            <button
              onClick={onLock}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-100 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Lock the app"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          )}
          <button
            onClick={onNewLog}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-800 bg-white hover:bg-brand-50 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
