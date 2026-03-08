// Runs in a separate browser thread
// Cannot access: React, useState, DOM, window
// CAN do: any pure JavaScript computation
 
import type { NormalizedStock } from "../../domains/market/types"; 
type WorkerInput = {
  cmd:     "sort_and_filter";
  stocks:  NormalizedStock[];
  sortBy:  keyof NormalizedStock;
  sortDir: "asc" | "desc";
  query:   string;
};
 
self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const { stocks, sortBy, sortDir, query } = event.data;
 
  const q = query.toUpperCase().trim();
  const filtered = q
    ? stocks.filter(s =>
        s.symbol.includes(q) || s.name.toUpperCase().includes(q))
    : stocks;
 
  const sorted = [...filtered].sort((a, b) => {
    const va=a[sortBy], vb=b[sortBy];
    const cmp = typeof va==="string"
      ? (va as string).localeCompare(vb as string)
      : (va as number) - (vb as number);
    return sortDir==="asc" ? cmp : -cmp;
  });
 
  // postMessage sends result back to the main thread
  self.postMessage({ result: "sorted", stocks: sorted });
};
