import { px } from "./data";

/* ============================================================
   SAMA CITY — monde ouvert inspiré de Dakar
   Coordonnées monde : 5200 × 4600. Dakar, Kaolack, Thiès et Touba sont reliées dans cette carte de simulation.
   ============================================================ */

export interface Vec {
  x: number;
  y: number;
}

export const WORLD = {
  w: 5200,
  h: 4600,
  seaEdge: 470,
  beachEdge: 600,
  minX: 486,
  maxX: 5152,
  minY: 130,
  maxY: 4540,
  spawn: { x: 878, y: 1490 },
};

/* ---------- Quartiers / villages ---------- */
export interface District {
  id: string;
  name: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
}
export const DISTRICTS: District[] = [
  { id: "yoff", name: "YOFF", sub: "Village lébou des pêcheurs", x: 600, y: 130, w: 1180, h: 570 },
  { id: "parcelles", name: "PARCELLES", sub: "Stade & arène de lutte", x: 1780, y: 130, w: 1180, h: 570 },
  { id: "medina", name: "MÉDINA", sub: "Le cœur battant de la ville", x: 600, y: 700, w: 1180, h: 1140 },
  { id: "campus", name: "CAMPUS UCAD", sub: "Université Cheikh Anta Diop", x: 1780, y: 700, w: 1180, h: 540 },
  { id: "plateau", name: "PLATEAU", sub: "Affaires, banques & hôpital", x: 1780, y: 1240, w: 1180, h: 1010 },
  { id: "almadies", name: "ALMADIES", sub: "Villas, surf & coucher de soleil", x: 460, y: 1840, w: 1320, h: 410 },
  // Première extension urbaine jouable : Kaolack (zone de jeu fictive, non cartographique).
  { id: "kaolack-medina-baye", name: "MÉDINA BAYE", sub: "Quartier spirituel et résidentiel", x: 3150, y: 180, w: 1950, h: 620 },
  { id: "kaolack-centre", name: "CENTRE-VILLE", sub: "Marché central, commerces et services", x: 3150, y: 800, w: 1950, h: 700 },
  { id: "kaolack-kasnack", name: "KASNACK", sub: "Quartier résidentiel", x: 3150, y: 1500, w: 1950, h: 700 },
  { id: "thies-centre", name: "THIÈS — CENTRE", sub: "Gare, commerces et vie urbaine", x: 3150, y: 2400, w: 1950, h: 620 },
  { id: "thies-residentiel", name: "THIÈS — QUARTIERS", sub: "Habitat, écoles et ateliers", x: 3150, y: 3020, w: 1950, h: 480 },
  { id: "touba-centre", name: "TOUBA — CENTRE", sub: "Ville sainte et activités locales", x: 3150, y: 3560, w: 1950, h: 480 },
  { id: "touba-marche", name: "TOUBA — MARCHÉ", sub: "Commerce et artisanat", x: 3150, y: 4040, w: 1950, h: 500 },
];

export const districtAt = (x: number, y: number): District | null => {
  if (x < WORLD.beachEdge) return { id: "ocean", name: "OCÉAN ATLANTIQUE", sub: y < 900 ? "Plage de Yoff" : "La Corniche ouest", x: 0, y: 0, w: 600, h: 2300 };
  for (const d of DISTRICTS) if (x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h) return d;
  return null;
};

/* ---------- Routes ---------- */
export interface Road {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
}
export const ROADS: Road[] = [
  { x1: 640, y1: 160, x2: 640, y2: 2160, w: 64 }, // Corniche
  { x1: 640, y1: 700, x2: 2900, y2: 700, w: 64 }, // Route de Yoff
  { x1: 640, y1: 1240, x2: 2900, y2: 1240, w: 64 }, // VDN
  { x1: 640, y1: 1840, x2: 2620, y2: 1840, w: 64 }, // Boulevard du Sud
  { x1: 1780, y1: 700, x2: 1780, y2: 1840, w: 64 }, // Av. Cheikh Anta Diop
  { x1: 2560, y1: 700, x2: 2560, y2: 2160, w: 64 }, // Av. du Plateau
  { x1: 640, y1: 2020, x2: 1240, y2: 2020, w: 56 }, // Boucle Almadies
  { x1: 1100, y1: 1840, x2: 1100, y2: 2020, w: 56 },
  { x1: 3300, y1: 250, x2: 4900, y2: 250, w: 62 },
  { x1: 3300, y1: 700, x2: 4900, y2: 700, w: 62 },
  { x1: 3300, y1: 1000, x2: 4900, y2: 1000, w: 62 },
  { x1: 3300, y1: 1450, x2: 4900, y2: 1450, w: 62 },
  { x1: 3300, y1: 1850, x2: 4900, y2: 1850, w: 62 },
  { x1: 3500, y1: 250, x2: 3500, y2: 1850, w: 54 },
  { x1: 4550, y1: 250, x2: 4550, y2: 1850, w: 54 },
  { x1: 3300, y1: 2420, x2: 5000, y2: 2420, w: 68 },
  { x1: 3300, y1: 2900, x2: 5000, y2: 2900, w: 60 },
  { x1: 3300, y1: 3600, x2: 5000, y2: 3600, w: 68 },
  { x1: 3300, y1: 4300, x2: 5000, y2: 4300, w: 60 },
  { x1: 3500, y1: 2420, x2: 3500, y2: 4300, w: 58 },
  { x1: 4550, y1: 2420, x2: 4550, y2: 4300, w: 58 },
];

/* ---------- Bâtiments interactifs ---------- */
export type BuildingKind =
  | "house" | "shop" | "market" | "mosque" | "tower" | "hospital"
  | "school" | "stadium" | "arena" | "villa" | "hut" | "station" | "campus" | "church" | "temple" | "meditation" | "culture" | "synagogue" | "gurdwara";

export interface Building {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  w: number;
  h: number;
  wall: string;
  roof: string;
  kind: BuildingKind;
  home?: string; // logement associé
  job?: string; // métier associé
}

export const BUILDINGS: Building[] = [
  // Yoff
  { id: "mosquee", name: "Mosquée de Yoff", emoji: "🕌", x: 1180, y: 250, w: 210, h: 160, wall: "#f3ede1", roof: "#1f8a70", kind: "mosque" },
  { id: "peche", name: "Quai des pêcheurs", emoji: "🎣", x: 740, y: 380, w: 150, h: 95, wall: "#caa06a", roof: "#8a5a33", kind: "hut", job: "pecheur" },
  // Médina
  { id: "mosquee-medina", name: "Mosquée de la Médina", emoji: "🕌", x: 1020, y: 930, w: 190, h: 145, wall: "#f3ede1", roof: "#1f8a70", kind: "mosque" },
  // Lieux communautaires fictifs du jeu : ils représentent plusieurs traditions sans prétendre être des monuments réels de Dakar.
  { id: "eglise", name: "Église Saint-Pierre", emoji: "⛪", x: 1790, y: 900, w: 170, h: 135, wall: "#eee7d8", roof: "#9a7651", kind: "church" },
  { id: "temple-hindou", name: "Maison de prière hindoue", emoji: "🛕", x: 1810, y: 1190, w: 175, h: 135, wall: "#f2dfc5", roof: "#c66b36", kind: "temple" },
  { id: "centre-meditation", name: "Centre de méditation", emoji: "🪷", x: 1810, y: 1480, w: 175, h: 125, wall: "#e8e2d5", roof: "#8c9c83", kind: "meditation" },
  { id: "maison-cultures", name: "Maison des traditions", emoji: "🌿", x: 1810, y: 1740, w: 175, h: 125, wall: "#e4c99b", roof: "#8a6945", kind: "culture" },
  { id: "synagogue", name: "Maison communautaire Beth Shalom", emoji: "✡️", x: 2100, y: 1900, w: 175, h: 130, wall: "#e8e3d5", roof: "#52718c", kind: "synagogue" },
  { id: "gurdwara", name: "Gurdwara — Maison du partage", emoji: "🪯", x: 2370, y: 1900, w: 175, h: 130, wall: "#f0dfc5", roof: "#c58b3d", kind: "gurdwara" },
  { id: "famille", name: "Chez la famille", emoji: "🏠", x: 800, y: 1330, w: 155, h: 110, wall: "#e8c87a", roof: "#b5533c", kind: "house", home: "famille" },
  { id: "awa", name: "Chez Awa — Resto", emoji: "🍛", x: 1060, y: 1330, w: 165, h: 110, wall: "#f0a35e", roof: "#a34a2a", kind: "shop" },
  { id: "sandaga", name: "Marché Sandaga", emoji: "🛍️", x: 1330, y: 1430, w: 230, h: 150, wall: "#e0b64f", roof: "#c0392b", kind: "market", job: "vendeur" },
  { id: "tailleur", name: "Atelier Modou", emoji: "🧵", x: 1580, y: 1330, w: 135, h: 100, wall: "#7fc4a3", roof: "#2c6e57", kind: "shop", job: "couturier" },
  { id: "boutique", name: "Boutique du quartier", emoji: "🏪", x: 1580, y: 1560, w: 135, h: 100, wall: "#8fb7d8", roof: "#33608a", kind: "shop" },
  { id: "coloc", name: "Coloc des amis", emoji: "🛏️", x: 800, y: 1600, w: 145, h: 110, wall: "#d8a0a8", roof: "#8a4a52", kind: "house", home: "coloc" },
  { id: "studio", name: "Studio Sacré-Cœur", emoji: "🏢", x: 1060, y: 1620, w: 145, h: 100, wall: "#c9c2b4", roof: "#6e675c", kind: "house", home: "studio" },
  { id: "taxis", name: "Station de taxis", emoji: "🚕", x: 720, y: 1120, w: 140, h: 80, wall: "#f2c94c", roof: "#8a6d1f", kind: "hut" },
  // Arrêts de transport collectif (lieux fictifs de gameplay, pas des stations réelles certifiées).
  { id: "station-yoff", name: "Arrêt Car rapide — Yoff", emoji: "🚌", x: 820, y: 610, w: 150, h: 76, wall: "#f2e6c8", roof: "#e87924", kind: "station" },
  { id: "station-medina", name: "Pôle transport — Médina", emoji: "🚏", x: 1430, y: 1160, w: 160, h: 76, wall: "#f2e6c8", roof: "#2476a8", kind: "station" },
  { id: "station-plateau", name: "Arrêt bus — Plateau", emoji: "🚌", x: 2670, y: 1300, w: 150, h: 76, wall: "#f2e6c8", roof: "#2476a8", kind: "station" },
  // Gare interurbaine à Dakar : départ vers Kaolack.
  { id: "gare-dakar", name: "Gare interurbaine — Dakar", emoji: "🚌", x: 2700, y: 1450, w: 190, h: 110, wall: "#ead9b8", roof: "#d97724", kind: "station" },
  // Kaolack — bâtiments et lieux de gameplay inspirés de la ville.
  { id: "kaolack-gare", name: "Gare routière de Kaolack", emoji: "🚌", x: 3420, y: 1320, w: 190, h: 110, wall: "#ead9b8", roof: "#d97724", kind: "station" },
  { id: "kaolack-mosquee", name: "Grande Mosquée de Médina Baye", emoji: "🕌", x: 3700, y: 320, w: 260, h: 190, wall: "#f3ede1", roof: "#1f8a70", kind: "mosque" },
  { id: "kaolack-daaray", name: "École coranique", emoji: "📖", x: 4050, y: 360, w: 170, h: 120, wall: "#e8d4ad", roof: "#9a7651", kind: "school" },
  { id: "kaolack-marche", name: "Marché central de Kaolack", emoji: "🛍️", x: 3800, y: 920, w: 260, h: 170, wall: "#e0b64f", roof: "#c0392b", kind: "market", job: "vendeur" },
  { id: "kaolack-hopital", name: "Hôpital régional", emoji: "🏥", x: 4510, y: 940, w: 220, h: 160, wall: "#f4f1ea", roof: "#c0392b", kind: "hospital", job: "medecin" },
  { id: "kaolack-maison", name: "Maison familiale de Kaolack", emoji: "🏠", x: 3650, y: 1660, w: 170, h: 120, wall: "#e8c87a", roof: "#b5533c", kind: "house" },
  { id: "kaolack-atelier", name: "Atelier artisanal", emoji: "🧵", x: 4050, y: 1680, w: 170, h: 120, wall: "#7fc4a3", roof: "#2c6e57", kind: "shop" },
  { id: "kaolack-ecole", name: "École du quartier", emoji: "🏫", x: 4550, y: 1700, w: 190, h: 130, wall: "#f0e0b8", roof: "#9a7b3f", kind: "school" },
  // Thiès — zone de simulation inspirée de la ville, sans prétention cartographique.
  { id: "thies-gare", name: "Gare routière de Thiès", emoji: "🚌", x: 3380, y: 2480, w: 200, h: 115, wall: "#ead9b8", roof: "#d97724", kind: "station" },
  { id: "thies-marche", name: "Marché central de Thiès", emoji: "🛍️", x: 3800, y: 2500, w: 250, h: 150, wall: "#e0b64f", roof: "#c0392b", kind: "market", job: "vendeur-thies" },
  { id: "thies-hopital", name: "Centre hospitalier de Thiès", emoji: "🏥", x: 4550, y: 2520, w: 220, h: 150, wall: "#f4f1ea", roof: "#c0392b", kind: "hospital", job: "infirmier-thies" },
  { id: "thies-atelier", name: "Atelier de réparation", emoji: "🛠️", x: 3800, y: 3150, w: 190, h: 120, wall: "#7fc4a3", roof: "#2c6e57", kind: "shop" },
  { id: "thies-ecole", name: "École de Thiès", emoji: "🏫", x: 4550, y: 3150, w: 190, h: 125, wall: "#f0e0b8", roof: "#9a7b3f", kind: "school", job: "enseignant-thies" },
  // Touba — espaces de vie et de commerce fictifs de la simulation.
  { id: "touba-gare", name: "Gare routière de Touba", emoji: "🚌", x: 3380, y: 3650, w: 200, h: 115, wall: "#ead9b8", roof: "#d97724", kind: "station" },
  { id: "touba-mosquee", name: "Grande Mosquée de Touba", emoji: "🕌", x: 3800, y: 3650, w: 270, h: 190, wall: "#f3ede1", roof: "#1f8a70", kind: "mosque" },
  { id: "touba-marche", name: "Marché de Touba", emoji: "🛍️", x: 3800, y: 4180, w: 250, h: 150, wall: "#e0b64f", roof: "#c0392b", kind: "market", job: "vendeur-touba" },
  { id: "touba-atelier", name: "Atelier artisanal de Touba", emoji: "🧵", x: 4550, y: 4180, w: 200, h: 130, wall: "#7fc4a3", roof: "#2c6e57", kind: "shop", job: "artisan-touba" },
  // Campus
  { id: "ucad", name: "UCAD — Université", emoji: "🎓", x: 2130, y: 860, w: 280, h: 170, wall: "#e7ddc8", roof: "#7a6a4f", kind: "campus" },
  { id: "biblio", name: "Bibliothèque", emoji: "📚", x: 2480, y: 900, w: 130, h: 105, wall: "#d9c9a8", roof: "#5d5138", kind: "school" },
  // Parcelles
  { id: "stade", name: "Stade Abdoulaye Wade", emoji: "🏟️", x: 2440, y: 260, w: 340, h: 240, wall: "#b9c4bb", roof: "#2f7d4f", kind: "stadium" },
  { id: "arene", name: "Arène de lutte", emoji: "🤼", x: 1980, y: 330, w: 180, h: 180, wall: "#d9b98a", roof: "#a87b45", kind: "arena" },
  // Plateau
  { id: "banque", name: "Banque CBAO", emoji: "🏦", x: 2040, y: 1360, w: 170, h: 170, wall: "#cfd6dd", roof: "#4a5a6a", kind: "tower" },
  { id: "tech", name: "Diamniadio Tech", emoji: "💻", x: 2320, y: 1360, w: 190, h: 180, wall: "#9fd0e8", roof: "#2a6f8f", kind: "tower", job: "developpeur" },
  { id: "hopital", name: "Hôpital Principal", emoji: "🏥", x: 2620, y: 1620, w: 220, h: 170, wall: "#f4f1ea", roof: "#c0392b", kind: "hospital", job: "medecin" },
  { id: "appart", name: "Résidence du Plateau", emoji: "🏙️", x: 2040, y: 1660, w: 170, h: 140, wall: "#e3d5c2", roof: "#8f7f6a", kind: "tower", home: "appart" },
  { id: "lycee", name: "Lycée Blaise Diagne", emoji: "🏫", x: 2320, y: 1660, w: 180, h: 125, wall: "#f0e0b8", roof: "#9a7b3f", kind: "school", job: "enseignant" },
  // Almadies
  { id: "villa", name: "Villa des Almadies", emoji: "🏝️", x: 760, y: 2070, w: 230, h: 150, wall: "#f6f1e6", roof: "#caa66a", kind: "villa", home: "villa" },
  { id: "resort", name: "Sea Plaza Resort", emoji: "🍹", x: 1240, y: 2070, w: 170, h: 125, wall: "#f2d8b8", roof: "#b5763c", kind: "villa" },
];

export const doorPos = (b: Building): Vec => ({ x: b.x + b.w / 2, y: b.y + b.h + 22 });

/* ---------- Points d'intérêt en plein air ---------- */
export interface Spot {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  color: string;
  action: { type: string; id?: string };
}
export const SPOTS: Spot[] = [
  { id: "ngor", name: "Plage de Ngor", emoji: "🏖️", x: 530, y: 1000, color: "#4fc3f7", action: { type: "visit", id: "ngor" } },
  { id: "goree", name: "Chaloupe pour Gorée", emoji: "⛴️", x: 535, y: 1520, color: "#ffb74d", action: { type: "visit", id: "goree" } },
  { id: "surf", name: "Spot de surf", emoji: "🏄", x: 530, y: 2060, color: "#4dd0e1", action: { type: "visit", id: "surf" } },
  { id: "corniche", name: "Banc de la Corniche", emoji: "💘", x: 610, y: 1935, color: "#f48fb1", action: { type: "date" } },
  { id: "monument", name: "Monument de la Renaissance", emoji: "🗽", x: 2820, y: 200, color: "#ffd54f", action: { type: "visit", id: "monument" } },
  { id: "lacrose", name: "Départ excursion Lac Rose", emoji: "🧂", x: 2840, y: 2080, color: "#f8bbd0", action: { type: "visit", id: "lacRose" } },
  { id: "saloum", name: "Départ delta du Saloum", emoji: "🛶", x: 2840, y: 1950, color: "#a5d6a7", action: { type: "visit", id: "saloum" } },
];

/* ---------- Décor ---------- */
export const PALMS: Vec[] = [
  { x: 585, y: 220 }, { x: 585, y: 480 }, { x: 585, y: 760 }, { x: 585, y: 1120 },
  { x: 585, y: 1400 }, { x: 585, y: 1700 }, { x: 585, y: 1980 }, { x: 585, y: 2200 },
  { x: 1030, y: 2140 }, { x: 1210, y: 2180 }, { x: 1440, y: 2130 }, { x: 730, y: 2040 },
  { x: 2000, y: 950 }, { x: 2060, y: 1100 }, { x: 2700, y: 1080 }, { x: 1900, y: 800 },
];
export const BAOBABS: { x: number; y: number; s: number }[] = [
  { x: 1720, y: 1080, s: 1.5 },
  { x: 1520, y: 540, s: 1.1 },
  { x: 2760, y: 560, s: 0.9 },
  { x: 3500, y: 1050, s: 1.25 }, { x: 4880, y: 1850, s: 1.1 },
];
export const LAMPS: Vec[] = [
  { x: 690, y: 400 }, { x: 690, y: 900 }, { x: 690, y: 1500 }, { x: 690, y: 2000 },
  { x: 1000, y: 750 }, { x: 1450, y: 750 }, { x: 2100, y: 750 }, { x: 2700, y: 750 },
  { x: 1000, y: 1290 }, { x: 1450, y: 1290 }, { x: 2100, y: 1290 }, { x: 2700, y: 1290 },
  { x: 1830, y: 1000 }, { x: 1830, y: 1550 }, { x: 2610, y: 1000 }, { x: 2610, y: 1550 },
  { x: 1000, y: 1890 }, { x: 2100, y: 1890 },
  { x: 3500, y: 760 }, { x: 4100, y: 760 }, { x: 4800, y: 760 }, { x: 3500, y: 1460 }, { x: 4100, y: 1460 }, { x: 4800, y: 1460 }, { x: 3500, y: 2050 }, { x: 4800, y: 2050 },
];
export const PIROGUES: { x: number; y: number; rot: number; c1: string; c2: string }[] = [
  { x: 505, y: 300, rot: -0.25, c1: "#1e88e5", c2: "#fdd835" },
  { x: 512, y: 380, rot: -0.12, c1: "#e53935", c2: "#43a047" },
  { x: 500, y: 460, rot: -0.32, c1: "#43a047", c2: "#fdd835" },
  { x: 510, y: 545, rot: -0.18, c1: "#fb8c00", c2: "#1e88e5" },
  { x: 505, y: 1560, rot: -0.2, c1: "#8e24aa", c2: "#fdd835" },
];
export const STALLS: { x: number; y: number; w: number; c1: string; c2: string }[] = [
  { x: 1340, y: 1610, w: 64, c1: "#e53935", c2: "#fdd835" },
  { x: 1420, y: 1610, w: 64, c1: "#1e88e5", c2: "#f5f5f5" },
  { x: 1500, y: 1610, w: 64, c1: "#43a047", c2: "#fdd835" },
  { x: 760, y: 500, w: 60, c1: "#fb8c00", c2: "#f5f5f5" },
  { x: 840, y: 500, w: 60, c1: "#00897b", c2: "#fdd835" },
];
// Maisonnettes décoratives des villages
export const HUTS: { x: number; y: number; w: number; h: number; wall: string; roof: string }[] = [
  { x: 820, y: 200, w: 100, h: 80, wall: "#e3c286", roof: "#a5673f" },
  { x: 960, y: 240, w: 90, h: 75, wall: "#dcb578", roof: "#8a5a33" },
  { x: 1040, y: 480, w: 100, h: 80, wall: "#e8cd96", roof: "#b5763c" },
  { x: 900, y: 560, w: 90, h: 70, wall: "#d9b98a", roof: "#96603a" },
  { x: 1440, y: 240, w: 95, h: 80, wall: "#e3c286", roof: "#a5673f" },
  { x: 1560, y: 420, w: 100, h: 75, wall: "#dcb578", roof: "#8a5a33" },
  { x: 1300, y: 560, w: 90, h: 70, wall: "#e8cd96", roof: "#b5763c" },
  { x: 800, y: 880, w: 110, h: 85, wall: "#f0a35e", roof: "#a34a2a" },
  { x: 960, y: 900, w: 100, h: 80, wall: "#7fc4a3", roof: "#2c6e57" },
  { x: 1120, y: 880, w: 105, h: 85, wall: "#e8c87a", roof: "#b5533c" },
  { x: 1290, y: 900, w: 100, h: 80, wall: "#d8a0a8", roof: "#8a4a52" },
  { x: 1460, y: 890, w: 105, h: 85, wall: "#8fb7d8", roof: "#33608a" },
  { x: 1600, y: 900, w: 95, h: 80, wall: "#e0b64f", roof: "#8a6d1f" },
  { x: 800, y: 1030, w: 100, h: 75, wall: "#c9c2b4", roof: "#6e675c" },
  { x: 1290, y: 1080, w: 110, h: 80, wall: "#e3c286", roof: "#a5673f" },
  { x: 1460, y: 1090, w: 100, h: 75, wall: "#f0a35e", roof: "#a34a2a" },
  { x: 1620, y: 1080, w: 90, h: 75, wall: "#7fc4a3", roof: "#2c6e57" },
  { x: 3650, y: 620, w: 110, h: 85, wall: "#e3c286", roof: "#a5673f" },
  { x: 4350, y: 500, w: 100, h: 80, wall: "#dcb578", roof: "#8a5a33" },
  { x: 4750, y: 1120, w: 110, h: 85, wall: "#e8cd96", roof: "#b5763c" },
  { x: 3850, y: 1880, w: 105, h: 80, wall: "#d9b98a", roof: "#96603a" },
  { x: 4650, y: 1900, w: 110, h: 85, wall: "#e3c286", roof: "#a5673f" },
  { x: 2000, y: 2000, w: 110, h: 85, wall: "#cfd6dd", roof: "#4a5a6a" },
  { x: 2180, y: 2020, w: 100, h: 80, wall: "#e3d5c2", roof: "#8f7f6a" },
  { x: 2360, y: 2000, w: 105, h: 85, wall: "#c9c2b4", roof: "#6e675c" },
];

/* ---------- Habitants (portraits réels) ---------- */
export interface NpcDef {
  id: string;
  name: string;
  role: string;
  portrait: string;
  shirt: string;
  skin: string;
  x: number;
  y: number;
  radius: number;
  /** Points d’activité visités successivement par cet habitant. */
  routineStops?: Vec[];
  /** Itinéraires selon le moment de la journée : 0 matin, 1 après-midi, 2 soirée, 3 nuit. */
  routineBySlot?: Partial<Record<0 | 1 | 2 | 3, Vec[]>>;
  faith?: "islam" | "christianisme" | "hindouisme" | "bouddhisme" | "traditions_africaines" | "judaisme" | "sikhisme" | "sans_pratique";
  practice?: "pratiquante" | "pratiquant" | "non_précisé";
  hijab?: string;
}
export const NPCS: NpcDef[] = [
  { id: "awa", name: "Maman Awa", role: "Cuisinière légendaire", portrait: px(31183851, 400), shirt: "#e0492f", skin: "#7a4a2b", x: 1140, y: 1470, radius: 40 },
  { id: "modou", name: "Modou", role: "Tailleur du marché HLM", portrait: px(6109343, 400), shirt: "#1f8a70", skin: "#5d3a22", x: 1645, y: 1460, radius: 45 },
  { id: "ibou", name: "Ibou", role: "Pêcheur de Yoff", portrait: px(31834066, 400), shirt: "#1e88e5", skin: "#6b4226", x: 800, y: 520, radius: 70 },
  { id: "cheikh", name: "Cheikh", role: "Roi de Sandaga", portrait: px(12179672, 400), shirt: "#f2b23e", skin: "#5d3a22", x: 1445, y: 1660, radius: 55 },
  { id: "fall", name: "Pr Fall", role: "Professeur à l'UCAD", portrait: px(19805876, 400), shirt: "#5e35b1", skin: "#4e3018", x: 2270, y: 1070, radius: 60 },
  { id: "kane", name: "Dr Kane", role: "Médecin-chef", portrait: px(19131212, 400), shirt: "#eceff1", skin: "#6b4226", x: 2730, y: 1830, radius: 45 },
  { id: "ousmane", name: "Ousmane", role: "Chef de la station de taxis", portrait: px(36078501, 400), shirt: "#fdd835", skin: "#5d3a22", x: 790, y: 1230, radius: 40 },
  { id: "fatou", name: "Fatou", role: "Griotte du quartier", portrait: px(2256401, 400), shirt: "#ad1457", skin: "#7a4a2b", x: 1720, y: 1150, radius: 60 },
  { id: "imam", name: "Imam Sall", role: "Imam · musulman pratiquant", portrait: px(6109289, 400), shirt: "#f5f5f5", skin: "#4e3018", faith: "islam", practice: "pratiquant", x: 1285, y: 450, radius: 35 },
  { id: "coach", name: "Coach Moussa", role: "Coach des Lions", portrait: px(36168096, 400), shirt: "#2e7d32", skin: "#5d3a22", x: 2610, y: 560, radius: 70 },
  { id: "ndeye", name: "Ndèye", role: "Vendeuse de bissap", portrait: px(4045708, 400), shirt: "#d81b60", skin: "#6b4226", x: 1180, y: 1080, radius: 160 },
  { id: "coumba", name: "Coumba", role: "Étudiante en droit", portrait: px(20094904, 400), shirt: "#00897b", skin: "#5d3a22", x: 2450, y: 1120, radius: 170 },
  { id: "love", name: "Sur la Corniche…", role: "Un regard qui intrigue", portrait: px(15254936, 400), shirt: "#f48fb1", skin: "#7a4a2b", x: 655, y: 1935, radius: 25 },
  // Nouveaux habitants : Dakar est une ville ouverte et diverse.
  { id: "liwei", name: "Li Wei", role: "Architecte sino-sénégalais", portrait: "/avatars/li-wei.svg", shirt: "#2878a8", skin: "#e7bd98", x: 2370, y: 1510, radius: 55, routineStops: [{ x: 2410, y: 1510 }, { x: 2370, y: 1600 }, { x: 2250, y: 1510 }], routineBySlot: { 0: [{ x: 2320, y: 1450 }, { x: 2410, y: 1510 }], 1: [{ x: 2370, y: 1600 }, { x: 2250, y: 1510 }], 2: [{ x: 2450, y: 1570 }, { x: 2370, y: 1510 }], 3: [{ x: 2370, y: 1510 }] } },
  { id: "meichen", name: "Mei Chen", role: "Étudiante en commerce", portrait: "/avatars/mei-chen.svg", shirt: "#bd477e", skin: "#f0c9a7", x: 2200, y: 1150, radius: 55, routineStops: [{ x: 2270, y: 1080 }, { x: 2390, y: 1150 }, { x: 2200, y: 1200 }], routineBySlot: { 0: [{ x: 2270, y: 1080 }, { x: 2390, y: 1150 }], 1: [{ x: 2200, y: 1200 }, { x: 2270, y: 1080 }], 2: [{ x: 2390, y: 1150 }], 3: [{ x: 2200, y: 1200 }] } },
  { id: "daniel", name: "Daniel Okafor", role: "Infirmier à l'hôpital", portrait: "/avatars/daniel-okafor.svg", shirt: "#3b8b62", skin: "#63391f", x: 2670, y: 1900, radius: 55, routineStops: [{ x: 2740, y: 1840 }, { x: 2670, y: 1930 }, { x: 2600, y: 1900 }], routineBySlot: { 0: [{ x: 2740, y: 1840 }, { x: 2670, y: 1930 }], 1: [{ x: 2600, y: 1900 }, { x: 2740, y: 1840 }], 2: [{ x: 2670, y: 1930 }], 3: [{ x: 2670, y: 1900 }] } },
  { id: "sofia", name: "Sofia Rossi", role: "Photographe indépendante", portrait: "/avatars/sofia-rossi.svg", shirt: "#a65dca", skin: "#f1c9a5", x: 900, y: 1960, radius: 55, routineStops: [{ x: 950, y: 1960 }, { x: 1040, y: 2050 }, { x: 820, y: 1900 }], routineBySlot: { 0: [{ x: 950, y: 1960 }, { x: 1040, y: 2050 }], 1: [{ x: 820, y: 1900 }, { x: 950, y: 1960 }], 2: [{ x: 1040, y: 2050 }], 3: [{ x: 900, y: 1960 }] } },
  { id: "maria", name: "Maria Santos", role: "Restauratrice capverdienne", portrait: "/avatars/maria-santos.svg", shirt: "#d97735", skin: "#a96d49", x: 1020, y: 1010, radius: 55 },
  { id: "yuki", name: "Yuki Tanaka", role: "Développeuse web", portrait: "/avatars/yuki-tanaka.svg", shirt: "#3977b9", skin: "#edc6a5", x: 2440, y: 1450, radius: 55, routineStops: [{ x: 2390, y: 1510 }, { x: 2480, y: 1580 }, { x: 2440, y: 1410 }], routineBySlot: { 0: [{ x: 2390, y: 1510 }, { x: 2480, y: 1580 }], 1: [{ x: 2440, y: 1410 }, { x: 2390, y: 1510 }], 2: [{ x: 2480, y: 1580 }], 3: [{ x: 2440, y: 1450 }] } },
  { id: "thomas", name: "Thomas Müller", role: "Enseignant de langues", portrait: "/avatars/thomas-muller.svg", shirt: "#607d8b", skin: "#f0c7a2", x: 2020, y: 1000, radius: 55, routineStops: [{ x: 2180, y: 1040 }, { x: 2250, y: 980 }, { x: 2050, y: 1100 }], routineBySlot: { 0: [{ x: 2180, y: 1040 }, { x: 2250, y: 980 }], 1: [{ x: 2050, y: 1100 }, { x: 2180, y: 1040 }], 2: [{ x: 2250, y: 980 }], 3: [{ x: 2020, y: 1000 }] } },
  { id: "amina", name: "Amina Diallo", role: "Entrepreneuse sénégalo-malienne", portrait: "/avatars/amina-diallo.svg", shirt: "#c34f4f", skin: "#87502f", x: 1500, y: 1760, radius: 55 },
  { id: "sokhna", name: "Sokhna Mariama", role: "Enseignante · musulmane pratiquante", portrait: "/avatars/sokhna-mariama.svg", shirt: "#2f806b", skin: "#75452b", hijab: "#d8b46a", faith: "islam", practice: "pratiquant", x: 1115, y: 1115, radius: 48, routineStops: [{ x: 1120, y: 1110 }, { x: 1125, y: 1098 }, { x: 1160, y: 1210 }], routineBySlot: { 0: [{ x: 1115, y: 1110 }, { x: 1120, y: 1085 }], 1: [{ x: 1160, y: 1210 }, { x: 1125, y: 1098 }], 2: [{ x: 1120, y: 1085 }, { x: 1115, y: 1110 }], 3: [{ x: 1115, y: 1115 }] } },
  { id: "khadija", name: "Khadija Ba", role: "Infirmière · musulmane pratiquante", portrait: "/avatars/khadija-ba.svg", shirt: "#8b5aa8", skin: "#63391f", hijab: "#6f8fb7", faith: "islam", practice: "pratiquant", x: 1260, y: 1170, radius: 52, routineStops: [{ x: 1260, y: 1170 }, { x: 1125, y: 1098 }, { x: 2720, y: 1810 }], routineBySlot: { 0: [{ x: 1125, y: 1098 }, { x: 1260, y: 1170 }], 1: [{ x: 2720, y: 1810 }, { x: 1260, y: 1170 }], 2: [{ x: 1125, y: 1098 }, { x: 1260, y: 1170 }], 3: [{ x: 1260, y: 1170 }] } },
  { id: "jean-baptiste", name: "Jean-Baptiste Diouf", role: "Infirmier · chrétien pratiquant", portrait: "/avatars/jean-baptiste-diouf.svg", shirt: "#4d7297", skin: "#75452b", faith: "christianisme", practice: "pratiquant", x: 1850, y: 1070, radius: 50, routineBySlot: { 0: [{ x: 1850, y: 1070 }, { x: 1870, y: 960 }], 1: [{ x: 2700, y: 1820 }, { x: 1850, y: 1070 }], 2: [{ x: 1870, y: 960 }, { x: 1850, y: 1070 }], 3: [{ x: 1850, y: 1070 }] } },
  { id: "priya", name: "Priya Raman", role: "Commerçante · hindoue pratiquante", portrait: "/avatars/priya-raman.svg", shirt: "#b84b38", skin: "#a96d49", faith: "hindouisme", practice: "pratiquante", x: 1900, y: 1360, radius: 50, routineBySlot: { 0: [{ x: 1900, y: 1360 }, { x: 1890, y: 1240 }], 1: [{ x: 1900, y: 1360 }, { x: 1700, y: 1450 }], 2: [{ x: 1890, y: 1240 }, { x: 1900, y: 1360 }], 3: [{ x: 1900, y: 1360 }] } },
  { id: "ananda", name: "Ananda Perera", role: "Étudiant · bouddhiste pratiquant", portrait: "/avatars/ananda-perera.svg", shirt: "#d29a3c", skin: "#b77b55", faith: "bouddhisme", practice: "pratiquant", x: 1900, y: 1640, radius: 50, routineBySlot: { 0: [{ x: 1900, y: 1640 }, { x: 1890, y: 1530 }], 1: [{ x: 2200, y: 1150 }, { x: 1900, y: 1640 }], 2: [{ x: 1890, y: 1530 }, { x: 1900, y: 1640 }], 3: [{ x: 1900, y: 1640 }] } },
  { id: "binta-sarr", name: "Binta Sarr", role: "Médiatrice · pratiquante des traditions sérères", portrait: "/avatars/binta-sarr.svg", shirt: "#94734b", skin: "#75452b", faith: "traditions_africaines", practice: "pratiquante", x: 1900, y: 1900, radius: 50, routineBySlot: { 0: [{ x: 1900, y: 1900 }, { x: 1890, y: 1800 }], 1: [{ x: 1500, y: 1760 }, { x: 1900, y: 1900 }], 2: [{ x: 1890, y: 1800 }, { x: 1900, y: 1900 }], 3: [{ x: 1900, y: 1900 }] } },
  { id: "esther-cohen", name: "Esther Cohen", role: "Médecin · juive pratiquante", portrait: "/avatars/esther-cohen.svg", shirt: "#477b91", skin: "#d5a17d", faith: "judaisme", practice: "pratiquante", x: 2150, y: 1830, radius: 50, routineBySlot: { 0: [{ x: 2150, y: 1830 }, { x: 2700, y: 1810 }], 1: [{ x: 2150, y: 1830 }, { x: 2160, y: 1940 }], 2: [{ x: 2160, y: 1940 }, { x: 2150, y: 1830 }], 3: [{ x: 2150, y: 1830 }] } },
  { id: "harjit-singh", name: "Harjit Singh", role: "Entrepreneur · sikh pratiquant", portrait: "/avatars/harjit-singh.svg", shirt: "#b97835", skin: "#9b6848", faith: "sikhisme", practice: "pratiquant", x: 2410, y: 1830, radius: 50, routineBySlot: { 0: [{ x: 2410, y: 1830 }, { x: 2410, y: 1940 }], 1: [{ x: 2410, y: 1830 }, { x: 2320, y: 1360 }], 2: [{ x: 2410, y: 1940 }, { x: 2410, y: 1830 }], 3: [{ x: 2410, y: 1830 }] } },
  { id: "maya-fall", name: "Maya Fall", role: "Étudiante · sans affiliation religieuse", portrait: "/avatars/maya-fall.svg", shirt: "#7b6ca8", skin: "#87502f", faith: "sans_pratique", practice: "non_précisé", x: 2220, y: 1080, radius: 50, routineBySlot: { 0: [{ x: 2220, y: 1080 }, { x: 2480, y: 900 }], 1: [{ x: 2200, y: 1150 }, { x: 2220, y: 1080 }], 2: [{ x: 2220, y: 1080 }], 3: [{ x: 2220, y: 1080 }] } },
  { id: "mame-diara-kaolack", name: "Mame Diara", role: "Commerçante à Médina Baye", portrait: "/avatars/amina-diallo.svg", shirt: "#b84b72", skin: "#75452b", x: 3910, y: 1160, radius: 65, routineStops: [{ x: 3910, y: 1160 }, { x: 4020, y: 1010 }, { x: 3850, y: 950 }] },
  { id: "serigne-mbacke-kaolack", name: "Serigne Mbacké", role: "Enseignant à Médina Baye", portrait: px(6109289, 400), shirt: "#e8dfc9", skin: "#5d3a22", faith: "islam", practice: "pratiquant", x: 3980, y: 590, radius: 55, routineStops: [{ x: 3980, y: 590 }, { x: 4100, y: 430 }, { x: 3980, y: 590 }] },
  { id: "awa-kaolack", name: "Awa Ndiaye", role: "Infirmière à l'hôpital régional", portrait: "/avatars/khadija-ba.svg", shirt: "#4f83a8", skin: "#75452b", hijab: "#d8b46a", faith: "islam", practice: "pratiquant", x: 4590, y: 1190, radius: 60, routineStops: [{ x: 4590, y: 1190 }, { x: 4600, y: 1050 }, { x: 4590, y: 1190 }] },
  { id: "ibrahima-kaolack", name: "Ibrahima", role: "Artisan", portrait: px(12179672, 400), shirt: "#c47b35", skin: "#5d3a22", x: 4140, y: 1880, radius: 70 },
  { id: "awa-thies", name: "Awa Seck", role: "Commerçante au marché de Thiès", portrait: "/avatars/amina-diallo.svg", shirt: "#b84b72", skin: "#75452b", x: 3920, y: 2700, radius: 58, routineStops: [{x:3920,y:2700},{x:4050,y:2580}] },
  { id: "moussa-thies", name: "Moussa Diop", role: "Mécanicien à Thiès", portrait: px(12179672,400), shirt: "#c47b35", skin: "#5d3a22", x: 3900, y: 3290, radius: 58 },
  { id: "khady-thies", name: "Khady Fall", role: "Infirmière · musulmane pratiquante", portrait: "/avatars/khadija-ba.svg", shirt: "#4f83a8", skin: "#75452b", hijab: "#d8b46a", faith: "islam", practice: "pratiquant", x: 4650, y: 2740, radius: 55 },
  { id: "serigne-touba", name: "Serigne Abdou", role: "Enseignant à Touba", portrait: px(6109289,400), shirt: "#e8dfc9", skin: "#5d3a22", faith: "islam", practice: "pratiquant", x: 3940, y: 3900, radius: 58 },
  { id: "fatou-touba", name: "Fatou Bousso", role: "Artisane à Touba", portrait: "/avatars/sokhna-mariama.svg", shirt: "#2f806b", skin: "#75452b", hijab: "#d8b46a", faith: "islam", practice: "pratiquant", x: 4650, y: 4380, radius: 55 },
];

export const LOVE_PORTRAITS = { H: px(6974965, 400), F: px(15254936, 400) };

/* ---------- Circulation ---------- */
export interface TrafficDef {
  id: string;
  kind: "taxi" | "bus" | "car";
  color: string;
  speed: number;
  path: Vec[];
}
export const TRAFFIC: TrafficDef[] = [
  { id: "taxi1", kind: "taxi", color: "#fdd835", speed: 150, path: [{ x: 640, y: 700 }, { x: 1780, y: 700 }, { x: 1780, y: 1240 }, { x: 640, y: 1240 }] },
  { id: "taxi2", kind: "taxi", color: "#fdd835", speed: 165, path: [{ x: 1780, y: 1240 }, { x: 2560, y: 1240 }, { x: 2560, y: 1840 }, { x: 1780, y: 1840 }] },
  { id: "taxi3", kind: "taxi", color: "#fbc02d", speed: 130, path: [{ x: 640, y: 1840 }, { x: 1100, y: 1840 }, { x: 1100, y: 2020 }, { x: 640, y: 2020 }] },
  { id: "bus1", kind: "bus", color: "#1e88e5", speed: 115, path: [{ x: 640, y: 700 }, { x: 2560, y: 700 }, { x: 2560, y: 1240 }, { x: 640, y: 1240 }] },
  { id: "car1", kind: "car", color: "#e53935", speed: 185, path: [{ x: 1780, y: 700 }, { x: 2560, y: 700 }, { x: 2560, y: 1240 }, { x: 1780, y: 1240 }] },
  { id: "car2", kind: "car", color: "#eceff1", speed: 175, path: [{ x: 640, y: 1240 }, { x: 1780, y: 1240 }, { x: 1780, y: 1840 }, { x: 640, y: 1840 }] },
  // Renfort de circulation : lignes supplémentaires pour densifier les déplacements urbains.
  { id: "bus2", kind: "bus", color: "#ef6c00", speed: 96, path: [{ x: 1780, y: 700 }, { x: 2560, y: 700 }, { x: 2560, y: 1840 }, { x: 1780, y: 1840 }] },
  { id: "taxi4", kind: "taxi", color: "#fdd835", speed: 145, path: [{ x: 1100, y: 1840 }, { x: 1780, y: 1840 }, { x: 1780, y: 1240 }, { x: 1100, y: 1240 }] },
  { id: "car3", kind: "car", color: "#43a047", speed: 190, path: [{ x: 640, y: 700 }, { x: 1100, y: 700 }, { x: 1100, y: 1240 }, { x: 640, y: 1240 }] },
  { id: "car4", kind: "car", color: "#8e24aa", speed: 160, path: [{ x: 2040, y: 1840 }, { x: 2560, y: 1840 }, { x: 2560, y: 1240 }, { x: 2040, y: 1240 }] },
  { id: "bus-thies", kind: "bus", color: "#ef6c00", speed: 105, path: [{ x: 3500, y: 2420 }, { x: 4550, y: 2420 }, { x: 4550, y: 2900 }, { x: 3500, y: 2900 }] },
  { id: "taxi-thies", kind: "taxi", color: "#fdd835", speed: 145, path: [{ x: 3500, y: 2900 }, { x: 4550, y: 2900 }, { x: 4550, y: 2420 }, { x: 3500, y: 2420 }] },
  { id: "bus-touba", kind: "bus", color: "#1e88e5", speed: 100, path: [{ x: 3500, y: 3600 }, { x: 4550, y: 3600 }, { x: 4550, y: 4300 }, { x: 3500, y: 4300 }] },
  { id: "taxi-touba", kind: "taxi", color: "#fbc02d", speed: 135, path: [{ x: 4550, y: 3600 }, { x: 4550, y: 4300 }, { x: 3500, y: 4300 }, { x: 3500, y: 3600 }] },
  { id: "taxi-kaolack", kind: "taxi", color: "#fdd835", speed: 135, path: [{ x: 3350, y: 800 }, { x: 4200, y: 800 }, { x: 4200, y: 1500 }, { x: 3350, y: 1500 }] },
  { id: "car-kaolack", kind: "car", color: "#43a047", speed: 155, path: [{ x: 4200, y: 800 }, { x: 5000, y: 800 }, { x: 5000, y: 1500 }, { x: 4200, y: 1500 }] },
];

/* ---------- Cibles de mission ---------- */
export const MISSION_TARGETS: Record<string, { pickup?: Vec; dropoff: Vec; place: string }> = {
  taxi_hopital: { dropoff: doorPos(BUILDINGS.find((b) => b.id === "hopital")!), place: "Hôpital Principal" },
  taxi_ucad: { dropoff: doorPos(BUILDINGS.find((b) => b.id === "ucad")!), place: "UCAD" },
  livraison_ucad: { pickup: { x: 1445, y: 1660 }, dropoff: doorPos(BUILDINGS.find((b) => b.id === "ucad")!), place: "Pr Fall, UCAD" },
  livraison_thieb: { pickup: { x: 1140, y: 1470 }, dropoff: doorPos(BUILDINGS.find((b) => b.id === "hopital")!), place: "Dr Kane, Hôpital" },
};

/* ---------- Collision ---------- */
export const SOLIDS: { x: number; y: number; w: number; h: number }[] = [
  ...BUILDINGS.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h })),
  ...HUTS.map((h) => ({ x: h.x, y: h.y, w: h.w, h: h.h })),
  ...BAOBABS.map((b) => ({ x: b.x - 14 * b.s, y: b.y - 10 * b.s, w: 28 * b.s, h: 20 * b.s })),
];

export function collide(px_: number, py: number, r: number): { x: number; y: number } {
  let x = Math.max(WORLD.minX, Math.min(WORLD.maxX, px_));
  let y = Math.max(WORLD.minY, Math.min(WORLD.maxY, py));
  for (const s of SOLIDS) {
    const nx = Math.max(s.x, Math.min(x, s.x + s.w));
    const ny = Math.max(s.y, Math.min(y, s.y + s.h));
    const dx = x - nx;
    const dy = y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      if (d2 === 0) {
        // centre à l'intérieur : pousser vers le bord le plus proche
        const left = x - s.x, right = s.x + s.w - x, top = y - s.y, bottom = s.y + s.h - y;
        const m = Math.min(left, right, top, bottom);
        if (m === left) x = s.x - r;
        else if (m === right) x = s.x + s.w + r;
        else if (m === top) y = s.y - r;
        else y = s.y + s.h + r;
      } else {
        const d = Math.sqrt(d2);
        x = nx + (dx / d) * r;
        y = ny + (dy / d) * r;
      }
    }
  }
  return { x, y };
}

export const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
