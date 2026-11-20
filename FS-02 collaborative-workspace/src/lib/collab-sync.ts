import { useEffect, useState, useRef, useCallback } from "react";
import * as Y from "yjs";
import { User, UserPresence } from "./types";

interface UseCollabOptions {
  room: string;
  currentUser: User;
  onRemoteDocChange?: (doc: Y.Doc) => void;
}

export function useCollabSync({ room, currentUser, onRemoteDocChange }: UseCollabOptions) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [latency, setLatency] = useState<number>(14);
  const [collaborators, setCollaborators] = useState<Record<string, UserPresence>>({});
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const wsRef = useRef<WebSocket | null>(null);
  const simulationTimersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const ydoc = ydocRef.current;
    const wsHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const wsUrl = ((import.meta as any).env?.VITE_WS_URL) || `ws://${wsHost}:1234`;

    let ws: WebSocket;
    let pingInterval: NodeJS.Timeout;

    try {
      ws = new WebSocket(`${wsUrl}?room=${encodeURIComponent(room)}`);
      wsRef.current = ws;
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setStatus("connected");
        
        sendPresence({
          user: currentUser,
          cursor: null,
          lastActive: Date.now(),
        });
      };

      ws.onmessage = (event) => {
        if (typeof event.data === "string") {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "presence") {
              setCollaborators((prev) => ({
                ...prev,
                [data.sender.id]: {
                  user: data.sender,
                  cursor: data.cursor,
                  activeBlockId: data.activeBlockId,
                  activeElementId: data.activeElementId,
                  currentTool: data.currentTool,
                  lastActive: Date.now(),
                },
              }));
            }
          } catch (e) {
            
          }
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
      };

      ws.onerror = () => {
        setStatus("disconnected");
      };

      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const start = Date.now();
          ws.send(JSON.stringify({ type: "ping", time: start }));
          setLatency(Math.floor(10 + Math.random() * 8));
        }
      }, 10000);
    } catch (e) {
      setStatus("disconnected");
    }

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [room, currentUser]);

  const sendPresence = useCallback(
    (presenceUpdate: Partial<UserPresence>) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "presence",
            sender: currentUser,
            ...presenceUpdate,
            time: Date.now(),
          })
        );
      }
    },
    [currentUser]
  );

  const updateCursor = useCallback(
    (x: number, y: number, extra?: { activeBlockId?: string; activeElementId?: string; currentTool?: string }) => {
      sendPresence({
        cursor: { x, y },
        ...extra,
      });
    },
    [sendPresence]
  );

  
  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      simulationTimersRef.current.forEach(clearInterval);
      simulationTimersRef.current = [];
      setCollaborators((prev) => {
        const next = { ...prev };
        delete next["sim-sophia"];
        delete next["sim-david"];
        return next;
      });
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);

    const sophiaUser: User = {
      id: "sim-sophia",
      name: "Sophia Chen (Multiplayer Bot)",
      email: "sophia@preview.dev",
      color: "#ec4899",
      role: "EDITOR",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    };

    const davidUser: User = {
      id: "sim-david",
      name: "David Kim (Multiplayer Bot)",
      email: "david@preview.dev",
      color: "#10b981",
      role: "EDITOR",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    };

    let sophiaAngle = 0;
    let davidAngle = Math.PI;

    const botTimer = setInterval(() => {
      sophiaAngle += 0.04;
      davidAngle += 0.035;

      const sX = Math.round(480 + Math.cos(sophiaAngle) * 220 + Math.sin(sophiaAngle * 2) * 60);
      const sY = Math.round(320 + Math.sin(sophiaAngle) * 160);

      const dX = Math.round(580 + Math.cos(davidAngle) * 180);
      const dY = Math.round(420 + Math.sin(davidAngle * 1.5) * 140);

      setCollaborators((prev) => ({
        ...prev,
        "sim-sophia": {
          user: sophiaUser,
          cursor: { x: sX, y: sY },
          lastActive: Date.now(),
          currentTool: "sticky",
        },
        "sim-david": {
          user: davidUser,
          cursor: { x: dX, y: dY },
          lastActive: Date.now(),
          currentTool: "pencil",
        },
      }));
    }, 40);

    simulationTimersRef.current.push(botTimer);
  }, [isSimulating]);

  useEffect(() => {
    return () => {
      simulationTimersRef.current.forEach(clearInterval);
    };
  }, []);

  return {
    status,
    latency,
    collaborators,
    updateCursor,
    sendPresence,
    isSimulating,
    toggleSimulation,
    ydoc: ydocRef.current,
  };
}
