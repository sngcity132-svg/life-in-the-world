# LIFE IN THE WORLD — Version 2.3 : première extension jouable à Kaolack

## Ajouts
- Extension du monde 2D de 3000 à 5200 unités de largeur.
- Trois quartiers jouables inspirés de Kaolack : Médina Baye, Centre-ville et Kasnack.
- Nouveaux bâtiments de gameplay : Grande Mosquée de Médina Baye, école coranique, marché central, hôpital régional, maison familiale, atelier et gare routière.
- Nouveaux habitants positionnés dans la zone de Kaolack, dont des personnages avec routines simples.
- Circulation de taxis et voitures dans les nouveaux quartiers.
- Liaison interurbaine depuis le Plateau ou la gare de Dakar vers Kaolack, puis retour vers Dakar.
- Prix du voyage fixé à 3 500 FCFA dans le jeu ; il s'agit d'une valeur fictive de gameplay, pas d'un tarif réel.
- La ville courante est conservée dans les métadonnées de sauvegarde existantes (achievements), sans ajouter de colonne SQL. Les anciennes sauvegardes sont interprétées comme Dakar.
- La mini-carte et la grande carte incluent l'extension.

## Limites
- La carte est une représentation de jeu inspirée de Kaolack, pas une carte géographique exacte ni un relevé cadastral.
- Les quartiers et lieux sont des repères de gameplay ; certains détails, positions et services sont simplifiés.
- Les déplacements interurbains sont instantanés après validation du billet ; il n'y a pas encore de trajet animé, d'horaires ni de simulation de route nationale.
- Les routines des habitants restent scriptées et simples.
- La compilation Next.js et le test sur appareil Android doivent encore être effectués.
