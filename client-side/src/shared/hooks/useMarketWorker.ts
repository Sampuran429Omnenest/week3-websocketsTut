import { useRef, useEffect, useState } from "react";
import type { NormalizedStock } from "../../domains/market/types";
 
export function useMarketWorker(
  stocks: NormalizedStock[], sortBy: keyof NormalizedStock,
  sortDir: "asc"|"desc",    query: string,
) {
  const workerRef = useRef<Worker|null>(null);
  const [sorted, setSorted] = useState<NormalizedStock[]>(stocks);
 
  // Create worker once
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../services/workers/market.worker.ts", import.meta.url),
      { type: "module" }  // required for TypeScript workers in Vite
    );
    workerRef.current.onmessage = (e) => {
      if (e.data.result === "sorted") setSorted(e.data.stocks);
    };
    return () => workerRef.current?.terminate();
  }, []);
 
  // Send new work whenever inputs change
  useEffect(() => {
    workerRef.current?.postMessage({ cmd:"sort_and_filter",
                                     stocks,sortBy,sortDir,query });
  }, [stocks,sortBy,sortDir,query]);
 
  return sorted;
}
