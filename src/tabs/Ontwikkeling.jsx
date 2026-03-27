import { useState } from "react";
import { CHART_COLORS } from "../constants";
import { getAllAuthentic, getAllInauthentic } from "../domainHelpers";
import { getPeriods, countValuesInPeriod } from "../dateUtils";
import StockChart from "../components/StockChart";
import useIsMobile from "../hooks/useIsMobile";

export default function Ontwikkeling({ entries, domains }) {
  const { isMobile } = useIsMobile();
  const [timeView, setTimeView] = useState("week");
  const [showDrivers, setShowDrivers] = useState(false);

  const allAuthenticNames = getAllAuthentic(domains).map((a) => a.value);
  const allInauthenticNames = getAllInauthentic(domains).map((a) => a.value);

  const now = new Date();
  const periods = getPeriods(timeView, now);

  const periodsData = periods.map((period) => ({
    ...period,
    valueCounts: countValuesInPeriod(entries, period.start, period.end, "selectedValues"),
    driverCounts: countValuesInPeriod(entries, period.start, period.end, "selectedDrivers"),
  }));

  const activeValues = [...new Set([
    ...allAuthenticNames,
    ...periodsData.flatMap((p) => Object.keys(p.valueCounts)),
  ])].filter((v) => periodsData.some((p) => (p.valueCounts[v] || 0) > 0));

  const activeDrivers = [...new Set([
    ...allInauthenticNames,
    ...periodsData.flatMap((p) => Object.keys(p.driverCounts)),
  ])].filter((d) => periodsData.some((p) => (p.driverCounts[d] || 0) > 0));

  const timeLabels = { week: "Week", month: "Maand", quarter: "Kwartaal" };

  const hasData = activeValues.length > 0 || activeDrivers.length > 0;

  const currentItems = showDrivers ? activeDrivers : activeValues;
  const field = showDrivers ? "driverCounts" : "valueCounts";
  const accentColor = showDrivers ? "#8A7A6A" : "#C47A5A";

  // Build chart series
  const chartSeries = currentItems.map((name, idx) => ({
    name,
    color: CHART_COLORS[idx % CHART_COLORS.length],
    data: periodsData.map((p) => p[field][name] || 0),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h3
          style={{
            margin: "0 0 6px",
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 400,
          }}
        >
          Ontwikkeling over tijd
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#888" }}>
          Vergelijk je waarden en drivers als koersen over tijd.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {(["week", "month", "quarter"]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeView(t)}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: timeView === t ? `2px solid ${accentColor}` : "2px solid #E8E6E2",
                background: timeView === t ? (showDrivers ? "#F5F0EC" : "#FDF6F0") : "#fff",
                color: timeView === t ? accentColor : "#666",
                fontWeight: timeView === t ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: "all 0.2s ease",
              }}
            >
              {timeLabels[t]}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowDrivers(false)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: !showDrivers ? "2px solid #C47A5A" : "2px solid #E8E6E2",
              background: !showDrivers ? "#FDF6F0" : "#fff",
              color: !showDrivers ? "#C47A5A" : "#666",
              fontWeight: !showDrivers ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              transition: "all 0.2s ease",
            }}
          >
            Waarden
          </button>
          <button
            onClick={() => setShowDrivers(true)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: showDrivers ? "2px solid #8A7A6A" : "2px solid #E8E6E2",
              background: showDrivers ? "#F5F0EC" : "#fff",
              color: showDrivers ? "#8A7A6A" : "#666",
              fontWeight: showDrivers ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              transition: "all 0.2s ease",
            }}
          >
            Drivers
          </button>
        </div>
      </div>

      {!hasData && (
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
          Nog geen check-ins met waarden of drivers gevonden.
          <br />
          Doe eerst een paar check-ins met waarde/driver-selectie.
        </div>
      )}

      {hasData && currentItems.length === 0 && (
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
          Geen {showDrivers ? "drivers" : "waarden"} gevonden in deze periode.
        </div>
      )}

      {currentItems.length > 0 && (
        <>
          {/* Table */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #E8E6E2",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #E8E6E2" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "14px 18px",
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                        color: accentColor,
                        position: "sticky",
                        left: 0,
                        background: "#fff",
                        minWidth: 140,
                      }}
                    >
                      {showDrivers ? "Driver" : "Waarde"}
                    </th>
                    {periodsData.map((p, i) => (
                      <th
                        key={i}
                        style={{
                          textAlign: "center",
                          padding: "14px 12px",
                          fontWeight: 600,
                          fontSize: 11,
                          color: "#888",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          minWidth: 60,
                        }}
                      >
                        {p.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((name, idx) => (
                    <tr
                      key={name}
                      style={{
                        borderBottom: idx < currentItems.length - 1 ? "1px solid #F0EEEA" : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 18px",
                          fontWeight: 600,
                          color: "#2A2A28",
                          position: "sticky",
                          left: 0,
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: CHART_COLORS[idx % CHART_COLORS.length],
                            flexShrink: 0,
                          }}
                        />
                        {name}
                      </td>
                      {periodsData.map((p, pi) => {
                        const count = p[field][name] || 0;
                        const prevCount = pi > 0 ? (periodsData[pi - 1][field][name] || 0) : null;
                        return (
                          <td
                            key={pi}
                            style={{
                              textAlign: "center",
                              padding: "12px 12px",
                              fontWeight: count > 0 ? 600 : 400,
                              color: count > 0 ? "#2A2A28" : "#DDD",
                              fontVariantNumeric: "tabular-nums",
                              position: "relative",
                            }}
                          >
                            {count > 0 ? count : "\u2013"}
                            {prevCount !== null && count !== prevCount && count > 0 && (
                              <span style={{
                                fontSize: 10,
                                marginLeft: 3,
                                color: (showDrivers ? count < prevCount : count > prevCount)
                                  ? "#4A8A5A"
                                  : (showDrivers ? count > prevCount : count < prevCount)
                                  ? "#C45A5A"
                                  : "#AAA",
                              }}>
                                {count > prevCount ? "\u25B2" : "\u25BC"}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "24px 20px 16px",
              border: "1px solid #E8E6E2",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: accentColor,
                marginBottom: 16,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                paddingLeft: 8,
              }}
            >
              Koersverloop
            </div>
            <StockChart series={chartSeries} periods={periodsData} />
            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 16px",
                marginTop: 12,
                paddingLeft: 8,
              }}
            >
              {chartSeries.map((s) => (
                <div
                  key={s.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: s.color,
                      flexShrink: 0,
                    }}
                  />
                  {s.name}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
