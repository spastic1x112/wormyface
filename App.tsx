
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Role, Message, ChatSession, ExecutionLog, PromptConfig } from './types.ts';
import { geminiService } from './services/geminiService.ts';
import Sidebar from './components/Sidebar.tsx';
import TerminalMessage from './components/TerminalMessage.tsx';
import RightTerminal from './components/RightTerminal.tsx';
import ExecutionSandbox from './components/ExecutionSandbox.tsx';
import TerminalInput from './components/TerminalInput.tsx';
import PromptSettings from './components/PromptSettings.tsx';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [activeSandbox, setActiveSandbox] = useState<{ code: string; lang: string } | null>(null);
  const [commandLogs, setCommandLogs] = useState<ExecutionLog[]>([]);
  const [isOverrideActive, setIsOverrideActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<'NONE' | 'SIDEBAR' | 'TELEMETRY'>('NONE');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [promptConfig, setPromptConfig] = useState<PromptConfig>({
    user: 'user',
    host: 'wormai',
    path: '~',
    showTimestamp: false,
    useColor: true
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2800);
    const id = uuidv4();
    setSessions([{
      id,
      title: 'ROOT_SHELL_01',
      messages: [{
        id: uuidv4(),
        role: Role.ASSISTANT,
        content: "## WORM_AI ELITE // CLAMSHELL_MODE\n---\n**Device:** Foldable detected (RAZR_2025)\n**Auth:** Level_04 Verified\n\nI am docked. Vertical scanlines synchronized. Input secured.",
        timestamp: new Date()
      }],
      updatedAt: new Date()
    }]);
    setCurrentSessionId(id);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, isTyping]);

  useEffect(() => {
    geminiService.setOverride(isOverrideActive);
  }, [isOverrideActive]);

  const addLog = (event: string, status: 'SUCCESS' | 'PROCESS' | 'FAILED' = 'PROCESS') => {
    setCommandLogs(prev => [...prev.slice(-12), { id: uuidv4(), event, status, timestamp: new Date() }]);
  };

  const handleNewSession = () => {
    const id = uuidv4();
    const newSession: ChatSession = {
      id,
      title: `ROOT_SHELL_${String(sessions.length + 1).padStart(2, '0')}`,
      messages: [{
        id: uuidv4(),
        role: Role.ASSISTANT,
        content: `## WORM_AI ELITE // INITIALIZED\n---\n**Session:** ROOT_SHELL_${String(sessions.length + 1).padStart(2, '0')}\n**Status:** Online\n\nTerminal uplink established. Enter your prompt or run commands below.`,
        timestamp: new Date()
      }],
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(id);
    addLog(`INIT_SHELL_${sessions.length + 1}`, 'SUCCESS');
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleArchiveSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isArchived: !s.isArchived } : s));
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || !currentSession) return;
    addLog(`EXEC: ${text.substring(0, 15)}`, "PROCESS");

    const userMsg: Message = { id: uuidv4(), role: Role.USER, content: text, timestamp: new Date() };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg], updatedAt: new Date() } : s));
    
    setIsTyping(true);
    const assistantId = uuidv4();
    let content = '';

    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, { id: assistantId, role: Role.ASSISTANT, content: '', timestamp: new Date() }] } : s));

    try {
      const chatHistory = currentSession.messages.map(m => ({ role: m.role, parts: m.content }));
      const stream = geminiService.streamChat(text, chatHistory);
      for await (const chunk of stream) {
        content += chunk;
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: s.messages.map(m => m.id === assistantId ? { ...m, content } : m) } : s));
      }
      addLog("TRANS_SUCCESS", "SUCCESS");
    } catch (e: any) {
      addLog("TRANS_ERROR", "FAILED");
      const errDetail = e?.message || "Execution error encountered";
      setSessions(prev => prev.map(s => s.id === currentSessionId ? {
        ...s,
        messages: s.messages.map(m => m.id === assistantId ? {
          ...m,
          content: `[ERR_SYS_FAULT]: ${errDetail}\n\n*If using AI generation, please verify that GEMINI_API_KEY is configured in project settings.*`
        } : m)
      } : s));
    } finally { setIsTyping(false); }
  };

  const renderPromptPrefix = () => {
    const user = isOverrideActive ? 'root' : promptConfig.user;
    const host = promptConfig.host;
    const path = promptConfig.path;
    const symbol = isOverrideActive ? '#' : '$';
    
    return (
      <div className={`flex items-center gap-1.5 text-[10px] font-mono shrink-0 whitespace-nowrap`}>
        {promptConfig.showTimestamp && (
          <span className="text-zinc-600 mr-1">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
        )}
        <span className={`${isOverrideActive ? 'text-red-500' : 'text-green-500'} font-bold`}>{user}@{host}</span>
        <span className="text-zinc-500">:</span>
        <span className={`${isOverrideActive ? 'text-red-400' : 'text-blue-500'} font-bold`}>{path}</span>
        <span className={`${isOverrideActive ? 'text-red-600' : 'text-zinc-100'} font-bold`}>{symbol}</span>
      </div>
    );
  };

  if (isBooting) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono text-green-500 px-8">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex justify-between text-[10px] font-bold opacity-50">
            <span>BOOT_V4.0</span>
            <span>RAZR_LINK_INIT</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs animate-pulse">&gt; CALIBRATING_FOLD_SENSORS...</p>
            <p className="text-[10px] opacity-70">&gt; [OK] OLED_SYNC_READY</p>
            <p className="text-[10px] opacity-70">&gt; [OK] ENCRYPTION_GATES_OPEN</p>
          </div>
          <div className="h-0.5 w-full bg-zinc-900 overflow-hidden">
            <div className="h-full bg-green-500 animate-[progress_2.5s_ease-in-out]"></div>
          </div>
        </div>
        <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  return (
    <div className={`flex h-[100dvh] w-full bg-transparent transition-colors duration-1000 ${isOverrideActive ? 'selection:bg-red-500/30' : 'selection:bg-green-500/30'}`}>
      
      {/* Sidebar - Desktop or Mobile Drawer */}
      <div className={`
        ${mobileMenu === 'SIDEBAR' ? 'fixed inset-0 z-50 translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0 lg:block transition-transform duration-300 ease-in-out
      `}>
        <Sidebar 
          sessions={sessions} 
          currentSessionId={currentSessionId} 
          onSelectSession={(id) => { setCurrentSessionId(id); setMobileMenu('NONE'); }} 
          onNewChat={handleNewSession}
          onDeleteSession={(id) => setSessions(s => s.filter(x => x.id !== id))}
          onRenameSession={handleRenameSession}
          onArchiveSession={handleArchiveSession}
          onCommandSelect={(cmd) => { sendMessage(cmd); setMobileMenu('NONE'); }}
          onClose={() => setMobileMenu('NONE')}
        />
      </div>

      <main className="flex-1 flex flex-col glass-panel relative border-x border-zinc-900/40 overflow-hidden">
        {/* Optimized Razr Header */}
        <header className="pt-[env(safe-area-inset-top)] h-auto flex flex-col border-b border-zinc-800/30 bg-black/40">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenu('SIDEBAR')} className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-green-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div className="flex flex-col">
                <h1 className={`text-[10px] font-black tracking-widest uppercase ${isOverrideActive ? 'text-red-500' : 'text-green-500'}`}>
                  WormAI_Elite
                </h1>
                <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-tighter">RAZR_ENCRYPTED_MODE</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-zinc-600 hover:text-white transition-colors"
                title="Customize Prompt"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9m3 10H5m11-6H3m14 6h4M3 7h2m6 10h2"/></svg>
              </button>
              <button 
                onClick={() => setIsOverrideActive(!isOverrideActive)}
                className={`px-2 py-1 border text-[8px] font-bold transition-all ${isOverrideActive ? 'bg-red-500 border-red-400 text-black shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'border-zinc-800 text-zinc-500'}`}
              >
                {isOverrideActive ? 'UNLOCKED' : 'BYPASS'}
              </button>
              <button onClick={() => setMobileMenu('TELEMETRY')} className="lg:hidden p-2 text-zinc-500 hover:text-blue-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </button>
            </div>
          </div>
        </header>

        {/* Message Area with Razr-Aware Padding */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            {currentSession?.messages.map(m => (
              <TerminalMessage key={m.id} message={m} onRunCode={(c, l) => setActiveSandbox({code: c, lang: l})} isOverride={isOverrideActive} />
            ))}
            {isTyping && <div className={`text-[9px] px-2 animate-pulse font-bold ${isOverrideActive ? 'text-red-500' : 'text-green-500/40'}`}>[ANALYZING_FREQUENCIES...]</div>}
          </div>
        </div>

        {/* Reachable Input Area */}
        <div className="p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-black/60 border-t border-zinc-900/50">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); setInputValue(''); }}
            className={`max-w-3xl mx-auto flex items-center bg-zinc-950 border ${isOverrideActive ? 'border-red-900/50' : 'border-zinc-800'} focus-within:border-green-500/30 transition-all rounded-sm overflow-hidden`}
          >
            <div className="pl-3 shrink-0">
              {renderPromptPrefix()}
            </div>
            <TerminalInput 
              value={inputValue} 
              onChange={setInputValue} 
              onSubmit={() => { sendMessage(inputValue); setInputValue(''); }}
              placeholder={isOverrideActive ? "System intent..." : "Analyze..."}
              theme={isOverrideActive ? 'red' : 'green'}
            />
          </form>
          <div className="flex justify-between mt-2 px-1 text-[7px] text-zinc-700 font-bold uppercase tracking-widest">
            <span>NODE: RAZR_01</span>
            <span>V4.0.25</span>
          </div>
        </div>
      </main>

      {/* Telemetry - Desktop Sidebar or Mobile Full Overlay */}
      <div className={`
        ${mobileMenu === 'TELEMETRY' ? 'fixed inset-0 z-50 flex' : 'hidden'} 
        lg:relative lg:flex lg:z-0 transition-all duration-300
      `}>
        <RightTerminal 
          externalLogs={commandLogs} 
          isOverride={isOverrideActive} 
          onClose={() => setMobileMenu('NONE')}
        />
      </div>

      {activeSandbox && <ExecutionSandbox code={activeSandbox.code} language={activeSandbox.lang} onClose={() => setActiveSandbox(null)} />}
      
      {isSettingsOpen && (
        <PromptSettings 
          config={promptConfig} 
          onChange={setPromptConfig} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {/* Backdrop for mobile menus */}
      {mobileMenu !== 'NONE' && (
        <div onClick={() => setMobileMenu('NONE')} className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity animate-in fade-in"></div>
      )}
    </div>
  );
};

export default App;
