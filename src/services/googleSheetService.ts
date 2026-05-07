/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings } from '../types';

// 🍊 ลิงก์ Web App จาก Apps Script ที่พี่แสนก๊อปมาให้น้องส้มค่ะ
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyfSV7soNQLCB3UDQxek1uf6EyoB9J1-gp5pKBLXcNnOI8QyQv_nCaMBizJNCIsj6sZRQ/exec';

export const googleSheetService = {
  // 1. ฟังก์ชันดึงข้อมูลสินค้า/บริการ และ Config จาก Sheet
  fetchAppConfig: async (sheetId: string): Promise<Partial<AppSettings>> => {
    try {
      // ดึงข้อมูลผ่าน Apps Script (doGet)
      const response = await fetch(`${SCRIPT_URL}?sheet=AppConfig`);
      const data = await response.json();
      
      // แปลงข้อมูลจาก Array เป็น Object (สมมติว่าแถว 1 เป็นหัวข้อ)
      const config: any = {};
      if (Array.isArray(data)) {
        data.slice(1).forEach((row: any[]) => {
          if (row[0]) config[String(row[0])] = row[1];
        });
      }

      // Map dynamic keys to AppSettings fields
      const mappedConfig: Partial<AppSettings> = {};
      if (config.brand_logo_url) mappedConfig.brandLogoUrl = config.brand_logo_url;
      if (config.hero_video_url) mappedConfig.heroVideoUrl = config.hero_video_url;
      if (config.hero_image_url) mappedConfig.heroImageUrl = config.hero_image_url;
      if (config.shop_description) mappedConfig.shopDescription = config.shop_description;

      // Fallback if sheet is empty but fetch "succeeded"
      if (Object.keys(mappedConfig).length === 0) {
        return {
          brandLogoUrl: '',
          heroImageUrl: '',
          shopDescription: 'Premium Thai Wellness - Your Ultimate Escape for Body and Soul'
        };
      }

      return mappedConfig;
    } catch (error) {
      console.error("น้องส้มดึง Config ไม่สำเร็จค่ะพี่แสน:", error);
      return {
        shopDescription: 'Premium Thai Wellness - Your Ultimate Escape for Body and Soul'
      };
    }
  },

  // 2. ฟังก์ชันส่งข้อมูลการจองใหม่ (doPost)
  submitBooking: async (bookingData: any) => {
    try {
      console.log("🍊 น้องส้มกำลังส่งข้อมูลจองไปที่ Sheet นะคะ...", bookingData);
      
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // สำคัญสำหรับ Google Apps Script
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      // เนื่องจากใช้ no-cors เราจะไม่เห็น response body 
      // แต่ถ้าไม่มี error แปลว่าข้อมูลถูกส่งออกไปแล้วค่ะ
      return { success: true };
    } catch (error) {
      console.error("โถ่พี่... ข้อมูลจองไม่เข้า Sheet ค่ะ:", error);
      return { success: false, error };
    }
  },

  // 3. ดึงข้อมูลการจองทั้งหมด (ใช้สำหรับสรุปยอดรายเดือน)
  fetchBookings: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${SCRIPT_URL}?sheet=Bookings`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("ดึงข้อมูลการจองไม่สำเร็จค่ะ:", error);
      return [];
    }
  },

  // 4. บันทึกสรุปยอดรายเดือน (Performance_Summary)
  savePerformanceSummary: async (summaryData: any) => {
    try {
      console.log("🍊 น้องส้มกำลังส่งสรุปยอดไปที่ Sheet Performance_Summary...");
      
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'appendPerformance',
          data: summaryData
        })
      });
      return { success: true };
    } catch (error) {
      console.error("บันทึกสรุปยอดไม่สำเร็จค่ะ:", error);
      return { success: false, error };
    }
  }
};

// Maintain compatibility with previous request if needed, but the user's latest prompt seems to redefine the service
export const updateProductPrices = async (sheetId: string, products: any[]) => {
  try {
    console.log("🍊 น้องส้มกำลังส่งราคาใหม่ไปที่ Sheet...");
    
    const result = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateProducts', data: products })
    });

    return await result.json();
  } catch (error) {
    console.error("โถ่พี่แสน... น้องส้มอัปเดตราคาไม่สำเร็จค่ะ:", error);
    return { error: true, message: String(error) };
  }
};
