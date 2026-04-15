import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Package, BarChart3, Lightbulb, RotateCcw, Users, Settings,
  Search, FileText, ArrowRight,
} from 'lucide-react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', keywords: 'home overview kpi' },
  { label: 'Billing', icon: Receipt, path: '/billing', keywords: 'invoice sale checkout cart' },
  { label: 'Products', icon: Package, path: '/products', keywords: 'inventory items stock sku' },
  { label: 'Reports', icon: BarChart3, path: '/reports', keywords: 'analytics charts data export csv' },
  { label: 'Insights', icon: Lightbulb, path: '/insights', keywords: 'smart tips recommendations' },
  { label: 'Returns', icon: RotateCcw, path: '/returns', keywords: 'refund loss damaged' },
  { label: 'Customers', icon: Users, path: '/customers', keywords: 'clients buyers purchase history' },
  { label: 'Settings', icon: Settings, path: '/settings', keywords: 'profile preferences theme notifications' },
];

const quickActions = [
  { label: 'New Sale', icon: Receipt, path: '/billing', keywords: 'create sale bill' },
  { label: 'Add Product', icon: Package, path: '/products', keywords: 'create new item' },
  { label: 'View Reports', icon: FileText, path: '/reports', keywords: 'generate report' },
  { label: 'Record Return', icon: RotateCcw, path: '/returns', keywords: 'return refund' },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const runCommand = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem key={page.path} onSelect={() => runCommand(page.path)} keywords={[page.keywords]}>
              <page.icon className="mr-2 h-4 w-4" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((action, i) => (
            <CommandItem key={i} onSelect={() => runCommand(action.path)} keywords={[action.keywords]}>
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
