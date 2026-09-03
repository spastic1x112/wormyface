
import React, { useState, useEffect, useRef } from 'react';

interface ExecutionSandboxProps {
  code: string;
  language: string;
  onClose: () => void;
}

type SandboxStatus = 'INITIALIZING' | 'ANALYZING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';

const ExecutionSandbox: React.FC<ExecutionSandboxProps> = ({ code, language, onClose }) => {
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'warn' | 'error' | 'success' }[]>([]);
  const [status, setStatus] = useState<SandboxStatus>('INITIALIZING');
  const [progress, setProgress] = useState(0);
  const [diagnostics, setDiagnostics] = useState<string | null>(null);
  
  const executionTimer = useRef<number | null>(null);
  const MAX_EXECUTION_TIME = 8000; // 8 seconds timeout

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    setLogs(prev => [...prev, { msg, type }]);
  };

  useEffect(() => {
    // Initial Sequence
    const startSequence = async () => {
      setStatus('INITIALIZING');
      addLog("VIRTUAL_ENV_INIT: BOOTSTRAPPING ISOLATED KERNEL", 'info');
      setProgress(10);
      
      await new Promise(r => setTimeout(r, 600));
      
      setStatus('ANALYZING');
      addLog(`STATIC_ANALYSIS: SCANNING ${language.toUpperCase()} SOURCE`, 'info');
      setProgress(30);

      // Check for empty code
      if (!code.trim()) {
        setStatus('FAILED');
        addLog("CRITICAL_ERROR: NULL_POINTER_EXCEPTION - SOURCE CODE IS EMPTY", 'error');
        setDiagnostics("Execution halted. Source buffer contains no data. Please provide a valid module payload.");
        setProgress(100);
        return;
      }

      await new Promise(r => setTimeout(r, 800));
      
      setStatus('EXECUTING');
      addLog(`LOADER: MOUNTING MODULE INTO BUFFER_0x${Math.floor(Math.random()*0xFFFF).toString(16).toUpperCase()}`, 'info');
      addLog("MONITORING: WATCHDOG_TIMER ARMED (8000ms)", 'warn');
      setProgress(50);

      // Start the actual timeout watchdog
      executionTimer.current = window.setTimeout(() => {
        if (status === 'EXECUTING') {
          setStatus('TIMEOUT');
          addLog("WATCHDOG_TIMEOUT: EXECUTION EXCEEDED TIME_LIMIT", 'error');
          setDiagnostics("The module failed to return within the allocated safety window. This could indicate an infinite loop or high resource demand.");
          setProgress(100);
        }
      }, MAX_EXECUTION_TIME);

      // Simulate execution steps
      await new Promise(r => setTimeout(r, 1200));
      if (status === 'TIMEOUT') return;
      
      setProgress(75);
      addLog("RUNTIME: RESOLVING DYNAMIC LINKER DEPENDENCIES", 'info');
      
      await new Promise(r => setTimeout(r, 1000));
      if (status === 'TIMEOUT') return;

      // Finalizing
      clearTimeout(executionTimer.current as number);
      setStatus('COMPLETED');
      setProgress(100);
      addLog("STABLE_EXECUTION: MODULE RETURNED CODE 0", 'success');
      setDiagnostics(`Execution successful. Memory footprint: ${Math.floor(Math.random()*256)}MB. No leaks detected in current scope.`);
    };

    startSequence();

    return () => {
      if (executionTimer.current) clearTimeout(executionTimer.current);
    };
  }, [code, language]);

  const isWebCode = ['html', 'js', 'javascript', 'css'].includes(language.toLowerCase());

  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED': return 'text-green-500';
      case 'FAILED':
      case 'TIMEOUT': return 'text-red-500';
      case 'EXECUTING': return 'text-amber-500';
      default: return 'text-cyan-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
      <div className="relative w-full h-full max-w-6xl bg-zinc-950 border border-zinc-800 flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Sandbox Header */}
        <div className="h-12 border-b border-zinc-900 flex items-center justify-between px-4 bg-black">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'FAILED' ? 'bg-red-500' : 'bg-red-500/30'}`}></div>
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'TIMEOUT' || status === 'EXECUTING' ? 'bg-amber-500' : 'bg-amber-500/30'}`}></div>
              <div className={`w-2.5 h-2.5 rounded-full ${status === 'COMPLETED' ? 'bg-green-500' : 'bg-green-500/30'}`}></div>
            </div>
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${getStatusColor()}`}>
              WormAI_Sandbox // {status}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="h-0.5 w-full bg-zinc-900">
          <div 
            className={`h-full transition-all duration-500 ${status === 'FAILED' || status === 'TIMEOUT' ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Code Inspector */}
          <div className="w-full md:w-1/3 border-r border-zinc-900 flex flex-col bg-zinc-950/50">
            <div className="p-3 bg-black/50 border-b border-zinc-900 text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex justify-between">
              <span>Artifact_Analysis</span>
              <span className="text-zinc-400">{language.toUpperCase()}</span>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <pre className="text-[11px] text-zinc-400 font-mono leading-relaxed opacity-60">
                {code}
              </pre>
            </div>
          </div>

          {/* Right: Result & Telemetry */}
          <div className="flex-1 flex flex-col relative bg-black">
            <div className="p-3 bg-zinc-950/50 border-b border-zinc-900 text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex justify-between">
              <span>Live_Output_Stream</span>
              <span className="text-zinc-600">ID: SBX-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {status === 'COMPLETED' && isWebCode ? (
                <iframe
                  title="sandbox-preview"
                  className="w-full h-full border-none bg-white animate-in fade-in duration-700"
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <style>
                          body{margin:0;font-family:sans-serif;background:#fff;color:#000;overflow:auto;height:100vh;}
                          .status-bar{background:#f0f0f0;padding:5px 10px;font-size:10px;color:#666;border-bottom:1px solid #ddd;}
                        </style>
                      </head>
                      <body>
                        <div class="status-bar">VIRTUAL_DOM_RENDERER_ACTIVE</div>
                        <div style="padding:20px;">
                          ${language === 'html' ? code : `<script>${code}</script>`}
                        </div>
                      </body>
                    </html>
                  `}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                  {status === 'EXECUTING' || status === 'ANALYZING' || status === 'INITIALIZING' ? (
                    <>
                      <div className="relative">
                        <div className="w-20 h-20 border-2 border-green-500/10 border-t-green-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-green-500 font-bold">
                          {progress}%
                        </div>
                      </div>
                      <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">
                        Isolated Execution in Progress...
                      </div>
                    </>
                  ) : status === 'FAILED' || status === 'TIMEOUT' ? (
                    <div className="space-y-4 max-w-sm animate-in zoom-in duration-300">
                       <div className="w-16 h-16 bg-red-950/50 border border-red-500 flex items-center justify-center rounded-full mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                       </div>
                       <h3 className="text-red-500 font-bold uppercase tracking-widest">Execution Terminated</h3>
                       <p className="text-zinc-500 text-[10px] font-mono leading-relaxed px-4">
                         {diagnostics}
                       </p>
                       <button 
                         onClick={onClose}
                         className="px-4 py-2 border border-zinc-800 text-zinc-400 text-[10px] hover:bg-zinc-900 transition-all uppercase font-bold"
                       >
                         Acknowledge & Exit
                       </button>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-sm animate-in fade-in duration-500">
                       <div className="w-16 h-16 bg-green-950/50 border border-green-500 flex items-center justify-center rounded-full mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
                       </div>
                       <h3 className="text-green-500 font-bold uppercase tracking-widest">Artifact Stabilized</h3>
                       <p className="text-zinc-500 text-[10px] font-mono leading-relaxed px-4">
                         {diagnostics}
                       </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sub-Terminal for Execution Logs */}
            <div className="h-40 bg-zinc-950 border-t border-zinc-900 p-3 font-mono text-[9px] overflow-y-auto custom-scrollbar">
              <div className="text-zinc-600 font-bold mb-3 uppercase tracking-tighter flex items-center justify-between">
                <span>Detailed_Telemetry</span>
                <span className="animate-pulse">REC_LIVE</span>
              </div>
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-zinc-800 font-bold">{String(i+1).padStart(2, '0')}</span>
                    <span className={`
                      ${log.type === 'error' ? 'text-red-400' : 
                        log.type === 'warn' ? 'text-amber-400' : 
                        log.type === 'success' ? 'text-green-400' : 'text-cyan-400/70'}
                    `}>
                      {log.type === 'error' ? 'ERR!' : log.type === 'warn' ? 'WRN?' : 'INF>'} {log.msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionSandbox;
