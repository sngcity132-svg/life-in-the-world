# LIFE IN THE WORLD — Notes v0.5

## Amélioration effectuée

Le stockage local a été renforcé dans `src/lib/offline-store.ts` :

- validation minimale des sauvegardes lues pour ignorer les entrées corrompues ;
- gestion défensive des erreurs JSON et des restrictions de `localStorage` ;
- tentative de sauvegarde normale, puis compactage du journal d'événements si le quota est dépassé ;
- en dernier recours, suppression des sauvegardes les moins avancées, en protégeant la partie en cours ;
- identifiant de partie basé sur `crypto.randomUUID()` quand le navigateur le permet, avec solution de repli ;
- limite centralisée du nombre d'événements conservés.

## Limites à connaître

- Les données restent stockées dans le navigateur de l'appareil. Elles ne sont pas automatiquement synchronisées entre Android et PC.
- Si le navigateur efface les données du site, les sauvegardes locales peuvent disparaître.
- La sauvegarde serveur dépend de la configuration de la base de données et du déploiement.
- Les contrôles `typecheck`, `lint` et `build` doivent encore être exécutés dans GitHub Actions ou un environnement Node compatible. Ils ne sont pas déclarés réussis dans cette version.

## Vérification conseillée après déploiement

1. Créer un personnage et vérifier qu'il apparaît dans « Continuer ».
2. Effectuer une action, recharger la page et vérifier que l'état est conservé.
3. Couper Internet, continuer une action, recharger et vérifier le retour dans la partie.
4. Fermer puis rouvrir le navigateur et vérifier que la partie est toujours présente.
