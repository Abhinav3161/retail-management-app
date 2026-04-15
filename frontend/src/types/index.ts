export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  profitMargin: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  products: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  profit: number;
  createdAt: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface DashboardData {
  totalSales: number;
  totalProfit: number;
  profitMargin: number;
  inventoryValue: number;
  healthScore: number;
  salesTrend: ChartDataPoint[];
  profitTrend: ChartDataPoint[];
  bestSellingProduct: Product | null;
  productOfTheWeek: Product | null;
  lowStockAlerts: Product[];
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ReportSummary {
  totalSales: number;
  totalProfit: number;
  avgProfitMargin: number;
  breakEvenCount: number;
}

export interface ReportData {
  summary: ReportSummary;
  salesVsProfit: ChartDataPoint[];
  bestTimeToSell: ChartDataPoint[];
  topProductsByRevenue: ChartDataPoint[];
}

export interface ReturnItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: 'damaged' | 'customer_return' | 'expired';
  lossAmount: number;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  full_name?: string | null;
  role: 'admin' | 'staff' | 'cashier';
  name?: string; // optional alias used by UI
  email?: string; // alias when using email as username
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
