import { MAX_PATHS, findAllPaths } from "./Allpaths";
import type { GraphExport } from "./Types";

export default function PathsTable({ data }: { data: GraphExport }) {
  const { paths, truncated, error } = findAllPaths(data);

  return (
    <div className="paths">
      <h3>Chemins possibles ({paths.length})</h3>
      {error ? (
        <p className="empty">{error}</p>
      ) : paths.length === 0 ? (
        <p className="empty">Aucun chemin entre {data.start} et {data.end}.</p>
      ) : (
        <div className="paths-scroll">
          <table>
            <thead>
              <tr>
                <th>Chemin</th>
                <th>Distance (px)</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((p, i) => (
                <tr key={i} className={i === 0 ? "best" : ""}>
                  <td>{p.path.join(" → ")}</td>
                  <td>{p.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {truncated && <p className="empty">Affichage limité à {MAX_PATHS} chemins.</p>}
    </div>
  );
}