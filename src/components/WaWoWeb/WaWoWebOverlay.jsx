import { useState, useEffect, useCallback } from "react";
import WaWoWebGraph from "./WaWoWebGraph";
import WaWoWebWheel from "./WaWoWebWheel";
import WaWoWebCard from "./WaWoWebCard";
import WaWoWebSearch from "./WaWoWebSearch";
import { DIMENSIONS, DRIVER_WORDS } from "../../data/wawoweb-data";
import useIsMobile from "../../hooks/useIsMobile";

export default function WaWoWebOverlay({ onClose, inline = false }) {
  const { isMobile } = useIsMobile();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [viewMode, setViewMode] = useState("clock");
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (inline) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        if (selectedTerm) setSelectedTerm(null);
        else if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedTerm, onClose, inline]);

  const handleSearchResult = useCallback(({ nodeId, term }) => {
    setFocusNodeId(nodeId);
    setHoveredNode(nodeId);
    if (term._type) {
      setSelectedTerm({ term, parentNeutral: term.parentNeutral, parentId: nodeId });
    }
    setTimeout(() => setFocusNodeId(null), 100);
  }, []);

  const handleConnectionsChange = useCallback((conns) => {
    setConnections(conns);
  }, []);

  const showClock = viewMode === "clock";

  return (
    <div style={{
      ...(inline
        ? { position: "relative", width: "100%", height: "calc(70vh)", background: "#F5F4F0" }
        : { position: "fixed", inset: 0, zIndex: 1000, background: "#F5F4F0" }
      ),
      display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Full-height graph area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Graph fills entire area */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: isMobile ? 8 : 16,
        }}>
          <div style={{
            width: "100%",
            ...(showClock
              ? { maxWidth: isMobile ? "100%" : 900, maxHeight: "100%", aspectRatio: "1/1" }
              : { maxWidth: "100%", height: "150%", maxHeight: "none" }
            ),
          }}>
            {showClock ? (
              <WaWoWebGraph
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
                focusNodeId={focusNodeId}
              />
            ) : (
              <WaWoWebWheel
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
                focusNodeId={focusNodeId}
                isMobile={isMobile}
                onConnectionsChange={handleConnectionsChange}
              />
            )}
          </div>
        </div>

        {/* Floating controls — search + toggle centered at top */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "linear-gradient(to bottom, rgba(245,244,240,0.95) 60%, rgba(245,244,240,0) 100%)",
          padding: isMobile ? "8px 12px 16px" : "10px 20px 20px",
          pointerEvents: "none",
          zIndex: 2,
          display: "flex", justifyContent: "center",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            pointerEvents: "auto",
          }}>
            <WaWoWebSearch onSelectResult={handleSearchResult} isMobile={isMobile} />
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)" }}>
              <button
                onClick={() => setViewMode("clock")}
                style={{
                  background: viewMode === "clock" ? "rgba(196,122,90,0.15)" : "rgba(245,244,240,0.9)",
                  border: "none", padding: isMobile ? "8px 10px" : "6px 12px",
                  color: viewMode === "clock" ? "#C47A5A" : "#888",
                  fontSize: isMobile ? 11 : 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                Klok
              </button>
              <button
                onClick={() => setViewMode("wheel")}
                style={{
                  background: viewMode === "wheel" ? "rgba(196,122,90,0.15)" : "rgba(245,244,240,0.9)",
                  border: "none", padding: isMobile ? "8px 10px" : "6px 12px",
                  color: viewMode === "wheel" ? "#C47A5A" : "#888",
                  fontSize: isMobile ? 11 : 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                Rad
              </button>
            </div>
            {!inline && (
              <button onClick={onClose} title="Sluiten (Esc)" style={{
                background: "rgba(245,244,240,0.9)", border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8, padding: isMobile ? "8px 12px" : "6px 14px", color: "#888", fontSize: 13,
                cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                minHeight: 36, minWidth: 36, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isMobile ? "\u2715" : "\u2715 Sluiten"}
              </button>
            )}
          </div>
        </div>

        {/* Legend — vertical list, top-left */}
        <div style={{
          position: "absolute", top: isMobile ? 48 : 52, left: isMobile ? 12 : 20,
          display: "flex", flexDirection: "column", gap: 3,
          fontSize: isMobile ? 9 : 10, color: "#888",
          pointerEvents: "none", zIndex: 2,
        }}>
          {DIMENSIONS.map(dim => (
            <span key={dim.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: dim.color, flexShrink: 0 }} />
              {dim.name}
            </span>
          ))}
          <span style={{ color: "#AAA", fontStyle: "italic", fontSize: isMobile ? 8 : 9, marginTop: 2 }}>
            Buiten = authentiek
          </span>
          <span style={{ color: "#AAA", fontStyle: "italic", fontSize: isMobile ? 8 : 9 }}>
            Binnen = inauthentiek
          </span>
        </div>

        {/* Connections panel (wheel mode only) */}
        {!showClock && connections.length > 0 && (
          <div style={{
            position: "absolute",
            ...(isMobile
              ? { bottom: 68, left: 8, right: 8 }
              : { bottom: 16, left: 16, maxWidth: 280 }
            ),
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: isMobile ? "10px 12px" : "12px 16px",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            zIndex: 2,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: 1.5, color: "#888", marginBottom: 8,
            }}>
              Verbindingen
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 6,
            }}>
              {connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => {
                    setFocusNodeId(conn.id);
                    setTimeout(() => setFocusNodeId(null), 100);
                  }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 10px", borderRadius: 14, fontSize: 12,
                    fontWeight: 500, fontFamily: "'DM Sans', system-ui, sans-serif",
                    background: "rgba(0,0,0,0.04)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    color: "#444", cursor: "pointer",
                    transition: "all 0.15s ease",
                    minHeight: 32,
                  }}
                >
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: conn.dim?.color || "#888", flexShrink: 0,
                  }} />
                  {conn.neutral}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card panel */}
      {selectedTerm && (
        <WaWoWebCard
          term={selectedTerm.term}
          parentNeutral={selectedTerm.parentNeutral}
          parentId={selectedTerm.parentId}
          onClose={() => setSelectedTerm(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
