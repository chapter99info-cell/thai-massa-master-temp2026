import EscPosEncoder from 'esc-pos-encoder';
import { storeConfig } from '../config';

export interface ReceiptData {
  storeName: string;
  abn: string;
  address: string;
  date: string;
  customer: string;
  therapist: string;
  providerNumber?: string;
  service: string;
  price: number;
  paymentMethod: string;
  hicaps?: {
    claim: number;
    gap: number;
  };
}

class PrinterService {
  private encoder = new EscPosEncoder();

  private generateEscPos(data: ReceiptData): Uint8Array {
    let result = this.encoder
      .initialize()
      .align('center')
      .size('large')
      .line(data.storeName)
      .size('normal')
      .line('Sydney, Australia')
      .line(`ABN: ${data.abn}`)
      .line('--------------------------------')
      .line('TAX INVOICE')
      .line('--------------------------------')
      .align('left')
      .line(`Date: ${data.date}`)
      .line(`Customer: ${data.customer}`)
      .line(`Therapist: ${data.therapist}`)
      .line(`Provider No: ${data.providerNumber || 'N/A'}`)
      .line('--------------------------------')
      .align('left')
      .text(data.service)
      .align('right')
      .line(`$${data.price.toFixed(2)}`)
      .align('left')
      .line('--------------------------------')
      .line(`Subtotal: $${(data.price / 1.1).toFixed(2)}`)
      .line(`GST (10%): ${(data.price / 11).toFixed(2)}`)
      .line('--------------------------------')
      .align('center')
      .size('large')
      .line(`TOTAL: $${data.price.toFixed(2)}`)
      .size('normal')
      .line('--------------------------------')
      .line(`PAID VIA: ${data.paymentMethod}`)
      .line('--------------------------------');

    if (data.hicaps) {
      result = result
        .line('HICAPS BREAKDOWN')
        .line(`Claim: -$${data.hicaps.claim.toFixed(2)}`)
        .line(`Gap: $${data.hicaps.gap.toFixed(2)}`)
        .line('--------------------------------');
    }

    result = result
      .align('center')
      .line('Thank you for visiting us!')
      .line('Please keep this receipt.')
      .feed(4)
      .cut();

    return result.encode();
  }

  async printViaUSB(data: ReceiptData) {
    try {
      // @ts-ignore
      const device = await navigator.usb.requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      
      const rawData = this.generateEscPos(data);
      await device.transferOut(1, rawData);
      await device.close();
      return true;
    } catch (error) {
      console.error('USB Print Error:', error);
      throw error;
    }
  }

  async printViaBluetooth(data: ReceiptData) {
    try {
      // @ts-ignore
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Common thermal printer service
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      
      const rawData = this.generateEscPos(data);
      // Bluetooth packets are usually limited to 20-512 bytes
      const chunkSize = 20;
      for (let i = 0; i < rawData.length; i += chunkSize) {
        await characteristic.writeValue(rawData.slice(i, i + chunkSize));
      }
      
      await server.disconnect();
      return true;
    } catch (error) {
      console.error('Bluetooth Print Error:', error);
      throw error;
    }
  }

  async printViaCloud(data: ReceiptData, token: string) {
    // Mock Sunmi Cloud Print API call
    console.log('Printing via Sunmi Cloud...', { data, token });
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }

  async printAuto(data: ReceiptData, settings: any) {
    // Try Cloud first, then USB, then Bluetooth, fallback to Window Print
    try {
      if (settings.sunmiCloudToken) {
        await this.printViaCloud(data, settings.sunmiCloudToken);
        return 'CLOUD';
      }
    } catch (e) {
      console.warn('Cloud print failed, trying USB...');
    }

    try {
      // Note: USB/BT require user interaction, so we might just return a flag to trigger UI
      return 'WINDOW'; 
    } catch (e) {
      return 'WINDOW';
    }
  }
}

export const printerService = new PrinterService();
