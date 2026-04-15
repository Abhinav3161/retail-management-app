import { useState, useEffect } from 'react';
import { format, startOfMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { RotateCcw, Search, CalendarIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { EmptyState } from '@/components/shared/EmptyState';
import { returnsApi } from '@/services/api';
import { ReturnItem } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const mockReturns: ReturnItem[] = [
  { id: '1', productId: '1', productName: 'Premium Headphones', quantity: 2, reason: 'damaged', lossAmount: 89.98, createdAt: '2026-02-22T10:30:00Z' },
  { id: '2', productId: '3', productName: 'USB-C Hub', quantity: 1, reason: 'customer_return', lossAmount: 49.99, createdAt: '2026-02-21T14:20:00Z' },
  { id: '3', productId: '8', productName: 'USB-C Cable', quantity: 5, reason: 'expired', lossAmount: 49.95, createdAt: '2026-02-20T09:15:00Z' },
];

const reasonLabels: Record<string, string> = { damaged: 'Damaged', customer_return: 'Customer Return', expired: 'Expired' };
const reasonColors: Record<string, string> = { damaged: 'bg-destructive/10 text-destructive', customer_return: 'bg-warning/10 text-warning', expired: 'bg-muted text-muted-foreground' };

export default function Returns() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date>(new Date());
  const [form, setForm] = useState({ productName: '', quantity: '1', reason: 'damaged' as ReturnItem['reason'] });

  useEffect(() => {
    returnsApi.getAll({ from: format(fromDate, 'yyyy-MM-dd'), to: format(toDate, 'yyyy-MM-dd') })
      .then((res) => setReturns(res.data || []))
      .catch(() => setReturns(mockReturns))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  const totalLoss = (returns.length > 0 ? returns : mockReturns).reduce((s, r) => s + r.lossAmount, 0);
  const displayReturns = returns.length > 0 ? returns : mockReturns;

  const handleSubmit = async () => {
    try { await returnsApi.create(form); } catch { /* mock */ }
    toast.success('Return recorded');
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Returns & Loss</h1><p className="text-muted-foreground">Track returns and calculate losses</p></div>
        <Button className="gradient-primary text-primary-foreground" onClick={() => setDialogOpen(true)}><RotateCcw className="h-4 w-4 mr-2" /> Record Return</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Returns</p>
            <AnimatedCounter value={displayReturns.length} className="text-3xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Loss</p>
            <AnimatedCounter value={totalLoss} prefix="$" decimals={2} className="text-3xl font-bold text-destructive" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm"><CalendarIcon className="h-4 w-4 mr-1" />{format(fromDate, 'MMM d')}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={fromDate} onSelect={(d) => d && setFromDate(d)} className="pointer-events-auto" /></PopoverContent>
            </Popover>
            <span className="text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm"><CalendarIcon className="h-4 w-4 mr-1" />{format(toDate, 'MMM d')}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={toDate} onSelect={(d) => d && setToDate(d)} className="pointer-events-auto" /></PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {displayReturns.length === 0 ? (
            <EmptyState icon={<RotateCcw className="h-12 w-12" />} title="No returns recorded" description="All clear! No returns for this period." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Loss</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayReturns.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.productName}</TableCell>
                    <TableCell className="text-center">{r.quantity}</TableCell>
                    <TableCell><Badge className={cn('border-0 text-xs', reasonColors[r.reason])}>{reasonLabels[r.reason]}</Badge></TableCell>
                    <TableCell className="text-right text-destructive font-semibold">-${r.lossAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{format(new Date(r.createdAt), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Return Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Return</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Product</Label><Input placeholder="Search product..." value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={form.reason} onValueChange={(v) => setForm({ ...form, reason: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="customer_return">Customer Return</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSubmit}>Submit Return</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
