
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
  return (
    <div className="w-72 lg:w-64 h-full bg-zinc-950 flex flex-col border-r border-zinc-900 z-50 overflow-hidden shadow-2xl lg:shadow-none">
      <div className="pt-[env(safe-area-inset-top)] px-5 py-6 border-b border-zinc-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-green-500/10 border border-green-500/30 rounded flex items-center justify-center">
              <span className="text-green-500 text-[10px] font-black">W</span>
            </div>
            <h2 className="text-[10px] font-black tracking-widest text-zinc-100 uppercase">Worm_Shell</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 text-zinc-600 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        <button 
          onClick={onNewChat}
          className="w-full mb-4 px-3 py-2.5 text-[9px] font-black uppercase tracking-wider bg-green-950/40 text-green-400 border border-green-700/40 hover:bg-green-900/40 hover:border-green-500/60 transition-all rounded-sm flex items-center justify-center gap-2"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + NEW ROOT SHELL
        </button>
        
        <div className="grid grid-cols-1 gap-2">
          {['Deep Search', 'Payload Gen', 'Scan Port'].map(cmd => (
            <button 
              key={cmd}
              onClick={() => onCommandSelect(`[CMD] ${cmd}: Run.`)}
              className="w-full text-left px-3 py-2.5 text-[9px] text-zinc-500 font-bold uppercase border border-zinc-900 hover:border-green-500/20 hover:text-green-400 transition-all rounded-sm bg-black/20"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <div className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mb-3 px-2 flex justify-between items-center">
          <span>Sequences</span>
          <span className="text-zinc-600">{sessions.length}</span>
        </div>
        {sessions.map(s => (
          <div
            key={s.id}
            className={`group w-full flex items-center justify-between p-2.5 text-[9px] font-bold rounded-sm border transition-all ${
              s.id === currentSessionId ? 'bg-zinc-900 border-zinc-800 text-green-500' : 'border-transparent text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <button
              onClick={() => onSelectSession(s.id)}
              className="flex-1 text-left truncate flex items-center gap-2"
            >
              <span className="opacity-30">#</span> {s.title}
            </button>
            {sessions.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-opacity"
                title="Delete Session"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-zinc-900 bg-black pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="h-16 w-full bg-zinc-950/50 border border-zinc-900/50 rounded-sm relative overflow-hidden p-2">
          <div className="text-[7px] text-zinc-800 font-bold uppercase mb-1">Grid_Status</div>
          <div className="flex gap-0.5 mt-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`h-1 flex-1 ${Math.random() > 0.3 ? 'bg-green-500/20' : 'bg-red-500/40'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
