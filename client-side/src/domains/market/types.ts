export type RawStockPayload={
    symbol:string;
    name:string;
    sector:string;
    price:number;
    open:number;
    high:number;
    low:number;
    volume:number;
    prevClose:number;
    change:number;
    changePercent:number;
};
export type NormalizedStock = {
  symbol: string;   name: string;   sector: string;
 
  // Price fields — guaranteed 2 decimal places
  price: number;   open: number;  high: number;
  low: number;     prevClose: number;
 
  // Change fields — guaranteed 2 decimal places
  change: number;   changePercent: number;
 
  // Volume — guaranteed whole integer
  volume: number;
 
  // Metadata we generate — the server never sends these
  receivedAt:  number;  // Date.now() when WE received this update
  serverTs:    number;  // timestamp the server added to the message
  updateCount: number;  // how many price ticks for this stock
};

export type ParsedMessage =
  | { kind: "stock_update"; stock: RawStockPayload; serverTs: number }
  | { kind: "hello";  message: string }
  | { kind: "pong";   ts: number }
  | { kind: "unknown"; raw: string };  // safe fallback
