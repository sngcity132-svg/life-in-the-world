# LIFE IN THE WORLD — v0.9 : premières relations sociales

## Ajouts
- Les habitants internationaux disposent d'un dialogue personnalisé qui reflète leur métier et leur parcours.
- Le joueur peut faire connaissance puis renforcer progressivement son amitié avec ces habitants.
- Chaque lien comporte cinq niveaux, de la première rencontre à l'amitié proche.
- Le niveau de relation est conservé dans la simulation courante tant que la scène de jeu reste active.

## Limites connues
- Les liens sociaux sont actuellement en mémoire vive de la scène : ils ne sont pas encore persistés dans la sauvegarde du joueur et peuvent être réinitialisés lors du rechargement du monde.
- Les interactions restent des choix de dialogue ; il n'existe pas encore de système complet de familles, de romance entre PNJ, de conflits ou de calendrier social autonome.
- Le build complet doit être validé dans un environnement avec les dépendances installées.
