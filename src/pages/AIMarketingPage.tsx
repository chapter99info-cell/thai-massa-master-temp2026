import React from 'react';
import AutoCampaignCard from '../components/marketing/AutoCampaignCard';
import TargetingListCard from '../components/marketing/TargetingListCard';
import CopywritingCard from '../components/marketing/CopywritingCard';
import AdBannerEditor from '../components/marketing/AdBannerEditor';

export const AIMarketingPage = ({ setSomMessage }: { setSomMessage: (msg: string) => void }) => {
  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-6 lg:p-10">
      {/* Header ตามสไตล์ image_f02bb9.png */}
      <header className="flex justify-between items-center mb-10 bg-[#2daae1] p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">AI MARKETING</h1>
          <p className="text-blue-100">Smart Promotion & Customer Retention</p>
        </div>
      </header>

      {/* Grid Layout สำหรับ iPad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <AutoCampaignCard />
          <TargetingListCard />
        </div>
        <div className="space-y-8">
          <CopywritingCard setSomMessage={setSomMessage} />
          <AdBannerEditor />
        </div>
      </div>
    </div>
  );
};

export default AIMarketingPage;
