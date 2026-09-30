import type { AllPathsResult, GraphExport, PathEntry } from "./Types";

export const MAX_PATHS = 1000; // garde-fou : le nombre de chemins peut exploser

/** Liste tous les chemins simples (sans repasser deux fois par un point) du départ à l'arrivée. */
export function findAllPaths(graph: GraphExport): AllPathsResult {
  const { start, end, links } = graph;
  if (!start || !end) {
    return { paths: [], truncated: false, error: "Placez un point de départ et un point d'arrivée." };
  }

  // Liste d'adjacence (liens non orientés)
  const adj = new Map<string, { to: string; w: number }[]>();
  const connect = (a: string, b: string, w: number) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push({ to: b, w });
  };
  for (const { from, to, distance } of links) {
    connect(from, to, distance);
    connect(to, from, distance);
  }

  const paths: PathEntry[] = [];
  let truncated = false;
  const visited = new Set<string>([start]);
  const current: string[] = [start];

  const dfs = (node: string, total: number) => {
    if (truncated) return;
    if (node === end) {
      if (paths.length >= MAX_PATHS) {
        truncated = true;
        return;
      }
      paths.push({ path: [...current], distance: +total.toFixed(1) });
      return;
    }
    for (const { to, w } of adj.get(node) ?? []) {
      if (visited.has(to)) continue;
      visited.add(to);
      current.push(to);
      dfs(to, total + w);
      current.pop();
      visited.delete(to);
    }
  };

  dfs(start, 0);
  paths.sort((a, b) => a.distance - b.distance);
  return { paths, truncated, error: null };
}