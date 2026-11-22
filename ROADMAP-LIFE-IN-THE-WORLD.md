# LIFE IN THE WORLD — feuille de route de production

## Principes non négociables
1. Une version jouable et testée à chaque étape.
2. Priorité à Android et aux performances mobiles, sans fermer la voie au PC.
3. Monde cohérent avant extension de la carte : déplacements, collisions, interactions, sauvegarde et économie doivent fonctionner.
4. Les lieux présentés comme réels doivent être géographiquement vérifiés ; les décors fictifs doivent être signalés comme inspirés du réel.
5. Mode solo hors connexion d'abord ; multijoueur après stabilisation du monde et de la persistance.

## Jalons
### Jalon 0 — Stabilisation de la base existante
- Corriger les erreurs TypeScript et de build.
- Vérifier création/reprise/suppression des sauvegardes en ligne et hors ligne.
- Tester les contrôles tactiles, la mini-carte et la carte plein écran.
- Mesurer les performances sur un Android d'entrée/milieu de gamme.

### Jalon 1 — Vertical slice Dakar
- Une zone de quartier cohérente, délimitée et optimisée.
- Déplacements fluides, collisions et interactions contextualisées.
- PNJ avec routines simples : domicile, travail, commerce et repos.
- Circulation routière basique, piétons et points d'intérêt.
- Cycle jour/nuit, météo simple et sauvegarde de position.

### Jalon 2 — Simulation de vie
- Besoins, inventaire, argent, achats et logement.
- Emploi avec horaires, tâches, rémunération et progression.
- Relations, dialogues et réputation.
- Événements de quartier et économie équilibrée.

### Jalon 3 — Géographie du Sénégal
- Données de routes et localités issues de sources géographiques ouvertes et contrôlées.
- Déplacements interurbains par étapes, temps de trajet et coûts.
- Scènes distinctes et reconnaissables pour Dakar, Kaolack, Médina Baye, Thiès et Touba.
- Téléchargement/cache des zones pour exploration hors ligne.

### Jalon 4 — Présentation 3D
- Prototype Godot 4 sur une petite zone avant toute migration massive.
- Contrôle troisième personne, caméra, collisions, éclairage et assets optimisés.
- Comparaison documentée des performances et du coût de production avant extension.

### Jalon 5 — Extension internationale et multijoueur
- Ajouter les pays uniquement avec une base de contenu et des lieux vérifiés.
- Comptes, synchronisation et sécurité serveur.
- Multijoueur après tests de charge et prévention de triche.

## Critères de sortie du premier jalon
- `npm run typecheck`, `npm run lint` et `npm run build` réussissent.
- Une nouvelle partie peut être créée, quittée, reprise et supprimée.
- Une action reste enregistrée après actualisation et après perte de connexion.
- Le joueur reste visible sur la mini-carte pendant les déplacements.
- La PWA ouvre son interface déjà mise en cache hors ligne.


## Prochain jalon après v2.4
- Gestion plus détaillée des commerces : stocks, dépenses, personnel et bénéfices variables.
- Logements disponibles à Kaolack et déménagement interurbain avec adresse de résidence persistante.
- Activités locales et missions propres à Kaolack.
- Préparer l'extension de Thiès et Touba après stabilisation des sauvegardes multi-villes.
