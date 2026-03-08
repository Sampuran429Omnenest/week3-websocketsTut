import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type{ NormalizedStock } from "../domains/market/types";
import StockRow            from "./StockRow";
 
type Props = {
  stocks:      NormalizedStock[];
  history:     Record<string, number[]>;
  selectedSymbol: string | null;
  onRowClick:  (symbol: string) => void;
};
 
const ROW_HEIGHT = 48;  // pixels — each StockRow is exactly 48px tall
 
export function VirtualStockTable({ stocks, history,
                                    selectedSymbol, onRowClick }: Props) {
 
  // A ref to the scrollable container div
  const containerRef = useRef<HTMLDivElement>(null);
 
  // useVirtualizer: the core of the library
  // It tells us which items are currently visible
  const virtualizer = useVirtualizer({
    count:       stocks.length,     // total number of rows
    getScrollElement: () => containerRef.current, // the scroll container
    estimateSize:    () => ROW_HEIGHT,  // height of each row
    overscan:        5,             // render 5 extra rows above + below viewport
    //               ↑ prevents blank flash when scrolling fast
  });
 
  // virtualizer.getTotalSize() = total height of ALL rows
  // (even the ones not rendered — needed for the scrollbar to be correct size)
  const totalHeight = virtualizer.getTotalSize();
 
  return (
    // The scrollable container
    <div
      ref={containerRef}
      style={{ height: "100%", overflowY: "auto", position: "relative" }}
    >
      {/* Table header — sticky, always visible */}
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead style={{ position:"sticky", top:0, zIndex:10,
                         backgroundColor:"#0D1117",
                         borderBottom:"1px solid #21262D" }}>
          <tr>
            <th style={{padding:"8px 16px",textAlign:"left",
                         fontFamily:"monospace",fontSize:10,color:"#484F58"}}>SYMBOL</th>
            <th style={{padding:"8px 16px",textAlign:"right",
                         fontFamily:"monospace",fontSize:10,color:"#484F58"}}>PRICE</th>
            <th style={{padding:"8px 16px",textAlign:"right",
                         fontFamily:"monospace",fontSize:10,color:"#484F58"}}>CHNG %</th>
            <th style={{padding:"8px 16px",textAlign:"right",
                         fontFamily:"monospace",fontSize:10,color:"#484F58"}}>CHNG</th>
            <th style={{padding:"8px 16px",textAlign:"center",
                         fontFamily:"monospace",fontSize:10,color:"#484F58"}}>TREND</th>
          </tr>
        </thead>
      </table>
 
      {/* Virtual scroll body */}
      <div style={{ height: totalHeight, position:"relative" }}>
        {/*
          virtualizer.getVirtualItems() returns ONLY the visible rows.
          If 500 stocks but only 12 fit in the viewport:
          getVirtualItems() returns ~22 items (12 visible + 5 overscan each side)
        */}
        {virtualizer.getVirtualItems().map(virtualRow => {
          const stock = stocks[virtualRow.index];
          return (
            // Position each row absolutely based on its virtual offset
            <div
              key={stock.symbol}
              style={{
                position: "absolute",
                top:    virtualRow.start,  // pixel offset from top
                width:  "100%",
                height: ROW_HEIGHT,
              }}
            >
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <tbody>
                  <StockRow
                    stock={stock}
                    history={history[stock.symbol] ?? []}
                    isSelected={selectedSymbol === stock.symbol}
                    onClick={() => onRowClick(stock.symbol)}
                  />
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
