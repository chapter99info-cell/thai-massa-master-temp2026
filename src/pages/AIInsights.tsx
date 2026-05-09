import React, { useState } from 'react';
import { usePin } from '../contexts/PinContext';
import DashboardHeader from '../components/DashboardHeader';

// โค้ดชั่วคราว สร้างการ์ดแบบง่ายๆ แทน SmartInsightCard
const SimpleInsightCard = ({ title, value, insight }: { title: string, value: string, insight: string }) => (
  <div className="bg-[#1a2333] p-6 rounded-2xl border border-blue-500/30">
    <h3 className="text-blue-400 font-semibold mb-2">{title}</h3>
    <p className="text-3xl text-white font-bold mb-4">{value}</p>
    <p className="text-sm text-gray-400">{insight}</p>
  </div>
);

const AIInsights: React.FC = () => {
  const [loading] = useState(false);
  const { logout } = usePin();

  if (loading) {
     return <div className="text-white text-center p-20">กำลังโหลดข้อมูลอัจฉริยะ...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white">
      <DashboardHeader 
        activeTab="insights" 
        newAlertsCount={0} 
        setShowAlerts={() => {}} 
        logout={logout}
        setIsIntakeOpen={() => {}}
      />
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            AI Business Insights
          </h1>
          <p className="text-gray-400 mt-2">วิเคราะห์ข้อมูลร้านนวดของคุณแบบเรียลไทม์</p>
        </div>

        {/* ส่วนแสดงการ์ดข้อมูล */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <SimpleInsightCard 
              title="คาดการณ์ยอดจองวันนี้" 
              value="15 คิว" 
              insight="📈 สูงกว่าค่าเฉลี่ยวันพุธ 20%. แนะนำให้เตรียมพนักงานนวดไทยเพิ่ม"
          />
          <SimpleInsightCard 
              title="บริการยอดฮิตสัปดาห์นี้" 
              value="Aroma Oil" 
              insight="🔥 ยอดจองเพิ่มขึ้น 30% จากโปรโมชันเมื่อสัปดาห์ก่อน"
          />
          <SimpleInsightCard 
              title="ลูกค้าที่ควร Re-engage" 
              value="42 คน" 
              insight="✉️ ลูกค้าเหล่านี้ไม่ได้มาใช้บริการเกิน 2 เดือนแล้ว AI พร้อมส่ง SMS ชวนกลับมา"
          />
        </div>

        {/* พื้นที่สำหรับใส่กราฟ (ถ้ามี) */}
        <div className="bg-[#1a2333] p-8 rounded-2xl border border-gray-700 h-64 flex items-center justify-center">
          <p className="text-gray-500">พื้นที่แสดงกราฟสรุปรายได้ (กำลังพัฒนา)</p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
