# LIFE IN THE WORLD — journal des versions

## v0.7 — Routines de déplacement des habitants
- Six habitants disposent désormais de plusieurs points d'activité qu'ils parcourent successivement.
- Les pauses entre déplacements sont plus longues pour ces personnages afin de donner une impression d'activité moins aléatoire.
- Les autres habitants gardent leur système de promenade libre.
- Il s'agit d'une première simulation de routines, pas encore d'une IA quotidienne complète.

## v0.6 — Diversité des habitants
- Ajout de profils internationaux et de portraits SVG locaux.

## Limites connues
- Le rendu actuel est un monde 2D Canvas, pas encore un monde 3D.
- La compilation de production et les performances sur Android doivent encore être testées.
- Les routines sont simples et doivent évoluer vers des horaires, métiers, domiciles et relations persistants.

## v0.8 — Routines quotidiennes par créneau
- Six habitants disposent désormais de parcours différents le matin, l'après-midi, le soir et la nuit.
- Les habitants sans planning dédié conservent leur déplacement libre autour de leur zone.

## v0.9 — Premières relations sociales
- Ajout d'un niveau d'amitié local (0 à 5) entre le joueur et les habitants internationaux.
- Dialogues personnalisés pour Li Wei, Mei Chen, Daniel Okafor, Sofia Rossi, Maria Santos, Yuki Tanaka, Thomas Müller et Amina Diallo.
- Actions de rencontre et de renforcement du lien social.
- Limite : les liens ne sont pas encore enregistrés dans la sauvegarde persistante.


## v1.0 — Relations persistantes
- Sauvegarde locale des niveaux d’amitié par partie et par habitant.
- Restauration des relations au retour dans une partie.
- Nettoyage des relations lors de la suppression d’une partie.

## v1.1 — Espace Famille
- Ajout d'une application Famille dans le téléphone : foyer, logement, situation sentimentale et appel à la famille.
- Les fonctionnalités non développées (enfants, parentalité, membres contrôlables) sont clairement signalées.

## v1.5 — Vie familiale autonome
- Événements familiaux aléatoires au changement de journée, adaptés à la situation sentimentale.
- Moments de soutien, repas, appels, échanges et petits désaccords avec effets sur les statistiques.
- Événements ajoutés au journal de la partie.
- Aucun changement du schéma de sauvegarde.

## v1.6 — Parentalité et adoption
- Ajout d'un foyer pouvant accueillir jusqu'à trois enfants adoptés.
- Ajout des actions d'adoption et d'activités parentales.
- Âge et bien-être des enfants évoluent au fil des journées.
- Persistance rétrocompatible des données familiales via les métadonnées de sauvegarde existantes.

## v1.7 — Diversité musulmane et vie spirituelle
- Ajout de Sokhna Mariama et Khadija Ba, habitantes musulmanes pratiquantes portant le hijab, avec portraits et silhouettes dédiés.
- Ajout de routines de quartier et de dialogues liés à leur vie quotidienne, leur foi et leurs métiers.
- Ajout d'une mosquée dans la Médina et amélioration des interactions avec les lieux de prière.
- L'Imam Sall est identifié comme musulman pratiquant ; la pratique religieuse du joueur reste facultative.

## v1.8 — Diversité religieuse
- Ajout de personnages chrétiens, hindous et bouddhistes pratiquants, ainsi que d'une médiatrice des traditions spirituelles sérères.
- Ajout de lieux communautaires fictifs, dessinés sur la carte et accessibles par interaction.
- Ajout des dialogues, visites gratuites, routines journalières et portraits dédiés.
- Les lieux fictifs sont clairement distingués des monuments réels de Dakar ; aucune religion n'est attribuée à un personnage en fonction de son origine.

## v1.9 — Diversité des convictions et lieux communautaires
- Personnages juif, sikh et sans affiliation religieuse, avec dialogues dédiés.
- Maison communautaire Beth Shalom et Gurdwara fictifs ajoutés à la carte et aux lieux visitables.
- Portraits SVG et routines quotidiennes ajoutés.

## v2.0 — Mobilité urbaine
- Densification de la circulation avec un car rapide, un taxi et deux voitures supplémentaires.
- Nouveaux itinéraires réutilisant le moteur de circulation existant.
- Les nouvelles voitures restent interactives via le système d'approche et de prise du volant existant.

## v2.1 — Arrêts de transport collectif
- Ajout de trois abribus interactifs à Yoff, Médina et Plateau.
- Ajout de dialogues de consultation des lignes et destinations proposées.
- Tarifs explicitement fictifs et itinéraires indicatifs.
- Le déplacement automatique par transport reste à implémenter.

## Version 2.2 — Transport collectif jouable
- Les choix de destination aux arrêts déclenchent désormais un trajet dans la carte : le personnage arrive dans le quartier ou près du lieu choisi.
- Le moteur débite le tarif fictif, refuse le trajet si le solde est insuffisant et inscrit l'opération dans le journal d'événements.
- Les trajets depuis Yoff, Médina, Plateau et UCAD sont disponibles selon les lignes proposées.
- Le déplacement est instantané : le temps de trajet, les arrêts intermédiaires, les horaires et la conduite réelle des bus ne sont pas encore simulés.

## v2.3 — Première extension jouable à Kaolack
- Monde élargi et ajout de Médina Baye, Centre-ville et Kasnack.
- Ajout de bâtiments, habitants, circulation locale et deux gares interurbaines.
- Voyage Dakar ↔ Kaolack avec billet de gameplay et sauvegarde de la ville courante.
- Mini-carte et carte complète étendues à la nouvelle zone.


## v2.4 — Économie locale de Kaolack
- Ajout de quatre métiers locaux avec conditions d'accès.
- Ajout de quatre investissements propres à Kaolack.
- Ajout des interactions professionnelles et commerciales dans les bâtiments de Kaolack.
- Vérification de la ville pour les emplois et investissements réservés à cette zone.

## Version 2.5 — Extension Thiès/Touba et gestion avancée des entreprises
- Agrandissement du monde 2D pour intégrer les zones de Thiès et Touba.
- Nouveaux quartiers, routes, gares, bâtiments interactifs et habitants.
- Nouvelles liaisons interurbaines et sauvegarde de la ville actuelle.
- Nouveaux emplois et investissements locaux à Thiès et Touba.
- Gestion des stocks, recrutements, salaires, charges, niveaux d'amélioration et succursales.
- Revenus quotidiens variables intégrant stock, capacité, effectif et concurrence simulée.
