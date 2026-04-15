import axios from 'axios';
import type { DashboardData, Insight, Product, User } from '@/types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helpers
const mapProductFromApi = (p: any): Product => {
  const profitMargin = p.selling_price ? ((p.selling_price - p.cost_price) / p.selling_price) * 100 : 0;
  return {
    id: String(p.id),
    name: p.name,
    sku: p.sku ?? '',
    category: p.category ?? '',
    costPrice: p.cost_price,
    sellingPrice: p.selling_price,
    stock: p.stock,
    profitMargin,
    imageUrl: p.image_url || p.imageUrl,
  };
};

const mapProductToApi = (p: Partial<Product>) => ({
  name: p.name,
  sku: p.sku,
  category: p.category,
  cost_price: p.costPrice,
  selling_price: p.sellingPrice,
  stock: p.stock,
  image_url: p.imageUrl,
});

// Auth
export const authApi = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  register: (data: { username: string; full_name?: string; password: string; role: string }) =>
    api.post('/auth/register', data),
};

// Dashboard (maps backend KPIs + insights into UI shape)
export const dashboardApi = {
  async getData(): Promise<DashboardData> {
    const [kpisRes, lowStockRes, topProductsRes] = await Promise.all([
      api.get('/reports/kpis'),
      api.get('/insights/low-stock'),
      api.get('/insights/top-products'),
    ]);

    const kpis = kpisRes.data || {};
    const lowStock = (lowStockRes.data || []).map(mapProductFromApi);
    const topProducts = topProductsRes.data || [];
    const best = topProducts[0]
      ? {
          id: String(topProducts[0].product_id || topProducts[0].productId || topProducts[0].id || '0'),
          name: topProducts[0].name,
          sku: topProducts[0].sku || '',
          category: '',
          costPrice: 0,
          sellingPrice: 0,
          stock: 0,
          profitMargin: 0,
        }
      : null;

    return {
      totalSales: kpis.revenue ?? 0,
      totalProfit: kpis.profit ?? 0,
      profitMargin: (kpis.gross_margin ?? 0) * 100,
      inventoryValue: kpis.inventory_value ?? 0,
      healthScore: Math.min(100, Math.max(0, (kpis.business_score ?? 0) * 100)),
      salesTrend: [],
      profitTrend: [],
      bestSellingProduct: best,
      productOfTheWeek: null,
      lowStockAlerts: lowStock,
    };
  },

  async getInsights(): Promise<Insight[]> {
    const [kpisRes, lowStockRes, topProductsRes] = await Promise.all([
      api.get('/reports/kpis'),
      api.get('/insights/low-stock'),
      api.get('/insights/top-products'),
    ]);

    const kpis = kpisRes.data || {};
    const lowStock = lowStockRes.data || [];
    const topProducts = topProductsRes.data || [];
    const marginPct = Math.round((kpis.gross_margin ?? 0) * 100);

    const insights: Insight[] = [];

    if (topProducts[0]) {
      insights.push({
        id: 'top-product',
        type: 'success',
        icon: 'success',
        title: 'Top Selling Product',
        description: `${topProducts[0].name} sold ${topProducts[0].units_sold ?? 0} units.`,
        actionLabel: 'Open Reports',
        actionUrl: '/reports',
      });
    }

    if (lowStock.length > 0) {
      insights.push({
        id: 'low-stock',
        type: 'warning',
        icon: 'warning',
        title: 'Low Stock Alert',
        description: `${lowStock.length} product(s) are at or below stock threshold.`,
        actionLabel: 'Review Products',
        actionUrl: '/products',
      });
    }

    insights.push({
      id: 'margin-health',
      type: marginPct >= 25 ? 'success' : marginPct >= 15 ? 'warning' : 'danger',
      icon: marginPct >= 15 ? 'info' : 'danger',
      title: 'Current Gross Margin',
      description: `Gross margin is ${marginPct}%. Revenue: $${(kpis.revenue ?? 0).toFixed(2)}.`,
      actionLabel: 'View KPIs',
      actionUrl: '/reports',
    });

    return insights;
  },
};

// Products
export const productsApi = {
  async getAll(params?: { search?: string; page?: number; limit?: number }) {
    const res = await api.get('/products', { params });
    const data = Array.isArray(res.data) ? res.data : res.data?.products || [];
    return data.map(mapProductFromApi);
  },
  create: (data: Partial<Product>) => api.post('/products', mapProductToApi(data)),
  update: (id: string | number, data: Partial<Product>) => api.patch(`/products/${id}`, mapProductToApi(data)),
  delete: (id: string | number) => api.delete(`/products/${id}`),
};

// Sales / Billing
export const salesApi = {
  create: (data: object) => api.post('/sales', data),
  invoice: (saleId: number | string) => api.get(`/sales/${saleId}/invoice`),
};

// Reports
export const reportsApi = {
  summary: () => api.get('/reports/summary'),
  profit: () => api.get('/reports/profit'),
  kpis: () => api.get('/reports/kpis'),
  // Convenience for Reports page (maps to expected summary shape)
  get: (params?: { from?: string; to?: string }) =>
    api.get('/reports/kpis', { params }).then((res) => {
      const d = res.data || {};
      return {
        data: {
          summary: {
            totalSales: d.revenue ?? 0,
            totalProfit: d.profit ?? 0,
            avgProfitMargin: (d.gross_margin ?? 0) * 100,
            breakEvenCount: d.break_even?.achieved ? 1 : 0,
          },
        },
      } as const;
    }),
  profitPerItem: (limit?: number) => api.get('/reports/profit-per-item', { params: { limit } }),
  heatmap: () => api.get('/reports/heatmap'),
  breakEven: () => api.get('/reports/break-even'),
};

// Returns (not implemented server-side; placeholder for future)
export const returnsApi = {
  create: async (_data: object) => Promise.reject(new Error('Returns API not implemented')),
  getAll: async (_params?: { from?: string; to?: string }) => Promise.reject(new Error('Returns API not implemented')),
};

export default api;
