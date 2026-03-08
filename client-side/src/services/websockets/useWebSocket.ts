import { useEffect, useRef } from "react";
import { useStockStore } from "../../store/useStockStore";
import { parseMessage } from "./messageParser";
import type { NormalizedStock } from "../../domains/market/types";
import { getRetryDelay, shouldRetry } from "./reconnectStrategy";

const SERVER_URL = "ws://localhost:8080";
const PING_EVERY_MS = 25_000;
const PONG_WAIT_MS = 5_000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingSentAtRef = useRef<number>(0);
  const pongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setStock, setConnected, setLatency, addEvent } = useStockStore();

  function stopHeartbeat() {
    if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    pingTimerRef.current = null;
    if (pongTimerRef.current) clearTimeout(pongTimerRef.current);
    pongTimerRef.current = null;
  }

  function startHeartbeat(ws: WebSocket) {
    stopHeartbeat();
    pingTimerRef.current = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const now = Date.now();
      pingSentAtRef.current = now;

      // FIX: Added () to Date.now()
      ws.send(JSON.stringify({ type: "PING", ts: now }));
      addEvent("PING", "ping");

      pongTimerRef.current = setTimeout(() => {
        console.warn("PONG timeout - closing zombie connection");
        ws.close();
      }, PONG_WAIT_MS);
    }, PING_EVERY_MS);
  }

  function connect() {
    console.log(`Connecting to ${SERVER_URL}...`);
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      addEvent(`Connected to ${SERVER_URL}`, "connect");
      retryCountRef.current = 0; // Reset backoff on success
      startHeartbeat(ws);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const parsed = parseMessage(event.data);

        switch (parsed.kind) {
          case "pong":
            if (pongTimerRef.current) {
              clearTimeout(pongTimerRef.current);
              pongTimerRef.current = null;
              
              const rtt = Date.now() - pingSentAtRef.current;
              setLatency(rtt); // Update Header latency
              addEvent(`PONG (${rtt}ms)`, "ping");
            }
            break;

          case "stock_update": {
            const existing = useStockStore.getState().stocks[parsed.stock.symbol];
            const normalized: NormalizedStock = {
              ...parsed.stock,
              serverTs: parsed.serverTs,
              receivedAt: Date.now(),
              updateCount: (existing?.updateCount ?? 0) + 1,
            };

            setStock(normalized);
            addEvent(`${normalized.symbol} → ${normalized.price.toFixed(2)}`, "price");
            break;
          }

          case "hello":
            addEvent(`Server: ${parsed.message}`, "connect");
            break;

          case "unknown":
            console.warn("Unknown message:", parsed.raw);
            break;
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      stopHeartbeat();

      const attempt = retryCountRef.current;
      if (shouldRetry(attempt)) {
        const waitTime = getRetryDelay(attempt);
        retryCountRef.current += 1;

        addEvent(`Disconnected. Retrying in ${waitTime / 1000}s...`, "disconnect");
        retryTimeRef.current = setTimeout(connect, waitTime);
      } else {
        addEvent("Maximum retry attempts reached.", "error");
      }
    };

    ws.onerror = () => {
      addEvent("WebSocket connection error", "error");
    };
  }

  useEffect(() => {
    connect();
    return () => {
      stopHeartbeat();
      if (retryTimeRef.current) clearTimeout(retryTimeRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent retry loop on unmount
        wsRef.current.close();
      }
    };
  }, []);
}