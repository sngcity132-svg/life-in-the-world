# LIFE IN THE WORLD — v0.8 : routines selon l'heure

## Modifications
- Ajout d'itinéraires distincts pour le matin, l'après-midi, la soirée et la nuit pour six habitants internationaux.
- Les itinéraires existants restent utilisés comme solution de repli pour les habitants sans planning.
- Les pauses et déplacements existants sont conservés ; les habitants ne changent de destination qu'à la fin de leur déplacement.
- Les horaires utilisent les quatre créneaux déjà pilotés par l'horloge du jeu (`player.slot`).

## Limites connues
- Il s'agit de routines simulées par points de passage, pas encore d'une IA complète avec besoins, navigation d'évitement ou horaires persistants.
- Les points de passage sont des coordonnées du monde de jeu et ne représentent pas une cartographie géographique certifiée.
- La compilation TypeScript et le build Next.js doivent encore être exécutés dans un environnement disposant des dépendances.
