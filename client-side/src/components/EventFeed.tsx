  import { useStockStore, type EventLogEntry, type EventKind } from "../store/useStockStore";
 
  // Color for each event kind
  function getKindColor(kind: EventKind): string {
    switch (kind) {
      case "connect":    return "#00C87C"; // green
      case "disconnect": return "#FF4D4D"; // red
      case "price":      return "#388BFD"; // blue
      case "ping":       return "#FFB800"; // gold
      case "error":      return "#FF4D4D"; // red
      default:           return "#484F58"; // gray
    }
  }
 
  // Icon for each event kind
  function getKindIcon(kind: EventKind): string {
    switch (kind) {
      case "connect":    return "✓"; // check mark
      case "disconnect": return "✗"; // cross
      case "price":      return "▲"; // triangle (tick)
      case "ping":       return "○"; // circle (heartbeat)
      case "error":      return "⚠"; // warning
      default:           return "·";
    }
  }
 
  // One row in the feed
  function FeedRow({ entry }: { entry: EventLogEntry }) {
    const color = getKindColor(entry.kind);
    const icon  = getKindIcon(entry.kind);
 
    return (
      <div style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "8px",
        padding:      "4px 12px",
        borderBottom: "1px solid #161B22",
        fontSize:     "11px",
        fontFamily:   "monospace",
      }}>
 
        {/* Kind icon */}
        <span style={{ color, flexShrink: 0, width: "12px" }}>{icon}</span>
 
        {/* Timestamp */}
        <span style={{ color: "#484F58", flexShrink: 0 }}>{entry.time}</span>
 
        {/* Message */}
        <span style={{ color: "#8B949E", overflow: "hidden",
                       textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.msg}
        </span>
 
      </div>
    );
  }
 
  // The full panel
  export function EventFeed() {
    const { eventLog, tickCount } = useStockStore();
 
    return (
      <div style={{
        width:           "240px",
        borderLeft:      "1px solid #21262D",
        backgroundColor: "#0D1117",
        display:         "flex",
        flexDirection:   "column",
        flexShrink:      0,
      }}>
 
        {/* Header */}
        <div style={{
          padding:      "8px 12px",
          borderBottom: "1px solid #21262D",
          display:      "flex",
          justifyContent:"space-between",
          alignItems:   "center",
        }}>
          <span style={{ fontSize: "10px", fontFamily: "monospace",
                         color: "#484F58", letterSpacing: "1px" }}>
            WS EVENTS
          </span>
          {/* Tick counter badge */}
          <span style={{
            fontSize:        "10px",
            fontFamily:      "monospace",
            color:           "#00C87C",
            backgroundColor: "rgba(0,200,124,0.10)",
            padding:         "1px 6px",
            borderRadius:    "8px",
          }}>
            {tickCount.toLocaleString()} ticks
          </span>
        </div>
 
        {/* Scrollable feed */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {eventLog.length === 0 ? (
            <p style={{ color: "#484F58", fontFamily: "monospace",
                        fontSize: "11px", textAlign: "center",
                        marginTop: "40px" }}>
              Waiting for events...
            </p>
          ) : (
            eventLog.map((entry) => (
              <FeedRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
 
      </div>
    );
  }
