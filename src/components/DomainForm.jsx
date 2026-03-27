import { useState } from "react";
import { ICON_OPTIONS } from "../constants";
import useIsMobile from "../hooks/useIsMobile";

export default function DomainForm({ onSave, onCancel, usedIcons }) {
  const { isMobile } = useIsMobile();
  const defaultIcon = ICON_OPTIONS.find((ico) => !usedIcons.includes(ico)) || ICON_OPTIONS[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(defaultIcon);
  const [authentic, setAuthentic] = useState([]);
  const [inauthentic, setInauthentic] = useState([]);
  const [reflectionQuestion, setReflectionQuestion] = useState("");
  const [authInput, setAuthInput] = useState("");
  const [inauthInput, setInauthInput] = useState("");

  const inputStyle = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1.5px solid #E8E6E2",
    outline: "none",
    background: "#fff",
    color: "#2A2A28",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#888",
    marginBottom: 6,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  };

  const tagStyle = (isAuthentic) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    background: isAuthentic ? "#C47A5A18" : "#F5F0EC",
    color: isAuthentic ? "#C47A5A" : "#8A7A6A",
    border: isAuthentic ? "1.5px solid #C47A5A44" : "1.5px solid #DDD5CC",
  });

  function addAuth() {
    const v = authInput.trim();
    if (v && !authentic.includes(v)) {
      setAuthentic([...authentic, v]);
    }
    setAuthInput("");
  }

  function addInauth() {
    const v = inauthInput.trim();
    if (v && !inauthentic.includes(v)) {
      setInauthentic([...inauthentic, v]);
    }
    setInauthInput("");
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      icon,
      authentic,
      inauthentic,
      reflectionQuestion: reflectionQuestion.trim(),
    });
  }

  return (
    <div
      style={{
        background: "#F5F4F0",
        borderRadius: 20,
        padding: isMobile ? 20 : 32,
        border: "1.5px solid #E8E6E2",
      }}
    >
      <h2
        style={{
          margin: "0 0 24px",
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 22,
          color: "#2A2A28",
        }}
      >
        Nieuw domein
      </h2>

      {/* Icon picker */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Icoon</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ICON_OPTIONS.map((ico) => {
            const used = usedIcons.includes(ico);
            const selected = icon === ico;
            return (
              <button
                key={ico}
                onClick={() => setIcon(ico)}
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  border: selected ? "2px solid #C47A5A" : "1.5px solid #E8E6E2",
                  background: selected ? "#C47A5A22" : "#fff",
                  cursor: "pointer",
                  opacity: used && !selected ? 0.35 : 1,
                }}
              >
                {ico}
              </button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Titel</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bijv. Relaties, Werk, Gezondheid..."
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <div style={labelStyle}>Beschrijving</div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Korte beschrijving van dit domein"
          style={inputStyle}
        />
      </div>

      {/* Authentic values */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...labelStyle, color: "#C47A5A" }}>Authentieke waarden</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {authentic.map((v) => (
            <span key={v} style={tagStyle(true)}>
              {v}
              <button
                onClick={() => setAuthentic(authentic.filter((x) => x !== v))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#C47A5A",
                  fontSize: 15,
                  padding: 0,
                  lineHeight: 1,
                  marginLeft: 2,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={authInput}
          onChange={(e) => setAuthInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addAuth(); }
          }}
          placeholder="Typ een waarde en druk Enter"
          style={{ ...inputStyle, maxWidth: isMobile ? "100%" : 240 }}
        />
      </div>

      {/* Inauthentic drivers */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...labelStyle, color: "#8A7A6A" }}>Inauthentieke drivers</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {inauthentic.map((v) => (
            <span key={v} style={tagStyle(false)}>
              {v}
              <button
                onClick={() => setInauthentic(inauthentic.filter((x) => x !== v))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8A7A6A",
                  fontSize: 15,
                  padding: 0,
                  lineHeight: 1,
                  marginLeft: 2,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={inauthInput}
          onChange={(e) => setInauthInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addInauth(); }
          }}
          placeholder="Typ een driver en druk Enter"
          style={{ ...inputStyle, maxWidth: isMobile ? "100%" : 240 }}
        />
      </div>

      {/* Reflection question */}
      <div style={{ marginBottom: 28 }}>
        <div style={labelStyle}>Reflectievraag (optioneel)</div>
        <input
          value={reflectionQuestion}
          onChange={(e) => setReflectionQuestion(e.target.value)}
          placeholder="Bijv. Handel ik vanuit wat echt belangrijk is?"
          style={{
            ...inputStyle,
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontStyle: "italic",
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          style={{
            padding: "10px 28px",
            borderRadius: 12,
            border: "none",
            background: title.trim() ? "#C47A5A" : "#ccc",
            color: "#fff",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: title.trim() ? "pointer" : "not-allowed",
          }}
        >
          Opslaan
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 28px",
            borderRadius: 12,
            border: "1.5px solid #E8E6E2",
            background: "#fff",
            color: "#666",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}
