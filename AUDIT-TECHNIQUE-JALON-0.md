# LIFE IN THE WORLD — Audit technique initial

Date : 22 novembre 2026

## État vérifié dans l'archive v0.2

- Application web Next.js / React / TypeScript.
- Monde rendu en 2D sur un élément HTML Canvas (`WorldGame.tsx` et `render.ts`). Ce n'est pas encore un jeu 3D ni un projet Unreal/Godot.
- Boucle de simulation avec personnage, PNJ, circulation, caméra, interactions et missions.
- Sauvegarde locale via `localStorage` (`offline-store.ts`). Les routes API existent également, mais la sauvegarde locale permet le mode solo sans serveur pour les actions prises en charge.
- Service worker (`public/sw.js`) avec cache de l'écran d'accueil et des ressources consultées.
- Configuration Netlify et workflow GitHub Actions présents.

## Limites à traiter avant d'agrandir le monde

1. **Validation de compilation non confirmée** : l'installation des dépendances a dépassé le délai disponible dans l'environnement d'audit. Aucun succès de `typecheck`, `lint` ou `build` n'est revendiqué.
2. **Absence de projet 3D** : aucun projet Godot ou Unreal, aucune scène 3D et aucun pipeline d'assets 3D ne figurent dans cette archive.
3. **Géographie** : les lieux et routes du monde actuel sont des données dessinées dans le code. Ils ne constituent pas encore une reproduction cartographique vérifiée du Sénégal.
4. **Persistance** : les sauvegardes locales dépendent du stockage du navigateur et de l'appareil. Elles ne sont pas synchronisées entre appareils.
5. **Hors connexion** : le service worker met en cache l'accueil et les ressources chargées, mais il faut tester le parcours complet après une première visite en ligne, puis après fermeture et réouverture hors connexion.
6. **Performances mobiles** : aucune mesure sur un téléphone Android réel n'est disponible dans cet audit.

## Ordre de travail retenu

### Jalon 0A — Validation reproductible
- Installer les dépendances avec le gestionnaire de paquets et figer les versions via un lockfile.
- Exécuter `npm run typecheck`, `npm run lint`, `npm run build`.
- Corriger toutes les erreurs bloquantes avant d'ajouter des fonctionnalités.

### Jalon 0B — Tests de jeu
- Créer une partie, agir, actualiser, reprendre et supprimer une partie.
- Vérifier les contrôles tactiles et clavier.
- Vérifier collisions, entrée/sortie des véhicules, interactions et mini-carte.
- Tester l'installation PWA et la reprise hors connexion.

### Jalon 1 — Vertical slice jouable
- Améliorer une seule zone urbaine cohérente avant d'étendre la carte.
- Ajouter des routines de PNJ lisibles et prévisibles (domicile, travail, repos).
- Ajouter des collisions et des règles de circulation robustes.
- Sauvegarder position et progression de façon fiable.

### Jalon 2 — Prototype 3D séparé
- Évaluer Godot 4 pour un prototype 3D léger et multiplateforme.
- Construire une petite scène de quartier avec personnage, caméra, collisions et éclairage.
- Comparer les performances sur Android avant toute décision de migration.

## Critères de validation

Un jalon n'est déclaré terminé qu'après exécution des tests correspondants et conservation des journaux ou résultats. Les lieux présentés comme réels doivent être vérifiés avec des données géographiques fiables ; sinon ils seront décrits comme inspirés du réel.

## Version 0.7 — routines de déplacement des habitants (prototype)
- Ajout de parcours d'activité simples pour six habitants : Li Wei, Mei Chen, Daniel Okafor, Sofia Rossi, Yuki Tanaka et Thomas Müller.
- Les personnages concernés visitent successivement des points prédéfinis autour de leurs lieux de vie/activité et marquent une courte pause avant de repartir.
- Les autres PNJ conservent leur déplacement exploratoire existant.
- Limite : ces parcours sont des routines de déplacement de prototype, pas encore un emploi du temps complet basé sur l'heure, le domicile, les besoins ou une IA sociale.
- Validation : vérification statique des modifications et de l'archive ; compilation complète non confirmée faute d'installation des dépendances.
