# LIFE IN THE WORLD — Version 2.5 : extension du Sénégal et gestion d'entreprise

## Nouvelles zones jouables
- Ajout de zones de simulation inspirées de Thiès et Touba, avec quartiers, axes routiers, bâtiments interactifs et habitants.
- Ajout de gares et de liaisons interurbaines Dakar–Thiès, Dakar–Kaolack, Kaolack–Thiès et Thiès–Touba, avec retours correspondants.
- Le choix de ville est enregistré avec la partie et détermine le point d'arrivée au chargement du monde.
- Les zones sont des représentations de gameplay dessinées dans la carte 2D ; elles ne sont pas des cartes GPS ou des reproductions exactes de la géographie réelle.

## Activités locales
- Thiès : marché, centre hospitalier, école, atelier, emplois de commerce, soins et enseignement, investissements dans un étal et un atelier.
- Touba : Grande Mosquée représentée avec respect, marché, atelier, emplois de commerce et artisanat, investissements locaux.
- Les personnages ajoutés ont des apparences et rôles distincts. Les dialogues génériques restent disponibles.

## Gestion d'entreprise
- Stock initial à l'achat, consommation quotidienne et réapprovisionnement par lots de trois unités.
- Recrutement jusqu'à trois employés, avec une charge salariale quotidienne simulée.
- Amélioration jusqu'au niveau 3 et ouverture de succursales jusqu'à trois points de vente.
- Calcul quotidien d'un revenu brut variable selon le stock, le niveau, l'effectif, le nombre de succursales et un facteur de concurrence local.
- Déduction de charges d'exploitation et de salaires pour produire un résultat net.
- État de gestion sauvegardé dans les métadonnées de la partie, sans modification du schéma SQL.

## Paramètres de simulation
Tous les tarifs, salaires, coûts, revenus, salaires d'employés, facteurs de concurrence et variations sont des paramètres fictifs d'équilibrage du jeu ; ils ne décrivent pas les prix ou revenus réels des villes concernées.

## Limites et vérifications
- Monde 2D Canvas ; pas de scène 3D.
- Les nouvelles zones sont des secteurs de jeu illustratifs, non une cartographie réelle détaillée.
- Les déplacements interurbains sont instantanés après validation du billet.
- Les routines des nouveaux habitants restent simples.
- Vérification syntaxique TypeScript/TSX effectuée sur les fichiers modifiés avec le transpileur TypeScript.
- La vérification complète des types et la compilation Next.js n'ont pas pu être terminées : les dépendances du projet ne sont pas présentes dans l'environnement.
- Les tests Android et le déploiement restent à effectuer.
