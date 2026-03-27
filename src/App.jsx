import { useState, useEffect, useRef } from "react";
import { ACT_PRINCIPLES, CHECKIN_STORAGE_KEY, DOMAINS_STORAGE_KEY, DB_TOKEN_KEY, CSV_COLUMNS, MAX_DOMAINS, OLD_CHECKIN_STORAGE_KEY, OLD_DB_TOKEN_KEY, OLD_DOMAINS_STORAGE_KEY } from "./constants";
import { csvEscape, parseCSV } from "./csvUtils";
import { enrichDomains } from "./domainHelpers";
import useIsMobile from "./hooks/useIsMobile";
import DomainCard from "./components/DomainCard";
import DomainDetail from "./components/DomainDetail";
import DomainForm from "./components/DomainForm";
import Waardenkaart from "./tabs/Waardenkaart";
import DailyCheckin from "./tabs/DailyCheckin";
import Ontwikkeling from "./tabs/Ontwikkeling";
import WaWoWebOverlay from "./components/WaWoWeb/WaWoWebOverlay";

const TAB_ICONS = { domains: "\u25A6", waardenkaart: "\u2726", daily: "\u2713", ontwikkeling: "\u2197", wawoweb: "\u25C8" };

// One-time migration from old act-waarden-* localStorage keys to evaluu-*
function migrateLocalStorageKeys() {
  const pairs = [
    [OLD_DOMAINS_STORAGE_KEY, DOMAINS_STORAGE_KEY],
    [OLD_CHECKIN_STORAGE_KEY, CHECKIN_STORAGE_KEY],
    [OLD_DB_TOKEN_KEY, DB_TOKEN_KEY],
  ];
  for (const [oldKey, newKey] of pairs) {
    const oldVal = localStorage.getItem(oldKey);
    if (oldVal !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, oldVal);
      localStorage.removeItem(oldKey);
    }
  }
}
migrateLocalStorageKeys();

export default function App() {
  const { isMobile } = useIsMobile();
  const [activeTab, setActiveTab] = useState("domains");
  const [showDomainForm, setShowDomainForm] = useState(false);
  // WaWoWeb is now a tab, no separate overlay state needed

  // Domains state (loaded from localStorage, enriched with palette colors)
  const [domains, setDomainsRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(DOMAINS_STORAGE_KEY);
      if (stored) return enrichDomains(JSON.parse(stored));

      // Migration: if old custom value keys exist, create a catch-all domain
      const oldAuth = localStorage.getItem("act-waarden-custom-authentic");
      const oldInauth = localStorage.getItem("act-waarden-custom-inauthentic");
      if (oldAuth || oldInauth) {
        const authValues = oldAuth ? JSON.parse(oldAuth) : [];
        const inauthValues = oldInauth ? JSON.parse(oldInauth) : [];
        if (authValues.length > 0 || inauthValues.length > 0) {
          const migrated = [{
            id: crypto.randomUUID(),
            title: "Mijn waarden",
            description: "Gemigreerde waarden",
            icon: "\u25C8",
            authentic: authValues,
            inauthentic: inauthValues,
            reflectionQuestion: "",
          }];
          localStorage.removeItem("act-waarden-custom-authentic");
          localStorage.removeItem("act-waarden-custom-inauthentic");
          return enrichDomains(migrated);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Wrap setDomains to always enrich with palette colors
  const setDomains = (updater) => {
    setDomainsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return enrichDomains(next);
    });
  };

  const [selectedDomain, setSelectedDomain] = useState(() => domains[0]?.id || null);
  const currentDomain = domains.find((d) => d.id === selectedDomain) || null;

  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(CHECKIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dbToken] = useState(() => {
    let token = localStorage.getItem(DB_TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DB_TOKEN_KEY, token);
    }
    return token;
  });

  const fileInputRef = useRef(null);

  // Persist domains (strip derived color/bgLight)
  useEffect(() => {
    const toStore = domains.map(({ color, bgLight, ...rest }) => rest);
    localStorage.setItem(DOMAINS_STORAGE_KEY, JSON.stringify(toStore));
  }, [domains]);

  useEffect(() => {
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Domain CRUD
  const handleAddDomain = (newDomain) => {
    setDomains((prev) => [...prev, newDomain]);
    setSelectedDomain(newDomain.id);
    setShowDomainForm(false);
  };

  const handleUpdateDomain = (updated) => {
    setDomains((prev) => prev.map((d) => d.id === updated.id ? { ...d, ...updated } : d));
  };

  const handleDeleteDomain = (id) => {
    setDomains((prev) => {
      const next = prev.filter((d) => d.id !== id);
      return next;
    });
    setSelectedDomain((prev) => {
      const remaining = domains.filter((d) => d.id !== id);
      return remaining.length > 0 ? remaining[0].id : null;
    });
  };

  // CSV Export
  const exportToCSV = () => {
    const updatedEntries = entries.map((e) => ({
      ...e,
      exportStatus: e.exportStatus ? "old" : "new",
    }));
    setEntries(updatedEntries);

    const header = CSV_COLUMNS.join(",");
    const metaRow = CSV_COLUMNS.map((c) => c === "type" ? "meta" : c === "token" ? csvEscape(dbToken) : "").join(",");
    const domainRows = domains.map((d) => {
      const { color, bgLight, ...data } = d;
      const { id, ...rest } = data;
      return CSV_COLUMNS.map((c) => c === "type" ? "domain" : c === "id" ? csvEscape(id) : c === "value" ? csvEscape(JSON.stringify(rest)) : "").join(",");
    });
    const entryRows = updatedEntries.map((e) =>
      CSV_COLUMNS.map((c) => {
        if (c === "type") return "entry";
        if (c === "token" || c === "value") return "";
        if (c === "selectedValues") return csvEscape((e.selectedValues || []).join("|"));
        if (c === "selectedDrivers") return csvEscape((e.selectedDrivers || []).join("|"));
        return csvEscape(e[c]);
      }).join(",")
    );

    const csv = [header, metaRow, ...domainRows, ...entryRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
    const filename = `evaluu_${dbToken}_${ts}.csv`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // CSV Import
  const importFromCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        if (rows.length === 0) { alert("Ongeldig CSV-bestand."); return; }

        const metaRow = rows.find((r) => r.type === "meta");
        if (!metaRow || !metaRow.token) { alert("Ongeldig CSV-bestand: geen database-token gevonden."); return; }

        const importedToken = metaRow.token;

        // Parse domains from CSV
        const importedDomains = rows.filter((r) => r.type === "domain").map((r) => {
          const data = JSON.parse(r.value);
          return { id: r.id, ...data };
        });

        // Legacy support: custom_authentic/custom_inauthentic rows without domain rows
        if (importedDomains.length === 0) {
          const legacyAuth = rows.filter((r) => r.type === "custom_authentic").map((r) => r.value).filter(Boolean);
          const legacyInauth = rows.filter((r) => r.type === "custom_inauthentic").map((r) => r.value).filter(Boolean);
          if (legacyAuth.length > 0 || legacyInauth.length > 0) {
            importedDomains.push({
              id: crypto.randomUUID(),
              title: "Geïmporteerde waarden",
              description: "Waarden uit een eerdere versie",
              icon: "\u25C8",
              authentic: legacyAuth,
              inauthentic: legacyInauth,
              reflectionQuestion: "",
            });
          }
        }

        const importedEntries = rows.filter((r) => r.type === "entry").map((r) => ({
          id: Number(r.id),
          activity: r.activity || "",
          feeling: r.feeling || "",
          direction: r.direction || null,
          selectedValues: r.selectedValues ? r.selectedValues.split("|").filter(Boolean) : [],
          selectedDrivers: r.selectedDrivers ? r.selectedDrivers.split("|").filter(Boolean) : [],
          date: r.date || "",
          time: r.time || "",
          exportStatus: r.exportStatus || null,
          importStatus: "new",
        }));

        const currentToken = localStorage.getItem(DB_TOKEN_KEY);
        const hasData = entries.length > 0 || domains.length > 0;

        if (!currentToken || !hasData) {
          // Empty database — adopt directly
          localStorage.setItem(DB_TOKEN_KEY, importedToken);
          setDomains(enrichDomains(importedDomains));
          setEntries(importedEntries);
          if (importedDomains.length > 0) setSelectedDomain(importedDomains[0].id);
          window.location.reload();
          return;
        }

        if (importedToken === currentToken) {
          // Same database — merge
          if (!window.confirm("Dit lijkt op een update van dezelfde database. Nieuwe records samenvoegen?")) return;
          const existingIds = new Set(entries.map((e) => e.id));
          const updatedExisting = entries.map((e) => ({
            ...e,
            importStatus: e.importStatus === "new" ? "old" : e.importStatus,
          }));
          const newEntries = importedEntries.filter((e) => !existingIds.has(e.id));
          setEntries([...newEntries, ...updatedExisting]);
          // Merge domains by ID
          const existingDomainIds = new Set(domains.map((d) => d.id));
          const newDomains = importedDomains.filter((d) => !existingDomainIds.has(d.id));
          if (newDomains.length > 0) {
            setDomains((prev) => [...prev, ...newDomains]);
          }
        } else {
          // Different database — replace
          if (window.confirm("Dit is van een andere database. Eerst een back-up maken van je huidige gegevens?")) {
            exportToCSV();
          }
          if (!window.confirm("Alle huidige gegevens vervangen door de geïmporteerde data?")) return;
          localStorage.setItem(DB_TOKEN_KEY, importedToken);
          setDomains(enrichDomains(importedDomains));
          setEntries(importedEntries);
          if (importedDomains.length > 0) setSelectedDomain(importedDomains[0].id);
          window.location.reload();
        }
      } catch (err) {
        alert("Fout bij het importeren: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const usedIcons = domains.map((d) => d.icon);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F4F0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#2A2A28",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />
      {/* Header */}
      <div
        style={{
          background: "#2A2A28",
          padding: isMobile ? "16px 16px 14px" : "32px 32px 28px",
          color: "#F5F4F0",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files[0]) importFromCSV(e.target.files[0]);
              e.target.value = "";
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2.5,
                color: "#C47A5A",
              }}
            >
              EvaluU
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Importeer CSV"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: "#AAA8A4",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: 14 }}>{"\u2193"}</span>{!isMobile && " Importeer"}
              </button>
              <button
                onClick={exportToCSV}
                title="Exporteer CSV"
                style={{
                  background: "rgba(196,122,90,0.2)",
                  border: "1px solid rgba(196,122,90,0.4)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: "#C47A5A",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: 14 }}>{"\u2191"}</span>{!isMobile && " Exporteer"}
              </button>
            </div>
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: isMobile ? 22 : 30,
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            Waar beweeg je naartoe?
          </h1>
          {!isMobile && (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                color: "#AAA8A4",
                lineHeight: 1.5,
                maxWidth: 520,
              }}
            >
              Waarden zijn richtingen, geen bestemmingen. Onderzoek bij elk
              levensdomein: beweeg je <em>naar</em> iets toe, of <em>weg</em> van
              iets?
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: isMobile ? 12 : 24,
              marginTop: isMobile ? 12 : 18,
              flexWrap: "wrap",
            }}
          >
            {ACT_PRINCIPLES.map((p) => (
              <div
                key={p.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: isMobile ? 12 : 13,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: p.color,
                    flexShrink: 0,
                  }}
                />
                <span>
                  <strong>{p.label}</strong>
                  {!isMobile && <span style={{ color: "#888" }}> {p.desc}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Tab navigation */}
      <div
        style={{
          background: isMobile ? "#fff" : "#EEEDEA",
          borderBottom: isMobile ? "none" : "1px solid #DDD",
          borderTop: isMobile ? "1px solid #DDD" : "none",
          padding: isMobile ? "0" : "0 32px",
          ...(isMobile ? {
            position: "fixed", bottom: 0, left: 0, right: 0,
            zIndex: 100,
            paddingBottom: "env(safe-area-inset-bottom)",
          } : {}),
        }}
      >
        <div
          style={{
            maxWidth: isMobile ? "none" : 800,
            margin: "0 auto",
            display: "flex",
            gap: 0,
          }}
        >
          {[
            { id: "domains", label: "Domeinen", shortLabel: "Domeinen" },
            { id: "waardenkaart", label: "Waardenkaart", shortLabel: "Kaart" },
            { id: "daily", label: "Dagelijkse Check-in", shortLabel: "Check-in" },
            { id: "ontwikkeling", label: "Ontwikkeling", shortLabel: "Groei" },
            { id: "wawoweb", label: "Wa-Wo-Web", shortLabel: "Web" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: isMobile ? 1 : "none",
                padding: isMobile ? "8px 4px 6px" : "14px 24px",
                background: "none",
                border: "none",
                borderBottom: isMobile ? "none" : (
                  activeTab === tab.id
                    ? "2.5px solid #C47A5A"
                    : "2.5px solid transparent"
                ),
                borderTop: isMobile ? (
                  activeTab === tab.id
                    ? "2.5px solid #C47A5A"
                    : "2.5px solid transparent"
                ) : "none",
                color: activeTab === tab.id ? (isMobile ? "#C47A5A" : "#2A2A28") : "#888",
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: isMobile ? 10 : 14,
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 2 : 0,
                minHeight: isMobile ? 52 : "auto",
              }}
            >
              {isMobile && <span style={{ fontSize: 18 }}>{TAB_ICONS[tab.id]}</span>}
              {isMobile ? tab.shortLabel : tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "20px 12px 88px" : "28px 32px", display: activeTab === "wawoweb" ? "none" : "block" }}>
        {activeTab === "domains" && (
          <>
            {domains.length === 0 && !showDomainForm && (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #E8E6E2",
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    marginBottom: 16,
                    opacity: 0.3,
                  }}
                >
                  {"\u25C8"}
                </div>
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 400,
                    margin: "0 0 8px",
                    color: "#2A2A28",
                  }}
                >
                  Begin met je eerste levensdomein
                </h2>
                <p style={{ fontSize: 14, color: "#888", margin: "0 0 24px", lineHeight: 1.5 }}>
                  Voeg een domein toe zoals muziek, studie, werk of relaties.
                  <br />
                  Elk domein krijgt eigen waarden en reflectievragen.
                </p>
                <button
                  onClick={() => setShowDomainForm(true)}
                  style={{
                    padding: "14px 32px",
                    borderRadius: 12,
                    border: "none",
                    background: "#C47A5A",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  + Nieuw domein
                </button>
              </div>
            )}
            {(domains.length > 0 || showDomainForm) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr",
                  gap: isMobile ? 16 : 24,
                  alignItems: "start",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {domains.map((d) => (
                    <DomainCard
                      key={d.id}
                      domain={d}
                      isSelected={selectedDomain === d.id && !showDomainForm}
                      onClick={() => { setSelectedDomain(d.id); setShowDomainForm(false); }}
                    />
                  ))}
                  {domains.length < MAX_DOMAINS && (
                    <div
                      onClick={() => setShowDomainForm(true)}
                      style={{
                        borderRadius: 16,
                        padding: "20px 22px",
                        cursor: "pointer",
                        border: showDomainForm ? "2px solid #C47A5A" : "2px dashed #DDD5CC",
                        background: showDomainForm ? "#FDF6F0" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 20,
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 12,
                          background: showDomainForm ? "#C47A5A" : "#E8E6E2",
                          color: showDomainForm ? "#fff" : "#999",
                          fontWeight: 600,
                        }}
                      >
                        +
                      </span>
                      <div
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontSize: 15,
                          fontWeight: 500,
                          color: showDomainForm ? "#C47A5A" : "#999",
                        }}
                      >
                        Nieuw domein
                      </div>
                    </div>
                  )}
                </div>
                <div style={isMobile ? {} : { position: "sticky", top: 20 }}>
                  {showDomainForm ? (
                    <DomainForm
                      onSave={handleAddDomain}
                      onCancel={() => setShowDomainForm(false)}
                      usedIcons={usedIcons}
                    />
                  ) : currentDomain ? (
                    <DomainDetail
                      domain={currentDomain}
                      onUpdate={handleUpdateDomain}
                      onDelete={() => handleDeleteDomain(currentDomain.id)}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}
        {activeTab === "waardenkaart" && (
          <Waardenkaart
            domains={domains}
            setDomains={setDomains}
          />
        )}
        {activeTab === "daily" && (
          <DailyCheckin
            entries={entries}
            setEntries={setEntries}
            domains={domains}
          />
        )}
        {activeTab === "ontwikkeling" && (
          <Ontwikkeling
            entries={entries}
            domains={domains}
          />
        )}
      </div>
      {activeTab === "wawoweb" && (
        <WaWoWebOverlay inline />
      )}
    </div>
  );
}
