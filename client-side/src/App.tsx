import { useState, useMemo, useCallback } from "react";
import { useStockStore } from "./store/useStockStore";
import { useWebSocket } from "./services/websockets/useWebSocket";
import Header  from "./components/Header";
// import { StockTable } from "./components/StockTable";
import { StockDetail } from "./components/StockDetail";
import { EventFeed } from "./components/EventFeed";
import { useMarketWorker } from "./shared/hooks/useMarketWorker";
import type { NormalizedStock } from "./domains/market/types";
import { VirtualStockTable } from "./components/VirtualStockTable";

export default function App() {
  // 1. Initialize WebSocket Connection
  useWebSocket();
 
  // 2. Pull State from Store
  const { 
    stocks, 
    isConnected, 
    selectedSymbol, 
    setSelected, 
    priceHistory 
  } = useStockStore();
 
  // 3. UI State for Filtering/Sorting
  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof NormalizedStock>("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
 
  // 4. Transform Record to Array for the Worker
  const stockList = useMemo(() => Object.values(stocks), [stocks]);

  // 5. Offload Filtering and Sorting to Web Worker
  // This keeps the UI thread (60fps) smooth during heavy market updates
  const processedStocks = useMarketWorker(
    stockList,
    sortBy,
    sortDir,
    searchText
  );

  // 6. Event Handlers
  // function handleSort(column: string) {
  //   const col = column as keyof NormalizedStock;
  //   if (sortBy === col) {
  //     setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  //   } else {
  //     setSortBy(col);
  //     setSortDir("asc");
  //   }
  // }
//   const handleSort = useCallback((column: string) => {
//     const col = column as keyof NormalizedStock;
//   if (sortBy === col) setSortDir(d => d==="asc"?"desc":"asc");
//   else { setSortBy(col); setSortDir("asc"); }
// }, [sortBy]);  // ← recreate only when sortBy changes (direction toggle logic depends on it)


 const handleRowClick = useCallback(
  (symbol: string) => setSelected(symbol),
  [setSelected]
  // ↑ only recreate if setSelected changes
  // (it never does — Zustand actions are stable)
);
 
  const selectedStock = selectedSymbol ? stocks[selectedSymbol] : null;
  const selectedHistory = selectedSymbol ? (priceHistory[selectedSymbol] || []) : [];
 
  return (
    <div style={{
      display: "flex", 
      flexDirection: "column",
      height: "100vh", 
      backgroundColor: "#010409", 
      color: "#E6EDF3",
    }}>
 
      <Header isConnected={isConnected} />
 
      {/* Search Bar & Stats */}
      <div style={{
        padding: "10px 20px", 
        borderBottom: "1px solid #21262D",
        backgroundColor: "#0D1117",
      }}>
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: "280px", 
            padding: "7px 12px",
            backgroundColor: "#161B22", 
            border: "1px solid #30363D",
            borderRadius: "6px", 
            color: "#E6EDF3",
            fontFamily: "monospace", 
            fontSize: "12px", 
            outline: "none",
          }}
        />
        <span style={{ 
          marginLeft: "12px", 
          fontSize: "11px",
          color: "#484F58", 
          fontFamily: "monospace" 
        }}>
          {processedStocks.length} stocks matched
        </span>
      </div>
 
      {/* Main Content Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* <StockTable
          stocks={processedStocks}
          history={priceHistory}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        /> */}
        <VirtualStockTable
        stocks={processedStocks}
        history={priceHistory}
        selectedSymbol={selectedSymbol}
        onRowClick={handleRowClick}
        />
        
        <StockDetail
          stock={selectedStock}
          history={selectedHistory}
          onClose={() => setSelected(null)}
        />
        
        <EventFeed />
      </div>
 
      {/* Footer / Status Bar */}
      <div style={{
        padding: "5px 20px", 
        borderTop: "1px solid #21262D",
        backgroundColor: "#0D1117", 
        display: "flex",
        justifyContent: "space-between",
        fontSize: "10px", 
        color: "#484F58", 
        fontFamily: "monospace",
      }}>
        <span>Endpoint: {import.meta.env.VITE_WS_URL || "ws://localhost:8080"}</span>
        <span>Market Thread: WebWorker Active</span>
        <span>Simulated data — for learning only</span>
      </div>
 
    </div>
  );
}