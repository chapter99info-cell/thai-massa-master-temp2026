export interface DHRReceipt {
  id: string;
  shopName: string;
  abn: string;
  items: Array<{ name: string; price: number }>;
  total: number;
  date: string;
  gst: number;
}
