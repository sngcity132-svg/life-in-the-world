# LIFE IN THE WORLD — base jouable, chapitre 1 : Sénégal

## Vision produit
Simulateur de vie en monde ouvert, conçu pour s'étendre progressivement à plusieurs pays. Le Sénégal est le premier chapitre de production. Le projet actuel est une base web 2D/2.5D jouable, et non encore un jeu 3D photoréaliste ni un monde géographique complet.

## État réel de cette version
- Création de personnage et sauvegardes de plusieurs vies.
- Déplacements dans un quartier urbain stylisé inspiré de Dakar.
- Personnages non-joueurs, circulation et interactions prévues dans la scène actuelle.
- Mini-carte persistante avec position du joueur, carte agrandie et carte plein écran (`M`).
- Simulation de vie : statistiques, argent, activités, métiers et progression.
- PWA installable et sauvegarde locale dans le navigateur.
- Les actions utilisent l'API quand elle est disponible et un moteur local en repli.

## Limites connues à ne pas confondre avec la vision finale
- La scène actuelle est une représentation stylisée, pas une reproduction cartographique à l'échelle.
- Les personnages sont des sprites/éléments 2D, pas des humains photoréalistes.
- Les localités hors de la zone de jeu ne sont pas encore des scènes explorable avec itinéraires géographiques réels.
- Le mode hors connexion dépend du premier chargement en ligne et des ressources déjà mises en cache.
- Le multijoueur n'est pas encore implémenté.

## Choix technique de production
**Étape immédiate :** stabiliser cette base web, ses sauvegardes, sa carte, ses contrôles tactiles et son déploiement Netlify. C'est le chemin le plus réaliste depuis Android et avec un budget initial nul.

**Étape suivante :** extraire les systèmes indépendants (personnage, inventaire, économie, besoins, temps, météo, IA des PNJ) en modules testables, puis remplacer progressivement la carte fictive par des données géographiques vérifiées et des scènes locales.

**Évolution 3D :** évaluer Godot 4 comme premier moteur 3D open-source, avec Unreal Engine comme option de production ultérieure si le matériel de compilation et les ressources deviennent suffisants. Ne pas promettre une compilation Unreal directement depuis un téléphone Android.

## Lancer en local
```bash
npm install
npm run dev
```
Puis ouvrir `http://localhost:3000`.

## Vérifications avant déploiement
```bash
npm run typecheck
npm run lint
npm run build
```

## Déploiement Netlify
1. Importer ce dossier dans un dépôt GitHub.
2. Dans Netlify, importer le dépôt.
3. La configuration `netlify.toml` utilise `npm run build` et le plugin Next.js.
4. Ajouter `DATABASE_URL` uniquement si les sauvegardes PostgreSQL distantes sont souhaitées. Sans cette variable, le mode local reste le mécanisme de repli.

## Mode hors connexion
Ouvrir le site une première fois avec Internet pour charger le jeu et ses ressources. Installer ensuite la PWA depuis le navigateur Android. Les ressources déjà chargées et les sauvegardes locales restent disponibles hors connexion ; les ressources externes jamais consultées ne sont pas garanties.

## Contrôle automatique GitHub
Le workflow `.github/workflows/quality-checks.yml` lance automatiquement l'installation, le contrôle TypeScript, ESLint et le build de production à chaque push ou pull request. Le premier résultat GitHub Actions servira de validation réelle du projet ; le ZIP fourni n'a pas été compilé ici, car ses dépendances ne sont pas installées dans cet environnement.


## Version 2.2 — Transport collectif jouable
Les arrêts de Yoff, Médina et Plateau proposent maintenant des déplacements instantanés avec débit du tarif fictif. Voir `NOTES-V2.2-TRANSPORT-JOUABLE.md` pour les lignes disponibles et les limites connues.
