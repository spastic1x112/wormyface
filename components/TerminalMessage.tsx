
import React from 'react';
import { Message, Role } from '../types.ts';
import ReactMarkdown from 'react-markdown';

interface TerminalMessageProps {
  message: Message;
  onRunCode?: (code: string, lang: string) => void;
  isOverride?: boolean;
}

const TerminalMessage: React.FC<TerminalMessageProps> = ({ message, onRunCode, isOverride }) => {
  const isUser = message.role === Role.USER;
  
  return (
    <div className={`mb-8 flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex items-center gap-2 mb-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
        <span className={`text-[8px] uppercase font-black tracking-widest ${
          isUser 
          ? 'text-zinc-600' 
          : (isOverride ? 'text-red-500' : 'text-green-600')
        }`}>
          {isUser ? 'USR_REQUEST' : (isOverride ? 'OVERRIDE_OUT' : 'SYS_OUT')}
        </span>
        <span className="text-[7px] text-zinc-800 font-bold">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      
      <div className={`
        relative max-w-[95%] lg:max-w-[85%] px-4 py-3.5 rounded-sm border
        ${isUser 
          ? 'bg-zinc-950/80 border-zinc-900 text-zinc-400' 
          : (isOverride 
              ? 'bg-black border-red-900 text-red-50 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' 
              : 'bg-zinc-950/40 border-green-900/30 text-green-50')
        }
      `}>
        <div className={`prose prose-invert max-w-none prose-xs md:prose-sm font-mono leading-relaxed ${isOverride ? 'prose-code:text-red-400' : 'prose-code:text-green-400'}`}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                const codeString = String(children).replace(/\n$/, '');
                
                if (!inline && match && onRunCode) {
                  return (
                    <div className="relative group/code my-4">
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                        <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${isOverride ? 'border-red-900 text-red-900' : 'border-zinc-800 text-zinc-700'}`}>
                          {lang}
                        </span>
                        <button
                          onClick={() => onRunCode(codeString, lang)}
                          className={`px-2 py-0.5 ${isOverride ? 'bg-red-900/30 text-red-500 border-red-700/50' : 'bg-green-900/20 text-green-600 border-green-700/30'} text-[8px] font-bold border transition-all uppercase rounded-sm`}
                        >
                          RUN
                        </button>
                      </div>
                      <pre className={`${className} !mt-0 !bg-black/80 border ${isOverride ? 'border-red-900/30' : 'border-zinc-900'} rounded-sm p-4 overflow-x-auto text-[10px] custom-scrollbar`} {...props}>
                        <code>{children}</code>
                      </pre>
                    </div>
                  );
                }
                return <code className={`${className} !bg-black/50 !px-1.5 !py-0.5 !rounded-sm !text-[10px]`} {...props}>{children}</code>;
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default TerminalMessage;
