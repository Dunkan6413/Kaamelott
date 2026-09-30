export type Mode = "points" | "links";
export type Role = "start" | "end" | "poi";

export interface Size {
  w: number;
  h: number;
}

export interface Point {
  id: number;
  label: string;
  /** pixels de l'image d'origine */
  x: number;
  y: number;
  role: Role;
}

/** Lien non orienté entre deux points (ids) */
export interface Link {
  a: number;
  b: number;
}

export interface GraphExport {
  imageSize: Size;
  start: string | null;
  end: string | null;
  points: Omit<Point, "id">[];
  links: { from: string; to: string; distance: number }[];
}

export interface PathEntry {
  /** labels des points, du départ à l'arrivée */
  path: string[];
  distance: number;
}

export interface AllPathsResult {
  paths: PathEntry[];
  /** true si la recherche a été arrêtée à MAX_PATHS */
  truncated: boolean;
  /** message si le calcul est impossible (pas de départ, d'arrivée…) */
  error: string | null;
}