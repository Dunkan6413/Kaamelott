import type { Mode, Role } from "./components/Types";

export const DEFAULT_SRC = "/map.png"; // servi depuis public/

export const MODES: Record<Mode, { icon: string; title: string }> = {
  points: { icon: "📍", title: "Placer les points d'intérêt" },
  links: { icon: "🔗", title: "Définir les liens" },
};

export const ROLES: Record<Role, string> = { start: "Départ", end: "Arrivée", poi: "Intermédiaire" };
export const ROLE_COLORS: Record<Role, string> = { start: "#1f9d3a", end: "#d9381e", poi: "#c2185b" };