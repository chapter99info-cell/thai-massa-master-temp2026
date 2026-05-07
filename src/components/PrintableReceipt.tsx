import React from 'react';
import { storeConfig } from '../config';
import { StaffStatus } from '../types';
import { services } from '../data/services';

interface PrintableReceiptProps {
  session?: StaffStatus;
  bookingData?: {
    customerName: string;
    serviceName: string;
    serviceId?: string;
    therapistName: string;
    providerNumber?: string;
    amount: number;
    paymentMethod: string;
    healthFund?: string;
    memberId?: string;
    date: Date;
  };
  paymentMethod?: string;
  hicapsData?: { claim: number; gap: number };
  date?: Date;
}

export default function PrintableReceipt({ session, bookingData, paymentMethod: propPaymentMethod, hicapsData, date: propDate }: PrintableReceiptProps) {
  // Normalize data from either session or bookingData
  const displayDate = bookingData?.date || propDate || new Date();
  const displayPaymentMethod = bookingData?.paymentMethod || propPaymentMethod || 'Cash';
  const displayCustomer = bookingData?.customerName || session?.currentCustomer || 'Guest';
  const displayService = bookingData?.serviceName || session?.currentService || 'Massage Service';
  const displayServiceId = bookingData?.serviceId || session?.currentServiceId;
  const displayTherapist = bookingData?.therapistName || session?.therapistName || 'Staff';
  const displayProviderNo = bookingData?.providerNumber || session?.providerNumber;
  const displayHealthFund = bookingData?.healthFund || session?.healthFund;
  const displayMemberId = bookingData?.memberId || session?.memberId;

  const amount = bookingData?.amount !== undefined 
    ? bookingData.amount 
    : (displayPaymentMethod === 'HICAPS' && hicapsData 
      ? hicapsData.claim + hicapsData.gap 
      : (session?.currentPrice || 0));
  
  const gst = amount / 11;
  const subtotal = amount - gst;

  const serviceTips = displayServiceId ? services.find(s => s.id === displayServiceId)?.postCareTips : null;

  return (
    <div className="print-only font-mono text-black bg-white p-4 w-full max-w-[80mm] mx-auto text-[10px] leading-tight">
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          .print-only { display: none; }
        }
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm;
            display: block !important;
            padding: 10mm;
          }
          @page {
            size: auto;
            margin: 0;
          }
          .no-print { display: none !important; }
        }
      `}} />
      
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="text-sm font-bold uppercase">{storeConfig.storeName}</h1>
        <p>{storeConfig.address}</p>
        <p>ABN: {storeConfig.abn}</p>
        <p>Tel: {storeConfig.phone}</p>
        <div className="mt-2 font-bold border-t border-black pt-1">TAX INVOICE</div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{displayDate.toLocaleDateString('en-AU')}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{displayDate.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span>Client:</span>
          <span className="font-bold">{displayCustomer}</span>
        </div>
        {displayHealthFund && (
          <div className="flex justify-between">
            <span>Health Fund:</span>
            <span>{displayHealthFund}</span>
          </div>
        )}
        {displayMemberId && (
          <div className="flex justify-between">
            <span>Member ID:</span>
            <span>{displayMemberId}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2 pt-1">
        <div className="flex justify-between font-bold">
          <span>Therapist:</span>
          <span>{displayTherapist}</span>
        </div>
        {displayProviderNo && (
          <div className="flex justify-between">
            <span>Provider No:</span>
            <span>{displayProviderNo}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2 pt-1">
        <div className="flex justify-between">
          <span className="flex-1">{displayService}</span>
          <span className="ml-2">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-black pt-1 mt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal (Excl. GST):</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST Included (1/11):</span>
          <span>${gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-1 border-t border-black">
          <span>TOTAL PAID:</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>

      {displayPaymentMethod === 'HICAPS' && hicapsData && (
        <div className="border border-black p-1 mt-2 space-y-1">
          <div className="text-center font-bold border-b border-black mb-1">HICAPS CLAIM</div>
          <div className="flex justify-between">
            <span>Benefit Paid:</span>
            <span>-${hicapsData.claim.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Gap Payable:</span>
            <span>${hicapsData.gap.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="text-center pt-4 border-t border-black mt-4">
        <p>Payment Method: {displayPaymentMethod}</p>
        
        {serviceTips && (
          <div className="mt-4 border border-black p-2 text-left">
            <p className="font-bold border-b border-black mb-1 text-center font-sans tracking-wide">POST-CARE ADVICE</p>
            {serviceTips.map((tip, idx) => (
              <p key={idx} className="mb-1 leading-tight text-[9px]">• {tip.en}</p>
            ))}
          </div>
        )}

        <p className="mt-4 italic">Thank you for visiting {storeConfig.storeName}!</p>
        <p className="mt-1">Please keep this receipt for your records.</p>
        <p className="mt-1 text-[8px] opacity-50">System: AIS Premium Wellness v5.0</p>
      </div>
    </div>
  );
}
