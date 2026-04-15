import { Bell, Receipt, Package, Lightbulb, CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore, Notification } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<Notification['type'], typeof Receipt> = {
  sale: Receipt,
  stock: Package,
  insight: Lightbulb,
};

const colorMap: Record<Notification['type'], string> = {
  sale: 'text-[hsl(var(--success))]',
  stock: 'text-[hsl(var(--warning))]',
  insight: 'text-primary',
};

export function NotificationCenter() {
  const { notifications, markAllRead, clear } = useNotificationStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-[10px] gradient-primary text-primary-foreground border-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 bg-popover z-50" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllRead}>
                <CheckCheck className="h-3 w-3" /> Mark read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={clear}>
                <Trash2 className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = iconMap[n.type];
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 transition-colors',
                      !n.read && 'bg-primary/5',
                    )}
                  >
                    <div className={cn('mt-0.5 shrink-0', colorMap[n.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
