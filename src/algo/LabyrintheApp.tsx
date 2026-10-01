import { useEffect, useMemo, useState } from "react";
import { labyrinthe } from "./labyrinthe";
import { aStar, type Position } from "./aStar";
import "../LabyrintheApp.css";

// -------------------------------------------------------
// 1. RÉGLAGES
// -------------------------------------------------------

// Délai (en ms) entre deux cases animées
const VITESSE_MS = 30;

// Transforme une position en clé unique, ex : "2-4"
const cle = (p: Position) => `${p.ligne}-${p.colonne}`;


// -------------------------------------------------------
// 2. TIRAGE ALÉATOIRE DU DÉPART ET DU COFFRE
// -------------------------------------------------------

// Renvoie un élément au hasard dans un tableau
const auHasard = <T,>(tab: T[]): T =>
  tab[Math.floor(Math.random() * tab.length)];

function tirerPositions(): { depart: Position; coffre: Position } {
  // 1. On liste toutes les cases libres (0 = passage)
  const libres: Position[] = [];
  labyrinthe.forEach((ligne, l) =>
    ligne.forEach((valeur, c) => {
      if (valeur === 0) libres.push({ ligne: l, colonne: c });
    })
  );

  // 2. Départ au hasard parmi les cases libres
  const depart = auHasard(libres);

  // 3. Parcours en largeur (BFS) pour trouver toutes les cases
  //    atteignables depuis le départ : le coffre sera forcément
  //    accessible, même si la grille a des zones isolées.
  const vues = new Set<string>([cle(depart)]);
  const file: Position[] = [depart];

  for (let i = 0; i < file.length; i++) {
    const p = file[i];
    for (const [dl, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { ligne: p.ligne + dl, colonne: p.colonne + dc };
      if (labyrinthe[n.ligne]?.[n.colonne] === 0 && !vues.has(cle(n))) {
        vues.add(cle(n));
        file.push(n);
      }
    }
  }

  // 4. Coffre au hasard parmi les cases atteignables (sauf le départ)
  const coffre = auHasard(file.slice(1));

  return { depart, coffre };
}


// -------------------------------------------------------
// 3. COMPOSANT
// -------------------------------------------------------

function LabyrintheApp() {
  // Positions initiales : celles de ton fichier d'origine
  const [positions, setPositions] = useState<{
    depart: Position;
    coffre: Position;
  }>({
    depart: { ligne: 0, colonne: 5 },
    coffre: { ligne: 9, colonne: 0 },
  });
  const { depart, coffre } = positions;

  // A* ne se recalcule que quand les positions changent
  const resultat = useMemo(
    () => aStar(depart, coffre, labyrinthe),
    [depart, coffre]
  );

  // Nombre de cases déjà "révélées" par l'animation
  const [nbVisites, setNbVisites] = useState(0);
  const [nbChemin, setNbChemin] = useState(0);

  // Rang de chaque case dans l'ordre de visite / dans le chemin
  const indexVisite = useMemo(
    () => new Map(resultat.ordreVisite.map((p, i) => [cle(p), i])),
    [resultat]
  );
  const indexChemin = useMemo(
    () => new Map(resultat.chemin.map((p, i) => [cle(p), i])),
    [resultat]
  );

  // Animation : d'abord l'exploration, ensuite le chemin final
  useEffect(() => {
    setNbVisites(0);
    setNbChemin(0);

    const totalVisites = resultat.ordreVisite.length;
    const totalChemin = resultat.chemin.length;
    let etape = 0;

    const timer = setInterval(() => {
      etape++;
      if (etape <= totalVisites) {
        setNbVisites(etape);
      } else if (etape - totalVisites <= totalChemin) {
        setNbChemin(etape - totalVisites);
      } else {
        clearInterval(timer);
      }
    }, VITESSE_MS);

    // Si on reclique pendant l'animation, on l'arrête proprement
    return () => clearInterval(timer);
  }, [resultat]);

  // Choisit la classe CSS d'une case selon l'avancement de l'animation
  const classeCase = (valeur: number, l: number, c: number) => {
    if (valeur === 1) return "case mur";

    const k = `${l}-${c}`;

    const iChemin = indexChemin.get(k);
    if (iChemin !== undefined && iChemin < nbChemin) return "case chemin";

    const iVisite = indexVisite.get(k);
    if (iVisite !== undefined && iVisite < nbVisites) return "case visite";

    return "case sol";
  };

  return (
    <main>
      <h2>
        Trouver le chemin le plus court entre le point de départ
        et le coffre, en évitant les obstacles
      </h2>

      <button onClick={() => setPositions(tirerPositions())}>
        Changer départ et arrivée
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${labyrinthe[0].length}, 50px)`,
          width: "fit-content",
          margin: "0 auto",
        }}
      >
        {labyrinthe.map((ligne, l) =>
          ligne.map((valeur, c) => (
            <div key={`${l}-${c}`} className={classeCase(valeur, l, c)}>
              {l === depart.ligne && c === depart.colonne && "🟢"}
              {l === coffre.ligne && c === coffre.colonne && "🧰"}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default LabyrintheApp;