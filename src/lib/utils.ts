import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)} AUD`;
}

export function generateLuxuryReceipt(customerName: string, service: string, timestamp: Date): string {
  const dateStr = timestamp.toLocaleDateString('en-AU');
  const timeStr = timestamp.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  
  return `
-----------------------------------------
              TAX INVOICE                
-----------------------------------------
        Premium Thai Wellness            
      ABN: 12 345 678 910                
         Sydney, NSW                     
-----------------------------------------
Date: ${dateStr}   Time: ${timeStr}      
Customer: ${customerName}                
Service: ${service}                      
Amount: $120.00 (Incl. GST)              
-----------------------------------------
    Thank you for choosing us!           
  We hope your experience was relaxing.  
-----------------------------------------
`;
}
