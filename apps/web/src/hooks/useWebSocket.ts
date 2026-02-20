import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@vas-dj-saas/auth";

type WebSocketMessage = {
  type: string;
  notification?: {
    id: string;
    title: string;
    message: string;
    category: string;
    priority: string;
    action_url: string;
    created_at: string;
    is_read: boolean;
  };
  notification_id?: string;
};

interface UseWebSocketOptions {
  /** Auto-reconnect on disconnect. Default: true */
  reconnect?: boolean;
  /** Max reconnect attempts. Default: 5 */
  maxReconnectAttempts?: number;
  /** Called when a new notification arrives */
  onNotification?: (notification: WebSocketMessage["notification"]) => void;
}

/**
 * WebSocket hook for real-time notifications.
 *
 * Connects to the Django Channels notification consumer and
 * receives live notifications as they are created.
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    reconnect = true,
    maxReconnectAttempts = 5,
    onNotification,
  } = options;
  const { accessToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
    if (!accessToken) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const url = `${wsUrl}/ws/notifications/?token=${accessToken}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(data);

        if (data.type === "new_notification" && data.notification) {
          onNotification?.(data.notification);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      if (reconnect && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          30000,
        );
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [accessToken, reconnect, maxReconnectAttempts, onNotification]);

  const disconnect = useCallback(() => {
    reconnectAttempts.current = maxReconnectAttempts; // prevent reconnection
    wsRef.current?.close();
  }, [maxReconnectAttempts]);

  const markAsRead = useCallback((notificationId: string) => {
    wsRef.current?.send(
      JSON.stringify({ action: "mark_read", notification_id: notificationId }),
    );
  }, []);

  useEffect(() => {
    connect();
    return () => {
      reconnectAttempts.current = maxReconnectAttempts;
      wsRef.current?.close();
    };
  }, [connect, maxReconnectAttempts]);

  return { isConnected, lastMessage, markAsRead, disconnect };
}
