import React from 'react';
import { Sparkles } from 'lucide-react';

export const SmartInsightCard = ({ insight }: { insight: string }) => (
  <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/50 p-6 rounded-3xl border border-indigo-500/20 shadow-xl space-y-4">
    <div className="flex items-center gap-3 text-indigo-400">
      <Sparkles size={20} />
      <h4 className="font-bold text-xs tracking-widest uppercase">Smart Insights</h4>
    </div>
    <p className="text-white text-sm leading-relaxed">{insight}</p>
  </div>
);
