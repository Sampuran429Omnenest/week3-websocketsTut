import type { NormalizedStock, RawStockPayload } from "./types";

function round2(n:number):number{
    return parseFloat(n.toFixed(2));
}
function safeNum(n:number,fb=0):number{
    return Number.isFinite(n) ? n : fb;
}
export function normalizeStock(
    raw:RawStockPayload,
    prev:NormalizedStock | undefined,
    serverTs:number
):NormalizedStock{
    return{
    symbol: raw.symbol.trim().toUpperCase(),
    name:   raw.name.trim(),
    sector: raw.sector.trim(),
    price:         round2(safeNum(raw.price)),
    open:          round2(safeNum(raw.open)),
    high:          round2(safeNum(raw.high)),
    low:           round2(safeNum(raw.low)),
    prevClose:     round2(safeNum(raw.prevClose)),
    change:        round2(safeNum(raw.change)),
    changePercent: round2(safeNum(raw.changePercent)),
    volume:        Math.round(safeNum(raw.volume)),
    receivedAt:  Date.now(),
    serverTs,
    updateCount: (prev?.updateCount ?? 0) + 1,
    }
}