
import React, { useRef, useEffect, useState } from 'react';
import { geminiService } from '../services/geminiService.ts';
import { Message } from '../types.ts';

interface TerminalInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  sessionMessages?: Message[];
  theme?: 'green' | 'red';
}

const TerminalInput: React.FC<TerminalInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled, 
  placeholder,
  sessionMessages = [],
  theme = 'green'
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const isRed = theme === 'red';

  // Sync scroll between input and backdrop
  const handleScroll = () => {
    if (inputRef.current && backdropRef.current) {
      backdropRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  const fetchSuggestions = async (val: string) => {
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    const context = sessionMessages.slice(-3).map(m => m.content).join('\n');
    const results = await geminiService.getCommandSuggestions(val, context);
    
    setSuggestions(results);
    setSelectedIndex(0);
    if (results.length > 0) setShowPopup(true);
  };

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    
    if (value.trim()) {
      timeoutRef.current = window.setTimeout(() => {
        fetchSuggestions(value);
      }, 600);
    } else {
      setSuggestions([]);
      setShowPopup(false);
    }
  }, [value]);

  const highlightText = (text: string) => {
    if (!text) return <span className="text-zinc-700">{placeholder}</span>;

    const tokens = text.split(/(\s+)/);
    
    return tokens.map((token, i) => {
      if (token.startsWith('#')) return <span key={i} className="text-zinc-600 italic">{token}</span>;
      
      const cmdColor = isRed ? 'text-red-500' : 'text-green-500';
      const cmdShadow = isRed ? 'drop-shadow-[0_0_2px_rgba(239,68,68,0.6)]' : 'drop-shadow-[0_0_2px_rgba(34,197,94,0.4)]';

      if (/^(recon|exploit|phish|analyze|bypass|sudo|curl|wget|nmap|run|exec|python|bash|ssh|ping|dig|whois|metasploit|msfconsole|wireshark|tcpdump|grep|cat|ls|chmod|chown|nc|netcat|revshell)$/i.test(token)) {
        return <span key={i} className={`${cmdColor} font-bold ${cmdShadow}`}>{token}</span>;
      }
      if (/^-{1,2}[a-z0-9-]+/i.test(token)) return <span key={i} className={isRed ? 'text-red-400' : 'text-amber-500'}>{token}</span>;
      if (/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/.test(token)) {
        return <span key={i} className={`${isRed ? 'text-red-400' : 'text-blue-400'} font-bold underline decoration-zinc-800`}>{token}</span>;
      }
      if (/^https?:\/\/\S+/.test(token)) return <span key={i} className={`${isRed ? 'text-red-300' : 'text-blue-300'} underline decoration-zinc-800 italic`}>{token}</span>;
      
      return <span key={i} className="text-zinc-200">{token}</span>;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (suggestions.length > 0 && showPopup) {
        e.preventDefault();
        onChange(suggestions[selectedIndex]);
        setShowPopup(false);
      }
    } else if (e.key === 'ArrowDown') {
      if (showPopup) {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      if (showPopup) {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Escape') {
      setShowPopup(false);
    } else if (e.key === 'Enter') {
      setShowPopup(false);
      onSubmit(e);
    }
  };

  const getGhostText = () => {
    if (!suggestions.length || !showPopup) return "";
    const selected = suggestions[selectedIndex];
    if (selected.toLowerCase().startsWith(value.toLowerCase())) {
      return selected.slice(value.length);
    }
    return "";
  };

  return (
    <div className="relative flex-1 flex items-center h-full overflow-visible">
      {showPopup && suggestions.length > 0 && (
        <div className={`absolute bottom-full left-0 mb-2 w-full max-w-md ${isRed ? 'bg-red-950/20 border-red-900' : 'bg-zinc-900 border-zinc-800'} border rounded-sm shadow-2xl z-50 overflow-hidden`}>
          <div className={`${isRed ? 'bg-red-900/40 border-red-900' : 'bg-black/50 border-zinc-800'} px-3 py-1.5 border-b flex justify-between items-center`}>
            <span className={`text-[9px] ${isRed ? 'text-red-500' : 'text-green-500'} font-bold uppercase tracking-widest`}>{isRed ? 'OVERRIDE_SUGGESTIONS' : 'AI_SUGGESTIONS'}</span>
            <span className="text-[8px] text-zinc-600">TAB_TO_ACCEPT</span>
          </div>
          <div className="py-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => { onChange(s); setShowPopup(false); }}
                className={`w-full text-left px-3 py-2 text-[11px] font-mono flex items-center gap-2 transition-colors ${
                  i === selectedIndex 
                  ? (isRed ? 'bg-red-500/20 text-red-400' : 'bg-green-500/10 text-green-400') 
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span className="opacity-30">&gt;</span>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={backdropRef} className="absolute inset-0 flex items-center px-3 py-4 text-sm font-mono whitespace-pre pointer-events-none overflow-hidden select-none">
        {highlightText(value)}
        <span className="text-zinc-700 opacity-50">{getGhostText()}</span>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onBlur={() => setTimeout(() => setShowPopup(false), 200)}
        onFocus={() => value && suggestions.length > 0 && setShowPopup(true)}
        placeholder={placeholder}
        className={`flex-1 bg-transparent border-none focus:ring-0 text-transparent ${isRed ? 'caret-red-500' : 'caret-green-500'} py-3 px-3 text-sm font-mono outline-none relative z-10 w-full`}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default TerminalInput;
