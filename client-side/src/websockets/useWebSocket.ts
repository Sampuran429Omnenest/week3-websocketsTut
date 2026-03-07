import { useEffect, useRef } from "react";
import { useStockStore } from "../store/useStockStore";
import type { Stock } from "../types/types";

const SERVER_URL="ws://localhost:8080";
const PING_EVERY_MS=25_000;
const PONG_WAIT_MS=5_000;
export function useWebSocket(){
    const wsRef=useRef<WebSocket|null>(null);
    const retryCountRef=useRef<number>(0);
    const retryTimeRef=useRef<ReturnType<typeof setTimeout>|null>(null);
    const pingTimerRef=useRef<ReturnType<typeof setInterval>|null>(null);
    const pongTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);

    const {setStock,setConnected}=useStockStore();
    const addEvent=useStockStore((s)=>s.addEvent);
    function getWaitTime():number{
        const seconds=Math.pow(2,retryCountRef.current);
        return Math.min(seconds,30)*1000;
    }
    function stopHeartbeat(){
        if(pingTimerRef.current) {clearInterval(pingTimerRef.current)};
        pingTimerRef.current=null;
        if(pongTimerRef.current)  {clearTimeout(pongTimerRef.current)};
        pongTimerRef.current=null;
    }
    function startHeartbeat(ws:WebSocket){
        stopHeartbeat();
        pingTimerRef.current=setInterval(()=>{
            if(ws.readyState!==WebSocket.OPEN) return;
            ws.send(JSON.stringify({type:"PING",ts:Date.now}));
            addEvent("PING","ping")
            pongTimerRef.current=setInterval(()=>{
                console.warn("PONG timeout-closing zombie connection");
                ws.close();
            },PONG_WAIT_MS)
        },PING_EVERY_MS)
    }
    function connect(){
        console.log(`Connecting to ${SERVER_URL}...`);
        const ws=new WebSocket(SERVER_URL);
        wsRef.current=ws;
        ws.onopen=()=>{
            setConnected(true);
            addEvent("Connected to ws://localhost:8080","connect");
            retryCountRef.current=0;
            startHeartbeat(ws);
        }
        ws.onmessage = (event: MessageEvent) => {
  try {
    const msg = JSON.parse(event.data);
    if(msg.type==='PONG'){
        if(pongTimerRef.current){
            clearTimeout(pongTimerRef.current);
            pongTimerRef.current=null;
            addEvent("PONG received","ping");
        }
        return;
    }
    const rawData = msg.data || msg.stock;
    //console.log(rawData);
    // Ensure we have a symbol and the message type is correct
    if (rawData && (msg.type === "SNAPSHOT" || msg.type === "STOCK_UPDATE" || msg.type==='QUOTE' || msg.type==='INDEX' || msg.type==='DEPTH')) {
      
      const formattedStock: Stock = {
        ...rawData,
        // FIX 1: Ensure symbol is present (take it from msg or data)
        symbol: msg.symbol || rawData.symbol, 
        // FIX 2: Explicitly map ltp to price
        price: rawData.ltp || rawData.price 
      };

      setStock(formattedStock);
      
     
      addEvent(`${formattedStock?.symbol} → ${formattedStock?.price.toFixed(2)}`, "price");
    }
  } catch (err) {
    console.error("Parse error:", err);
  }
};
        ws.onclose=()=>{
            setConnected(false);
              addEvent("Disconnected. Reconnecting...","disconnect");
            stopHeartbeat();
            const waitTime=getWaitTime();
            retryCountRef.current+=1;
            console.log(`Retrying in ${waitTime/1000}s...`);
            retryTimeRef.current=setTimeout(connect,waitTime);
        }
        ws.onerror=()=>{
            console.log("WebSocket error - server may be offline");
            addEvent("Connection error", "error");
        }
    }
    useEffect(()=>{
            connect();
            return ()=>{
                stopHeartbeat();
                if(retryTimeRef.current) clearTimeout(retryTimeRef.current);
                if(wsRef.current){
                    wsRef.current.onclose=null;
                    wsRef.current.close();
                }
            }
    },[])
}