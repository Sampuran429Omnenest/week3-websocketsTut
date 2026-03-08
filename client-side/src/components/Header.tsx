import  { memo } from "react";
import { useMarketStore } from "../store/market.store";

type HeaderProps = {
  isConnected: boolean;
};

function Header({ isConnected }: HeaderProps) {
  // 1. Get latency from the store
  const latencyMs = useMarketStore(s => s.latencyMs);

  // 2. Define the dynamic color logic
  const latColor = latencyMs === null ? "#484F58"
    : latencyMs < 50  ? "#00C87C"  // Green
    : latencyMs < 150 ? "#FFB800"  // Gold
    : "#FF4D4D";                   // Red

  return (
    <div style={{
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "space-between",
      padding:         "0 24px",
      height:          "56px",
      backgroundColor: "#0D1117",
      borderBottom:    "1px solid #21262D",
    }}>
 
      {/* Left Side: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "22px", fontWeight: "bold", color: "#00C87C" }}>
          groww
        </span>
        <span style={{ fontSize: "11px", color: "#555555", fontFamily: "monospace" }}>
          dev feed
        </span>
      </div>

      {/* Right Side: Status & Latency */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        
        {/* Latency Display (only if connected) */}
        {isConnected && latencyMs !== null && (
          <span style={{ 
            fontFamily: "monospace", 
            fontSize: "11px", 
            color: latColor 
          }}>
            {latencyMs}ms
          </span>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width:           "8px",
            height:          "8px",
            borderRadius:    "50%",
            backgroundColor: isConnected ? "#00C87C" : "#FF4D4D",
          }} />
          <span style={{
            fontSize:   "11px",
            fontFamily: "monospace",
            color:      isConnected ? "#00C87C" : "#FF4D4D",
          }}>
            {isConnected ? "LIVE" : "OFFLINE"}
          </span>
        </div>

      </div>
    </div>
  );
}
export default memo(Header);