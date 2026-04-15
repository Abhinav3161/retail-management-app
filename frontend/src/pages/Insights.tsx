import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trophy, TrendingDown, Package, Heart, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '@/services/api';
import { Insight } from '@/types';
import { KpiCardSkeleton } from '@/components/shared/Skeletons';

const iconMap: Record<string, React.ElementType> = {
  warning: AlertTriangle, success: Trophy, info: Lightbulb, danger: TrendingDown,
};

const colorMap: Record<string, string> = {
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  info: 'bg-primary/10 text-primary',
  danger: 'bg-destructive/10 text-destructive',
};

const mockInsights: Insight[] = [
  { id: '1', type: 'warning', icon: 'warning', title: 'Low Margin Alert', description: '3 products have margins below 15%. Consider adjusting prices.', actionLabel: 'View Products', actionUrl: '/products' },
  { id: '2', type: 'success', icon: 'success', title: 'Highest Profit Product', description: 'Premium Headphones generated $4,500 in profit this week—your top performer.' },
  { id: '3', type: 'danger', icon: 'danger', title: 'Profit Drop -8.3%', description: 'Weekly profit declined compared to last week. Returns may be a factor.', actionLabel: 'Check Returns', actionUrl: '/returns' },
  { id: '4', type: 'warning', icon: 'warning', title: 'Stock Running Low', description: 'USB-C Cables and Screen Protectors will run out in ~3 days at current sales rate.', actionLabel: 'Restock', actionUrl: '/products' },
  { id: '5', type: 'info', icon: 'info', title: 'Business Health: 78/100', description: 'Your overall health score is good. Improving margins on 3 products could push it above 85.' },
  { id: '6', type: 'success', icon: 'success', title: 'Peak Sales Hour: 12PM', description: 'Lunch hour consistently drives highest revenue. Consider staffing adjustments.', actionLabel: 'View Report', actionUrl: '/reports' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getInsights()
      .then((res) => setInsights(res || []))
      .catch(() => setInsights(mockInsights))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Insights</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3, 4].map((i) => <KpiCardSkeleton key={i} />)}</div>
    </div>
  );

  const displayInsights = insights.length > 0 ? insights : mockInsights;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Smart Insights</h1><p className="text-muted-foreground">AI-powered recommendations for your business</p></div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayInsights.map((insight) => {
          const Icon = iconMap[insight.type] || Lightbulb;
          return (
            <motion.div key={insight.id} variants={item}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[insight.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      {insight.actionLabel && (
                        <Button variant="link" className="px-0 mt-2 text-primary" onClick={() => window.location.href = insight.actionUrl || '#'}>
                          {insight.actionLabel} <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
