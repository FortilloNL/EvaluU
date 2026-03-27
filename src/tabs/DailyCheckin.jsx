import { useState } from "react";
import { getAllAuthentic, getAllInauthentic } from "../domainHelpers";
import useIsMobile from "../hooks/useIsMobile";

export default function DailyCheckin({ entries, setEntries, domains }) {
  const { isMobile } = useIsMobile();
  const [activity, setActivity] = useState("");
  const [feeling, setFeeling] = useState("");
  const [direction, setDirection] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState([]);

  const allAuthentic = getAllAuthentic(domains);
  const allInauthentic = getAllInauthentic(domains);

  const toggleValue = (v) => {
    setSelectedValues((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };
  const toggleDriver = (d) => {
    setSelectedDrivers((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleDirectionChange = (val) => {
    setDirection(val);
    if (val === "toward") setSelectedDrivers([]);
    if (val === "away") setSelectedValues([]);
  };

  const addEntry = () => {
    if (!activity || !feeling) return;
    const newEntry = {
      id: Date.now(),
      activity,
      feeling,
      direction,
      selectedValues: direction === "toward" || direction === "both" ? selectedValues : [],
      selectedDrivers: direction === "away" || direction === "both" ? selectedDrivers : [],
      date: new Date().toLocaleDateString("nl-NL"),
      time: new Date().toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setEntries([newEntry, ...entries]);
    setActivity("");
    setFeeling("");
    setDirection(null);
    setSelectedValues([]);
    setSelectedDrivers([]);
  };

  const showValues = direction === "toward" || direction === "both";
  const showDrivers = direction === "away" || direction === "both";

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
        Voeg eerst domeinen toe via het Domeinen-tabblad om waarden en drivers te kunnen selecteren.
      </div>
    );
  }

  return (
    <div>
      {/* Input card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: isMobile ? 20 : 32,
          border: "1px solid #E8E6E2",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            margin: "0 0 6px",
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 400,
          }}
        >
          Wat doe je nu?
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888" }}>
          Beschrijf de activiteit en het gevoel — niet de waarde. Die ontdekken
          we samen.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "#888",
                display: "block",
                marginBottom: 6,
              }}
            >
              Activiteit
            </label>
            <input
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="bv. 'Rehearsal voorbereiden voor Toonkunst'"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1.5px solid #DDD5CC",
                fontSize: 14,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: "#FAFAF8",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "#888",
                display: "block",
                marginBottom: 6,
              }}
            >
              Welk gevoel heb je erbij?
            </label>
            <input
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="bv. 'spanning, maar ook opwinding'"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1.5px solid #DDD5CC",
                fontSize: 14,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                background: "#FAFAF8",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "#888",
                display: "block",
                marginBottom: 10,
              }}
            >
              Beweeg je ergens naartoe, of ergens vanaf?
            </label>
            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
              {[
                {
                  val: "toward",
                  label: "Naar iets toe",
                  desc: "openheid, richting",
                  color: "#C47A5A",
                  bg: "#FDF6F0",
                },
                {
                  val: "away",
                  label: "Weg van iets",
                  desc: "druk, verplichting",
                  color: "#8A7A6A",
                  bg: "#F5F0EC",
                },
                {
                  val: "both",
                  label: "Beide",
                  desc: "gemengd",
                  color: "#6A5A8A",
                  bg: "#F5F0FA",
                },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleDirectionChange(opt.val)}
                  style={{
                    flex: 1,
                    padding: "14px 12px",
                    borderRadius: 12,
                    border:
                      direction === opt.val
                        ? `2px solid ${opt.color}`
                        : "2px solid #E8E6E2",
                    background: direction === opt.val ? opt.bg : "#fff",
                    cursor: "pointer",
                    textAlign: "center",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color:
                        direction === opt.val ? opt.color : "#666",
                    }}
                  >
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Value selection based on direction */}
          {showValues && (
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#C47A5A",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                Welke waarde(n) herken je?
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {allAuthentic.map((item) => {
                  const isSelected = selectedValues.includes(item.value);
                  return (
                    <button
                      key={`${item.domain.id}-${item.value}`}
                      onClick={() => toggleValue(item.value)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        background: isSelected
                          ? item.domain.color
                          : `${item.domain.color}12`,
                        color: isSelected ? "#fff" : item.domain.color,
                        border: isSelected
                          ? `1.5px solid ${item.domain.color}`
                          : `1.5px solid ${item.domain.color}44`,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.value}
                      <span style={{ fontSize: 10, opacity: isSelected ? 0.8 : 0.5, marginLeft: 2 }}>
                        {item.domain.icon}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {showDrivers && (
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#8A7A6A",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                Welke driver(s) herken je?
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {allInauthentic.map((item) => {
                  const isSelected = selectedDrivers.includes(item.value);
                  return (
                    <button
                      key={`${item.domain.id}-${item.value}`}
                      onClick={() => toggleDriver(item.value)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        background: isSelected ? "#8A7A6A" : "#F5F0EC",
                        color: isSelected ? "#fff" : "#8A7A6A",
                        border: isSelected
                          ? "1.5px solid #8A7A6A"
                          : "1.5px solid #DDD5CC",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.value}
                      <span style={{ fontSize: 10, opacity: isSelected ? 0.8 : 0.5, marginLeft: 2 }}>
                        {item.domain.icon}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button
            onClick={addEntry}
            disabled={!activity || !feeling}
            style={{
              padding: "14px 24px",
              borderRadius: 12,
              border: "none",
              background:
                activity && feeling ? "#2A2A28" : "#DDD",
              color: activity && feeling ? "#F5F4F0" : "#999",
              fontSize: 14,
              fontWeight: 600,
              cursor: activity && feeling ? "pointer" : "default",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              transition: "all 0.2s ease",
              marginTop: 4,
            }}
          >
            Opslaan & Reflecteren
          </button>
        </div>
      </div>
      {/* Entries */}
      {entries.length > 0 && (
        <div>
          <h3
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 18,
              fontWeight: 400,
              marginBottom: 14,
            }}
          >
            Ervaringen
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: isMobile ? "14px 16px" : "18px 22px",
                  border: "1px solid #E8E6E2",
                  display: "flex",
                  gap: isMobile ? 10 : 16,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: 4,
                    minHeight: 40,
                    borderRadius: 2,
                    background:
                      entry.direction === "toward"
                        ? "#C47A5A"
                        : entry.direction === "away"
                        ? "#8A7A6A"
                        : entry.direction === "both"
                        ? "#6A5A8A"
                        : "#DDD",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>
                    {entry.activity}
                  </div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
                    Gevoel: {entry.feeling}
                  </div>
                  {/* Show selected values/drivers */}
                  {((entry.selectedValues && entry.selectedValues.length > 0) ||
                    (entry.selectedDrivers && entry.selectedDrivers.length > 0)) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {(entry.selectedValues || []).map((v) => (
                        <span
                          key={v}
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 10,
                            background: "#C47A5A18",
                            color: "#C47A5A",
                            fontWeight: 500,
                          }}
                        >
                          {v}
                        </span>
                      ))}
                      {(entry.selectedDrivers || []).map((d) => (
                        <span
                          key={d}
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 10,
                            background: "#F5F0EC",
                            color: "#8A7A6A",
                            fontWeight: 500,
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "#BBB", flexShrink: 0, textAlign: "right" }}>
                  <div>{entry.date}</div>
                  <div>{entry.time}</div>
                  {(entry.exportStatus || entry.importStatus) && (
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 6 }}>
                      {entry.exportStatus && (
                        <span
                          title={entry.exportStatus === "new" ? "Zojuist geëxporteerd" : "Eerder geëxporteerd"}
                          style={{
                            fontSize: 11,
                            color: entry.exportStatus === "new" ? "#2A2A28" : "#CCC",
                            lineHeight: 1,
                          }}
                        >{"\u2191"}</span>
                      )}
                      {entry.importStatus && (
                        <span
                          title={entry.importStatus === "new" ? "Zojuist geïmporteerd" : "Eerder geïmporteerd"}
                          style={{
                            fontSize: 11,
                            color: entry.importStatus === "new" ? "#2A2A28" : "#CCC",
                            lineHeight: 1,
                          }}
                        >{"\u2193"}</span>
                      )}
                    </div>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {entries.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#BBB",
            fontSize: 14,
          }}
        >
          Je hebt vandaag nog niets genoteerd.
          <br />
          Begin met wat je nu aan het doen bent.
        </div>
      )}
    </div>
  );
}
