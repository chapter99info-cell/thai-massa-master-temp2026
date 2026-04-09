import React from 'react';
import { storeConfig } from '../config';
import { StaffStatus } from '../types';

interface PrintableReceiptProps {
  session: StaffStatus;
  paymentMethod: string;
  hicapsData?: { claim: number; gap: number };
  date: Date;
}

export default function PrintableReceipt({ session, paymentMethod, hicapsData, date }: PrintableReceiptProps) {
  const amount = paymentMethod === 'HICAPS' && hicapsData 
    ? hicapsData.claim + hicapsData.gap 
    : (session.currentPrice || 0);
  
  const gst = amount / 11;
  const subtotal = amount - gst;

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
          <span>{date.toLocaleDateString('en-AU')}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span>Client:</span>
          <span className="font-bold">{session.currentCustomer || 'Guest'}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2 pt-1">
        <div className="flex justify-between font-bold">
          <span>Therapist:</span>
          <span>{session.therapistName}</span>
        </div>
        {session.providerNumber && (
          <div className="flex justify-between">
            <span>Provider No:</span>
            <span>{session.providerNumber}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2 pt-1">
        <div className="flex justify-between">
          <span className="flex-1">{session.currentService || 'Massage Service'}</span>
          <span className="ml-2">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-black pt-1 mt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (10%):</span>
          <span>${gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      </div>

      {paymentMethod === 'HICAPS' && hicapsData && (
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
        <p>Paid via: {paymentMethod}</p>
        <p className="mt-2 italic">Thank you for visiting us!</p>
        <p className="mt-1">Please keep this receipt for your records.</p>
      </div>
    </div>
  );
}
