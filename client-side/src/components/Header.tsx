type HeaderProps = {
  isConnected: boolean;
  tickCount:number;
};
 
export function Header({ isConnected, tickCount }: HeaderProps) {
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
 
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "22px", fontWeight: "bold", color: "#00C87C" }}>
          groww
        </span>
        <span style={{ fontSize: "11px", color: "#555555", fontFamily: "monospace" }}>
          dev feed
        </span>
      </div>

 
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

                  {tickCount > 0 && (
          <span style={{
            fontSize:        "10px",
            fontFamily:      "monospace",
            color:           "#484F58",
            marginRight:     "8px",
          }}>
            {tickCount.toLocaleString()} updates
          </span>
        )}

        </span>

      </div>
 
    </div>
  );
}
