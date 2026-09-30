import type { ChangeEvent } from "react";
import { ROLES, ROLE_COLORS } from "../Constants";
import type { Graph } from "./Usegraph";
import type { Mode, Role, Size } from "./Types";
import PathsTable from "./Pathstable";

interface Props {
  mode: Mode;
  role: Role;
  onRoleChange: (role: Role) => void;
  graph: Graph;
  size: Size;
  onImageChange: (url: string) => void;
}

export default function SidePanel({ mode, role, onRoleChange, graph, size, onImageChange }: Props) {
  const { points, links, byId, removeLink, linkDistance, reset, toJSON } = graph;

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageChange(URL.createObjectURL(file));
  };

  return (
    <aside className="side">
      {mode === "points" ? (
        <>
          <h3>Type du prochain point</h3>
          {(Object.keys(ROLES) as Role[]).map((key) => (
            <label key={key} className="radio">
              <input type="radio" checked={role === key} onChange={() => onRoleChange(key)} />
              <span className="dot" style={{ background: ROLE_COLORS[key] }} />
              {ROLES[key]}
            </label>
          ))}
        </>
      ) : (
        <>
          <h3>Liens ({links.length})</h3>
          <ul>
            {links.map((l, i) => (
              <li key={i}>
                <b>{byId[l.a].label} - {byId[l.b].label}</b>
                <span>{linkDistance(l).toFixed(1)} px</span>
                <button onClick={() => removeLink(i)} title="Supprimer le lien">✕</button>
              </li>
            ))}
            {links.length === 0 && <li className="empty">Aucun lien pour l'instant.</li>}
          </ul>
        </>
      )}

      <h3>Points ({points.length})</h3>
      <ul>
        {points.map((p) => (
          <li key={p.id}>
            <b style={{ color: ROLE_COLORS[p.role] }}>{p.label}</b>
            <span>x {p.x}, y {p.y}</span>
          </li>
        ))}
        {points.length === 0 && <li className="empty">Aucun point pour l'instant.</li>}
      </ul>

      <div className="actions">
        <label className="file">
          Changer l'image
          <input type="file" accept="image/*" hidden onChange={onFile} />
        </label>
        <button onClick={reset}>Tout effacer</button>
      </div>

      <PathsTable data={toJSON(size)} />
    </aside>
  );
}