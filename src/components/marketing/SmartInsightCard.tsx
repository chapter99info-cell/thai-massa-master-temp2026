import React from 'react';

export const SmartInsightCard = ({ insight }: { insight: string }) => (
  <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/50 p-6 rounded-3xl border border-indigo-500/20 shadow-xl space-y-4">
    <div className="flex items-center gap-3 text-indigo-400">
      {/* ใช้ SVG แทน Sparkles เพื่อลดความเสี่ยง Build พัง */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
      </svg>
      <h4 className="font-bold text-[10px] tracking-widest uppercase">Smart Insights</h4>
    </div>
    <p className="text-white text-sm leading-relaxed">{insight || "กำลังวิเคราะห์ข้อมูล..."}</p>
  </div>
);
