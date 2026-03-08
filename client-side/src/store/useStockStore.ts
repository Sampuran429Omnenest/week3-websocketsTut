import { create } from "zustand";
import type { NormalizedStock } from "../domains/market/types";

export type EventKind="connect" | "disconnect" | "price" | "ping" | "error";
export type EventLogEntry={
    id:number;
    msg:string;
    kind:EventKind;
    time:string;
}
type StockStoreState={
    stocks:Record<string,NormalizedStock>;
    isConnected:boolean;
    selectedSymbol:string|null;
    priceHistory:Record<string,number[]>;
    tickCount: number;
    latencyMs:number|null;
    eventLog:EventLogEntry[];
    setStock:(stock:NormalizedStock)=>void;
    setConnected:(value:boolean)=>void;
    setSelected:(symbol:string|null)=>void;
    setLatency:(ms:number)=>void;
    addEvent: (msg:string,kind:EventKind)=>void
}
let eventIdCounter=0;
export const useStockStore=create<StockStoreState>((set)=>({
    stocks:{},
    isConnected:false,
    selectedSymbol:null,
    priceHistory:{},
    tickCount:0,
    latencyMs:null,
    eventLog:[],
    setStock:(stock:NormalizedStock)=>{
        set((state)=>{
            const oldHistory=state.priceHistory[stock.symbol]||[];
            const newHistory=[...oldHistory,stock.price].slice(-30);
            return{
                stocks:{...state.stocks,[stock.symbol]:stock},
                priceHistory:{...state.priceHistory,[stock.symbol]:newHistory},
                tickCount:state.tickCount+1,
            }
        })
    },
    addEvent:(msg:string,kind:EventKind)=>{
        
        const entry:EventLogEntry={
            id:eventIdCounter++,
            msg,
            kind,
            time:new Date().toLocaleTimeString("en-IN",{hour12:false}),

        }
        set((state)=>({
            eventLog:[entry,...state.eventLog].slice(0,50),
        }))
    },
    setConnected:(value:boolean)=>{
        set(()=>({
            isConnected:value,
        }))
    },
    setSelected:(symbol:string|null)=>{
        set(()=>({
            selectedSymbol:symbol,
        }))
    },
    setLatency: (ms: number) => set({ latencyMs: ms }),
}));