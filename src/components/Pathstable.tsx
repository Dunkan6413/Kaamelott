// Pathstable.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MAX_PATHS, findAllPaths } from "./Allpaths";
import type { GraphExport } from "./Types";

import knightGif from "./hooded_knight_run.gif";

type Pt = { x: number; y: number };

const HERO_W = 48*2;  // largeur d'affichage du sprite en px (image coordinates)
const HERO_H = 48*2;  // hauteur d'affichage
const SPEED = 300;  // pixels / seconde

function findGraphSvg(): SVGSVGElement | null {
  if (typeof document === "undefined") return null;
  const all = Array.from(document.querySelectorAll("svg"));
  const notInSide = all.find((s) => !s.closest(".side, aside"));
  return notInSide ?? all[all.length - 1] ?? null;
}

export default function PathsTable({ data }: { data: GraphExport }) {
  const { paths, truncated, error } = findAllPaths(data);

  const [hero, setHero] = useState<Pt | null>(null);
  const [facing, setFacing] = useState<1 | -1>(1); // 1 = droite, -1 = gauche
  const [activePath, setActivePath] = useState<string[] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  const getPoint = useCallback(
    (label: string): Pt | null => {
      const p = data.points.find((pt) => pt.label === label);
      return p ? { x: p.x, y: p.y } : null;
    },
    [data.points]
  );

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsPlaying(false);
    setHero(null);
    setActivePath(null);
  }, []);

  const play = useCallback(
    (path: string[]) => {
      stop();

      const pts = path.map(getPoint).filter((p): p is Pt => p !== null);
      if (pts.length < 2) {
        console.warn("[hero] getPoint returned null for path:", path);
        return;
      }

      const segs: { a: Pt; b: Pt; start: number; len: number }[] = [];
      let total = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        segs.push({ a, b, start: total, len });
        total += len;
      }

      // orientation initiale selon le premier segment
      setFacing(segs[0].b.x < segs[0].a.x ? -1 : 1);

      setActivePath(path);
      setHero(pts[0]);
      if (total === 0) return;
      setIsPlaying(true);

      const duration = (total / SPEED) * 1000;
      const t0 = performance.now();

      const frame = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const d = t * total;

        let s = segs[segs.length - 1];
        for (const seg of segs) {
          if (d <= seg.start + seg.len) {
            s = seg;
            break;
          }
        }
        const k = s.len === 0 ? 0 : (d - s.start) / s.len;

        // flip horizontal selon la direction du segment courant
        const dir = s.b.x < s.a.x ? -1 : 1;
        setFacing((prev) => (prev === dir ? prev : dir));

        setHero({
          x: s.a.x + (s.b.x - s.a.x) * k,
          y: s.a.y + (s.b.y - s.a.y) * k,
        });

        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          rafRef.current = null;
          setIsPlaying(false);
        }
      };

      rafRef.current = requestAnimationFrame(frame);
    },
    [getPoint, stop]
  );

  useEffect(() => () => stop(), [stop]);

  const samePath = (a: string[] | null, b: string[]) =>
    a !== null && a.length === b.length && a.every((v, i) => v === b[i]);

  // ---- Sprite du chevalier, rendu dans le SVG du graphe via portal ----
  const svg = findGraphSvg();
  const heroNode =
    svg && hero
      ? createPortal(
          <g
            style={{ pointerEvents: "none" }}
            pointerEvents="none"
            transform={`translate(${hero.x}, ${hero.y}) scale(${facing}, 1)`}
          >
            {/* ombre au sol */}
            <ellipse
              cx={0}
              cy={HERO_H / 2 - 4}
              rx={HERO_W / 3}
              ry={5}
              fill="rgba(0,0,0,0.25)"
            />
            {/* le gif */}
            <image
              href={knightGif}
              x={-HERO_W / 2}
              y={-HERO_H / 2}
              width={HERO_W}
              height={HERO_H}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>,
          svg
        )
      : null;

  return (
    <div className="paths">
      <h3>Chemins possibles ({paths.length})</h3>
      {error ? (
        <p className="empty">{error}</p>
      ) : paths.length === 0 ? (
        <p className="empty">
          Aucun chemin entre {data.start} et {data.end}.
        </p>
      ) : (
        <div className="paths-scroll">
          <table>
            <thead>
              <tr>
                <th>Chemin</th>
                <th>Distance (px)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paths.map((p, i) => {
                const active = samePath(activePath, p.path);
                return (
                  <tr
                    key={i}
                    className={`${i === 0 ? "best" : ""} ${active ? "active" : ""}`}
                  >
                    <td>{p.path.join(" → ")}</td>
                    <td>{p.distance}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => (active && isPlaying ? stop() : play(p.path))}
                      >
                        {active && isPlaying ? "■ Stop" : "▶ Animer"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {truncated && <p className="empty">Affichage limité à {MAX_PATHS} chemins.</p>}

      {heroNode}
    </div>
  );
}