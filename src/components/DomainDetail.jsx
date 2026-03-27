import { useState } from "react";
import ValueTag from "./ValueTag";
import { ICON_OPTIONS } from "../constants";
import useIsMobile from "../hooks/useIsMobile";

export default function DomainDetail({ domain, onUpdate, onDelete }) {
  const { isMobile } = useIsMobile();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(domain.title);
  const [editDesc, setEditDesc] = useState(domain.description);
  const [editIcon, setEditIcon] = useState(domain.icon);
  const [editReflection, setEditReflection] = useState(domain.reflectionQuestion);
  const [editingReflection, setEditingReflection] = useState(false);
  const [newAuthentic, setNewAuthentic] = useState("");
  const [addingAuthentic, setAddingAuthentic] = useState(false);
  const [newInauthentic, setNewInauthentic] = useState("");
  const [addingInauthentic, setAddingInauthentic] = useState(false);

  const inputStyle = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: 14,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1.5px solid #E8E6E2",
    outline: "none",
    background: "#fff",
    color: "#2A2A28",
  };

  const smallBtnStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#888",
    padding: "2px 6px",
    borderRadius: 6,
    lineHeight: 1,
  };

  function startEditing() {
    setEditTitle(domain.title);
    setEditDesc(domain.description);
    setEditIcon(domain.icon);
    setEditing(true);
  }

  function saveHeader() {
    onUpdate({
      ...domain,
      title: editTitle.trim() || domain.title,
      description: editDesc.trim(),
      icon: editIcon,
    });
    setEditing(false);
  }

  function cancelHeader() {
    setEditing(false);
  }

  function addAuthentic() {
    const v = newAuthentic.trim();
    if (v && !domain.authentic.includes(v)) {
      onUpdate({ ...domain, authentic: [...domain.authentic, v] });
    }
    setNewAuthentic("");
    setAddingAuthentic(false);
  }

  function removeAuthentic(val) {
    onUpdate({ ...domain, authentic: domain.authentic.filter((x) => x !== val) });
  }

  function addInauthentic() {
    const v = newInauthentic.trim();
    if (v && !domain.inauthentic.includes(v)) {
      onUpdate({ ...domain, inauthentic: [...domain.inauthentic, v] });
    }
    setNewInauthentic("");
    setAddingInauthentic(false);
  }

  function removeInauthentic(val) {
    onUpdate({ ...domain, inauthentic: domain.inauthentic.filter((x) => x !== val) });
  }

  function saveReflection() {
    onUpdate({ ...domain, reflectionQuestion: editReflection.trim() });
    setEditingReflection(false);
  }

  function handleDelete() {
    if (window.confirm(`Domein "${domain.title}" verwijderen? Dit kan niet ongedaan worden.`)) {
      onDelete();
    }
  }

  return (
    <div
      style={{
        background: domain.bgLight,
        borderRadius: 20,
        padding: isMobile ? 20 : 32,
        border: `1.5px solid ${domain.color}33`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {editing ? (
          <div style={{ flex: 1 }}>
            {/* Icon picker */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  color: "#888",
                  marginBottom: 6,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                Icoon
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ICON_OPTIONS.map((ico) => (
                  <button
                    key={ico}
                    onClick={() => setEditIcon(ico)}
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      border: editIcon === ico ? `2px solid ${domain.color}` : "1.5px solid #E8E6E2",
                      background: editIcon === ico ? `${domain.color}22` : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {ico}
                  </button>
                ))}
              </div>
            </div>
            {/* Title input */}
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Titel"
              style={{
                ...inputStyle,
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 20,
                fontWeight: 700,
                width: "100%",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            {/* Description input */}
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Beschrijving"
              style={{ ...inputStyle, width: "100%", boxSizing: "border-box", fontSize: 13 }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                onClick={saveHeader}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: domain.color,
                  color: "#fff",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Opslaan
              </button>
              <button
                onClick={cancelHeader}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "1.5px solid #E8E6E2",
                  background: "#fff",
                  color: "#666",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Annuleren
              </button>
            </div>
          </div>
        ) : (
          <>
            <span
              style={{
                fontSize: 28,
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                background: domain.color,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {domain.icon}
            </span>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 22,
                  color: "#2A2A28",
                }}
              >
                {domain.title}
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 13,
                  color: "#888",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                {domain.description}
              </p>
            </div>
            <button
              onClick={startEditing}
              title="Bewerken"
              style={{
                ...smallBtnStyle,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              ✎
            </button>
          </>
        )}
      </div>

      {/* Authentic values */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: domain.color,
            marginBottom: 10,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          Mogelijk authentieke waarden
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {domain.authentic.map((v) => (
            <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
              <ValueTag label={v} type="authentic" color={domain.color} />
              <button
                onClick={() => removeAuthentic(v)}
                title="Verwijderen"
                style={{
                  ...smallBtnStyle,
                  fontSize: 13,
                  color: domain.color,
                  marginLeft: -4,
                }}
              >
                ×
              </button>
            </span>
          ))}
          {addingAuthentic ? (
            <input
              autoFocus
              value={newAuthentic}
              onChange={(e) => setNewAuthentic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addAuthentic();
                if (e.key === "Escape") { setAddingAuthentic(false); setNewAuthentic(""); }
              }}
              onBlur={addAuthentic}
              placeholder="Nieuwe waarde"
              style={{ ...inputStyle, width: 130 }}
            />
          ) : (
            <button
              onClick={() => setAddingAuthentic(true)}
              style={{
                ...smallBtnStyle,
                fontSize: 18,
                color: domain.color,
                border: `1.5px dashed ${domain.color}66`,
                borderRadius: 20,
                padding: "2px 12px",
              }}
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Inauthentic values */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: "#8A7A6A",
            marginBottom: 10,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          Mogelijk inauthentieke drivers
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {domain.inauthentic.map((v) => (
            <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
              <ValueTag label={v} type="inauthentic" color={domain.color} />
              <button
                onClick={() => removeInauthentic(v)}
                title="Verwijderen"
                style={{
                  ...smallBtnStyle,
                  fontSize: 13,
                  color: "#8A7A6A",
                  marginLeft: -4,
                }}
              >
                ×
              </button>
            </span>
          ))}
          {addingInauthentic ? (
            <input
              autoFocus
              value={newInauthentic}
              onChange={(e) => setNewInauthentic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addInauthentic();
                if (e.key === "Escape") { setAddingInauthentic(false); setNewInauthentic(""); }
              }}
              onBlur={addInauthentic}
              placeholder="Nieuwe driver"
              style={{ ...inputStyle, width: 130 }}
            />
          ) : (
            <button
              onClick={() => setAddingInauthentic(true)}
              style={{
                ...smallBtnStyle,
                fontSize: 18,
                color: "#8A7A6A",
                border: "1.5px dashed #8A7A6A66",
                borderRadius: 20,
                padding: "2px 12px",
              }}
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Reflection question */}
      <div
        style={{
          marginTop: 24,
          padding: "16px 20px",
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #E8E6E2",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#666",
            marginBottom: 6,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          Reflectievraag
        </div>
        {editingReflection ? (
          <div>
            <input
              autoFocus
              value={editReflection}
              onChange={(e) => setEditReflection(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveReflection();
                if (e.key === "Escape") setEditingReflection(false);
              }}
              style={{
                ...inputStyle,
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: 15,
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={saveReflection}
                style={{
                  padding: "5px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: domain.color,
                  color: "#fff",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Opslaan
              </button>
              <button
                onClick={() => setEditingReflection(false)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #E8E6E2",
                  background: "#fff",
                  color: "#666",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Annuleren
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              setEditReflection(domain.reflectionQuestion);
              setEditingReflection(true);
            }}
            style={{
              fontSize: 15,
              color: "#3A3A38",
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontStyle: "italic",
              lineHeight: 1.5,
              cursor: "pointer",
            }}
          >
            {domain.reflectionQuestion || <span style={{ color: "#bbb" }}>Klik om een reflectievraag toe te voegen...</span>}
          </div>
        )}
      </div>

      {/* Delete button */}
      <div style={{ marginTop: 24, textAlign: "right" }}>
        <button
          onClick={handleDelete}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: "1.5px solid #E8E6E2",
            background: "#fff",
            color: "#C45A5A",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Domein verwijderen
        </button>
      </div>
    </div>
  );
}
