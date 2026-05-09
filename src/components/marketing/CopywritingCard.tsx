import React, { useState } from 'react';

const CopywritingCard = () => {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('หรูหรา');
  const [result, setResult] = useState<any>(null);

  const generateCopy = () => {
    setResult({
      line: `✨ สัมผัสความผ่อนคลายระดับพรีเมียมกับโปรโมชัน "${input}" ที่จัดขึ้นเพื่อคุณโดยเฉพาะ...`,
      sms: `[Thai Massage] โปรเด็ด! ${input} ลดพิเศษถึงสิ้นเดือนนี้ โทรจองเลย!`
    });
  };

  return (
    <div className="bg-[#161d29] border border-gray-700 rounded-3xl p-6 shadow-xl">
      <h3 className="text-xl font-semibold mb-4">✍️ AI Copywriting Tool</h3>
      <textarea 
        className="w-full bg-[#0a0f18] rounded-xl p-4 border border-gray-600 mb-4 focus:border-blue-500 outline-none"
        placeholder="กรอกไอเดียโปรโมชันของคุณ..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['หรูหรา', 'เป็นกันเอง', 'ทางการ'].map(t => (
          <button 
            key={t}
            onClick={() => setTone(t)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${tone === t ? 'bg-blue-600' : 'bg-gray-800 text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <button onClick={generateCopy} className="w-full py-3 bg-white text-black font-bold rounded-xl mb-6">สร้างข้อความ</button>
      
      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-800 rounded-xl">
            <p className="text-xs text-green-400 mb-2 uppercase font-bold">LINE Version</p>
            <p className="text-sm">{result.line}</p>
          </div>
          <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-xl text-sm">
            <p className="text-xs text-blue-400 mb-2 uppercase font-bold">SMS Version</p>
            <p>{result.sms}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopywritingCard;
