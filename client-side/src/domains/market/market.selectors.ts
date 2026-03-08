import type { NormalizedStock } from "./types";

type Map=Record<string,NormalizedStock>;

export const selectAllStocks=(m:Map)=>Object.values(m);
export const selectStock=(m:Map,svm:string)=>m[svm.toUpperCase()];
export const selectBySector=(m:Map,sec:string)=>
    Object.values(m).filter(s=>s.sector===sec);
export const selectTotalTicks=(m:Map)=>
    Object.values(m).reduce((sum,s)=>sum+s.updateCount,0);
