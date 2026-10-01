// -------------------------------------------------------
// 1. POSITION
// -------------------------------------------------------

// Une Position représente simplement une case du labyrinthe.
// Exemple : { ligne: 2, colonne: 4 }
export type Position = {
    ligne: number;
    colonne: number;
};


// -------------------------------------------------------
// 2. NOEUD
// -------------------------------------------------------

// Un Noeud représente une case utilisée par A*.
//
// En plus de sa position, A* mémorise :
// g = distance déjà parcourue depuis le départ
// h = estimation de la distance restante jusqu'au coffre
// f = score total : g + h
// parent = case précédente utilisée pour arriver ici
type Noeud = {
    position: Position;

    g: number;
    h: number;
    f: number;

    parent: Noeud | null;
};


// -------------------------------------------------------
// 3. DISTANCE DE MANHATTAN
// -------------------------------------------------------

// Cette fonction estime la distance entre une position
// et l'objectif.
//
// On utilise la distance de Manhattan car notre personnage
// peut uniquement se déplacer :
// - en haut
// - en bas
// - à gauche
// - à droite
//
// Il ne peut pas se déplacer en diagonale.
export function manhattan(
    actuelle: Position,
    objectif: Position
): number {

    return (
        Math.abs(actuelle.ligne - objectif.ligne) +
        Math.abs(actuelle.colonne - objectif.colonne)
    );
}


// -------------------------------------------------------
// 4. RECHERCHER LES VOISINS
// -------------------------------------------------------

// Cette fonction cherche toutes les cases accessibles
// autour d'une position.
//
// Dans notre labyrinthe :
// 0 = passage
// 1 = mur
export function getVoisins(
    position: Position,
    labyrinthe: number[][]
): Position[] {

    // Tableau qui contiendra les voisins accessibles.
    const voisins: Position[] = [];


    // Les 4 déplacements possibles.
    //
    // Exemple pour "haut" :
    // ligne - 1 et colonne inchangée.
    const directions = [
        { ligne: -1, colonne: 0 }, // haut
        { ligne: 1, colonne: 0 },  // bas
        { ligne: 0, colonne: -1 }, // gauche
        { ligne: 0, colonne: 1 },  // droite
    ];


    // On teste chacune des quatre directions.
    for (const direction of directions) {

        // On calcule les coordonnées de la case voisine.
        const nouvelleLigne =
            position.ligne + direction.ligne;

        const nouvelleColonne =
            position.colonne + direction.colonne;


        // On vérifie d'abord que la nouvelle position
        // reste à l'intérieur du labyrinthe.
        //
        // Par exemple, depuis la ligne 0,
        // on ne peut pas aller à la ligne -1.
        if (
            nouvelleLigne >= 0 &&
            nouvelleLigne < labyrinthe.length &&
            nouvelleColonne >= 0 &&
            nouvelleColonne < labyrinthe[0].length
        ) {

            // Ensuite, on regarde la valeur de la case.
            //
            // 0 = passage : on peut y aller.
            // 1 = mur : on l'ignore.
            if (
                labyrinthe[nouvelleLigne][nouvelleColonne] === 0
            ) {

                // La case est accessible :
                // on l'ajoute dans les voisins.
                voisins.push({
                    ligne: nouvelleLigne,
                    colonne: nouvelleColonne,
                });
            }
        }
    }


    // On renvoie toutes les cases accessibles trouvées.
    return voisins;
}


// -------------------------------------------------------
// 5. ALGORITHME A*
// -------------------------------------------------------

// Cette fonction reçoit :
// - la position de départ
// - la position du coffre
// - le labyrinthe
//
// Elle va chercher le chemin le plus court.
export function aStar(
    depart: Position,
    objectif: Position,
    labyrinthe: number[][]
) {


    // -----------------------------------------------------
    // CRÉATION DU PREMIER NOEUD
    // -----------------------------------------------------

    // On calcule H :
    // estimation de la distance entre le départ
    // et le coffre.
    const hDepart = manhattan(depart, objectif);


    // On transforme le départ en Noeud A*.
    const noeudDepart: Noeud = {
        position: depart,

        // On vient de commencer :
        // aucune distance n'a encore été parcourue.
        g: 0,

        // Distance estimée jusqu'au coffre.
        h: hDepart,

        // F = G + H.
        // Comme G vaut 0 au départ,
        // F est égal à H.
        f: hDepart,

        // Le départ n'a pas de case précédente.
        parent: null,
    };


    // -----------------------------------------------------
    // OPEN ET CLOSED
    // -----------------------------------------------------

    // OPEN contient les cases découvertes
    // qu'A* doit encore examiner.
    //
    // Au départ, il contient uniquement l'entrée.
    const open: Noeud[] = [noeudDepart];


    // CLOSED contient les cases
    // qu'A* a déjà examinées.
    //
    // Au départ, il est vide.
    const closed: Noeud[] = [];


    // -----------------------------------------------------
    // BOUCLE PRINCIPALE
    // -----------------------------------------------------

    // Tant qu'il reste au moins une case à explorer,
    // A* continue sa recherche.
    while (open.length > 0) {


        // ---------------------------------------------------
        // CHERCHER LE PLUS PETIT F
        // ---------------------------------------------------

        // On suppose d'abord que le premier élément
        // de OPEN est le meilleur.
        let indexMeilleur = 0;


        // Puis on compare son F avec tous les autres.
        for (let i = 1; i < open.length; i++) {

            // Si on trouve un F plus petit,
            // cette case devient la meilleure.
            if (open[i].f < open[indexMeilleur].f) {
                indexMeilleur = i;
            }
        }


        // On récupère donc le noeud
        // ayant actuellement le plus petit F.
        const actuel = open[indexMeilleur];


        // ---------------------------------------------------
        // EST-CE LE COFFRE ?
        // ---------------------------------------------------

        // On compare les coordonnées de la case actuelle
        // avec celles de l'objectif.
        if (
            actuel.position.ligne === objectif.ligne &&
            actuel.position.colonne === objectif.colonne
        ) {

            // Si elles sont identiques :
            // A* a atteint le coffre !

            const chemin: Position[] = [];

            // On commence par le coffre.
            let noeud: Noeud | null = actuel;


            // -------------------------------------------------
            // RECONSTRUIRE LE CHEMIN
            // -------------------------------------------------

            // Chaque noeud connaît son parent.
            //
            // On va donc remonter :
            //
            // coffre → parent → parent → ... → départ
            while (noeud !== null) {

                chemin.push(noeud.position);

                // On passe à la case précédente.
                noeud = noeud.parent;
            }


            // Pour l'instant, le chemin est à l'envers :
            //
            // coffre → ... → départ
            //
            // On le retourne pour obtenir :
            //
            // départ → ... → coffre
            chemin.reverse();


            // On renvoie le chemin trouvé.
            return chemin;
        }


        // ---------------------------------------------------
        // PASSAGE DE OPEN VERS CLOSED
        // ---------------------------------------------------

        // La case actuelle est retirée de OPEN.
        open.splice(indexMeilleur, 1);


        // Puis elle est ajoutée à CLOSED
        // car elle vient d'être examinée.
        closed.push(actuel);


        // ---------------------------------------------------
        // RECHERCHER LES VOISINS
        // ---------------------------------------------------

        // On récupère les passages accessibles
        // en haut, bas, gauche et droite.
        const voisins = getVoisins(
            actuel.position,
            labyrinthe
        );


        // ---------------------------------------------------
        // ANALYSER CHAQUE VOISIN
        // ---------------------------------------------------

        for (const voisin of voisins) {


            // -------------------------------------------------
            // EST-IL DÉJÀ DANS CLOSED ?
            // -------------------------------------------------

            // On vérifie si cette position
            // a déjà été complètement explorée.
            const dejaExplore = closed.some(
                (noeud) =>
                    noeud.position.ligne === voisin.ligne &&
                    noeud.position.colonne === voisin.colonne
            );


            // Si oui, inutile de revenir dessus.
            if (dejaExplore) {
                continue;
            }


            // -------------------------------------------------
            // CALCUL DE G
            // -------------------------------------------------

            // Pour atteindre le voisin,
            // on fait un déplacement supplémentaire.
            //
            // Exemple :
            // actuel.g = 4
            // voisin.g = 5
            const g = actuel.g + 1;


            // -------------------------------------------------
            // EST-IL DÉJÀ DANS OPEN ?
            // -------------------------------------------------

            const dejaDansOpen = open.find(
                (noeud) =>
                    noeud.position.ligne === voisin.ligne &&
                    noeud.position.colonne === voisin.colonne
            );


            // Si A* connaissait déjà cette case...
            if (dejaDansOpen) {

                // ...on regarde si le nouveau chemin
                // permet de l'atteindre avec un G plus petit.
                if (g < dejaDansOpen.g) {

                    // Si oui, on remplace l'ancien chemin
                    // par le meilleur.

                    dejaDansOpen.g = g;

                    dejaDansOpen.h =
                        manhattan(voisin, objectif);

                    dejaDansOpen.f =
                        dejaDansOpen.g + dejaDansOpen.h;

                    // Le parent change également,
                    // car on vient de trouver une meilleure façon
                    // d'arriver sur cette case.
                    dejaDansOpen.parent = actuel;
                }


                // Pas besoin de créer une deuxième fois la case.
                continue;
            }


            // -------------------------------------------------
            // NOUVELLE CASE
            // -------------------------------------------------

            // H = estimation entre cette case et le coffre.
            const h = manhattan(voisin, objectif);


            // F = coût parcouru + estimation restante.
            const f = g + h;


            // On transforme le voisin en Noeud A*.
            const nouveauNoeud: Noeud = {
                position: voisin,
                g: g,
                h: h,
                f: f,

                // On mémorise la case depuis laquelle
                // nous sommes arrivés.
                parent: actuel,
            };


            // La nouvelle case est ajoutée à OPEN.
            //
            // Elle pourra être examinée lors
            // d'un prochain tour de boucle.
            open.push(nouveauNoeud);
        }
    }


    // -----------------------------------------------------
    // AUCUN CHEMIN
    // -----------------------------------------------------

    // Si OPEN devient vide sans atteindre le coffre,
    // cela signifie qu'aucun chemin n'existe.
    return [];
}


// Le labyrinthe contient des 0 et des 1 : 0 = passage, 1 = mur.
// getVoisins() regarde haut, bas, gauche, droite et ne garde que les 0.
// A* commence au départ avec G = 0.
// Pour chaque case, il calcule F = G + H, où G est la distance déjà parcourue et H l'estimation de Manhattan jusqu'au coffre.
// Dans OPEN, il choisit la case avec le plus petit F. CLOSED garde les cases déjà examinées.
// Chaque case mémorise son parent, c'est-à-dire la case depuis laquelle A* est arrivé.
// Quand A* atteint le coffre, il remonte les parent jusqu'au départ puis fait reverse() pour obtenir départ → coffre.