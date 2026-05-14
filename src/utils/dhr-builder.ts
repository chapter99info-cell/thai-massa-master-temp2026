import { DHRReceipt } from '../types/dhr-payload';

export const calculateTax = (amount: number): number => {
  return amount * 0.1; // Assuming 10% GST
};

export const buildReceiptPayload = (data: Omit<DHRReceipt, 'id'>): DHRReceipt => {
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
  };
};
