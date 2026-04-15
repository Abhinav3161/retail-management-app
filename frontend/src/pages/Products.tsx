import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getProductImage } from '@/utils/productImages';
import { Plus, Search, Edit, Trash2, Package, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productsApi } from '@/services/api';
import { Product } from '@/types';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const mockProducts: Product[] = [
  { id: '1', name: 'Premium Headphones', sku: 'HP-001', category: 'Electronics', costPrice: 45, sellingPrice: 89.99, stock: 34, profitMargin: 50 },
  { id: '2', name: 'Wireless Charger Pro', sku: 'WC-100', category: 'Accessories', costPrice: 12, sellingPrice: 39.99, stock: 120, profitMargin: 70 },
  { id: '3', name: 'USB-C Hub 7-in-1', sku: 'UH-007', category: 'Accessories', costPrice: 18, sellingPrice: 49.99, stock: 56, profitMargin: 64 },
  { id: '4', name: 'Mechanical Keyboard', sku: 'MK-200', category: 'Peripherals', costPrice: 35, sellingPrice: 79.99, stock: 22, profitMargin: 56 },
  { id: '5', name: 'Ergonomic Mouse', sku: 'EM-050', category: 'Peripherals', costPrice: 15, sellingPrice: 34.99, stock: 88, profitMargin: 57 },
  { id: '6', name: 'Monitor Stand', sku: 'MS-300', category: 'Furniture', costPrice: 20, sellingPrice: 54.99, stock: 41, profitMargin: 64 },
  { id: '7', name: 'Webcam HD', sku: 'WB-400', category: 'Electronics', costPrice: 25, sellingPrice: 59.99, stock: 15, profitMargin: 58 },
  { id: '8', name: 'USB-C Cable 2m', sku: 'UC-010', category: 'Accessories', costPrice: 2, sellingPrice: 9.99, stock: 3, profitMargin: 80 },
];

type SortKey = 'name' | 'costPrice' | 'sellingPrice' | 'profitMargin' | 'stock';
type SortDir = 'asc' | 'desc';

function MarginBadge({ margin }: { margin: number }) {
  if (margin >= 30) return <Badge className="bg-success/10 text-success border-0">{margin.toFixed(0)}%</Badge>;
  if (margin >= 15) return <Badge className="bg-warning/10 text-warning border-0">{margin.toFixed(0)}%</Badge>;
  return <Badge className="bg-destructive/10 text-destructive border-0">{margin.toFixed(0)}%</Badge>;
}

const PAGE_SIZE = 10;

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', category: '', costPrice: '', sellingPrice: '', stock: '', imageUrl: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [targetMargin, setTargetMargin] = useState(30);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productsApi.getAll({ search })
      .then((res) => setProducts(res || []))
      .catch(() => setProducts(mockProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const liveMargin = form.costPrice && form.sellingPrice
    ? ((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.sellingPrice)) * 100 : 0;

  const suggestPrice = () => {
    if (form.costPrice) {
      const suggested = Number(form.costPrice) / (1 - targetMargin / 100);
      setForm((f) => ({ ...f, sellingPrice: suggested.toFixed(2) }));
    }
  };

  const openEdit = (p: Product) => {
    if (!isAdmin) return;
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku, category: p.category || '', costPrice: String(p.costPrice), sellingPrice: String(p.sellingPrice), stock: String(p.stock), imageUrl: p.imageUrl || '' });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openNew = () => {
    if (!isAdmin) return;
    setEditProduct(null);
    setForm({ name: '', sku: '', category: '', costPrice: '', sellingPrice: '', stock: '', imageUrl: '' });
    setImageFile(null);
    setDialogOpen(true);
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Only admin can add or update products');
      return;
    }

    const imageUrl = imageFile ? await fileToDataUrl(imageFile) : form.imageUrl;
    const data = { name: form.name, sku: form.sku, category: form.category, costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice), stock: Number(form.stock), profitMargin: liveMargin, imageUrl };

    try {
      if (editProduct) { await productsApi.update(editProduct.id, data); } else { await productsApi.create(data); }
      fetchProducts();
    } catch {
      toast.error('Could not save product');
      return;
    }
    toast.success(editProduct ? 'Product updated!' : 'Product added!');
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error('Only admin can delete products');
      return;
    }
    try {
      await productsApi.delete(id);
    } catch {
      toast.error('Could not delete product');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    toast.success('Product deleted');
  };

  const handleBulkDelete = async () => {
    if (!isAdmin) {
      toast.error('Only admin can delete products');
      return;
    }
    if (selected.size === 0) return;
    for (const id of selected) {
      try { await productsApi.delete(id); } catch {}
    }
    setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
    toast.success(`${selected.size} product(s) deleted`);
    setSelected(new Set());
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const allProducts = products.length > 0 ? products : mockProducts;
  const categories = useMemo(() => [...new Set(allProducts.map((p) => p.category).filter(Boolean))], [allProducts]);
  const lowStockCount = useMemo(() => allProducts.filter((p) => p.stock <= 5).length, [allProducts]);

  const filtered = useMemo(() => {
    let result = allProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter !== 'all') result = result.filter((p) => p.category === categoryFilter);
    result.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return result;
  }, [allProducts, search, categoryFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allOnPageSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.id));

  const toggleAllOnPage = () => {
    if (allOnPageSelected) {
      setSelected((prev) => { const n = new Set(prev); paginated.forEach((p) => n.delete(p.id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); paginated.forEach((p) => n.add(p.id)); return n; });
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1 text-primary" /> : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  if (loading) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> {lowStockCount} low stock
            </Badge>
          )}
          {isAdmin && <Button className="gradient-primary text-primary-foreground" onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {isAdmin && selected.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete {selected.size}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={<Package className="h-12 w-12" />} title="No products found" description="Try adjusting your search or add a new product." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      {isAdmin && <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAllOnPage} />}
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      <span className="flex items-center">Product <SortIcon col="name" /></span>
                    </TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('costPrice')}>
                      <span className="flex items-center justify-end">Cost <SortIcon col="costPrice" /></span>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('sellingPrice')}>
                      <span className="flex items-center justify-end">Price <SortIcon col="sellingPrice" /></span>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort('profitMargin')}>
                      <span className="flex items-center justify-center">Margin <SortIcon col="profitMargin" /></span>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort('stock')}>
                      <span className="flex items-center justify-center">Stock <SortIcon col="stock" /></span>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((p) => (
                    <TableRow key={p.id} className={`group ${selected.has(p.id) ? 'bg-primary/5' : ''}`}>
                      <TableCell>
                        {isAdmin && <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {(p.imageUrl || getProductImage(p.sku)) ? (
                            <img src={p.imageUrl || getProductImage(p.sku)} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                      <TableCell className="text-right">${p.costPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${p.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-center"><MarginBadge margin={p.profitMargin} /></TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {p.stock <= 5 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                          {p.stock <= 5 ? <Badge variant="destructive" className="text-xs">Only {p.stock} left</Badge> : <span>{p.stock}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>}
                          {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button key={p} variant={p === page ? 'default' : 'ghost'} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    ))}
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cost Price ($)</Label><Input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Selling Price ($)</Label>
                <div className="flex gap-2">
                  <Input type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
                  <Button variant="outline" size="sm" onClick={suggestPrice} title={`Suggest price for ${targetMargin}% margin`}>Auto</Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-2 flex-1">
                <Label>Target Margin (%)</Label>
                <Input type="number" value={targetMargin} onChange={(e) => setTargetMargin(Number(e.target.value))} className="w-full" />
              </div>
              {form.costPrice && form.sellingPrice && (
                <div className="flex items-center gap-2 text-sm pt-6">
                  <span className="text-muted-foreground">Live:</span>
                  <MarginBadge margin={liveMargin} />
                </div>
              )}
            </div>
            <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {(imageFile || form.imageUrl) && (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg object-cover border border-border"
                />
              )}
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSave}>{editProduct ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
