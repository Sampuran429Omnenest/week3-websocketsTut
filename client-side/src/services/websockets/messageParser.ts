import type { ParsedMessage, RawStockPayload } from "../../domains/market/types";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function safeParseJSON(raw:string):unknown|null{
    try {
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
function validateStockPayload(s:unknown) : s is RawStockPayload{
    if(typeof s!=="object" || s===null) return false;
    const o = s as Record<string,unknown>;
    return(
        typeof o.symbol==="string" && typeof o.name==="string" &&
        typeof o.sector==="string" && isFiniteNumber(o.price) && 
        isFiniteNumber(o.open) && isFiniteNumber(o.high) && 
        isFiniteNumber(o.low)  && isFiniteNumber(o.prevClose) && 
        isFiniteNumber(o.change) && isFiniteNumber(o.changePercent) && 
        isFiniteNumber(o.volume)
    );
}
export function parseMessage(raw:string) : ParsedMessage{
    const data=safeParseJSON(raw);
    if(data===null || typeof data!=="object"){
        return {kind:"unknown",raw};
    }
    const msg=data as Record<string,unknown>;
    switch(msg.type){
        case "STOCK_UPDATE":
            if(!validateStockPayload(msg.stock))
                return {kind:"unknown",raw};
            return {
                kind:"stock_update",
                stock:msg.stock as RawStockPayload,
                serverTs: typeof msg.serverTs === "number" ? msg.serverTs : Date.now(), // Use serverTs
            };
        case "HELLO":
            return { kind:"hello", message: typeof msg.message==="string"?msg.message:"" };
        case "PONG":
            return { kind:"pong", ts: typeof msg.ts==="number"?msg.ts:0 };
        default:
            return { kind:"unknown", raw };

    }
}