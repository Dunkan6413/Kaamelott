import { useMemo, useRef, useState } from "react";
import type { GraphExport, Link, Point, Role, Size } from "./Types";
import { distance, labelFor } from "../Geometry";

/**
 * État du graphe : points et liens (ids de points).
 * (x, y) sont en pixels de l'image d'origine, donc indépendants de la taille d'affichage.
 */
export function useGraph() {
  const [points, setPoints] = useState<Point[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const nextId = useRef(0);

  const byId = useMemo(
    () => Object.fromEntries(points.map((p) => [p.id, p])) as Record<number, Point>,
    [points]
  );

  const addPoint = (x: number, y: number, role: Role) => {
    const id = nextId.current++;
    setPoints((prev) => {
      // un seul départ et une seule arrivée : l'ancien redevient intermédiaire
      const base = role === "poi" ? prev : prev.map((p) => (p.role === role ? { ...p, role: "poi" as const } : p));
      return [...base, { id, label: labelFor(id), x, y, role }];
    });
  };

  const movePoint = (id: number, x: number, y: number) =>
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));

  const removePoint = (id: number) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    setLinks((prev) => prev.filter((l) => l.a !== id && l.b !== id));
  };

  const addLink = (a: number, b: number) =>
    setLinks((prev) =>
      a === b || prev.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a))
        ? prev
        : [...prev, { a, b }]
    );

  const removeLink = (index: number) => setLinks((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    setPoints([]);
    setLinks([]);
    nextId.current = 0;
  };

  const linkDistance = (l: Link): number => distance(byId[l.a], byId[l.b]);

  const toJSON = (imageSize: Size): GraphExport => ({
    imageSize,
    start: points.find((p) => p.role === "start")?.label ?? null,
    end: points.find((p) => p.role === "end")?.label ?? null,
    points: points.map(({ label, x, y, role }) => ({ label, x, y, role })),
    links: links.map((l) => ({
      from: byId[l.a].label,
      to: byId[l.b].label,
      distance: +linkDistance(l).toFixed(1),
    })),
  });

  return { points, links, byId, addPoint, movePoint, removePoint, addLink, removeLink, reset, linkDistance, toJSON };
}

export type Graph = ReturnType<typeof useGraph>;