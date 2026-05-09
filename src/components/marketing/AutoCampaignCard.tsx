import React, { useState } from 'react';
import { aiMarketingService } from '../../services/aiMarketingService';

const AutoCampaignCard = () => {
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePromo = () => {
    setLoading(true);
    const lowService = aiMarketingService.getLowestSellingService();
    
    // จำลอง AI คิด 1.5 วินาที
    setTimeout(() => {
      setPromo({
        title: `Special Focus: ${lowService.service}`,
        details: `รับส่วนลดทันทีเมื่อจองช่วงวันธรรมดา เพื่อกระตุ้นยอดขาย${lowService.service}`,
        validFrom: '2026-02-01',
        validTo: '2026-02-07',
        recommendedPrice: 'ลด 15%',
        reasoning: `เนื่องจากยอดขาย ${lowService.service} ต่ำที่สุดใน 30 วันที่ผ่านมา (${lowService.sales} ครั้ง)`
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-[#161d29] border border-gray-700 rounded-3xl p-6 shadow-xl">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        ✨ Auto-Campaign
      </h3>
      {!promo ? (
        <button 
          onClick={generatePromo}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-lg active:scale-95 transition-all"
        >
          {loading ? 'AI กำลังวิเคราะห์ยอดขาย...' : 'ให้ AI คิดโปรโมชันรายสัปดาห์'}
        </button>
      ) : (
        <div className="bg-[#1c2533] p-5 rounded-2xl border-l-4 border-cyan-400">
          <h4 className="text-cyan-400 font-bold text-xl mb-2">{promo.title}</h4>
          <p className="text-gray-300 mb-4">{promo.details}</p>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4 text-gray-400">
            <p>ราคาแนะนำ: <span className="text-white">{promo.recommendedPrice}</span></p>
            <p>ระยะเวลา: <span className="text-white">{promo.validFrom} - {promo.validTo}</span></p>
          </div>
          <p className="text-xs text-amber-300 italic">💡 {promo.reasoning}</p>
          <button onClick={() => setPromo(null)} className="mt-4 text-sm text-gray-500 underline">ล้างข้อมูล</button>
        </div>
      )}
    </div>
  );
};

export default AutoCampaignCard;
