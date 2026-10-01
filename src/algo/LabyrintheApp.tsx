// -------------------------------------------------------
// 1. IMPORTS
// -------------------------------------------------------

// On importe notre grille contenant :
// 0 = passage
// 1 = mur
import { labyrinthe } from "./labyrinthe";

// On importe notre algorithme A*
// qui va calculer le chemin le plus court.
import { aStar } from "./aStar";

// On importe le fichier CSS qui contient
// le style du labyrinthe.
import "../LabyrintheApp.css";


// -------------------------------------------------------
// 2. POSITION DE DÉPART
// -------------------------------------------------------

// On définit la case depuis laquelle
// l'algorithme doit commencer.
//
// Ici :
// ligne 0
// colonne 5
const depart = {
  ligne: 0,
  colonne: 5,
};


// -------------------------------------------------------
// 3. POSITION DU COFFRE
// -------------------------------------------------------

// On définit la case que l'algorithme
// doit atteindre.
//
// Ici :
// ligne 9
// colonne 0
const coffre = {
  ligne: 9,
  colonne: 0,
};


// -------------------------------------------------------
// 4. LANCEMENT DE A*
// -------------------------------------------------------

// On donne à A* :
// - le départ
// - le coffre
// - le labyrinthe
//
// A* nous retourne le chemin le plus court.
const chemin = aStar(depart, coffre, labyrinthe);


// -------------------------------------------------------
// 5. COMPOSANT REACT
// -------------------------------------------------------

function LabyrintheApp() {
  return (
    <main>

      {/* Titre affiché au-dessus du labyrinthe */}
      <h2>
        Trouver le chemin le plus court entre le point de départ
        et le coffre, en évitant les obstacles
      </h2>


      {/* ------------------------------------------------
          6. CRÉATION DE LA GRILLE
         ------------------------------------------------ */}

      <div
        style={{
          // On utilise CSS Grid pour créer le labyrinthe.
          display: "grid",

          // On crée autant de colonnes que dans notre tableau.
          // Chaque case mesure 50px.
          gridTemplateColumns:
            `repeat(${labyrinthe[0].length}, 50px)`,

          // La grille prend uniquement la place nécessaire.
          width: "fit-content",

          // On centre le labyrinthe.
          margin: "0 auto",
        }}
      >


        {/* ------------------------------------------------
            7. PARCOURIR LE LABYRINTHE
           ------------------------------------------------ */}

        {/*
          Premier map :
          on parcourt chaque ligne du labyrinthe.
        */}

        {labyrinthe.map((ligne, indexLigne) =>

          /*
            Deuxième map :
            on parcourt chaque case de la ligne.
          */

          ligne.map((caseLabyrinthe, indexColonne) => {


            // ------------------------------------------------
            // 8. VÉRIFIER SI LA CASE APPARTIENT AU CHEMIN
            // ------------------------------------------------

            // .some() vérifie si les coordonnées
            // de cette case sont présentes dans
            // le chemin calculé par A*.
            const estDansChemin = chemin.some(
              (position) =>
                position.ligne === indexLigne &&
                position.colonne === indexColonne
            );


            // ------------------------------------------------
            // 9. AFFICHAGE DE LA CASE
            // ------------------------------------------------

            return (
              <div

                // Chaque case doit avoir une clé unique
                // pour React.
                //
                // Exemple :
                // 0-0
                // 0-1
                // 1-0
                // etc.
                key={`${indexLigne}-${indexColonne}`}


                // On donne une classe différente
                // selon le type de case.
                className={
                  caseLabyrinthe === 1
                    ? "case mur"
                    : estDansChemin
                      ? "case chemin"
                      : "case sol"
                }
              >


                {/* ----------------------------------------
                    10. AFFICHAGE DU DÉPART
                   ---------------------------------------- */}

                {/* Si cette case correspond au départ,
                    on affiche le rond vert. */}

                {indexLigne === depart.ligne &&
                  indexColonne === depart.colonne &&
                  "🟢"}


                {/* ----------------------------------------
                    11. AFFICHAGE DU COFFRE
                   ---------------------------------------- */}

                {/* Si cette case correspond au coffre,
                    on affiche le coffre. */}

                {indexLigne === coffre.ligne &&
                  indexColonne === coffre.colonne &&
                  "🧰"}

              </div>
            );
          })
        )}

      </div>
    </main>
  );
}


// -------------------------------------------------------
// 12. EXPORT
// -------------------------------------------------------

// On exporte App pour pouvoir
// l'afficher dans notre application React.
export default LabyrintheApp;