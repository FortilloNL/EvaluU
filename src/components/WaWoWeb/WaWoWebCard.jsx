import { useEffect, useState } from "react";

const sectionTitle = {
  margin: "0 0 8px", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: 1.5, color: "#AAA8A4",
};

export default function WaWoWebCard({ term, parentNeutral, onClose, isMobile }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  if (!term) return null;
  const isPos = term._type === "positief";
  const dot = isPos ? "#C47A5A" : "#8A7A6A";

  const handleClose = () => { setVisible(false); setTimeout(onClose, 250); };

  if (isMobile) {
    // Bottom sheet on mobile
    return (
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        maxHeight: "70vh",
        background: "#F5F4F0",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
        borderRadius: "20px 20px 0 0",
        zIndex: 1002,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.25s ease",
        display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {/* Drag handle */}
        <div style={{
          display: "flex", justifyContent: "center", padding: "10px 0 4px",
          flexShrink: 0, cursor: "pointer",
        }} onClick={handleClose}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: "#DDD5CC",
          }} />
        </div>

        {/* Header */}
        <div style={{ padding: "8px 20px 14px", borderBottom: "1px solid #DDD", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: dot }}>
                  {isPos ? "Authentieke waarde" : "Inauthentieke driver"}
                </span>
              </div>
              <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#2A2A28" }}>
                {term.word}
              </h2>
              <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                Onderdeel van: <strong style={{ color: "#666" }}>{parentNeutral}</strong>
              </div>
            </div>
            <button onClick={handleClose} style={{
              background: "none", border: "none", fontSize: 20, color: "#AAA",
              cursor: "pointer", padding: 8, lineHeight: 1, minWidth: 36, minHeight: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {"\u2715"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
          {term.explanation && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={sectionTitle}>Toelichting</h3>
              <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, margin: 0 }}>{term.explanation}</p>
            </section>
          )}
          {term.examples?.length > 0 && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={sectionTitle}>Voorbeelden</h3>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#555", lineHeight: 1.7 }}>
                {term.examples.map((ex, i) => <li key={i} style={{ marginBottom: 4 }}>{ex}</li>)}
              </ul>
            </section>
          )}
          {term.archetypes?.length > 0 && (
            <section style={{ marginBottom: 18 }}>
              <h3 style={sectionTitle}>Archetypes</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {term.archetypes.map((a, i) => (
                  <span key={i} style={{
                    display: "inline-block", padding: "5px 12px", borderRadius: 12, fontSize: 12,
                    background: isPos ? "rgba(196,122,90,0.12)" : "rgba(138,122,106,0.12)",
                    color: isPos ? "#A0603E" : "#6A5A4A",
                    border: `1px solid ${isPos ? "rgba(196,122,90,0.2)" : "rgba(138,122,106,0.2)"}`,
                  }}>{a}</span>
                ))}
              </div>
            </section>
          )}
          {term.synonyms?.length > 0 && (
            <section>
              <h3 style={sectionTitle}>Synoniemen</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {term.synonyms.map((s, i) => (
                  <span key={i} style={{
                    display: "inline-block", padding: "4px 10px", borderRadius: 10, fontSize: 11,
                    background: "rgba(42,42,40,0.06)", color: "#666", border: "1px solid rgba(42,42,40,0.1)",
                  }}>{s}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Desktop: right sidebar (original behavior)
  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 380, maxWidth: "100vw",
      background: "#F5F4F0", boxShadow: "-4px 0 24px rgba(0,0,0,0.3)", zIndex: 1002,
      transform: visible ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.25s ease",
      display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #DDD", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: dot }}>
                {isPos ? "Authentieke waarde" : "Inauthentieke driver"}
              </span>
            </div>
            <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#2A2A28" }}>
              {term.word}
            </h2>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              Onderdeel van: <strong style={{ color: "#666" }}>{parentNeutral}</strong>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", fontSize: 20, color: "#AAA", cursor: "pointer", padding: 4, lineHeight: 1 }}>
            {"\u2715"}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
        {term.explanation && (
          <section style={{ marginBottom: 20 }}>
            <h3 style={sectionTitle}>Toelichting</h3>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, margin: 0 }}>{term.explanation}</p>
          </section>
        )}
        {term.examples?.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h3 style={sectionTitle}>Voorbeelden</h3>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#555", lineHeight: 1.7 }}>
              {term.examples.map((ex, i) => <li key={i} style={{ marginBottom: 4 }}>{ex}</li>)}
            </ul>
          </section>
        )}
        {term.archetypes?.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h3 style={sectionTitle}>Archetypes</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {term.archetypes.map((a, i) => (
                <span key={i} style={{
                  display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 12,
                  background: isPos ? "rgba(196,122,90,0.12)" : "rgba(138,122,106,0.12)",
                  color: isPos ? "#A0603E" : "#6A5A4A",
                  border: `1px solid ${isPos ? "rgba(196,122,90,0.2)" : "rgba(138,122,106,0.2)"}`,
                }}>{a}</span>
              ))}
            </div>
          </section>
        )}
        {term.synonyms?.length > 0 && (
          <section>
            <h3 style={sectionTitle}>Synoniemen</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {term.synonyms.map((s, i) => (
                <span key={i} style={{
                  display: "inline-block", padding: "3px 8px", borderRadius: 10, fontSize: 11,
                  background: "rgba(42,42,40,0.06)", color: "#666", border: "1px solid rgba(42,42,40,0.1)",
                }}>{s}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
