# LIFE IN THE WORLD v1.6 — Parentalité et adoption

## Nouveautés
- Ajout d'un système de foyer pouvant accueillir jusqu'à trois enfants.
- Adoption jouable après le mariage, avec un coût simulé de 50 000 FCFA et une action consommant un créneau et de l'énergie.
- Chaque enfant possède un prénom, un genre, un âge simulé et un indicateur de bien-être.
- Les enfants grandissent au fil des journées de jeu et peuvent avoir des événements narratifs.
- Action « Passer du temps avec l'enfant » : coût simulé de 1 000 FCFA, consommation d'énergie et progression du bien-être.
- Les données des enfants sont conservées dans les sauvegardes locales. Pour les parties connectées, les métadonnées familiales sont encapsulées dans la colonne `achievements` existante afin d'éviter une migration SQL.

## Compatibilité
- Les anciennes parties sans champ `children` sont initialisées avec une liste vide dans le moteur.
- Les métadonnées internes sont retirées de la liste des succès affichés.
- Aucune grossesse biologique n'est simulée : cette version propose uniquement un parcours d'adoption simplifié.

## Vérifications
- Contrôle statique des modifications et intégrité ZIP effectués.
- Dépendances non installées dans l'environnement : compilation Next.js, lint et tests Android non exécutés.
