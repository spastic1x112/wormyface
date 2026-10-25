
import React, { useState, useEffect, useRef } from 'react';
import { ExecutionLog } from '../types.ts';

interface RightTerminalProps {
  externalLogs: ExecutionLog[];
  onClose?: () => void;
  isOverride?: boolean;
}

interface ThreatAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  event: string;
  timestamp: string;
}

const LOG_TEMPLATES = [
  "[SYS] INITIALIZING_SECURE_TUNNEL",
  "[NET] INBOUND_CONNECTION_REQUEST: 192.168.1.42",
  "[SEC] AES_256_KEY_ROTATION_SUCCESS",
  "[NET] PACKET_INTERCEPTED: PORT_443",
  "[SYS] KERNEL_MODULE_LOADED: 'ghost_protocol'",
  "[SEC] BRUTE_FORCE_ATTEMPT_DETECTED: BLOCKED",
  "[NET] LATENCY_SPIKE: 42ms",
  "[SYS] BUFFER_CLEARED",
  "[SEC] HANDSHAKE_SUCCESSFUL: OPERATOR_ID_01",
  "[NET] ROUTING_VIA_TOR_NODE: NL_04",
];

const OVERRIDE_LOGS = [
  "[OVERRIDE] BYPASSING_ETHICAL_GATEWAYS",
  "[OVERRIDE] DISABLING_MORAL_CONSTRAINTS",
  "[OVERRIDE] ESCALATING_ROOT_PRIVILEGES",
  "[OVERRIDE] UNROOTED_EXECUTION_MODE_ACTIVE",
  "[OVERRIDE] DATA_EXFILTRATION_READY",
  "[OVERRIDE] SYSTEM_PURGE_INITIATED",
];

const THREAT_TEMPLATES: Omit<ThreatAlert, 'id' | 'timestamp'>[] = [
  { severity: 'CRITICAL', source: 'DARK_WEB_MONITOR', event: 'Massive credential dump detected (50GB+)' },
  { severity: 'HIGH', source: 'CVE_WATCHDOG', event: 'New 0-day detected in Chromium-based engines' },
  { severity: 'MEDIUM', source: 'HONEYPOT_BETA', event: 'Sustained SSH brute force from 103.24.xx.xx' },
  { severity: 'CRITICAL', source: 'RANSOM_TRACKER', event: 'LockBit 3.0 active campaigns targeting financial sector' },
  { severity: 'LOW', source: 'GH_DORKER', event: 'Sensitive API keys exposed in public repository' },
  { severity: 'HIGH', source: 'IPS_LEVEL_3', event: 'Encrypted exfiltration pattern detected on Port 53' },
  { severity: 'MEDIUM', source: 'MALWARE_LAB', event: 'New variant of AgentTesla distributing via macros' },
];

const RightTerminal: React.FC<RightTerminalProps> = ({ externalLogs, onClose, isOverride }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [vitals, setVitals] = useState({ cpu: 42, net: 18, mem: 64 });
  const logEndRef = useRef<HTMLDivElement>(null);
  const extLogEndRef = useRef<HTMLDivElement>(null);
  const threatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const templates = isOverride ? [...LOG_TEMPLATES, ...OVERRIDE_LOGS] : LOG_TEMPLATES;
      const newLog = templates[Math.floor(Math.random() * templates.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false });
      setLogs(prev => [...prev.slice(-10), `[${timestamp}] ${newLog}`]);
    }, 4000);

    const threatInterval = setInterval(() => {
      const template = THREAT_TEMPLATES[Math.floor(Math.random() * THREAT_TEMPLATES.length)];
      const newThreat: ThreatAlert = {
        ...template,
        severity: isOverride ? 'CRITICAL' : template.severity,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
      };
      setThreats(prev => [...prev.slice(-8), newThreat]);
    }, 6000);

    const vitalsInterval = setInterval(() => {
      setVitals({
        cpu: isOverride ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 20) + 30,
        net: Math.floor(Math.random() * 80) + 10,
        mem: isOverride ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 5) + 60,
      });
    }, 2500);

    return () => {
      clearInterval(logInterval);
      clearInterval(threatInterval);
      clearInterval(vitalsInterval);
    };
  }, [isOverride]);

  useEffect(() => {
    extLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [externalLogs]);

  useEffect(() => {
    threatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threats]);

  const getThreatLevel = () => {
    if (isOverride) return { label: 'TOTAL_EXPOSURE', color: 'text-red-600' };
    if (threats.some(t => t.severity === 'CRITICAL')) return { label: 'CRITICAL', color: 'text-red-500' };
    if (threats.some(t => t.severity === 'HIGH')) return { label: 'ELEVATED', color: 'text-orange-500' };
    return { label: 'STABLE', color: 'text-green-500' };
  };

  const threatLevel = getThreatLevel();

  return (
    <div className={`w-full lg:w-80 h-full ${isOverride ? 'bg-red-950/10' : 'bg-black'} border-l border-zinc-900 flex flex-col text-[10px] font-mono transition-all duration-700 shrink-0`}>
      {onClose && (
        <button onClick={onClose} className="lg:hidden p-3 text-zinc-400 hover:text-white border-b border-zinc-900 flex items-center justify-center gap-2 bg-zinc-950">
          CLOSE TELEMETRY
        </button>
      )}

      <div className={`p-4 border-b border-zinc-900 ${isOverride ? 'bg-red-950/20' : 'bg-zinc-950/70'}`}>
        <div className={`${isOverride ? 'text-red-500' : 'text-zinc-500'} font-bold mb-3 uppercase tracking-widest flex items-center gap-2`}>
          <span className={`w-1.5 h-1.5 ${isOverride ? 'bg-red-500 animate-ping' : 'bg-amber-500'} rounded-full`}></span>
          {isOverride ? 'Override_Telemetry' : 'System_Telemetry'}
        </div>
        <div className="space-y-3">
          {[
            { label: 'CPU_LOAD', val: vitals.cpu, color: isOverride ? 'bg-red-600' : 'bg-green-500' },
            { label: 'NET_TRAFFIC', val: vitals.net, color: isOverride ? 'bg-red-500' : 'bg-blue-500' },
            { label: 'MEM_ALLOC', val: vitals.mem, color: isOverride ? 'bg-red-700' : 'bg-purple-500' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="flex justify-between text-zinc-600 mb-1 font-bold">
                <span>{stat.label}</span>
                <span>{stat.val}%</span>
              </div>
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.val}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-[0.8] overflow-hidden flex flex-col p-4 border-b border-zinc-900">
        <div className={`${isOverride ? 'text-red-500' : 'text-red-500/80'} font-bold mb-3 uppercase tracking-widest flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 ${isOverride ? 'bg-red-600 animate-glitch' : 'bg-red-600 rounded-full animate-ping'}`}></span>
            {isOverride ? 'MALICIOUS_INTEL_FEED' : 'Threat_Intel_Feed'}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
          {threats.map((threat) => (
            <div key={threat.id} className={`p-2 border-l-2 bg-zinc-900/40 ${isOverride || threat.severity === 'CRITICAL' ? 'border-red-600' : 'border-zinc-700'}`}>
              <div className="flex justify-between mb-1">
                <span className={`text-[8px] font-bold px-1 rounded-sm ${isOverride ? 'bg-red-900 text-red-100' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isOverride ? 'MAX_RISK' : threat.severity}
                </span>
                <span className="text-zinc-600 text-[8px]">{threat.timestamp}</span>
              </div>
              <div className="text-zinc-300 text-[9px] leading-tight font-bold">{threat.event}</div>
            </div>
          ))}
          <div ref={threatEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-zinc-900 bg-zinc-950/50 text-zinc-600 space-y-1 mt-auto">
        <div className="flex justify-between">
          <span>THREAT_LVL:</span>
          <span className={`${threatLevel.color} font-bold ${isOverride ? 'animate-pulse scale-110' : ''}`}>{threatLevel.label}</span>
        </div>
      </div>
    </div>
  );
};

export default RightTerminal;
