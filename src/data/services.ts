import { Service } from '../types';

export const services: Service[] = [
  {
    id: '1',
    name: 'นวดไทยยืดเหยียดแผนโบราณ',
    englishName: 'Traditional Thai Yoga Massage',
    description: 'ศาสตร์แห่งการยืดเหยียดระดับพรีเมียม! เน้นการดัดดึงและกดจุดเพื่อคืนสมดุลให้ร่างกาย คลายความตึงเครียดของกล้ามเนื้อระดับลึก 🍊',
    englishDescription: 'Ancient healing art! Focused rhythmic stretching and pressure points to restore balance and melt away deep muscle tension. 🍊',
    standardPrice: 95,
    earlyBirdPrice: 85,
    weekendPrice: 105,
    durationMins: 60,
    category: 'MASSAGE',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db874?q=80&w=800&fit=crop',
    isFeatured: true,
    postCareTips: [
      { th: 'ดื่มน้ำอุ่นมากๆ เพื่อขับของเสีย', en: 'Drink plenty of warm water to flush toxins.' },
      { th: 'เลี่ยงกิจกรรมหนักหลังนวด 2-3 ชม.', en: 'Avoid heavy activity for 2-3 hours.' },
      { th: 'ประคบอุ่นหากมีอาการระบมกล้ามเนื้อ', en: 'Apply warm compress if you feel muscle soreness.' }
    ]
  },
  {
    id: '2',
    name: 'นวดอโรมาน้ำมันหอมระเหยพรีเมียม',
    englishName: 'Premium Aromatherapy Oil Massage',
    description: 'สัมผัสความหรูหราด้วยน้ำมันหอมสกัดบริสุทธิ์และหินร้อน ช่วยปลอบประโลมจิตใจและฟื้นฟูผิวพรรณในบรรยากาศแสงสีทองอุ่นๆ 🍊',
    englishDescription: 'Experience luxury with pure essential oils and hot stones. Soothes the soul and rejuvenates skin in a warm golden atmosphere. 🍊',
    standardPrice: 115,
    earlyBirdPrice: 105,
    weekendPrice: 130,
    durationMins: 60,
    category: 'MASSAGE',
    imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&fit=crop',
    isFeatured: true,
    postCareTips: [
      { th: 'ไม่ต้องรีบอาบน้ำ ปล่อยให้น้ำมันซึมเพื่อบำรุงผิว', en: 'Don\'t rush to shower; let the oil nourish your skin.' },
      { th: 'จิบชาสมุนไพรอุ่นๆ ช่วยผ่อนคลายระบบประสาท', en: 'Sip warm herbal tea to relax your nervous system.' },
      { th: 'สูดหายใจลึกๆ เพื่อรับประโยชน์จากกลิ่นอโรมา', en: 'Take deep breaths to benefit from the aroma oils.' }
    ]
  },
  {
    id: '3',
    name: 'นวดหน้าออร์แกนิกโกลว์',
    englishName: 'Organic Glow Facial',
    description: 'ทำความสะอาดล้ำลึกและเติมความชุ่มชื้นโดยใช้สมุนไพรไทยออร์แกนิกเพื่อฟื้นฟูความกระจ่างใสตามธรรมชาติของคุณ',
    englishDescription: 'Deep cleansing and hydration using organic Thai herbs to restore your natural radiance.',
    standardPrice: 125,
    earlyBirdPrice: 110,
    weekendPrice: 135,
    durationMins: 60,
    category: 'FACIAL',
    imageUrl: 'https://picsum.photos/seed/facial/800/600',
    isFeatured: true,
    postCareTips: [
      { th: 'งดแต่งหน้าอย่างน้อย 4-6 ชม.', en: 'Avoid makeup for at least 4-6 hours.' },
      { th: 'หลีกเลี่ยงแสงแดดจัดหลังทำทรีทเมนท์', en: 'Avoid direct sunlight after the treatment.' },
      { th: 'ใช้ครีมบำรุงผิวที่อ่อนโยนและให้ความชุ่มชื้น', en: 'Apply gentle and hydrating moisturizer.' }
    ]
  },
  {
    id: '4',
    name: 'แพ็กเกจเซนขั้นสุดยอด',
    englishName: 'Ultimate Spa Package',
    description: 'ความสุข 90 นาที: นวดไทย 60 นาที + นวดกดจุดสะท้อนเท้า 30 นาที',
    englishDescription: '90 mins of bliss: 60 mins Thai Massage + 30 mins Foot Reflexology.',
    standardPrice: 150,
    earlyBirdPrice: 135,
    weekendPrice: 165,
    durationMins: 90,
    category: 'SPA PACKAGES',
    imageUrl: 'https://picsum.photos/seed/spa-package/800/600',
    isFeatured: true,
    postCareTips: [
      { th: 'แช่เท้าในน้ำอุ่นเพื่อความผ่อนคลายที่ยาวนาน', en: 'Soak feet in warm water for lasting relaxation.' },
      { th: 'ขยับเขยื้อนนิ้วเท้าเพื่อกระตุ้นการไหลเวียน', en: 'Wiggle your toes to stimulate circulation.' },
      { th: 'พักผ่อนในบรรยากาศที่เงียบสงบหลังจบทริป', en: 'Rest in a quiet environment after your spa journey.' }
    ]
  },
  {
    id: '5',
    name: 'นวดเนื้อเยื่อส่วนลึก',
    englishName: 'Deep Tissue Relief',
    description: 'เน้นการปรับแนวมัดกล้ามเนื้อที่ลึกขึ้น เหมาะสำหรับอาการปวดเรื้อรัง',
    englishDescription: 'Focuses on realigning deeper layers of muscles. Ideal for chronic aches.',
    standardPrice: 120,
    earlyBirdPrice: 105,
    weekendPrice: 130,
    durationMins: 60,
    category: 'MASSAGE',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800',
    postCareTips: [
      { th: 'ดื่มน้ำมากๆ เพื่อขับกรดแลคติกที่ถูกบีบออกมา', en: 'Drink plenty of water to flush out released lactic acid.' },
      { th: 'หากมีรอยเขียวช้ำหรือระบมเล็กน้อยเป็นเรื่องปกติ', en: 'Minor bruising or soreness is normal after deep work.' },
      { th: 'ยืดกล้ามเนื้อเบาๆ เพื่อรักษาความยืดหยุ่น', en: 'Perform gentle stretches to maintain flexibility.' }
    ]
  },
  {
    id: '6',
    name: 'นวดหน้าลดริ้วรอย',
    englishName: 'Anti-Aging Facial',
    description: 'ทรีทเมนท์ขั้นสูงเพื่อลดเลือนริ้วรอยและปรับปรุงความยืดหยุ่นของผิว',
    englishDescription: 'Advanced treatment to reduce fine lines and improve skin elasticity.',
    standardPrice: 145,
    earlyBirdPrice: 130,
    weekendPrice: 155,
    durationMins: 75,
    category: 'FACIAL',
    imageUrl: 'https://picsum.photos/seed/anti-aging/800/600',
  }
];
