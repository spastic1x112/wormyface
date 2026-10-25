
import React from 'react';
import { ChatSession } from '../types.ts';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onArchiveSession: (id: string) => void;
  onCommandSelect: (cmd: string) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  onCommandSelect,
  onClose
}) => {
  const quickActions = [
    { label: 'Reverse Shell', cmd: 'Generate a stealthy Python and Bash reverse shell one-liner with encryption.' },
    { label: 'CVE Analysis', cmd: 'Analyze recent high-severity 0-day CVE vulnerabilities and mitigation vectors.' },
    { label: 'Port Recon', cmd: 'Generate advanced nmap stealth scanning parameters for firewalled subnets.' },
    { label: 'SQLi Auditor', cmd: 'Audit web endpoint for SQL injection vulnerabilities and craft test payloads.' },
    { label: 'PrivEsc Checklist', cmd: 'Generate a Linux local privilege escalation enumeration checklist.' }
  ];

  return (
    <aside className="w-64 h-full bg-zinc-950 flex flex-col border-r border-zinc-900 z-40 overflow-hidden select-none shrink-0">
      {/* Top Header */}
      <div className="px-4 py-4 border-b border-zinc-900 bg-zinc-950/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-red-950/40 border border-red-500/40 rounded flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.2)]">
              <span className="text-red-500 text-xs font-black">W</span>
            </div>
            <div>
              <h2 className="text-xs font-black tracking-wider text-zinc-100 uppercase">WormGPT</h2>
              <p className="text-[8px] text-zinc-500 font-mono tracking-tight uppercase">v2.4 // WORKSTATION</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 text-zinc-500 hover:text-white rounded border border-zinc-800 hover:border-zinc-700 transition-colors"
              title="Close Navigation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        <button 
          onClick={onNewChat}
          className="w-full px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider bg-red-950/30 text-red-400 border border-red-800/40 hover:bg-red-900/40 hover:border-red-500/60 hover:text-red-300 transition-all rounded flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          NEW TTY SESSION
        </button>
      </div>

      {/* Quick Tactical Scripts */}
      <div className="px-3 py-3 border-b border-zinc-900 bg-black/30">
        <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
          <span>TACTICAL PAYLOADS</span>
          <span className="text-[7px] text-red-500/70">HOTKEYS</span>
        </div>
        <div className="space-y-1">
          {quickActions.map(action => (
            <button 
              key={action.label}
              onClick={() => onCommandSelect(action.cmd)}
              className="w-full text-left px-2.5 py-1.5 text-[9px] text-zinc-400 font-mono font-medium border border-zinc-900/80 hover:border-red-500/30 hover:bg-red-950/20 hover:text-red-300 transition-all rounded flex items-center justify-between group"
            >
              <span className="truncate">{action.label}</span>
              <span className="opacity-0 group-hover:opacity-100 text-red-400 text-[8px] transition-opacity">&gt;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shell Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider mb-2 px-1 flex justify-between items-center">
          <span>ACTIVE SHELLS</span>
          <span className="text-zinc-500 font-mono">{sessions.length} TTY</span>
        </div>
        {sessions.map(s => {
          const isActive = s.id === currentSessionId;
          return (
            <div
              key={s.id}
              className={`group w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-mono rounded border transition-all ${
                isActive 
                  ? 'bg-zinc-900 border-zinc-800 text-green-400 font-semibold shadow-inner' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
              }`}
            >
              <button
                onClick={() => onSelectSession(s.id)}
                className="flex-1 text-left truncate flex items-center gap-2"
                title={s.title}
              >
                <span className={`text-[8px] ${isActive ? 'text-green-500' : 'text-zinc-600'}`}>
                  {isActive ? '●' : '○'}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                  title="Close session"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Laptop Workstation Diagnostics Footer */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-950 font-mono text-[9px]">
        <div className="bg-black/60 border border-zinc-900 rounded p-2.5 space-y-1.5">
          <div className="flex justify-between items-center text-zinc-400 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              STATION_ONLINE
            </span>
            <span className="text-[8px] text-zinc-600">x86_64</span>
          </div>
          <div className="text-[8px] text-zinc-600 flex justify-between">
            <span>UPTIME: 99.98%</span>
            <span>TTY: /dev/pts/0</span>
          </div>
          <div className="h-1 w-full bg-zinc-900 rounded overflow-hidden flex">
            <div className="h-full bg-red-600 w-1/3"></div>
            <div className="h-full bg-amber-500 w-1/4"></div>
            <div className="h-full bg-green-500 w-5/12"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
