import headphonesImg from '@/assets/products/headphones.jpg';
import chargerImg from '@/assets/products/charger.jpg';
import usbHubImg from '@/assets/products/usb-hub.jpg';
import keyboardImg from '@/assets/products/keyboard.jpg';
import mouseImg from '@/assets/products/mouse.jpg';
import monitorStandImg from '@/assets/products/monitor-stand.jpg';
import webcamImg from '@/assets/products/webcam.jpg';
import usbCableImg from '@/assets/products/usb-cable.jpg';

/** Map SKU → imported image for mock products */
export const productImages: Record<string, string> = {
  'HP-001': headphonesImg,
  'WC-100': chargerImg,
  'UH-007': usbHubImg,
  'MK-200': keyboardImg,
  'EM-050': mouseImg,
  'MS-300': monitorStandImg,
  'WB-400': webcamImg,
  'UC-010': usbCableImg,
};

/** Get product image by SKU, falling back to empty string */
export function getProductImage(sku?: string): string {
  if (!sku) return '';
  return productImages[sku] || '';
}
