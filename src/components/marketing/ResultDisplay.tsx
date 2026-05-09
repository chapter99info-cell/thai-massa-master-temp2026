import React from 'react';
import { Plus, Send, ImageIcon, Timer } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ResultDisplay = ({ output, onCopy, onSend, isProcessing }: { output: string, onCopy: () => void, onSend: () => void, isProcessing: boolean }) => (
  <div className="space-y-4">
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60">Luxury Result</label>
    <div className="w-full h-48 relative group">
      {output ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#B8962E] to-[#F5F5DC] rounded-3xl blur-[1px]" />
          <div className="relative m-[1px] h-[calc(100%-2px)] bg-[#0A0D17] border border-indigo-500/20 rounded-[1.4rem] p-6 text-indigo-100 text-sm leading-relaxed overflow-y-auto italic font-serif shadow-[0_0_20px_rgba(184,150,46,0.2)] whitespace-pre-wrap">
            {output}
            <button onClick={onCopy} className="absolute top-4 right-16 p-2 bg-gold/20 hover:bg-gold text-white hover:text-navy rounded-lg transition-all shadow-[0_0_10px_rgba(184,150,46,0.3)]">
              <Plus size={16} />
            </button>
            <button onClick={onSend} disabled={isProcessing} className="absolute top-4 right-4 p-2 bg-indigo-500/20 hover:bg-indigo-500 text-white hover:text-white rounded-lg transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              {isProcessing ? <Timer className="animate-spin" size={16}/> : <Send size={16} />}
            </button>
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-600 opacity-50">
           <ImageIcon size={32} className="mb-2" />
           <p className="text-[10px] font-black uppercase tracking-widest">Waiting for input...</p>
        </div>
      )}
    </div>
  </div>
);
