import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, X, ShoppingCart, Printer, Download, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { productsApi, salesApi } from '@/services/api';
import { Product, CartItem } from '@/types';
import { toast } from 'sonner';
import InvoiceTemplate from '@/components/billing/InvoiceTemplate';
import { ConfettiEffect } from '@/components/billing/ConfettiEffect';
import { downloadInvoicePDF } from '@/utils/invoicePDF';
import { getProductImage } from '@/utils/productImages';

const mockProducts: Product[] = [
  { id: '1', name: 'Premium Headphones', sku: 'HP-001', costPrice: 45, sellingPrice: 89.99, stock: 34, profitMargin: 50 },
  { id: '2', name: 'Wireless Charger Pro', sku: 'WC-100', costPrice: 12, sellingPrice: 39.99, stock: 120, profitMargin: 70 },
  { id: '3', name: 'USB-C Hub 7-in-1', sku: 'UH-007', costPrice: 18, sellingPrice: 49.99, stock: 56, profitMargin: 64 },
  { id: '4', name: 'Mechanical Keyboard', sku: 'MK-200', costPrice: 35, sellingPrice: 79.99, stock: 22, profitMargin: 56 },
  { id: '5', name: 'Ergonomic Mouse', sku: 'EM-050', costPrice: 15, sellingPrice: 34.99, stock: 88, profitMargin: 57 },
  { id: '6', name: 'Monitor Stand', sku: 'MS-300', costPrice: 20, sellingPrice: 54.99, stock: 41, profitMargin: 64 },
  { id: '7', name: 'Webcam HD', sku: 'WB-400', costPrice: 25, sellingPrice: 59.99, stock: 15, profitMargin: 58 },
  { id: '8', name: 'USB-C Cable 2m', sku: 'UC-010', costPrice: 2, sellingPrice: 9.99, stock: 3, profitMargin: 80 },
];

function generateInvoiceNumber() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
}

const LOW_STOCK_THRESHOLD = 5;

export default function Billing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState(8);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'%' | '$'>('%');
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [lastSaleCart, setLastSaleCart] = useState<CartItem[]>([]);
  const [lastSaleTotals, setLastSaleTotals] = useState({ subtotal: 0, taxAmount: 0, discountAmount: 0, total: 0, expectedProfit: 0 });
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productsApi.getAll()
      .then((res) => setProducts(res || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart((prev) => prev.map((c) => {
      if (c.product.id === productId) {
        const newQty = c.quantity + delta;
        return newQty <= 0 ? c : { ...c, quantity: newQty };
      }
      return c;
    }));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, c) => sum + c.product.sellingPrice * c.quantity, 0), [cart]);
  const discountAmount = useMemo(() => discountType === '%' ? subtotal * (discount / 100) : discount, [subtotal, discount, discountType]);
  const taxAmount = useMemo(() => (subtotal - discountAmount) * (taxRate / 100), [subtotal, discountAmount, taxRate]);
  const total = useMemo(() => subtotal - discountAmount + taxAmount, [subtotal, discountAmount, taxAmount]);
  const expectedProfit = useMemo(() => cart.reduce((sum, c) => sum + (c.product.sellingPrice - c.product.costPrice) * c.quantity, 0) - discountAmount, [cart, discountAmount]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const invNum = generateInvoiceNumber();
    setInvoiceNumber(invNum);
    setLastSaleCart([...cart]);
    setLastSaleTotals({ subtotal, taxAmount, discountAmount, total, expectedProfit });
    try {
      await salesApi.create({ products: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity })), subtotal, tax: taxAmount, discount: discountAmount, total, profit: expectedProfit });
    } catch { /* API unavailable, continue with success UX */ }
    setShowSuccess(true);
    toast.success('Invoice generated successfully!');
    setTimeout(() => { setShowSuccess(false); setCart([]); setDiscount(0); }, 2500);
  };

  const handlePrintInvoice = () => {
    if (lastSaleCart.length === 0 && cart.length === 0) return;
    const printCart = lastSaleCart.length > 0 ? lastSaleCart : cart;
    const printTotals = lastSaleCart.length > 0 ? lastSaleTotals : { subtotal, taxAmount, discountAmount, total, expectedProfit };
    setLastSaleCart(printCart);
    setLastSaleTotals(printTotals);
    if (!invoiceNumber) setInvoiceNumber(generateInvoiceNumber());
    setShowInvoice(true);
  };

  const handleDownloadPDF = () => {
    const pdfCart = lastSaleCart.length > 0 ? lastSaleCart : cart;
    const pdfTotals = lastSaleCart.length > 0 ? lastSaleTotals : { subtotal, taxAmount, discountAmount, total, expectedProfit };
    if (pdfCart.length === 0) return;
    const invNum = invoiceNumber || generateInvoiceNumber();
    if (!invoiceNumber) setInvoiceNumber(invNum);
    downloadInvoicePDF({
      cart: pdfCart,
      subtotal: pdfTotals.subtotal,
      taxAmount: pdfTotals.taxAmount,
      taxRate,
      discountAmount: pdfTotals.discountAmount,
      total: pdfTotals.total,
      expectedProfit: pdfTotals.expectedProfit,
      invoiceNumber: invNum,
    });
    toast.success('PDF downloaded!');
  };

  const mergedProducts = useMemo(() => {
    const byKey = new Map<string, Product>();
    for (const p of mockProducts) {
      const key = (p.sku || p.name).toLowerCase();
      byKey.set(key, p);
    }
    for (const p of products) {
      const key = (p.sku || p.name).toLowerCase();
      byKey.set(key, p);
    }
    return Array.from(byKey.values());
  }, [products]);

  const allProducts = mergedProducts;
  const filteredProducts = search.trim()
    ? allProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    : allProducts;
  const displayProducts = search.trim() ? filteredProducts : filteredProducts.slice(0, 6);

  return (
    <div className="space-y-6">
      <ConfettiEffect active={showSuccess} />

      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Create invoices and process sales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search & Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {displayProducts.map((product) => (
              <motion.div key={product.id} layout whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addToCart(product)}>
                  <CardContent className="p-4">
                    {(product.imageUrl || getProductImage(product.sku)) ? (
                      <img src={product.imageUrl || getProductImage(product.sku)} alt={product.name} className="h-20 rounded-md mb-3 w-full object-cover" />
                    ) : (
                      <div className="h-20 bg-muted rounded-md mb-3 flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-lg">${product.sellingPrice.toFixed(2)}</span>
                      {product.stock <= LOW_STOCK_THRESHOLD ? (
                        <Badge variant="destructive" className="text-xs">Only {product.stock} left</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">{product.stock} in stock</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Cart
                {cart.length > 0 && <Badge className="gradient-primary text-primary-foreground border-0">{cart.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No items in cart</p>
              ) : (
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div key={item.product.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">${item.product.sellingPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, -1)}><Minus className="h-3 w-3" /></Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <p className="text-sm font-semibold w-16 text-right">${(item.product.sellingPrice * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}><X className="h-3 w-3" /></Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {cart.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Tax %" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-20 text-sm" />
                      <span className="text-xs text-muted-foreground">Tax %</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Discount" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))} className="w-20 text-sm" />
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => setDiscountType((t) => t === '%' ? '$' : '%')}>{discountType}</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    {discountAmount > 0 && <div className="flex justify-between text-destructive"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">Tax ({taxRate}%)</span><span>${taxAmount.toFixed(2)}</span></div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-success"><span className="text-sm">Expected Profit</span><span className="font-semibold">${expectedProfit.toFixed(2)}</span></div>
                  </div>
                  <Button className="w-full gradient-primary text-primary-foreground" onClick={handleCheckout}>
                    <FileText className="h-4 w-4 mr-2" /> Generate Invoice
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handlePrintInvoice}><Printer className="h-4 w-4 mr-1" /> Preview</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleDownloadPDF}><Download className="h-4 w-4 mr-1" /> Print/PDF</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-center">
              <CheckCircle className="h-24 w-24 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Invoice Created!</h2>
              <p className="text-muted-foreground">#{invoiceNumber}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <InvoiceTemplate
            ref={invoiceRef}
            cart={lastSaleCart.length > 0 ? lastSaleCart : cart}
            subtotal={lastSaleCart.length > 0 ? lastSaleTotals.subtotal : subtotal}
            taxAmount={lastSaleCart.length > 0 ? lastSaleTotals.taxAmount : taxAmount}
            taxRate={taxRate}
            discountAmount={lastSaleCart.length > 0 ? lastSaleTotals.discountAmount : discountAmount}
            total={lastSaleCart.length > 0 ? lastSaleTotals.total : total}
            expectedProfit={lastSaleCart.length > 0 ? lastSaleTotals.expectedProfit : expectedProfit}
            invoiceNumber={invoiceNumber || generateInvoiceNumber()}
          />
          <div className="flex justify-end gap-2 mt-4 no-print">
            <Button variant="outline" onClick={() => setShowInvoice(false)}>Close</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => { const w = window.open('', '_blank'); if (w && invoiceRef.current) { w.document.write(`<!DOCTYPE html><html><head><title>Invoice</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',system-ui,sans-serif;padding:20px}</style></head><body>${invoiceRef.current.innerHTML}</body></html>`); w.document.close(); w.print(); } }}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
