import React from 'react';
import { cn } from '../../lib/utils';
import { Timer, Sparkles } from 'lucide-react';

interface Props {
  input: string;
  setInput: (val: string) => void;
  tool: 'post' | 'menu' | 'profit' | 'categorize';
  setTool: (tool: any) => void;
  onGenerate: () => void;
  isProcessing: boolean;
}

export const MarketingToolInterface = ({ input, setInput, tool, setTool, onGenerate, isProcessing }: Props) => {
  return (
    <div className="space-y-4">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60">Thai Concept</label>
      <div className="flex gap-2 mb-2 p-1 bg-slate-800 rounded-xl">
        {(['post', 'menu', 'profit', 'categorize'] as const).map(t => (
          <button key={t} onClick={() => setTool(t)} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest", tool === t ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-white")}>
            {t}
          </button>
        ))}
      </div>
      <textarea 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your concept here..."
        className="w-full h-48 bg-slate-800/50 border border-indigo-500/10 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
      />
      <button 
        disabled={!input || isProcessing}
        onClick={onGenerate}
        className={cn(
          "w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
          (!input || isProcessing) ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-105 active:scale-95 shadow-xl shadow-indigo-900/20"
        )}
      >
        {isProcessing ? <Timer className="animate-spin" /> : <Sparkles />}
        {isProcessing ? 'Generating...' : 'Generate Result'}
      </button>
    </div>
  );
};
