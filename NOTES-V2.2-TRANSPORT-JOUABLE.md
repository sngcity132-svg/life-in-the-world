# LIFE IN THE WORLD — Version 2.2 : transport collectif jouable

## Ajouts
- Les destinations des arrêts Yoff, Médina et Plateau déclenchent un déplacement du personnage dans la carte.
- Une liaison retour UCAD → Médina est disponible depuis le bâtiment de l'université.
- Les tarifs sont débités par le moteur de simulation via l'action `transport`.
- Un solde insuffisant empêche le départ ; chaque trajet produit un événement dans le journal.
- Les missions actives sont annulées lors d'un déplacement en transport afin d'éviter une mission incohérente après téléportation.

## Limites connues
- Le trajet est instantané, sans animation d'embarquement ni temps de parcours.
- Le joueur n'est pas encore transporté dans le véhicule qui circule sur la carte.
- Les lignes, arrêts et tarifs sont fictifs et ne représentent pas le réseau officiel de Dakar.
- Les destinations sont des positions de gameplay dans l'unique carte Dakar existante ; aucune autre ville n'est encore jouable.
- Compilation et essai sur appareil Android non réalisés dans cet environnement.

## Vérifications
- Contrôle statique ciblé : aucune erreur TypeScript signalée dans `WorldGame.tsx` ou `engine.ts` par le compilateur global.
- Vérification complète impossible : les dépendances du projet (`next`, `react`, etc.) ne sont pas installées dans cet environnement. Le build Next.js n'a donc pas été exécuté.
