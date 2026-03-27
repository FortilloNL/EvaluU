import { useRef, useEffect, useCallback, useState, memo } from "react";
import { DRIVER_WORDS, DIMENSIONS } from "../../data/wawoweb-data";

/* ── Layout constants ────────────────────────────────────────────── */
const CX = 500, CY = 500;
const R_MAIN = 340;     // dimension arcs radius base (arcs at R_MAIN + 20 = 360)
const R_NODE = 380;     // node dots sit OUTSIDE the arcs (20px beyond arcs)
const R_POS = 480;      // authentiek — outer ring (100 beyond nodes)
const R_NEG = 330;      // inauthentiek — inner ring (50 inside nodes, still outside arcs)
const DEG = Math.PI / 180;
const STEP = 6; // degrees per value
// Focus point at 9 o'clock (left side of wheel)
const FOCUS_X = CX - R_NODE; // ~120

/* ── Build dimension-sorted word array ───────────────────────────── */
const SORTED = [];
const DIM_FOR = {};
DIMENSIONS.forEach(dim => {
  dim.ids.forEach(id => {
    const w = DRIVER_WORDS.find(d => d.id === id);
    if (w) { SORTED.push(w); DIM_FOR[id] = dim; }
  });
});

/* ── Synonym-based connections (computed once at load) ────────────── */
const STOP = new Set(
  "de het een van in op aan met voor naar als dat die wat zijn niet maar wel ook nog dan bij uit door over onder tot om zich alle zeer meer geen worden wordt deze andere anderen steeds zonder"
    .split(" ")
);

function collectTokens(word) {
  const set = new Set();
  const add = (s) =>
    s.toLowerCase().split(/[\s,\-\/()]+/).forEach(t => {
      if (t.length >= 4 && !STOP.has(t)) set.add(t);
    });
  for (const v of [...word.positive, ...word.negative]) {
    (v.synonyms || []).forEach(add);
    add(v.word);
  }
  return set;
}

const TOKENS = SORTED.map(collectTokens);

const EDGES = (() => {
  const out = [];
  for (let i = 0; i < SORTED.length; i++) {
    for (let j = i + 1; j < SORTED.length; j++) {
      let n = 0;
      for (const t of TOKENS[i]) { if (TOKENS[j].has(t)) n++; }
      if (n >= 2)
        out.push({ fi: i, ti: j, fid: SORTED[i].id, tid: SORTED[j].id });
    }
  }
  return out;
})();

// Build adjacency map for quick connection lookups
const CONNECTIONS = {};
EDGES.forEach(({ fid, tid }) => {
  if (!CONNECTIONS[fid]) CONNECTIONS[fid] = [];
  if (!CONNECTIONS[tid]) CONNECTIONS[tid] = [];
  CONNECTIONS[fid].push(tid);
  CONNECTIONS[tid].push(fid);
});

/* ── Geometry helpers ────────────────────────────────────────────── */
function pt(a, r) { return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]; }

function normalizeAngle(deg) {
  return ((deg % 360) + 360) % 360;
}

function clampIdx(idx) {
  return ((idx % SORTED.length) + SORTED.length) % SORTED.length;
}

/* ── Wheel component ─────────────────────────────────────────────── */
export default function WaWoWebWheel({
  hoveredNode, setHoveredNode, selectedTerm, setSelectedTerm,
  focusNodeId, isMobile, onConnectionsChange,
}) {
  const [rotation, setRotation] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const animRef = useRef(null);
  const dragRef = useRef({ active: false, startY: 0, startX: 0, startRotation: 0, lastY: 0, lastTime: 0, velocity: 0, moved: false });
  const svgRef = useRef(null);
  const scrollAccumRef = useRef(0);

  // Update focused index + hoveredNode from a rotation value
  const updateFocusFromRotation = useCallback((rot) => {
    const idx = clampIdx(Math.round(-rot / STEP));
    setFocusedIndex(idx);
    setHoveredNode(SORTED[idx]?.id ?? null);
  }, [setHoveredNode]);

  // Snap to focused value with animation
  const snapTo = useCallback((idx, animate = true) => {
    const clamped = clampIdx(idx);
    const targetRot = -clamped * STEP;
    if (!animate) {
      setRotation(targetRot);
      setFocusedIndex(clamped);
      setHoveredNode(SORTED[clamped]?.id ?? null);
      return;
    }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = rotation;
    // Find shortest rotation path (for seamless wrapping)
    const fullCircle = SORTED.length * STEP; // 360
    let diff = targetRot - start;
    diff = ((diff % fullCircle) + fullCircle + fullCircle / 2) % fullCircle - fullCircle / 2;
    const duration = Math.min(400, Math.abs(diff) * 3 + 100);
    const t0 = performance.now();
    const actualTarget = start + diff;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setRotation(start + diff * ease);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else {
        setRotation(actualTarget);
        setFocusedIndex(clamped);
        setHoveredNode(SORTED[clamped]?.id ?? null);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [rotation, setHoveredNode]);

  // Focus on external node ID
  useEffect(() => {
    if (focusNodeId != null) {
      const idx = SORTED.findIndex(w => w.id === focusNodeId);
      if (idx >= 0) snapTo(idx);
    }
  }, [focusNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial snap
  useEffect(() => {
    setHoveredNode(SORTED[0]?.id ?? null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Report connections when focused node changes
  useEffect(() => {
    const word = SORTED[focusedIndex];
    if (!word || !onConnectionsChange) return;
    const conns = (CONNECTIONS[word.id] || []).map(id => {
      const idx = SORTED.findIndex(w => w.id === id);
      const w = SORTED[idx];
      if (!w) return null;
      return { id, neutral: w.neutral, dim: DIM_FOR[id], idx };
    }).filter(Boolean);
    onConnectionsChange(conns);
  }, [focusedIndex, onConnectionsChange]);

  // Mouse wheel: 1 tick = 1 value (accumulate delta, snap per threshold)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      scrollAccumRef.current += e.deltaY;
      const threshold = 40; // pixels per step
      if (Math.abs(scrollAccumRef.current) >= threshold) {
        const steps = Math.sign(scrollAccumRef.current);
        scrollAccumRef.current = 0;
        const newIdx = clampIdx(focusedIndex + steps);
        snapTo(newIdx);
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [focusedIndex, snapTo]);

  // Helper: get SVG center X in viewport coordinates (for drag direction inversion)
  const getSvgCenterX = useCallback(() => {
    const el = svgRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const vbParts = el.getAttribute("viewBox").split(" ").map(Number);
    const [vbX, vbY, vbW, vbH] = vbParts;
    const fracX = (CX - vbX) / vbW;
    return rect.left + fracX * rect.width;
  }, []);

  // Pointer event handlers for drag/spin
  const onPointerDown = useCallback((e) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const d = dragRef.current;
    d.active = true;
    d.startY = e.clientY;
    d.startX = e.clientX;
    d.startRotation = rotation;
    d.lastY = e.clientY;
    d.lastTime = performance.now();
    d.velocity = 0;
    d.moved = false;
    // Don't use setPointerCapture — it prevents clicks on child elements
  }, [rotation]);

  const onPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d.active) return;

    // Check if user actually moved (for click vs drag distinction)
    const totalDist = Math.abs(e.clientY - d.startY) + Math.abs(e.clientX - d.startX);
    if (totalDist > 5) d.moved = true;

    const dy = e.clientY - d.startY;
    const svgEl = svgRef.current;
    const scale = svgEl ? 1000 / svgEl.getBoundingClientRect().height : 1;

    // Invert drag direction based on pointer X position relative to wheel center
    // Right of center (12-6 o'clock): drag down = clockwise (normal)
    // Left of center (6-12 o'clock): drag down = counter-clockwise (inverted)
    const svgCenterX = getSvgCenterX();
    const sign = e.clientX > svgCenterX ? 1 : -1;

    const degDelta = dy * scale * 0.5 * sign;
    const newRotation = d.startRotation + degDelta;
    setRotation(newRotation);

    // Live highlight: update focused index during drag
    updateFocusFromRotation(newRotation);

    // Track velocity for momentum
    const now = performance.now();
    const dt = now - d.lastTime;
    if (dt > 0) {
      const pixVelocity = (e.clientY - d.lastY) / dt;
      d.velocity = pixVelocity * scale * 0.5 * sign;
    }
    d.lastY = e.clientY;
    d.lastTime = now;
  }, [getSvgCenterX, updateFocusFromRotation]);

  const onPointerUp = useCallback(() => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;

    // If no significant movement, treat as click — handled by node onClick
    if (!d.moved) return;

    // Momentum animation
    let vel = d.velocity * 16; // velocity in deg per frame
    if (Math.abs(vel) > 0.5) {
      const tick = () => {
        vel *= 0.92;
        setRotation(prev => {
          const next = prev + vel;
          if (Math.abs(vel) < 0.3) {
            const idx = clampIdx(Math.round(-next / STEP));
            snapTo(idx);
            return next;
          }
          updateFocusFromRotation(next);
          return next;
        });
        if (Math.abs(vel) >= 0.3) animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    } else {
      // Just snap to nearest
      const idx = clampIdx(Math.round(-rotation / STEP));
      snapTo(idx);
    }
  }, [rotation, snapTo, updateFocusFromRotation]);

  // Click on a node to jump to it
  const onNodeClick = useCallback((index) => {
    if (dragRef.current.moved) return; // was a drag, not a click
    snapTo(index);
  }, [snapTo]);

  const clickVariant = useCallback((v, wordId) => {
    const w = DRIVER_WORDS.find(d => d.id === wordId);
    const isPos = w.positive.some(p => p.word === v.word);
    setSelectedTerm({
      term: { ...v, _type: isPos ? "positief" : "negatief" },
      parentNeutral: w.neutral, parentId: w.id,
    });
  }, [setSelectedTerm]);

  // Compute which nodes are visible
  const visibleNodes = SORTED.map((w, i) => {
    const nodeAngle = normalizeAngle(i * STEP + rotation);
    const dist = Math.min(nodeAngle, 360 - nodeAngle);
    let opacity = 0;
    let scale = 0;
    if (dist <= 40) { opacity = 1; scale = 1; }
    else if (dist <= 65) { opacity = 0.5; scale = 0.85; }
    else if (dist <= 90) { opacity = 0.2; scale = 0.6; }
    else { opacity = 0; scale = 0; }
    const isFocused = i === focusedIndex;
    return { word: w, index: i, dist, opacity, scale, isFocused };
  }).filter(n => n.opacity > 0);

  // ViewBox: centered on the focus point (FOCUS_X ≈ 120)
  // Desktop: wider view (more of the circle visible)
  // Mobile: tighter view (less circle, larger elements)
  const viewBox = isMobile ? "-40 200 400 600" : "-180 50 800 900";

  return (
    <svg ref={svgRef}
      viewBox={viewBox}
      style={{ width: "100%", height: "100%", display: "block", touchAction: "none", userSelect: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Dimension arcs (rotate with wheel) — base at +180 for 9 o'clock */}
      <g transform={`rotate(${rotation}, ${CX}, ${CY})`}>
        {DIMENSIONS.map((dim, di) => {
          const si = di * 10;
          const sAngle = (si * STEP + 180 - 2.5) * DEG;
          const eAngle = ((si + 9) * STEP + 180 + 2.5) * DEG;
          const [x1, y1] = pt(sAngle, R_MAIN + 20);
          const [x2, y2] = pt(eAngle, R_MAIN + 20);
          return (
            <path key={dim.id}
              d={`M${x1},${y1} A${R_MAIN + 20},${R_MAIN + 20} 0 0 1 ${x2},${y2}`}
              fill="none" stroke={dim.color} strokeWidth={3} opacity={0.25}
              strokeLinecap="round" />
          );
        })}
      </g>

      {/* Ring labels: Authentiek (outer/left) / Inauthentiek (inner/right) — horizontal, above variants */}
      <text x={CX - R_POS - 110} y={CY - 70} textAnchor="middle" fill="rgba(196,122,90,0.55)"
        fontSize={12} fontWeight={700} letterSpacing="2"
        fontFamily="'DM Sans',system-ui,sans-serif">
        AUTHENTIEK
      </text>
      <text x={CX - R_NEG + 50} y={CY - 70} textAnchor="middle" fill="rgba(138,122,106,0.55)"
        fontSize={12} fontWeight={700} letterSpacing="2"
        fontFamily="'DM Sans',system-ui,sans-serif">
        INAUTHENTIEK
      </text>

      {/* Value nodes */}
      {visibleNodes.map(({ word, index, opacity, scale, isFocused }) => {
        const baseAngle = (index * STEP + rotation + 180) * DEG;
        const [x, y] = pt(baseAngle, R_NODE);
        const dim = DIM_FOR[word.id];
        const color = dim.color;
        const isConnected = hoveredNode != null && (CONNECTIONS[hoveredNode] || []).includes(word.id);
        const nodeR = isFocused ? 12 : isConnected ? 9 : 7;

        return (
          <g key={word.id} style={{ transition: "opacity 0.2s" }} opacity={opacity}>
            {/* Connector lines to variants when focused */}
            {isFocused && [...word.positive, ...word.negative].map((v, vi) => {
              const isPos = vi < word.positive.length;
              const subIdx = isPos ? vi : vi - word.positive.length;
              // Scale angular offset by radius ratio so both rings reach same y-height
              const baseOff = subIdx === 0 ? -4 : 4;
              const off = (isPos ? baseOff * R_NEG / R_POS : baseOff) * DEG;
              const r = isPos ? R_POS : R_NEG;
              const [vx, vy] = pt(baseAngle + off, r);
              return (
                <line key={`cl${vi}`} x1={x} y1={y} x2={vx} y2={vy}
                  stroke={isPos ? color : "#8A7A6A"} strokeWidth={0.8} opacity={0.35}
                  strokeDasharray="3,3" />
              );
            })}

            {/* Main node circle + click target */}
            <circle cx={x} cy={y} r={nodeR * scale} fill={color}
              opacity={isFocused ? 1 : isConnected ? 0.7 : 0.5} />
            {!isFocused && (
              <circle cx={x} cy={y} r={20} fill="transparent" style={{ cursor: "pointer" }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onNodeClick(index); }} />
            )}

            {/* Label — to the LEFT of the node (away from wheel center) */}
            <text x={x} y={y}
              dx={isFocused ? -20 : -14 * scale} dy={4}
              textAnchor="end"
              fill={isFocused ? "#2A2A28" : isConnected ? "#555" : "#888"}
              fontSize={isFocused ? 18 : 14 * scale}
              fontWeight={isFocused ? 700 : 500}
              fontFamily="'DM Sans',system-ui,sans-serif"
              style={{ pointerEvents: "none", transition: "all .2s", cursor: !isFocused ? "pointer" : "default" }}>
              {word.neutral}
            </text>

            {/* Dimension label — inside the wheel (toward center) */}
            {isFocused && (
              <text x={x} y={y}
                dx={140} dy={5}
                textAnchor="start"
                fill={color} fontSize={12} fontWeight={700} opacity={0.45}
                fontFamily="'DM Serif Display',Georgia,serif"
                letterSpacing="1.5"
                style={{ pointerEvents: "none" }}>
                {dim.name.toUpperCase()}
              </text>
            )}

            {/* Positive variants = outer ring = authentiek (to the LEFT, away from center) */}
            {isFocused && word.positive.map((v, vi) => {
              const off = (vi === 0 ? -4 : 4) * R_NEG / R_POS * DEG;
              const [vx, vy] = pt(baseAngle + off, R_POS);
              const isSelected = selectedTerm?.term?.word === v.word;
              return (
                <g key={`p${vi}`} transform={`translate(${vx},${vy})`}
                  style={{ cursor: "pointer" }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); clickVariant(v, word.id); }}>
                  <circle r={7} fill={color} opacity={isSelected ? 1 : 0.85} />
                  <circle r={22} fill="transparent" />
                  <text dx={-12} dy={4} textAnchor="end" fill={color}
                    fontSize={12} fontWeight={isSelected ? 700 : 550}
                    fontFamily="'DM Sans',system-ui,sans-serif"
                    style={{ cursor: "pointer" }}>
                    {v.word}
                  </text>
                </g>
              );
            })}

            {/* Negative variants = inner ring = inauthentiek (to the RIGHT, toward center) */}
            {isFocused && word.negative.map((v, vi) => {
              const off = (vi === 0 ? -4 : 4) * DEG;
              const [vx, vy] = pt(baseAngle + off, R_NEG);
              const isSelected = selectedTerm?.term?.word === v.word;
              return (
                <g key={`n${vi}`} transform={`translate(${vx},${vy})`}
                  style={{ cursor: "pointer" }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); clickVariant(v, word.id); }}>
                  <circle r={7} fill="#8A7A6A" opacity={isSelected ? 1 : 0.85} />
                  <circle r={22} fill="transparent" />
                  <text dx={12} dy={4} textAnchor="start" fill="#8A7A6A"
                    fontSize={12} fontWeight={isSelected ? 700 : 550}
                    fontFamily="'DM Sans',system-ui,sans-serif"
                    style={{ cursor: "pointer" }}>
                    {v.word}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// Export for reuse
export { SORTED, DIM_FOR, CONNECTIONS, EDGES };
