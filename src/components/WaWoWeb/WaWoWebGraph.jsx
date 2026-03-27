import { useRef, useEffect, useCallback, useState, memo } from "react";
import { DRIVER_WORDS, DIMENSIONS } from "../../data/wawoweb-data";

/* ── Layout constants ────────────────────────────────────────────── */
const CX = 500, CY = 500, R_MAIN = 340, R_POS = 405, R_NEG = 270;
const DEG = Math.PI / 180;
const DEFAULT_VB = { x: 0, y: 0, w: 1000, h: 1000 };
const MIN_ZOOM = 200;
const MAX_ZOOM = 1000;

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

/* ── Geometry helpers ────────────────────────────────────────────── */
function ang(i) { return (i * 6 - 90) * DEG; }
function pt(a, r) { return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]; }

function flipDeg(d) {
  const a = ((d % 360) + 360) % 360;
  return a > 90 && a < 270 ? d + 180 : d;
}

function bezier(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = mx - CX, dy = my - CY;
  const pull = Math.max(0.15, 0.4 - Math.hypot(dx, dy) / 1200);
  return `M${x1},${y1} Q${mx - dx * pull},${my - dy * pull} ${x2},${y2}`;
}

function dimArc(startIdx, count, r) {
  const s = (startIdx * 6 - 90 - 2.5) * DEG;
  const e = ((startIdx + count - 1) * 6 - 90 + 2.5) * DEG;
  const [x1, y1] = pt(s, r);
  const [x2, y2] = pt(e, r);
  return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
}

/* ── Variant node (authentiek / inauthentiek) ────────────────────── */
function VariantNode({ v, sortedIndex, offset, radius, color, isSelected, onClick, onEnter, onLeave, wordId, inward }) {
  const a = ang(sortedIndex) + offset * DEG;
  const [vx, vy] = pt(a, radius);
  const rotDeg = ((sortedIndex * 6 - 90 + offset) % 360 + 360) % 360;
  const tr = flipDeg(rotDeg);
  const flipped = tr !== rotDeg;
  const textLeft = inward ? !flipped : flipped;
  return (
    <g transform={`translate(${vx},${vy})`} style={{ cursor: "pointer" }}
       onClick={() => onClick(v, wordId)}
       onMouseEnter={() => onEnter(wordId)} onMouseLeave={onLeave}>
      <circle r={6} fill={color} opacity={isSelected ? 1 : 0.85} />
      <circle r={20} fill="transparent" />
      <text transform={`rotate(${tr})`}
            dx={textLeft ? -9 : 9} dy={3.5}
            textAnchor={textLeft ? "end" : "start"} fill={color}
            fontSize={11} fontWeight={isSelected ? 700 : 550}
            fontFamily="'DM Sans',system-ui,sans-serif"
            style={{ pointerEvents: "none" }}>
        {v.word}
      </text>
    </g>
  );
}

/* ── Main node group (memoised) ──────────────────────────────────── */
const NodeGroup = memo(function NodeGroup({
  word, sortedIndex, dim, isHovered, isConnected,
  onEnter, onLeave, onVariantClick, selectedTerm,
}) {
  const a = ang(sortedIndex);
  const [x, y] = pt(a, R_MAIN);
  const deg = sortedIndex * 6 - 90;
  const tr = flipDeg(deg);
  const flipped = tr !== deg;
  const color = dim.color;

  return (
    <g>
      {isHovered && [...word.positive, ...word.negative].map((v, vi) => {
        const isPos = vi < word.positive.length;
        const subIdx = isPos ? vi : vi - word.positive.length;
        const off = (subIdx === 0 ? -4 : 4) * DEG;
        const r = isPos ? R_POS : R_NEG;
        const [vx, vy] = pt(a + off, r);
        return (
          <line key={`cl${vi}`} x1={x} y1={y} x2={vx} y2={vy}
                stroke={isPos ? color : "#8A7A6A"} strokeWidth={0.7} opacity={0.3}
                strokeDasharray="3,3" />
        );
      })}

      <g transform={`translate(${x},${y})`}>
        <circle r={isHovered ? 10 : isConnected ? 8 : 7} fill={color}
          opacity={isHovered ? 1 : isConnected ? 0.7 : 0.4} />
        <circle r={24} fill="transparent" style={{ cursor: "pointer" }}
          onMouseEnter={() => onEnter(word.id)} onMouseLeave={onLeave} />
        <text transform={`rotate(${tr})`}
              dx={flipped ? (isHovered ? -18 : -11) : (isHovered ? 18 : 11)} dy={4.5}
              textAnchor={flipped ? "end" : "start"}
              fill={isHovered ? "#2A2A28" : isConnected ? "#555" : "#999"}
              fontSize={isHovered ? 15 : 12} fontWeight={isHovered ? 700 : 500}
              fontFamily="'DM Sans',system-ui,sans-serif"
              style={{ transition: "all .3s", pointerEvents: "none" }}>
          {word.neutral}
        </text>
      </g>

      {isHovered && word.positive.map((v, vi) => (
        <VariantNode key={`p${vi}`} v={v} sortedIndex={sortedIndex}
          offset={vi === 0 ? -4 : 4} radius={R_POS} color={color}
          wordId={word.id} isSelected={selectedTerm?.word === v.word}
          onClick={onVariantClick} onEnter={onEnter} onLeave={onLeave} />
      ))}

      {isHovered && word.negative.map((v, vi) => (
        <VariantNode key={`n${vi}`} v={v} sortedIndex={sortedIndex}
          offset={vi === 0 ? -4 : 4} radius={R_NEG} color="#8A7A6A"
          wordId={word.id} isSelected={selectedTerm?.word === v.word}
          onClick={onVariantClick} onEnter={onEnter} onLeave={onLeave} inward />
      ))}
    </g>
  );
});

/* ── Root graph component ────────────────────────────────────────── */
export default function WaWoWebGraph({ hoveredNode, setHoveredNode, selectedTerm, setSelectedTerm, focusNodeId }) {
  const leaveTimer = useRef(null);
  const svgRef = useRef(null);
  const panRef = useRef({ active: false, startX: 0, startY: 0, startVB: null });
  const pinchRef = useRef({ active: false, startDist: 0, startVB: null });

  // Zoom/pan state
  const [vb, setVb] = useState({ ...DEFAULT_VB });

  useEffect(() => {
    if (focusNodeId != null) setHoveredNode(focusNodeId);
  }, [focusNodeId, setHoveredNode]);

  const enter = useCallback((id) => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setHoveredNode(id);
  }, [setHoveredNode]);

  const leave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHoveredNode(null), 300);
  }, [setHoveredNode]);

  const clickVariant = useCallback((v, wordId) => {
    const w = DRIVER_WORDS.find(d => d.id === wordId);
    const isPos = w.positive.some(p => p.word === v.word);
    setSelectedTerm({
      term: { ...v, _type: isPos ? "positief" : "negatief" },
      parentNeutral: w.neutral, parentId: w.id,
    });
  }, [setSelectedTerm]);

  // Convert screen coordinates to SVG coordinates
  const screenToSvg = useCallback((clientX, clientY) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const fracX = (clientX - rect.left) / rect.width;
    const fracY = (clientY - rect.top) / rect.height;
    return { x: vb.x + fracX * vb.w, y: vb.y + fracY * vb.h };
  }, [vb]);

  // Mouse wheel zoom (zoom toward pointer position)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      setVb(prev => {
        const newW = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.w * zoomFactor));
        const newH = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.h * zoomFactor));
        // Zoom toward mouse position
        const rect = el.getBoundingClientRect();
        const fracX = (e.clientX - rect.left) / rect.width;
        const fracY = (e.clientY - rect.top) / rect.height;
        const svgX = prev.x + fracX * prev.w;
        const svgY = prev.y + fracY * prev.h;
        return {
          x: svgX - fracX * newW,
          y: svgY - fracY * newH,
          w: newW,
          h: newH,
        };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Pinch-to-zoom for touch devices
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const getTouchDist = (t) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.hypot(dx, dy);
    };
    const getTouchCenter = (t) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    });

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const p = pinchRef.current;
        p.active = true;
        p.startDist = getTouchDist(e.touches);
        p.startVB = { ...vb };
        p.startCenter = getTouchCenter(e.touches);
      }
    };
    const onTouchMove = (e) => {
      const p = pinchRef.current;
      if (!p.active || e.touches.length < 2 || !p.startVB) return;
      e.preventDefault();
      const dist = getTouchDist(e.touches);
      const scale = p.startDist / dist; // >1 = zoom out, <1 = zoom in
      const newW = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, p.startVB.w * scale));
      const newH = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, p.startVB.h * scale));
      // Zoom toward pinch center
      const rect = el.getBoundingClientRect();
      const center = getTouchCenter(e.touches);
      const fracX = (center.x - rect.left) / rect.width;
      const fracY = (center.y - rect.top) / rect.height;
      const svgX = p.startVB.x + fracX * p.startVB.w;
      const svgY = p.startVB.y + fracY * p.startVB.h;
      setVb({ x: svgX - fracX * newW, y: svgY - fracY * newH, w: newW, h: newH });
    };
    const onTouchEnd = () => {
      pinchRef.current.active = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [vb]);

  // Pan handlers
  const onPointerDown = useCallback((e) => {
    const p = panRef.current;
    p.active = true;
    p.startX = e.clientX;
    p.startY = e.clientY;
    p.startVB = { ...vb };
  }, [vb]);

  const onPointerMove = useCallback((e) => {
    const p = panRef.current;
    if (!p.active || !p.startVB) return;
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - p.startX) / rect.width * p.startVB.w;
    const dy = (e.clientY - p.startY) / rect.height * p.startVB.h;
    setVb({
      x: p.startVB.x - dx,
      y: p.startVB.y - dy,
      w: p.startVB.w,
      h: p.startVB.h,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    panRef.current.active = false;
  }, []);

  // Double-click to reset zoom
  const onDoubleClick = useCallback(() => {
    setVb({ ...DEFAULT_VB });
  }, []);

  const connected = new Set();
  if (hoveredNode != null) {
    EDGES.forEach(({ fid, tid }) => {
      if (fid === hoveredNode) connected.add(tid);
      if (tid === hoveredNode) connected.add(fid);
    });
  }
  const hoverColor = hoveredNode != null ? DIM_FOR[hoveredNode]?.color ?? "#C47A5A" : "#C47A5A";

  const viewBoxStr = `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;

  return (
    <svg ref={svgRef} viewBox={viewBoxStr}
      style={{ width: "100%", height: "100%", display: "block", touchAction: "none", userSelect: "none", cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      {/* Dimension arcs & labels */}
      {DIMENSIONS.map((dim, di) => {
        const si = di * 10;
        const midA = ((si + 4.5) * 6 - 90) * DEG;
        const [lx, ly] = pt(midA, 195);
        const midDeg = (si + 4.5) * 6 - 90;
        const lr = flipDeg(midDeg);
        return (
          <g key={dim.id}>
            <path d={dimArc(si, 10, R_MAIN)} fill="none"
                  stroke={dim.color} strokeWidth={2.5} opacity={0.3} strokeLinecap="round" />
            <path d={dimArc(si, 10, R_POS)} fill="none"
                  stroke={dim.color} strokeWidth={0.5} opacity={0.1} strokeDasharray="2,4" />
            <path d={dimArc(si, 10, R_NEG)} fill="none"
                  stroke={dim.color} strokeWidth={0.5} opacity={0.1} strokeDasharray="2,4" />
            <text transform={`translate(${lx},${ly}) rotate(${lr})`}
                  textAnchor="middle" dy={4}
                  fill={dim.color} fontSize={18} fontWeight={700} opacity={0.55}
                  fontFamily="'DM Serif Display',Georgia,serif"
                  letterSpacing="1.5">
              {dim.name.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* Synonym-based connection edges */}
      {EDGES.map(({ fi, ti, fid, tid }, ci) => {
        const [x1, y1] = pt(ang(fi), R_MAIN);
        const [x2, y2] = pt(ang(ti), R_MAIN);
        const hi = hoveredNode != null && (fid === hoveredNode || tid === hoveredNode);
        return (
          <path key={ci} d={bezier(x1, y1, x2, y2)} fill="none"
                stroke={hi ? hoverColor : "#CCC"}
                strokeWidth={hi ? 1.8 : 0.4}
                opacity={hi ? 0.6 : 0.15}
                style={{ transition: "all .3s" }} />
        );
      })}

      {/* Value nodes */}
      {SORTED.map((w, i) => (
        <NodeGroup key={w.id} word={w} sortedIndex={i} dim={DIM_FOR[w.id]}
          isHovered={hoveredNode === w.id} isConnected={connected.has(w.id)}
          onEnter={enter} onLeave={leave} onVariantClick={clickVariant}
          selectedTerm={selectedTerm?.term} />
      ))}

      {/* Center label */}
      <text x={CX} y={CY - 8} textAnchor="middle" fill="rgba(0,0,0,0.08)"
            fontSize={14} fontFamily="'DM Serif Display',Georgia,serif">
        WaardenWoordenWeb
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill="rgba(0,0,0,0.05)"
            fontSize={10} fontFamily="'DM Sans',system-ui,sans-serif">
        Scroll om te zoomen, sleep om te pannen
      </text>
    </svg>
  );
}
