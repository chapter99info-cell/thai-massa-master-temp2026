import React from 'react';
import { aiMarketingService } from '../../services/aiMarketingService';

const TargetingListCard = () => {
  const customers = aiMarketingService.getChurnRiskCustomers();

  const copyToClipboard = (name: string) => {
    alert(`คัดลอกข้อความสำหรับคุณ ${name} เรียบร้อย!`);
  };

  return (
    <div className="bg-[#161d29] border border-gray-700 rounded-3xl p-6 shadow-xl">
      <h3 className="text-xl font-semibold mb-4">🎯 Top 5 Customers to Re-engage</h3>
      <div className="space-y-4">
        {customers.map(c => (
          <div key={c.id} className="flex justify-between items-center p-4 bg-[#1c2533] rounded-2xl hover:bg-[#252f3f] transition-colors">
            <div>
              <p className="font-bold text-lg">{c.name} <span className="text-xs font-normal text-gray-500">({c.pref})</span></p>
              <p className="text-sm text-gray-400">มาล่าสุด: {c.lastVisitAt} | เคยมา: {c.visitCount} ครั้ง</p>
            </div>
            <button 
              onClick={() => copyToClipboard(c.name)}
              className="p-3 bg-gray-700 rounded-full active:bg-blue-600"
            >
              📋
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetingListCard;
