
import React from 'react';
import { PromptConfig } from '../types.ts';

interface PromptSettingsProps {
  config: PromptConfig;
  onChange: (config: PromptConfig) => void;
  onClose: () => void;
}

const PromptSettings: React.FC<PromptSettingsProps> = ({ config, onChange, onClose }) => {
  const handleChange = (key: keyof PromptConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-zinc-900 bg-black flex justify-between items-center">
          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-100 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9m3 10H5m11-6H3m14 6h4M3 7h2m6 10h2"/></svg>
            Prompt_Config
          </h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-white p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Preview</label>
            <div className="bg-black p-3 rounded-sm border border-zinc-900 font-mono text-[11px] flex items-center gap-1.5">
              <span className="text-green-500 font-bold">{config.user}@{config.host}</span>
              <span className="text-zinc-400">:</span>
              <span className="text-blue-500 font-bold">{config.path}</span>
              <span className="text-zinc-100 font-bold">$</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">User_ID</label>
              <input 
                type="text" 
                value={config.user} 
                onChange={(e) => handleChange('user', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-2 text-[11px] font-mono text-zinc-200 outline-none focus:border-green-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Host_Name</label>
              <input 
                type="text" 
                value={config.host} 
                onChange={(e) => handleChange('host', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-2 text-[11px] font-mono text-zinc-200 outline-none focus:border-green-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Virtual_Path</label>
            <input 
              type="text" 
              value={config.path} 
              onChange={(e) => handleChange('path', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-2 text-[11px] font-mono text-zinc-200 outline-none focus:border-green-500/50"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="showTime"
                checked={config.showTimestamp}
                onChange={(e) => handleChange('showTimestamp', e.target.checked)}
                className="accent-green-500"
              />
              <label htmlFor="showTime" className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Show Timestamp</label>
            </div>
            <button 
              onClick={onClose}
              className="bg-green-600 hover:bg-green-500 text-black text-[9px] font-black uppercase px-4 py-2 transition-all"
            >
              Commit_Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptSettings;
