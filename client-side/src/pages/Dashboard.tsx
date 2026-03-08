import { useState, useMemo, useCallback } from "react";
import { useMarketStore } from "../store/market.store";
import { useDebounce } from "../shared/hooks/useDebounce";
import { useMarketWorker } from "../shared/hooks/useMarketWorker"; // Import the worker hook
import  Header  from "../components/Header";
import { VirtualStockTable } from "../components/VirtualStockTable";
import { StockDetail } from "../components/StockDetail";
import type { NormalizedStock } from "../domains/market/types";

export default function DashboardPage() {
  const { 
    stocks, 
    isConnected, 
    selectedSymbol,
    setSelected, 
    priceHistory, 
    tickCount 
  } = useMarketStore();

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<keyof NormalizedStock>("symbol"); // Strictly typed
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // 1. Debounce search input to prevent worker spam
  const debouncedQuery = useDebounce(searchText, 300);

  // 2. Memoize the stock array to provide a stable reference to the worker
  const stockList = useMemo(() => Object.values(stocks), [stocks]);

  // 3. Stable empty array for fallback logic
  const emptyHistory = useMemo(() => [], []);

  // 4. Offload Filter & Sort to the Web Worker
  // This replaces both filteredStocks and sortedStocks useMemo blocks
  const processedStocks = useMarketWorker(
    stockList,
    sortBy,
    sortDir,
    debouncedQuery
  );

  // 5. Stable event handlers
  const handleRowClick = useCallback(
    (symbol: string) => setSelected(symbol),
    [setSelected]
  );

  const handleSort = useCallback((column: string) => {
    const col = column as keyof NormalizedStock;
    setSortBy((prev) => {
      if (prev === col) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return col;
    });
  }, []);

  const selectedStock = selectedSymbol ? stocks[selectedSymbol] : null;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      backgroundColor: "#010409", color: "#E6EDF3"
    }}>
      <Header isConnected={isConnected} tickCount={tickCount} />

      <div style={{
        padding: "10px 20px", borderBottom: "1px solid #21262D",
        backgroundColor: "#0D1117"
      }}>
        <input 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search 500+ stocks..."
          style={{
            width: 280, padding: "7px 12px", backgroundColor: "#161B22",
            border: "1px solid #30363D", borderRadius: 6,
            color: "#E6EDF3", fontFamily: "monospace", fontSize: 12, outline: "none"
          }}
        />
        <span style={{ marginLeft: 12, fontSize: 11, color: "#484F58", fontFamily: "monospace" }}>
          {processedStocks.length} stocks matched
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <VirtualStockTable
          stocks={processedStocks} // Result from Web Worker
          history={priceHistory}
          
          selectedSymbol={selectedSymbol}
          onRowClick={handleRowClick}
          
          
        />
        
        <StockDetail 
          stock={selectedStock}
          history={selectedSymbol ? (priceHistory[selectedSymbol] ?? emptyHistory) : emptyHistory}
          onClose={() => setSelected(null)} 
        />
      </div>
    </div>
  );
}