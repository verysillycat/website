"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SocketState, WebSocketMessage, LanyardData } from "@/types/socket";

const DISCORD_USER_ID = "825069530376044594";
const RECONNECT_DELAY = 5000;
const SOCKET_URL = "wss://api.lanyard.rest/socket";

class SocketManager {
  private static instance: SocketManager;
  private socket: WebSocket | null = null;
  private listeners: Set<(data: SocketState) => void> = new Set();
  private heartbeatTimeout?: NodeJS.Timeout;
  private reconnectTimeout?: NodeJS.Timeout;
  private currentState: SocketState = {
    status: "offline",
    data: null,
    connectionStatus: 'disconnected'
  };

  private constructor() {
    this.connect();
  }

  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(SOCKET_URL);
    this.updateState({ ...this.currentState, connectionStatus: 'connecting' });

    const sendHeartbeat = () => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ op: 3 }));
        this.heartbeatTimeout = setTimeout(sendHeartbeat, 30000);
      }
    };

    this.socket.addEventListener("open", () => {
      this.updateState({ ...this.currentState, connectionStatus: 'connected' });
      this.socket?.send(
        JSON.stringify({
          op: 2,
          d: {
            subscribe_to_id: DISCORD_USER_ID,
          },
        })
      );
    });

    this.socket.addEventListener("message", (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        switch (message.op) {
          case 1:
            if (message.d.heartbeat_interval) {
              this.heartbeatTimeout = setTimeout(sendHeartbeat, message.d.heartbeat_interval);
            }
            break;
            
          case 0:
            if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
              this.updateState({
                ...this.currentState,
                status: message.d.discord_status || "offline",
                data: message.d as LanyardData
              });
            }
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    });

    this.socket.addEventListener("close", () => {
      clearTimeout(this.heartbeatTimeout);
      this.updateState({ ...this.currentState, connectionStatus: 'disconnected' });
      this.reconnectTimeout = setTimeout(() => this.connect(), RECONNECT_DELAY);
    });

    this.socket.addEventListener("error", (error: Event) => {
      console.error("WebSocket error:", error);
      clearTimeout(this.heartbeatTimeout);
      this.socket?.close();
    });
  }

  private updateState(newState: SocketState) {
    this.currentState = newState;
    this.listeners.forEach(listener => listener(this.currentState));
  }

  subscribe(listener: (data: SocketState) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  cleanup() {
    clearTimeout(this.heartbeatTimeout);
    clearTimeout(this.reconnectTimeout);
    this.socket?.close();
    this.listeners.clear();
  }
}

const SocketContext = createContext<SocketState | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socketData, setSocketData] = useState<SocketState>({
    status: "offline",
    data: null,
    connectionStatus: 'disconnected'
  });

  useEffect(() => {
    const socketManager = SocketManager.getInstance();
    return socketManager.subscribe(setSocketData);
  }, []);

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
} 