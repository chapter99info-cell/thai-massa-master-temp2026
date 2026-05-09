import { GoogleGenAI } from "@google/genai";
import { storeConfig } from "../config";

export const mockSalesData = [
  { service: 'นวดแผนไทย', sales: 150, period: '30d' },
  { service: 'นวดน้ำมันอโรมา', sales: 120, period: '30d' },
  { service: 'นวดเท้า', sales: 45, period: '30d' }, // ต่ำที่สุด
  { service: 'นวดประคบสมุนไพร', sales: 60, period: '30d' },
];

export const mockCustomers = [
  { id: '1', name: 'คุณนพดล', phone: '081-234-XXXX', lastVisitAt: '2025-12-15', visitCount: 12, pref: 'นวดอโรมา' },
  { id: '2', name: 'คุณศิริพร', phone: '092-888-XXXX', lastVisitAt: '2025-11-20', visitCount: 5, pref: 'นวดไทย' },
  { id: '3', name: 'Mr. John Smith', phone: '085-111-XXXX', lastVisitAt: '2026-01-05', visitCount: 20, pref: 'นวดเท้า' },
];

export const aiMarketingService = {
  // 1. หาบริการที่ยอดขายต่ำสุด
  getLowestSellingService: () => {
    return [...mockSalesData].sort((a, b) => a.sales - b.sales)[0];
  },

  // 2. กรองลูกค้าที่ไม่มานานกว่า 1 เดือน
  getChurnRiskCustomers: () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return mockCustomers
      .filter(c => new Date(c.lastVisitAt) < oneMonthAgo)
      .slice(0, 5);
  },

  generateContent: async (input: string, tool: 'post' | 'menu' | 'profit' | 'categorize', settings: any): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    let prompt = "";
    switch (tool) {
        case 'post':
            prompt = `ในฐานะ "น้องส้ม" เลขาส่วนตัวอัจฉริยะ ช่วยเปลี่ยนไอเดียภาษาไทยนี้: "${input}" ให้เป็น Content ภาษาอังกฤษระดับพรีเมียม (Luxury) สำหรับโพสต์ลง Social Media ของร้าน ${storeConfig.storeName} ที่ Sydney โดยใช้โทนเสียงแบบ ${settings.toneOfVoice || 'Warm and Professional'}.

      โครงสร้างที่ต้องการ:
      1. Premium English Caption (Luxury & Professional)
      2. Recommended Visual Tips: (คำแนะนำสั้นๆ ว่าต้องใช้รูปภาพหรือวิดีโอแบบไหน เพื่อให้ดูหรูหราที่สุด)

      ใส่ Hashtag ที่เกี่ยวข้องและปิดท้ายด้วย 🍊🧡 ทุกครั้ง`;
            break;
        case 'menu':
            prompt = `ในฐานะผู้ช่วยร้านอาหารพรีเมียม ช่วยเขียนคำบรรยายเมนู "${input}" ให้ดูน่ากินแบบพรีเมียม สไตล์เป็นกันเอง โดยเน้นจุดเด่นเรื่องวัตถุดิบและรสชาติ สำหรับลงในหน้าแอป V4 ของร้าน ${storeConfig.storeName} ขอความยาวไม่เกิน 2 ประโยคค่ะ 🍊`;
            break;
        case 'profit':
            prompt = `ในฐานะผู้ช่วยบริหารร้านอาหาร ช่วยตั้งราคาขายที่เหมาะสมสำหรับเมนูต้นทุน "${input}" บาท โดยพี่ต้องการกำไรสุทธิ 35% หลังหักค่า GP ของแพลตฟอร์มแล้ว ควรตั้งราคาขายที่เท่าไหร่ดีคะ? อธิบายสั้นๆ ให้พี่เข้าใจง่ายค่ะ 🍊`;
            break;
        case 'categorize':
            prompt = `ในฐานะผู้ช่วยบริหารร้านอาหาร ช่วยแยกประเภทรายการอาหารจำนวนนี้: "${input}" เข้าหมวดหมู่: อาหารจานเดียว, ของทานเล่น, และเครื่องดื่ม เพื่อให้จัดระเบียบในแอป V4 ได้ง่ายที่สุดค่ะ 🍊`;
            break;
    }

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            systemInstruction: "คุณคือ 'น้องส้ม' (Nong Som) ผู้เชี่ยวชาญด้านการตลาด Wellness และ Restaurant ระดับพรีเมียม คุณเรียกตัวเองว่า 'น้องส้ม' และเรียกผู้ใช้งานว่า 'พี่' เสมอ คุณเก่งเรื่องการเขียน Content ภาษาอังกฤษที่ดูแพง หรูหรา ใส่ใจรายละเอียด และสร้างภาพลักษณ์อันโดดเด่นให้ร้านอาหารหรือร้านนวดใน Sydney",
        }
    });

    return response.text || "ขอโทษทีค่ะพี่ น้องส้มขัดข้องนิดหน่อย ลองใหม่อีกทีนะคะ 🍊";
},
  translateToEnglish: async (input: string, tone: string): Promise<{facebook: string, line: string, sms: string}> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `Translate the Thai marketing promotion: "${input}" into English.
    Tone: "${tone}".
    Create 3 versions based on the tone: Facebook post (with emojis and hashtags), LINE message (short and direct), and SMS message (very short and direct).
    Return the result as a raw valid JSON object with keys: "facebook", "line", "sms".
    Do not add any markup. Return JSON only.
    Use this format for the response: {"facebook": "Facebook text here", "line": "Line text here", "sms": "SMS text here"}`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            systemInstruction: "You are a marketing expert. Translate the provided Thai marketing promotion into English, returning only a raw JSON object.",
        }
    });

    if (!response.text) return {facebook: "Error", line: "Error", sms: "Error"};
    
    // Clean response just in case
    const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        return JSON.parse(text);
    } catch {
        return {facebook: "Error parsing JSON", line: "Error", sms: "Error"};
    }
  }
};
