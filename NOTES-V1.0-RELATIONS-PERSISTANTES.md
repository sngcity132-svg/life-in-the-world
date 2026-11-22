# LIFE IN THE WORLD — v1.0 : relations persistantes

## Changement
- Les niveaux d’amitié avec les habitants sont désormais enregistrés dans `localStorage`, séparément de la sauvegarde principale.
- Au chargement d’une partie, les niveaux sont restaurés pour chaque PNJ.
- Les valeurs sont validées et bornées entre 0 et 5 ; un JSON invalide est ignoré sans bloquer le jeu.
- La suppression d’une partie supprime aussi ses relations sociales locales.
- Le libellé de dialogue précise que la progression est enregistrée sur l’appareil.

## Limites
- Sauvegarde locale au navigateur et à l’appareil : aucune synchronisation cloud.
- Les relations familiales, couples et enfants ne sont pas encore simulés.
- La compilation complète n’a pas été exécutée dans cet environnement : les dépendances ne sont pas installées.
