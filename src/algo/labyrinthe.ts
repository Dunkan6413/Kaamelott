// -------------------------------------------------------
// LABYRINTHE
// -------------------------------------------------------

// Le labyrinthe est représenté par un tableau à 2 dimensions.
//
// Chaque petit tableau représente UNE LIGNE du labyrinthe.
//
// Chaque nombre représente UNE CASE :
//
// 0 = passage → A* peut passer
// 1 = mur     → A* ne peut pas passer

// Le labyrinthe contient ici 10 lignes et 10 colonnes.
// Il s'agit donc d'une grille de 10 x 10 cases.

export const labyrinthe = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 1, 0, 1, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
];