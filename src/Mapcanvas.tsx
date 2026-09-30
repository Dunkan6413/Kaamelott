import { useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent, SyntheticEvent } from "react";
import { ROLE_COLORS } from "./Constants";
import type { Graph } from "./components/Usegraph";
import type { Mode, Role, Size } from "./components/Types";

interface Props {
  src: string;
  size: Size;
  onSizeChange: (size: Size) => void;
  mode: Mode;
  role: Role;
  graph: Graph;
}

export default function MapCanvas({ src, size, onSizeChange, mode, role, graph }: Props) {
  const { points, links, byId, addPoint, movePoint, removePoint, addLink, linkDistance } = graph;
  const [pending, setPending] = useState<number | null>(null); // premier point choisi en mode liens
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<number | null>(null);
  const u = size.w / 1500; // unité pour garder des marqueurs lisibles quelle que soit l'image

  useEffect(() => {
    setPending(null);
  }, [mode]);

  // Position du curseur -> pixels de l'image d'origine
  const toImageCoords = (e: { clientX: number; clientY: number }) => {
    const r = svgRef.current!.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - r.left) * size.w) / r.width),
      y: Math.round(((e.clientY - r.top) * size.h) / r.height),
    };
  };

  const onBackgroundClick = (e: MouseEvent<SVGSVGElement>) => {
    if (mode !== "points") return;
    const { x, y } = toImageCoords(e);
    addPoint(x, y, role);
  };

  const onPointDown = (e: PointerEvent<SVGGElement>, id: number) => {
    if (mode !== "points") return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = id;
  };

  const onPointMove = (e: PointerEvent<SVGGElement>) => {
    if (dragging.current === null) return;
    const { x, y } = toImageCoords(e);
    movePoint(dragging.current, x, y);
  };

  const onPointClick = (e: MouseEvent<SVGGElement>, id: number) => {
    e.stopPropagation();
    if (mode !== "links") return;
    if (pending === null) {
      setPending(id);
      return;
    }
    addLink(pending, id);
    setPending(null);
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) =>
    onSizeChange({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });

  const hint =
    mode === "points"
      ? "Cliquez sur la carte pour placer un point. Glisse un point pour le déplacer, double-cliquez pour le supprimer."
      : pending !== null
      ? `Point ${byId[pending]?.label} sélectionné : cliquez sur le point à relier.`
      : "Cliquez sur deux points successifs pour créer un lien.";

  return (
    <div className="stage">
      <div className="hint">{hint}</div>
      <div className="canvas">
        <img src={src} alt="Carte" onLoad={onImageLoad} />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size.w} ${size.h}`}
          onClick={onBackgroundClick}
          style={{ cursor: mode === "points" ? "crosshair" : "default" }}
        >
          {links.map((l, i) => {
            const A = byId[l.a];
            const B = byId[l.b];
            return (
              <g key={i}>
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#111" strokeWidth={5 * u} strokeLinecap="round" strokeDasharray={`${12 * u} ${8 * u}`} />
                <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 8 * u} fontSize={17 * u} textAnchor="middle" className="dist-label">
                  {Math.round(linkDistance(l))}
                </text>
              </g>
            );
          })}

          {points.map((p) => (
            <g
              key={p.id}
              onPointerDown={(e) => onPointDown(e, p.id)}
              onPointerMove={onPointMove}
              onPointerUp={() => (dragging.current = null)}
              onClick={(e) => onPointClick(e, p.id)}
              onDoubleClick={() => mode === "points" && removePoint(p.id)}
              style={{ cursor: mode === "points" ? "grab" : "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={(pending === p.id ? 24 : 18) * u}
                fill={ROLE_COLORS[p.role]}
                stroke={pending === p.id ? "#ffd400" : "#fff"}
                strokeWidth={5 * u}
              />
              <text x={p.x} y={p.y + 7 * u} fontSize={20 * u} fontWeight="700" textAnchor="middle" fill="#fff" pointerEvents="none">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}