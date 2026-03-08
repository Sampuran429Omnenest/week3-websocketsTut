import { memo, useEffect, useRef, useState } from "react";
import type { NormalizedStock } from "../domains/market/types";
import  Sparkline from "./Sparkline";
import { formatPrice, formatPercent, formatChange,
         formatVolume, getColor, getBgColor } from "../helpers/helpers";
import { useStaleness } from "../shared/hooks/useStaleness";
 
type StockRowProps = {
  stock:      NormalizedStock;
  history:    number[];
  isSelected: boolean;
  onClick:    () => void;
};
 
function StockRow({ stock, history, isSelected, onClick }: StockRowProps) {
  const prevPrice       = useRef<number>(stock.price);
  const [flash, setFlash] = useState<string>("");
  const isStale=useStaleness(stock.receivedAt);

 
  useEffect(() => {
    if (stock.price === prevPrice.current) return;
 
    setFlash(stock.price > prevPrice.current ? "flash-up" : "flash-down");
    prevPrice.current = stock.price;
 
    const timer = setTimeout(() => setFlash(""), 600);
    return () => clearTimeout(timer);
  }, [stock.price]);
 
  const isPositive = stock.changePercent >= 0;

  return (
    <tr
      className={flash}
      onClick={onClick}
      style={{
        cursor:          "pointer",
        borderBottom:    "1px solid #161B22",
        backgroundColor: isSelected ? "rgba(255, 184, 0, 0.07)" : "transparent",
        opacity : isStale ? 0.45 : 1.0,
        transition : "opacity 0.3s ease",
      }}
    >
      {/* Symbol + sector */}
      <td style={{ padding: "10px 16px" }}>
        <div style={{ fontWeight: "bold", color: "#E6EDF3", fontSize: "13px" }}>
          {stock.symbol}
        </div>
        <div style={{ fontSize: "10px", color: "#484F58", marginTop: "2px" }}>
          {stock.sector}
        </div>
      </td>
 
      {/* Current price */}
      <td style={{ padding: "10px 16px", textAlign: "right" }}>
        <span style={{ fontFamily: "monospace", fontWeight: "bold",
                       fontSize: "14px", color: "#E6EDF3" }}>
          {formatPrice(stock.price)}
        </span>
        {isStale && (
          <div style={{ fontSize: "9px", color: "#484F58", marginTop: "2px" }}>
            STALE
          </div>
        )}
      </td>
 
      {/* Change % */}
      <td style={{ padding: "10px 16px", textAlign: "right" }}>
        <span style={{
          display: "inline-block", padding: "2px 8px", borderRadius: "4px",
          backgroundColor: getBgColor(stock.changePercent),
          color: getColor(stock.changePercent),
          fontFamily: "monospace", fontSize: "12px", fontWeight: "bold",
        }}>
          {formatPercent(stock.changePercent)}
        </span>
      </td>
 
      {/* Absolute change */}
      <td style={{ padding: "10px 16px", textAlign: "right" }}>
        <span style={{ fontFamily: "monospace", fontSize: "12px",
                       color: getColor(stock.change) }}>
          {formatChange(stock.change)}
        </span>
      </td>
 
      {/* Volume */}
      <td style={{ padding: "10px 16px", textAlign: "right" }}>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#484F58" }}>
          {formatVolume(stock.volume)}
        </span>
      </td>
 
      {/* Sparkline */}
      <td style={{ padding: "10px 16px", textAlign: "center" }}>
        <Sparkline prices={history} isGreen={isPositive} width={70} height={26} />
      </td>
    </tr>
  );
}
export default memo(StockRow);
