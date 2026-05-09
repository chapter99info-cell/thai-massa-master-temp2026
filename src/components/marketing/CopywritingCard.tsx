import React, { useState } from 'react';
import { aiMarketingService } from '../../services/aiMarketingService';

const CopywritingCard = () => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [result, setResult] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const generateCopy = async () => {
    setIsTranslating(true);
    try {
      const translated = await aiMarketingService.translateToEnglish(input, tone);
      setResult(translated);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการสร้างข้อความ");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    alert(`คัดลอกข้อความสำหรับ ${platform} เรียบร้อย!`);
  };

  return (
    <div className="bg-[#161d29] border border-gray-700 rounded-3xl p-6 shadow-xl text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        ✍️ AI Copywriting (Thai to English Only)
      </h3>
      
      <textarea 
        className="w-full bg-[#0a0f18] rounded-xl p-4 border border-gray-600 mb-4 focus:border-blue-500 outline-none"
        placeholder="พิมพ์ชื่อโปรโมชั่นภาษาไทย... (เช่น วันแม่ลด 10%)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['Elegant', 'Friendly', 'Professional'].map(t => (
          <button 
            key={t}
            onClick={() => setTone(t)}
            className={`px-4 py-2 rounded-full text-sm ${tone === t ? 'bg-blue-600' : 'bg-gray-800 text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <button 
        onClick={generateCopy} 
        disabled={isTranslating}
        className="w-full py-3 bg-white text-black font-bold rounded-xl mb-6 active:scale-95 transition-all"
      >
        {isTranslating ? 'Translating to English...' : 'สร้างข้อความภาษาอังกฤษ'}
      </button>
      
      {result && (
        <div className="space-y-4">
          {/* Facebook Version พร้อมปุ่ม COPY เด่นๆ */}
          <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-2xl relative">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-blue-400 uppercase font-bold">Facebook Post</p>
              <button 
                onClick={() => copyToClipboard(result.facebook, 'Facebook')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-lg font-bold"
              >
                COPY FOR FB
              </button>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{result.facebook}</p>
          </div>

          {/* LINE & SMS Version */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-green-400 font-bold uppercase">LINE</span>
                <button onClick={() => copyToClipboard(result.line, 'LINE')} className="text-[10px] text-gray-500">Copy</button>
              </div>
              <p className="text-xs text-gray-300">{result.line}</p>
            </div>
            <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">SMS</span>
                <button onClick={() => copyToClipboard(result.sms, 'SMS')} className="text-[10px] text-gray-500">Copy</button>
              </div>
              <p className="text-xs text-gray-300">{result.sms}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopywritingCard;
