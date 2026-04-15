import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useNotificationStore } from '@/stores/notificationStore';

type WSHandler = (data: any) => void;
type WSEvent = 'sale_completed' | 'low_stock_alert' | 'new_insight' | string;

interface WebSocketMessage {
  type?: string;
  event?: string;
  payload?: any;
}

export function useWebSocket(url: string = 'ws://localhost:8000/ws/dashboard') {
  const ws = useRef<WebSocket | null>(null);
  const handlers = useRef<Map<string, WSHandler[]>>(new Map());
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const on = useCallback((event: WSEvent, handler: WSHandler) => {
    if (!handlers.current.has(event)) {
      handlers.current.set(event, []);
    }
    handlers.current.get(event)!.push(handler);
    return () => off(event, handler);
  }, []);

  const off = useCallback((event: string, handler: WSHandler) => {
    const eventHandlers = handlers.current.get(event);
    if (eventHandlers) {
      handlers.current.set(event, eventHandlers.filter((h) => h !== handler));
    }
  }, []);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setConnected(true);
      };

      ws.current.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 5s
        reconnectTimer.current = setTimeout(connect, 5000);
      };

      ws.current.onerror = () => {
        setConnected(false);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          const eventType = data.type || data.event;
          if (!eventType) return;

          const payload = data.payload || data;
          const eventHandlers = handlers.current.get(eventType);
          if (eventHandlers) {
            eventHandlers.forEach((h) => h(payload));
          }
        } catch {
          // ignore parse errors
        }
      };
    } catch {
      // WebSocket connection failed — silently ignore in dev
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  return { on, off, connected };
}

/**
 * Hook that subscribes to WebSocket events and shows toast notifications.
 * Use in MainLayout or a top-level component.
 */
export function useWebSocketNotifications() {
  const { on, connected } = useWebSocket();
  const addNotification = useNotificationStore((s) => s.add);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      on('sale_completed', (data) => {
        const desc = data.message || `$${data.total?.toFixed(2) || '0.00'} — ${data.items || 0} item(s) sold`;
        toast.success('💰 Sale Completed!', { description: desc });
        addNotification({ type: 'sale', title: 'Sale Completed', description: desc });
      })
    );

    unsubs.push(
      on('low_stock_alert', (data) => {
        const desc = data.message || `${data.productName || 'A product'} is running low (${data.stock ?? 0} remaining)`;
        toast.warning('⚠️ Low Stock Alert', { description: desc });
        addNotification({ type: 'stock', title: 'Low Stock Alert', description: desc });
      })
    );

    unsubs.push(
      on('new_insight', (data) => {
        const desc = data.message || data.title || 'A new business insight is available';
        toast.info('💡 New Insight', { description: desc });
        addNotification({ type: 'insight', title: 'New Insight', description: desc });
      })
    );

    return () => unsubs.forEach((u) => u());
  }, [on, addNotification]);

  return { connected };
}
