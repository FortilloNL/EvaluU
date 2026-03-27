import { useState, useRef, useEffect } from "react";
import { ALL_TERMS } from "../../data/wawoweb-data";

export default function WaWoWebSearch({ onSelectResult, isMobile }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(!isMobile);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        if (isMobile && !query) setExpanded(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [isMobile, query]);

  const results = query.trim().length < 2
    ? []
    : ALL_TERMS.filter((t) => {
        const q = query.toLowerCase();
        if (t.label.toLowerCase().includes(q)) return true;
        if (t.synonyms?.some((s) => s.toLowerCase().includes(q))) return true;
        return false;
      }).slice(0, 8);

  if (isMobile && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          background: "rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8, padding: "8px 10px",
          color: "#888", fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          minWidth: 36, minHeight: 36,
        }}
        title="Zoeken"
      >
        {"\u2315"}
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: isMobile ? 1 : "none" }}>
      <input
        autoFocus={isMobile && expanded}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setQuery(""); if (isMobile) setExpanded(false); } }}
        placeholder="Zoek een waarde\u2026"
        style={{
          background: "rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8,
          color: "#2A2A28",
          padding: "8px 12px",
          width: isMobile ? "100%" : 260,
          fontSize: 13,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          outline: "none",
        }}
      />
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)",
          left: 0, right: isMobile ? 0 : "auto",
          width: isMobile ? "auto" : 300,
          background: "#fff", border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 8, maxHeight: 320, overflowY: "auto", zIndex: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}>
          {results.map((r, i) => (
            <div key={i}
              onClick={() => { onSelectResult({ nodeId: r.nodeId, term: r }); setOpen(false); setQuery(""); if (isMobile) setExpanded(false); }}
              style={{
                padding: isMobile ? "12px 14px" : "8px 12px",
                cursor: "pointer", fontSize: 13, color: "#2A2A28",
                borderBottom: i < results.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                minHeight: 44,
                display: "flex", flexDirection: "column", justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: r.type === "positief" ? "#C47A5A" : r.type === "negatief" ? "#8A7A6A" : "#888",
                }} />
                <span>{r.label}</span>
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2, marginLeft: 12 }}>
                {r.parentNeutral}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
