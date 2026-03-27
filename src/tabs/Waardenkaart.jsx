import { useState } from "react";
import { getAllAuthentic, getAllInauthentic } from "../domainHelpers";
import useIsMobile from "../hooks/useIsMobile";

export default function Waardenkaart({ domains, setDomains }) {
  const { isMobile } = useIsMobile();
  const [newAuthentic, setNewAuthentic] = useState("");
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [authDomainId, setAuthDomainId] = useState(null);
  const [newInauthentic, setNewInauthentic] = useState("");
  const [showInauthInput, setShowInauthInput] = useState(false);
  const [inauthDomainId, setInauthDomainId] = useState(null);

  const allAuthentic = getAllAuthentic(domains);
  const allInauthentic = getAllInauthentic(domains);

  const addAuthentic = () => {
    const trimmed = newAuthentic.trim();
    if (!trimmed || !authDomainId) return;
    if (allAuthentic.some((a) => a.value.toLowerCase() === trimmed.toLowerCase())) return;
    setDomains(domains.map((d) =>
      d.id === authDomainId ? { ...d, authentic: [...d.authentic, trimmed] } : d
    ));
    setNewAuthentic("");
    setAuthDomainId(null);
    setShowAuthInput(false);
  };

  const addInauthentic = () => {
    const trimmed = newInauthentic.trim();
    if (!trimmed || !inauthDomainId) return;
    if (allInauthentic.some((a) => a.value.toLowerCase() === trimmed.toLowerCase())) return;
    setDomains(domains.map((d) =>
      d.id === inauthDomainId ? { ...d, inauthentic: [...d.inauthentic, trimmed] } : d
    ));
    setNewInauthentic("");
    setInauthDomainId(null);
    setShowInauthInput(false);
  };

  const removeAuthentic = (value, domainId) => {
    setDomains(domains.map((d) =>
      d.id === domainId ? { ...d, authentic: d.authentic.filter((v) => v !== value) } : d
    ));
  };

  const removeInauthentic = (value, domainId) => {
    setDomains(domains.map((d) =>
      d.id === domainId ? { ...d, inauthentic: d.inauthentic.filter((v) => v !== value) } : d
    ));
  };

  if (domains.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#BBB",
          fontSize: 14,
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #E8E6E2",
        }}
      >
        Voeg eerst domeinen toe via het Domeinen-tabblad
      </div>
    );
  }

  const DomainSelector = ({ selectedId, onSelect }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {domains.map((d) => (
        <button
          key={d.id}
          onClick={() => onSelect(d.id)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 14,
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            background: selectedId === d.id ? `${d.color}30` : "#FAFAF8",
            color: selectedId === d.id ? d.color : "#888",
            border: selectedId === d.id ? `1.5px solid ${d.color}` : "1.5px solid #E8E6E2",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span style={{ fontSize: 12 }}>{d.icon}</span>
          {d.name}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Authentic values */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: isMobile ? 20 : 32,
          border: "1px solid #E8E6E2",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "#C47A5A",
            marginBottom: 6,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          Mogelijk authentieke waarden
        </div>
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            color: "#888",
            lineHeight: 1.5,
          }}
        >
          Alle waarden uit je levensdomeinen bij elkaar. Wat valt op als je ze
          naast elkaar ziet?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allAuthentic.map((item) => (
            <span
              key={`${item.domain.id}-${item.value}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: `${item.domain.color}18`,
                color: item.domain.color,
                border: `1.5px solid ${item.domain.color}44`,
              }}
            >
              {item.value}
              <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>
                {item.domain.icon}
              </span>
              <button
                onClick={() => removeAuthentic(item.value, item.domain.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: item.domain.color,
                  opacity: 0.6,
                  padding: "0 0 0 2px",
                  lineHeight: 1,
                }}
                title="Verwijderen"
              >
                {"\u00D7"}
              </button>
            </span>
          ))}
          {!showAuthInput && (
            <button
              onClick={() => setShowAuthInput(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: "#FAFAF8",
                color: "#C47A5A",
                border: "1.5px dashed #C47A5A66",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              + Toevoegen
            </button>
          )}
          {showAuthInput && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 14,
                border: "1.5px solid #C47A5A",
                background: "#FDF6F0",
                width: "100%",
                maxWidth: isMobile ? "100%" : 320,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  autoFocus
                  value={newAuthentic}
                  onChange={(e) => setNewAuthentic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addAuthentic();
                    if (e.key === "Escape") { setShowAuthInput(false); setNewAuthentic(""); setAuthDomainId(null); }
                  }}
                  placeholder="Nieuwe waarde..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    outline: "none",
                    flex: 1,
                    color: "#C47A5A",
                  }}
                />
                <button
                  onClick={addAuthentic}
                  style={{
                    background: authDomainId ? "#C47A5A" : "#DDD",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    width: 26,
                    height: 26,
                    fontSize: 14,
                    cursor: authDomainId ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
              </div>
              <DomainSelector selectedId={authDomainId} onSelect={setAuthDomainId} />
            </div>
          )}
        </div>
      </div>
      {/* Inauthentic drivers */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: isMobile ? 20 : 32,
          border: "1px solid #E8E6E2",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "#8A7A6A",
            marginBottom: 6,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          Mogelijk inauthentieke drivers
        </div>
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            color: "#888",
            lineHeight: 1.5,
          }}
        >
          De onderliggende drijfveren die je actie kunnen kapen. Herken je
          patronen?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {allInauthentic.map((item) => (
            <span
              key={`${item.domain.id}-${item.value}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: "#F5F0EC",
                color: "#8A7A6A",
                border: "1.5px solid #DDD5CC",
              }}
            >
              {item.value}
              <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>
                {item.domain.icon}
              </span>
              <button
                onClick={() => removeInauthentic(item.value, item.domain.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#8A7A6A",
                  opacity: 0.6,
                  padding: "0 0 0 2px",
                  lineHeight: 1,
                }}
                title="Verwijderen"
              >
                {"\u00D7"}
              </button>
            </span>
          ))}
          {!showInauthInput && (
            <button
              onClick={() => setShowInauthInput(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: "#FAFAF8",
                color: "#8A7A6A",
                border: "1.5px dashed #8A7A6A66",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              + Toevoegen
            </button>
          )}
          {showInauthInput && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 14,
                border: "1.5px solid #8A7A6A",
                background: "#F5F0EC",
                width: "100%",
                maxWidth: isMobile ? "100%" : 320,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  autoFocus
                  value={newInauthentic}
                  onChange={(e) => setNewInauthentic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addInauthentic();
                    if (e.key === "Escape") { setShowInauthInput(false); setNewInauthentic(""); setInauthDomainId(null); }
                  }}
                  placeholder="Nieuwe driver..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    outline: "none",
                    flex: 1,
                    color: "#8A7A6A",
                  }}
                />
                <button
                  onClick={addInauthentic}
                  style={{
                    background: inauthDomainId ? "#8A7A6A" : "#DDD",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    width: 26,
                    height: 26,
                    fontSize: 14,
                    cursor: inauthDomainId ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
              </div>
              <DomainSelector selectedId={inauthDomainId} onSelect={setInauthDomainId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
