import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const labelMap: Record<string, string> = {
  dashboard: 'Dashboard',
  billing: 'Billing',
  products: 'Products',
  reports: 'Reports',
  insights: 'Insights',
  returns: 'Returns',
  customers: 'Customers',
  settings: 'Settings',
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="no-print flex items-center gap-1 text-sm text-muted-foreground px-4 md:px-6 py-2 border-b border-border bg-card/40">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
        const isLast = i === segments.length - 1;

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
