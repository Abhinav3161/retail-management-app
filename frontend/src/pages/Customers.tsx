import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, ChevronDown, ChevronRight, Mail, Phone, MapPin, ShoppingBag, Calendar, DollarSign, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { format } from 'date-fns';

interface Purchase {
  id: string;
  date: string;
  items: number;
  total: number;
  status: 'completed' | 'refunded' | 'pending';
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalSpent: number;
  totalOrders: number;
  lastOrder: string;
  joinedAt: string;
  status: 'active' | 'inactive';
  purchases: Purchase[];
}

const mockCustomers: Customer[] = [
  {
    id: 'c1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 (555) 123-4567',
    location: 'New York, NY', totalSpent: 2847.50, totalOrders: 12, lastOrder: '2026-02-22', joinedAt: '2025-06-15', status: 'active',
    purchases: [
      { id: 'p1', date: '2026-02-22', items: 3, total: 249.97, status: 'completed' },
      { id: 'p2', date: '2026-02-15', items: 1, total: 89.99, status: 'completed' },
      { id: 'p3', date: '2026-01-28', items: 2, total: 129.98, status: 'refunded' },
    ],
  },
  {
    id: 'c2', name: 'Michael Chen', email: 'michael@example.com', phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA', totalSpent: 5120.00, totalOrders: 24, lastOrder: '2026-02-23', joinedAt: '2024-11-02', status: 'active',
    purchases: [
      { id: 'p4', date: '2026-02-23', items: 5, total: 459.95, status: 'completed' },
      { id: 'p5', date: '2026-02-18', items: 2, total: 159.98, status: 'completed' },
      { id: 'p6', date: '2026-02-10', items: 1, total: 79.99, status: 'pending' },
    ],
  },
  {
    id: 'c3', name: 'Emily Rodriguez', email: 'emily@example.com', phone: '+1 (555) 345-6789',
    location: 'Austin, TX', totalSpent: 1230.75, totalOrders: 8, lastOrder: '2026-02-19', joinedAt: '2025-08-20', status: 'active',
    purchases: [
      { id: 'p7', date: '2026-02-19', items: 2, total: 94.98, status: 'completed' },
      { id: 'p8', date: '2026-02-05', items: 4, total: 289.96, status: 'completed' },
    ],
  },
  {
    id: 'c4', name: 'James Wilson', email: 'james@example.com', phone: '+1 (555) 456-7890',
    location: 'Chicago, IL', totalSpent: 670.25, totalOrders: 4, lastOrder: '2026-01-30', joinedAt: '2025-12-01', status: 'inactive',
    purchases: [
      { id: 'p9', date: '2026-01-30', items: 1, total: 54.99, status: 'completed' },
      { id: 'p10', date: '2026-01-12', items: 3, total: 199.97, status: 'completed' },
    ],
  },
  {
    id: 'c5', name: 'Priya Patel', email: 'priya@example.com', phone: '+1 (555) 567-8901',
    location: 'Seattle, WA', totalSpent: 3890.00, totalOrders: 18, lastOrder: '2026-02-24', joinedAt: '2025-03-10', status: 'active',
    purchases: [
      { id: 'p11', date: '2026-02-24', items: 2, total: 179.98, status: 'completed' },
      { id: 'p12', date: '2026-02-20', items: 6, total: 539.94, status: 'completed' },
      { id: 'p13', date: '2026-02-14', items: 1, total: 39.99, status: 'refunded' },
    ],
  },
  {
    id: 'c6', name: 'David Kim', email: 'david@example.com', phone: '+1 (555) 678-9012',
    location: 'Los Angeles, CA', totalSpent: 920.50, totalOrders: 6, lastOrder: '2026-02-16', joinedAt: '2025-09-25', status: 'active',
    purchases: [
      { id: 'p14', date: '2026-02-16', items: 3, total: 149.97, status: 'completed' },
      { id: 'p15', date: '2026-01-25', items: 2, total: 109.98, status: 'completed' },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return <Badge className="bg-success/10 text-success border-0">Active</Badge>;
  if (status === 'inactive') return <Badge className="bg-muted text-muted-foreground border-0">Inactive</Badge>;
  if (status === 'completed') return <Badge className="bg-success/10 text-success border-0 text-xs">Completed</Badge>;
  if (status === 'refunded') return <Badge className="bg-destructive/10 text-destructive border-0 text-xs">Refunded</Badge>;
  return <Badge className="bg-warning/10 text-warning border-0 text-xs">Pending</Badge>;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Customers() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => mockCustomers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const totalCustomers = mockCustomers.length;
  const activeCustomers = mockCustomers.filter((c) => c.status === 'active').length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0);

  const kpis = [
    { label: 'Total Customers', value: totalCustomers, icon: Users },
    { label: 'Active Customers', value: activeCustomers, icon: User },
    { label: 'Total Revenue', value: totalRevenue, prefix: '$', icon: DollarSign },
    { label: 'Avg Order Value', value: avgOrderValue, prefix: '$', decimals: 2, icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage your customer base and purchase history</p>
      </div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={item}>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <AnimatedCounter value={kpi.value} prefix={kpi.prefix} decimals={kpi.decimals} className="text-2xl font-bold" />
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <>
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                  >
                    <TableCell>
                      {expandedId === customer.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {customer.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {customer.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /> {customer.email}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-center">{customer.totalOrders}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(customer.lastOrder), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-center"><StatusBadge status={customer.status} /></TableCell>
                  </TableRow>

                  {/* Expanded purchase history */}
                  <AnimatePresence>
                    {expandedId === customer.id && (
                      <TableRow key={`${customer.id}-history`}>
                        <TableCell colSpan={7} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-muted/30 p-4 border-t border-border">
                              <div className="flex items-center gap-2 mb-3">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-semibold">Purchase History</h4>
                                <Badge variant="secondary" className="text-xs">{customer.purchases.length} transactions</Badge>
                              </div>
                              <div className="space-y-2">
                                {customer.purchases.map((purchase) => (
                                  <div key={purchase.id} className="flex items-center justify-between bg-card rounded-lg px-4 py-2.5 border border-border/50">
                                    <div className="flex items-center gap-4">
                                      <div className="text-sm">
                                        <p className="font-medium">Order #{purchase.id.toUpperCase()}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(purchase.date), 'MMM d, yyyy')}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-xs text-muted-foreground">{purchase.items} item(s)</span>
                                      <span className="text-sm font-semibold">${purchase.total.toFixed(2)}</span>
                                      <StatusBadge status={purchase.status} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Member since {format(new Date(customer.joinedAt), 'MMM yyyy')}</span>
                                <span className="font-medium">Lifetime value: <span className="text-primary">${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
                              </div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium">No customers found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
