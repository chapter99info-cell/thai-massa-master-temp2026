import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Corrected import path
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const MasterConfig3501: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  
  // 1. กำหนด State สำหรับเก็บค่า Config ทั้งหมด
  const [config, setConfig] = useState({
    shopName: '',
    logoUrl: '',
    googleSheetId: '',
    googleReviewUrl: '',
    nongSomLang: 'en', // 'en' | 'th'
    reviewDiscount: '10', // หน่วยเป็น %
    themeColor: '#2daae1'
  });

  // 2. ดึงข้อมูลจาก Firebase มาโชว์เมื่อเปิดหน้าจอ
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "system", "appSettings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  // 3. ฟังก์ชันบันทึกค่า
  const handleSave = async () => {
    setSaveStatus('กำลังบันทึก...');
    try {
      const docRef = doc(db, "system", "appSettings");
      await updateDoc(docRef, config);
      setSaveStatus('✅ บันทึกสำเร็จ! ข้อมูลอัปเดตทันที');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('❌ พังครับพี่! เช็กสิทธิ์การเข้าถึง Firebase หน่อย');
    }
  };

  if (loading) return <div className="p-10 text-white">Loading Master Data...</div>;

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="border-b border-blue-500/30 pb-4">
          <h1 className="text-3xl font-bold">Master Config 3501 🍊</h1>
          <p className="text-gray-400 text-sm">ส่วนตั้งค่าระบบ White-Label สำหรับลูกค้าใหม่</p>
        </header>

        {/* Section: Branding */}
        <section className="space-y-4 bg-[#1a2333] p-6 rounded-2xl shadow-xl">
          <h2 className="text-blue-400 font-bold uppercase tracking-wider text-xs">1. Branding & Identity</h2>
          <div>
            <label className="block text-xs mb-1 opacity-60">ชื่อร้าน (Shop Name)</label>
            <input 
              className="w-full bg-[#0a0f18] border border-gray-700 p-3 rounded-xl focus:border-blue-500 outline-none"
              value={config.shopName}
              onChange={(e) => setConfig({...config, shopName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 opacity-60">Logo URL</label>
            <input 
              className="w-full bg-[#0a0f18] border border-gray-700 p-3 rounded-xl"
              value={config.logoUrl}
              onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
            />
          </div>
        </section>

        {/* Section: Integrations */}
        <section className="space-y-4 bg-[#1a2333] p-6 rounded-2xl shadow-xl">
          <h2 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">2. Integrations</h2>
          <div>
            <label className="block text-xs mb-1 opacity-60">Google Sheet ID (Database)</label>
            <input 
              className="w-full bg-[#0a0f18] border border-gray-700 p-3 rounded-xl"
              value={config.googleSheetId}
              onChange={(e) => setConfig({...config, googleSheetId: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs mb-1 opacity-60">Google Review URL</label>
            <input 
              className="w-full bg-[#0a0f18] border border-gray-700 p-3 rounded-xl"
              value={config.googleReviewUrl}
              onChange={(e) => setConfig({...config, googleReviewUrl: e.target.value})}
            />
          </div>
        </section>

        {/* Section: AI & Marketing */}
        <section className="space-y-4 bg-[#1a2333] p-6 rounded-2xl shadow-xl">
          <h2 className="text-orange-400 font-bold uppercase tracking-wider text-xs">3. AI & Marketing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1 opacity-60">ภาษาของน้องส้ม</label>
              <select 
                className="w-full bg-[#0a0f18] border border-gray-700 p-3 rounded-xl"
                value={config.nongSomLang}
                onChange={(e) => setConfig({...config, nongSomLang: e.target.value})}
              >
                <option value="en">English (Aussie)</option>
                <option value="th">ภาษาไทย</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 opacity-60">ส่วนลดล่อใจ (%)</label>
              <input 
                type="number"
                className="w-full bg-[#0a0f18] border border-gray-700 p-3 rounded-xl"
                value={config.reviewDiscount}
                onChange={(e) => setConfig({...config, reviewDiscount: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* ปุ่มบันทึก */}
        <div className="pt-6">
          <button 
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 py-4 rounded-2xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            อัปเดตระบบเดี๋ยวนี้!
          </button>
          {saveStatus && <p className="text-center mt-4 font-bold text-sm animate-pulse">{saveStatus}</p>}
        </div>

      </div>
    </div>
  );
};

export default MasterConfig3501;
