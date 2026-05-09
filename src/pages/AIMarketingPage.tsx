import React from 'react';
import AutoCampaignCard from '../components/marketing/AutoCampaignCard';
import TargetingListCard from '../components/marketing/TargetingListCard';
import CopywritingCard from '../components/marketing/CopywritingCard';
import AdBannerEditor from '../components/marketing/AdBannerEditor';
import DashboardHeader from '../components/DashboardHeader';
import { usePin } from '../contexts/PinContext';

export const AIMarketingPage: React.FC = () => {
  const { logout } = usePin();
  
  return (
    <div className="min-h-screen bg-[#0a0f18] text-white">
      <DashboardHeader 
        activeTab="marketing" 
        newAlertsCount={0} 
        setShowAlerts={() => {}} 
        logout={logout}
        setIsIntakeOpen={() => {}}
      />
      <div className="p-6 lg:p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">AI MARKETING</h1>
          <p className="text-blue-100">Smart Promotion & Customer Retention</p>
        </header>

        {/* Grid Layout สำหรับ iPad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AutoCampaignCard />
            <TargetingListCard />
          </div>
          <div className="space-y-8">
            <CopywritingCard />
            <AdBannerEditor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMarketingPage;
