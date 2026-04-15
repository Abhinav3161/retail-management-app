import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Package, Crown, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { KpiCardSkeleton, ChartSkeleton } from '@/components/shared/Skeletons';
import { dashboardApi } from '@/services/api';
import { DashboardData } from '@/types';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWebSocket } from '@/hooks/useWebSocket';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Mock data for when API is unavailable
const mockData: DashboardData = {
  totalSales: 48750,
  totalProfit: 12340,
  profitMargin: 25.3,
  inventoryValue: 156780,
  healthScore: 78,
  salesTrend: [
    { label: 'Mon', value: 6200 }, { label: 'Tue', value: 7100 }, { label: 'Wed', value: 5800 },
    { label: 'Thu', value: 8400 }, { label: 'Fri', value: 9200 }, { label: 'Sat', value: 7650 }, { label: 'Sun', value: 4400 },
  ],
  profitTrend: [
    { label: 'Mon', value: 1500 }, { label: 'Tue', value: 1800 }, { label: 'Wed', value: 1200 },
    { label: 'Thu', value: 2100 }, { label: 'Fri', value: 2500 }, { label: 'Sat', value: 1900 }, { label: 'Sun', value: 1340 },
  ],
  bestSellingProduct: { id: '1', name: 'Premium Headphones', sku: 'HP-001', costPrice: 45, sellingPrice: 89.99, stock: 34, profitMargin: 50, imageUrl: '' },
  productOfTheWeek: { id: '2', name: 'Wireless Charger Pro', sku: 'WC-100', costPrice: 12, sellingPrice: 39.99, stock: 120, profitMargin: 70, imageUrl: '' },
  lowStockAlerts: [
    { id: '3', name: 'USB-C Cable', sku: 'UC-010', costPrice: 2, sellingPrice: 9.99, stock: 3, profitMargin: 80, imageUrl: '' },
    { id: '4', name: 'Screen Protector', sku: 'SP-020', costPrice: 1, sellingPrice: 12.99, stock: 5, profitMargin: 92, imageUrl: '' },
  ],
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { on } = useWebSocket();

  const refreshData = useCallback(() => {
    dashboardApi.getData()
      .then((res) => setData(res))
      .catch(() => setData((prev) => prev || mockData))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  // Live updates via WebSocket
  useEffect(() => {
    const unsubs = [
      on('sale_completed', () => refreshData()),
      on('low_stock_alert', (payload) => {
        setData((prev) => {
          if (!prev) return prev;
          const alreadyExists = prev.lowStockAlerts.some((a) => a.id === payload.productId);
          if (alreadyExists) return prev;
          return {
            ...prev,
            lowStockAlerts: [...prev.lowStockAlerts, { id: payload.productId, name: payload.productName || 'Unknown', sku: '', costPrice: 0, sellingPrice: 0, stock: payload.stock ?? 0, profitMargin: 0 }].slice(0, 5),
          };
        });
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [on, refreshData]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Dashboard</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <KpiCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton /> <ChartSkeleton />
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Sales Today', value: data.totalSales, prefix: '$', trend: 12.5, icon: DollarSign, color: 'text-primary' },
    { label: 'Total Profit', value: data.totalProfit, prefix: '$', trend: 8.2, icon: TrendingUp, color: 'text-success' },
    { label: 'Profit Margin', value: data.profitMargin, suffix: '%', trend: -2.1, icon: TrendingUp, decimals: 1, color: 'text-warning' },
    { label: 'Inventory Value', value: data.inventoryValue, prefix: '$', trend: 3.4, icon: Package, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={item}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} className="text-3xl font-bold" />
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {kpi.trend > 0 ? (
                    <Badge variant="secondary" className="bg-success/10 text-success border-0 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" /> +{kpi.trend}%
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0 text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" /> {kpi.trend}%
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts + Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Sales Trend (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Business Health</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <CircularProgress value={data.healthScore} label="Score" size={140} />
            <p className="mt-4 text-sm text-muted-foreground text-center">
              {data.healthScore >= 70 ? 'Your business is performing well!' : data.healthScore >= 40 ? 'Room for improvement.' : 'Needs attention.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Overview */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Profit Overview</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.profitTrend}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--success))" fill="url(#profitGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Selling */}
        {data.bestSellingProduct && (
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="h-full">
              <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Best Selling</CardTitle></CardHeader>
              <CardContent>
                <p className="font-semibold text-lg">{data.bestSellingProduct.name}</p>
                <p className="text-sm text-muted-foreground">{data.bestSellingProduct.sku}</p>
                <Badge className="mt-2 bg-success/10 text-success border-0">{data.bestSellingProduct.profitMargin}% margin</Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Product of the Week */}
        {data.productOfTheWeek && (
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="h-full">
              <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Crown className="h-4 w-4" /> Product of the Week</CardTitle></CardHeader>
              <CardContent>
                <p className="font-semibold text-lg">{data.productOfTheWeek.name}</p>
                <p className="text-sm text-muted-foreground">${data.productOfTheWeek.sellingPrice}</p>
                <Badge className="mt-2 gradient-primary text-primary-foreground border-0">👑 Top Pick</Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Low Stock */}
        <motion.div variants={item} initial="hidden" animate="show">
          <Card className="h-full">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Low Stock Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.lowStockAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">All products well stocked!</p>
              ) : (
                data.lowStockAlerts.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-sm truncate">{p.name}</span>
                    <Badge variant="destructive" className="text-xs">{p.stock} left</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
