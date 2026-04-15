import { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { KpiCardSkeleton, ChartSkeleton } from '@/components/shared/Skeletons';
import { reportsApi, dashboardApi } from '@/services/api';
import { ReportData, ReportSummary, ChartDataPoint } from '@/types';
import { CalendarIcon, Download, DollarSign, TrendingUp, BarChart3, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { toast } from 'sonner';

const mockSummary: ReportSummary = { totalSales: 148500, totalProfit: 42300, avgProfitMargin: 28.5, breakEvenCount: 3 };
const mockSalesVsProfit: ChartDataPoint[] = [
  { label: 'Week 1', value: 32000, secondaryValue: 9200 },
  { label: 'Week 2', value: 38000, secondaryValue: 11400 },
  { label: 'Week 3', value: 35500, secondaryValue: 10100 },
  { label: 'Week 4', value: 43000, secondaryValue: 11600 },
];
const mockTimeAnalysis: ChartDataPoint[] = [
  { label: '9AM', value: 1200 }, { label: '10AM', value: 2800 }, { label: '11AM', value: 3500 },
  { label: '12PM', value: 4200 }, { label: '1PM', value: 3800 }, { label: '2PM', value: 3200 },
  { label: '3PM', value: 2900 }, { label: '4PM', value: 3600 }, { label: '5PM', value: 4100 },
  { label: '6PM', value: 3400 },
];
const mockTopProducts: ChartDataPoint[] = [
  { label: 'Headphones', value: 24500 }, { label: 'Charger Pro', value: 18900 },
  { label: 'USB Hub', value: 15200 }, { label: 'Keyboard', value: 12800 }, { label: 'Mouse', value: 9400 },
];
// Heatmap mock: day x hour sales intensity
const mockHeatmap = (() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'];
  return days.flatMap((day, di) =>
    hours.map((hour, hi) => ({
      day, hour, dayIndex: di, hourIndex: hi,
      value: Math.floor(Math.random() * 80 + 10 + (di < 5 ? 20 : 0) + (hi >= 2 && hi <= 6 ? 30 : 0)),
    }))
  );
})();

// Profit comparison mock data
const mockProfitComparison = {
  daily: [
    { label: 'Mon', value: 1500 }, { label: 'Tue', value: 1800 }, { label: 'Wed', value: 1200 },
    { label: 'Thu', value: 2100 }, { label: 'Fri', value: 2500 }, { label: 'Sat', value: 1900 }, { label: 'Sun', value: 1340 },
  ],
  weekly: [
    { label: 'W1', value: 8400 }, { label: 'W2', value: 11200 }, { label: 'W3', value: 9800 }, { label: 'W4', value: 12900 },
  ],
  monthly: [
    { label: 'Jan', value: 38000 }, { label: 'Feb', value: 42300 }, { label: 'Mar', value: 45100 },
    { label: 'Apr', value: 39800 }, { label: 'May', value: 48500 }, { label: 'Jun', value: 52100 },
  ],
};

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = value / max;
  const opacity = 0.15 + intensity * 0.85;
  return (
    <div
      className="rounded-sm w-full aspect-square flex items-center justify-center text-[10px] font-medium"
      style={{ backgroundColor: `hsl(234 89% 64% / ${opacity})`, color: intensity > 0.5 ? 'white' : 'hsl(var(--foreground))' }}
      title={`${value} sales`}
    >
      {value}
    </div>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary>(mockSummary);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [profitPeriod, setProfitPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const from = dateRange === 'today' ? new Date() : dateRange === 'week' ? startOfWeek(new Date()) : dateRange === 'month' ? startOfMonth(new Date()) : fromDate;
    const to = toDate;
    reportsApi.get({ from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') })
      .then((res) => setSummary(res.data?.summary || mockSummary))
      .catch(() => setSummary(mockSummary))
      .finally(() => setLoading(false));
  }, [dateRange, fromDate, toDate]);

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Sales', summary.totalSales.toString()],
      ['Total Profit', summary.totalProfit.toString()],
      ['Avg Profit Margin', summary.avgProfitMargin + '%'],
      ['Break-Even Products', summary.breakEvenCount.toString()],
      [],
      ['--- Sales vs Profit ---'],
      ['Period', 'Sales', 'Profit'],
      ...mockSalesVsProfit.map((d) => [d.label, d.value.toString(), (d.secondaryValue || 0).toString()]),
      [],
      ['--- Best Time to Sell ---'],
      ['Time', 'Sales'],
      ...mockTimeAnalysis.map((d) => [d.label, d.value.toString()]),
      [],
      ['--- Top Products ---'],
      ['Product', 'Revenue'],
      ...mockTopProducts.map((d) => [d.label, d.value.toString()]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Report exported as CSV');
  };

  const kpis = [
    { label: 'Total Sales', value: summary.totalSales, prefix: '$', icon: DollarSign },
    { label: 'Total Profit', value: summary.totalProfit, prefix: '$', icon: TrendingUp },
    { label: 'Avg Margin', value: summary.avgProfitMargin, suffix: '%', decimals: 1, icon: BarChart3 },
    { label: 'Break-Even', value: summary.breakEvenCount, icon: Target },
  ];

  const heatmapMax = Math.max(...mockHeatmap.map((h) => h.value));
  const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground">Analyze your business performance</p></div>
        <div className="flex items-center gap-2">
          <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> CSV</Button>
        </div>
      </div>

      {dateRange === 'custom' && (
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('justify-start text-left font-normal', !fromDate && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />{fromDate ? format(fromDate, 'PPP') : 'From'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={fromDate} onSelect={(d) => d && setFromDate(d)} className="pointer-events-auto" /></PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('justify-start text-left font-normal', !toDate && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />{toDate ? format(toDate, 'PPP') : 'To'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={toDate} onSelect={(d) => d && setToDate(d)} className="pointer-events-auto" /></PopoverContent>
          </Popover>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => <KpiCardSkeleton key={i} />) : kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} className="text-2xl font-bold" />
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><kpi.icon className="h-5 w-5 text-primary" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sales vs Profit</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={mockSalesVsProfit}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="value" name="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="secondaryValue" name="Profit" stroke="hsl(var(--success))" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Comparison with toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Profit Comparison</CardTitle>
              <Tabs value={profitPeriod} onValueChange={(v) => setProfitPeriod(v as any)}>
                <TabsList className="h-8">
                  <TabsTrigger value="daily" className="text-xs px-2 py-1">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-2 py-1">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-2 py-1">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockProfitComparison[profitPeriod]}>
                <defs>
                  <linearGradient id="profitCompGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" name="Profit" stroke="hsl(var(--success))" fill="url(#profitCompGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Best Time to Sell</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockTimeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Products by Revenue</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockTopProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="label" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Heatmap */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Sales Heatmap (Day × Hour)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header row */}
              <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(${hours.length}, 1fr)` }}>
                <div />
                {hours.map((h) => <div key={h} className="text-center text-xs text-muted-foreground font-medium py-1">{h}</div>)}
              </div>
              {/* Data rows */}
              {days.map((day) => (
                <div key={day} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `60px repeat(${hours.length}, 1fr)` }}>
                  <div className="flex items-center text-xs text-muted-foreground font-medium">{day}</div>
                  {hours.map((hour) => {
                    const cell = mockHeatmap.find((h) => h.day === day && h.hour === hour);
                    return <HeatmapCell key={`${day}-${hour}`} value={cell?.value || 0} max={heatmapMax} />;
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Low</span>
            <div className="flex gap-0.5">
              {[0.15, 0.3, 0.5, 0.7, 0.85, 1].map((o) => (
                <div key={o} className="w-4 h-3 rounded-sm" style={{ backgroundColor: `hsl(234 89% 64% / ${o})` }} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
