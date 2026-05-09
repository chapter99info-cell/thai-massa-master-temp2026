import React, { useState } from 'react';

const AdBannerEditor = () => {
  // State สำหรับจัดการข้อมูล Banner
  const [bannerConfig, setBannerConfig] = useState({
    title: 'ผ่อนคลายกับน้ำมันอโรมาสูตรใหม่',
    subtitle: 'รับส่วนลด 20% เมื่อจองผ่านแอป',
    buttonText: 'Book Now',
    bgColor: 'from-purple-900 to-indigo-900', // สี Gradient
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // รูปนวดสปา
  });

  const handleSave = () => {
    // โค้ดสำหรับส่งข้อมูลไปบันทึกที่ Database / API
    alert('บันทึก Banner ใหม่เรียบร้อยแล้ว แบนเนอร์นี้จะไปแสดงในหน้าของลูกค้า!');
  };

  return (
    <div className="bg-[#161d29] border border-gray-700 rounded-3xl p-6 shadow-xl flex flex-col h-full">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        🖼️ Ad Banner Editor
      </h3>

      {/* --- ส่วน Preview แบนเนอร์ --- */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">Live Preview</p>
        
        {/* กล่อง Banner (จำลองสัดส่วนแนวนอน) */}
        <div className={`relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-r ${bannerConfig.bgColor} shadow-2xl flex`}>
          
          {/* ข้อมูล Text ซ้าย */}
          <div className="flex-1 p-6 flex flex-col justify-center z-10">
            <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md mb-2">
              Sponsored
            </span>
            <h4 className="text-white font-bold text-lg md:text-xl leading-tight mb-2">
              {bannerConfig.title || 'กรุณาใส่หัวข้อ'}
            </h4>
            <p className="text-white/80 text-sm mb-4 line-clamp-2">
              {bannerConfig.subtitle}
            </p>
            {bannerConfig.buttonText && (
              <button className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold w-fit hover:bg-gray-200 transition">
                {bannerConfig.buttonText}
              </button>
            )}
          </div>

          {/* รูปภาพ ขวา (พร้อม Overlay Gradient) */}
          <div className="w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 z-10"></div>
            {/* ตัวเบลอขอบซ้ายของรูปเพื่อให้กลืนกับพื้นหลัง */}
            <div className={`absolute inset-y-0 left-0 w-16 bg-gradient-to-r ${bannerConfig.bgColor} to-transparent z-10`}></div>
            <img 
              src={bannerConfig.imageUrl} 
              alt="Ad Visual" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* --- ส่วนเครื่องมือแก้ไข (Editor Controls) --- */}
      <div className="space-y-4 flex-1">
        
        {/* หัวข้อ */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">หัวข้อแบนเนอร์</label>
          <input 
            type="text" 
            value={bannerConfig.title}
            onChange={(e) => setBannerConfig({...bannerConfig, title: e.target.value})}
            className="w-full bg-[#0a0f18] text-sm text-white rounded-xl p-3 border border-gray-600 focus:border-blue-500 outline-none"
          />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">รายละเอียดรอง</label>
          <input 
            type="text" 
            value={bannerConfig.subtitle}
            onChange={(e) => setBannerConfig({...bannerConfig, subtitle: e.target.value})}
            className="w-full bg-[#0a0f18] text-sm text-white rounded-xl p-3 border border-gray-600 focus:border-blue-500 outline-none"
          />
        </div>

        {/* เลือกสี Theme (ปรับให้กดง่ายบน iPad) */}
        <div>
          <label className="text-xs text-gray-400 block mb-2">เลือกโทนสีแบนเนอร์</label>
          <div className="flex gap-3">
            {[
              { id: 'purple', class: 'from-purple-900 to-indigo-900', display: 'bg-purple-600' },
              { id: 'gold', class: 'from-yellow-900 to-amber-700', display: 'bg-amber-600' },
              { id: 'green', class: 'from-emerald-900 to-teal-900', display: 'bg-teal-600' },
              { id: 'dark', class: 'from-gray-900 to-black', display: 'bg-gray-800' },
            ].map(color => (
              <button
                key={color.id}
                onClick={() => setBannerConfig({...bannerConfig, bgColor: color.class})}
                className={`w-10 h-10 rounded-full ${color.display} border-2 ${bannerConfig.bgColor === color.class ? 'border-white scale-110' : 'border-transparent'} transition-transform active:scale-95 shadow-md`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ปุ่ม Save */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg active:scale-95 transition-all shadow-lg"
        >
          บันทึกและเผยแพร่
        </button>
      </div>
    </div>
  );
};

export default AdBannerEditor;
