import type { Effects, Gender, PlayerState, Tone } from "./types";

/* ---------- Images (photos réelles haute résolution, sources 6K–8K) ---------- */
export const px = (id: number, w = 1200, ext: "jpeg" | "png" = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=${w}`;

export const IMG = {
  hero: px(37461627, 3840),
  heroCard: px(37461627, 1600),
  street: px(37904482),
  business: px(12179672),
  pirogues: px(37904491),
  lacRose: px(35594683, 1600, "png"),
  lacRoseBoats: px(35594681, 1200, "png"),
  salt: px(37301322),
  goree: px(12014943, 1600),
  market: px(35856106, 1600),
  fabrics: px(38487457),
  marketBenin: px(16274226),
  beach: px(15533213, 1600),
  resort: px(16562982),
  thieb: px(16627892),
  yassa: px(18805640),
  mafe: px(8166269),
  weddingRice: px(36707697),
  cafeTouba: px(33542011),
  attaya: px(31497982),
  mosque: px(15971159),
  baobab: px(36139778, 2400),
  friends: px(8910365),
  boatFriends: px(17027966),
  community: px(7951555),
  students: px(5538343),
  campus: px(6146971),
  villa: px(8134745, 1600),
  appart: px(30554297),
  studio: px(6238683),
  bedroom: px(7546564),
  family: px(39730377),
  familySelfie: px(6192012),
  dev: px(19805876),
  taxi: px(19967702),
  stadium: px(38345870, 1600),
  sabar: px(15474702, 1600),
  parade: px(32690097),
  lutte: px(33998297, 1600),
  surf: px(16354188),
  sunset: px(5006538, 1600),
  doctor: px(19131212),
  flag: px(14434228),
  monument: "/images/monument.jpg",
};

/* ---------- Helpers ---------- */
export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n));

export const SLOT_NAMES = ["Matin", "Après-midi", "Soir", "Nuit"];
export const SLOT_ICONS = ["🌅", "☀️", "🌇", "🌙"];
export const EDU_NAMES = ["Sans diplôme", "BFEM", "Bac", "Licence", "Master"];
export const ageOf = (day: number) => 18 + Math.floor((day - 1) / 30);

export const rankOf = (shifts: number) =>
  shifts >= 25
    ? { label: "Senior", mult: 1.8 }
    : shifts >= 10
      ? { label: "Confirmé", mult: 1.4 }
      : { label: "Débutant", mult: 1 };

export const weeklyRent = (rent: number) => Math.round(rent / 4);

/* ---------- Avatars ---------- */
export interface Avatar {
  id: string;
  gender: Gender;
  url: string;
  vibe: string;
}
export const AVATARS: Avatar[] = [
  { id: "a1", gender: "H", url: px(6109343, 600), vibe: "Le sage du quartier" },
  { id: "a2", gender: "H", url: px(6974965, 600), vibe: "Le jeune ambitieux" },
  { id: "a3", gender: "H", url: px(6109289, 600), vibe: "L'élégant boubou" },
  { id: "a4", gender: "F", url: px(31183851, 600), vibe: "La fierté teranga" },
  { id: "a5", gender: "F", url: px(2256401, 600), vibe: "La battante souriante" },
  { id: "a6", gender: "F", url: px(20094904, 600), vibe: "La reine de Dakar" },
];

export const NAME_SUGGESTIONS: Record<Gender, string[]> = {
  H: ["Moussa Diop", "Ibrahima Ndiaye", "Cheikh Fall", "Ousmane Sarr", "Pape Gueye", "Mamadou Ba"],
  F: ["Awa Diallo", "Fatou Sy", "Aïssatou Kane", "Mariama Faye", "Khady Sow", "Coumba Diagne"],
};

export const PARTNER_NAMES: Record<Gender, string[]> = {
  H: ["Awa", "Fatou", "Aïssatou", "Mariama", "Khady", "Coumba"],
  F: ["Moussa", "Ibrahima", "Cheikh", "Ousmane", "Mamadou", "Pape"],
};

/* ---------- Quartiers d'origine ---------- */
export interface Origin {
  id: string;
  name: string;
  desc: string;
  image: string;
  emoji: string;
  bonusLabel: string;
  bonus: Effects;
}
export const ORIGINS: Origin[] = [
  {
    id: "medina", name: "Médina", emoji: "🏘️", image: IMG.street,
    desc: "Le cœur battant de Dakar. Ici, tout le monde te connaît.",
    bonusLabel: "+12 Teranga", bonus: { reputation: 12 },
  },
  {
    id: "plateau", name: "Plateau", emoji: "💼", image: IMG.business,
    desc: "Banques, ministères et costards. La famille a des relations.",
    bonusLabel: "+15 000 FCFA", bonus: { money: 15000 },
  },
  {
    id: "yoff", name: "Yoff", emoji: "🌊", image: IMG.beach,
    desc: "Village lébou, plage et spiritualité au bord de l'Atlantique.",
    bonusLabel: "+8 Santé, +5 Bonheur", bonus: { health: 8, happiness: 5 },
  },
  {
    id: "parcelles", name: "Parcelles Assainies", emoji: "🏙️", image: IMG.marketBenin,
    desc: "La banlieue qui bouge : solidarité, foot et débrouille.",
    bonusLabel: "+10 Énergie", bonus: { energy: 10 },
  },
];

/* ---------- Logements ---------- */
export interface Home {
  id: string;
  name: string;
  quartier: string;
  rent: number; // mensuel
  comfort: number; // 1..5
  image: string;
  desc: string;
}
export const HOMES: Home[] = [
  {
    id: "famille", name: "Chez la famille", quartier: "Médina", rent: 0, comfort: 1,
    image: IMG.family, desc: "Une chambre chez tonton. Bruyante, mais pleine de teranga.",
  },
  {
    id: "coloc", name: "Coloc entre amis", quartier: "Parcelles Assainies", rent: 40000, comfort: 2,
    image: IMG.bedroom, desc: "Trois amis, un salon, des fous rires jusqu'à minuit.",
  },
  {
    id: "studio", name: "Studio moderne", quartier: "Sacré-Cœur", rent: 120000, comfort: 3,
    image: IMG.studio, desc: "Ton premier vrai chez-toi. Calme et bien placé.",
  },
  {
    id: "appart", name: "Appartement standing", quartier: "Plateau", rent: 350000, comfort: 4,
    image: IMG.appart, desc: "Vue sur la ville, gardien, clim. Tu as percé.",
  },
  {
    id: "villa", name: "Villa avec piscine", quartier: "Almadies", rent: 1200000, comfort: 5,
    image: IMG.villa, desc: "Le rêve sénégalais : piscine, jardin et océan à deux pas.",
  },
];

/* ---------- Métiers ---------- */
export interface Job {
  id: string;
  title: string;
  salary: number; // par journée de travail
  edu: number;
  rep: number;
  energy: number;
  image: string;
  emoji: string;
  desc: string;
  cityId?: "dakar" | "kaolack" | "thies" | "touba";
}
export const JOBS: Job[] = [
  { id: "vendeur", title: "Vendeur à Sandaga", salary: 4500, edu: 0, rep: 0, energy: 25, emoji: "🛍️", image: IMG.market, desc: "Négocie tissus et babouches du matin au soir." },
  { id: "pecheur", title: "Pêcheur à Soumbédioune", salary: 6000, edu: 0, rep: 0, energy: 35, emoji: "🎣", image: IMG.pirogues, desc: "Pirogue à l'aube, thiof et dorades au retour." },
  { id: "couturier", title: "Tailleur au marché HLM", salary: 5500, edu: 0, rep: 0, energy: 25, emoji: "🧵", image: IMG.fabrics, desc: "Boubous brodés et tenues de Tabaski." },
  { id: "serveur", title: "Serveur aux Almadies", salary: 5000, edu: 0, rep: 10, energy: 28, emoji: "🍽️", image: IMG.thieb, desc: "Service face à l'océan, pourboires de touristes." },
  { id: "chauffeur", title: "Chauffeur de car rapide", salary: 8500, edu: 0, rep: 15, energy: 30, emoji: "🚌", image: IMG.street, desc: "« Plateau ! Plateau ! » — l'art de la conduite dakaroise." },
  { id: "guide", title: "Guide à Gorée", salary: 9000, edu: 1, rep: 25, energy: 22, emoji: "🏛️", image: IMG.goree, desc: "Raconte l'histoire de l'île aux visiteurs du monde entier." },
  { id: "enseignant", title: "Enseignant", salary: 11000, edu: 2, rep: 30, energy: 24, emoji: "📚", image: IMG.campus, desc: "Former la jeunesse sénégalaise, tableau noir et craie." },
  { id: "developpeur", title: "Développeur à Diamniadio", salary: 18000, edu: 3, rep: 20, energy: 22, emoji: "💻", image: IMG.dev, desc: "Code dans la Silicon Valley de l'Afrique de l'Ouest." },
  { id: "medecin", title: "Médecin à l'hôpital Principal", salary: 32000, edu: 4, rep: 40, energy: 30, emoji: "🩺", image: IMG.doctor, desc: "Sauver des vies, le métier le plus respecté." },
  // Emplois dédiés à l'économie locale de Kaolack.
  { id: "vendeur-kaolack", title: "Commerçant au marché central de Kaolack", salary: 4200, edu: 0, rep: 0, energy: 24, emoji: "🥜", image: IMG.market, desc: "Vendre arachides, céréales et produits du quotidien.", cityId: "kaolack" },
  { id: "artisan-kaolack", title: "Artisan à Kasnack", salary: 5800, edu: 0, rep: 5, energy: 28, emoji: "🧵", image: IMG.fabrics, desc: "Fabriquer, réparer et vendre des objets artisanaux.", cityId: "kaolack" },
  { id: "infirmier-kaolack", title: "Infirmier à l'hôpital régional", salary: 14500, edu: 3, rep: 15, energy: 27, emoji: "🩺", image: IMG.doctor, desc: "Accueillir les patients et participer aux soins.", cityId: "kaolack" },
  { id: "enseignant-kaolack", title: "Enseignant à l'école de quartier", salary: 10500, edu: 2, rep: 10, energy: 23, emoji: "📚", image: IMG.campus, desc: "Accompagner les élèves dans leurs apprentissages.", cityId: "kaolack" },
  { id: "vendeur-thies", title: "Commerçant au marché de Thiès", salary: 4700, edu: 0, rep: 0, energy: 24, emoji: "🛍️", image: IMG.market, desc: "Tenir un étal et servir les clients du marché.", cityId: "thies" },
  { id: "infirmier-thies", title: "Infirmier au centre hospitalier de Thiès", salary: 13800, edu: 3, rep: 12, energy: 27, emoji: "🩺", image: IMG.doctor, desc: "Participer à l'accueil et aux soins des patients.", cityId: "thies" },
  { id: "enseignant-thies", title: "Enseignant à Thiès", salary: 10800, edu: 2, rep: 10, energy: 23, emoji: "📚", image: IMG.campus, desc: "Accompagner les élèves dans leurs apprentissages.", cityId: "thies" },
  { id: "vendeur-touba", title: "Commerçant au marché de Touba", salary: 4600, edu: 0, rep: 0, energy: 24, emoji: "🛍️", image: IMG.market, desc: "Vendre des produits du quotidien au marché.", cityId: "touba" },
  { id: "artisan-touba", title: "Artisan à Touba", salary: 6200, edu: 0, rep: 5, energy: 28, emoji: "🧵", image: IMG.fabrics, desc: "Fabriquer et réparer des articles artisanaux.", cityId: "touba" },
];

export const jobSalaryPreview = (job: Job, shifts: number, energy: number, happiness: number) => {
  const { mult } = rankOf(shifts);
  return Math.round((job.salary * mult * (0.85 + energy / 400 + happiness / 500)) / 50) * 50;
};

/* ---------- Cuisine ---------- */
export interface Food {
  id: string;
  name: string;
  price: number;
  emoji: string;
  image: string;
  desc: string;
  fx: Effects;
}
export const FOODS: Food[] = [
  { id: "thieb", name: "Thiéboudienne", price: 2500, emoji: "🍛", image: IMG.thieb, desc: "Le plat national : riz au poisson, légumes fondants.", fx: { satiety: 45, happiness: 8, energy: 5 } },
  { id: "yassa", name: "Yassa poulet", price: 2000, emoji: "🍗", image: IMG.yassa, desc: "Poulet mariné, oignons caramélisés, citron vert.", fx: { satiety: 38, happiness: 6 } },
  { id: "mafe", name: "Mafé", price: 1800, emoji: "🥘", image: IMG.mafe, desc: "Sauce onctueuse à la pâte d'arachide.", fx: { satiety: 34, happiness: 5 } },
  { id: "cafe", name: "Café Touba", price: 300, emoji: "☕", image: IMG.cafeTouba, desc: "Le café épicé au djar, vendu au coin de la rue.", fx: { satiety: 4, happiness: 2, energy: 12 } },
];

/* ---------- Lieux à explorer ---------- */
export interface Place {
  id: string;
  name: string;
  price: number;
  emoji: string;
  image: string;
  desc: string;
  tag: string;
  fx: Effects;
}
export const PLACES: Place[] = [
  { id: "ngor", name: "Plage de Ngor", price: 0, emoji: "🏖️", tag: "Gratuit", image: IMG.beach, desc: "Sable doré, vagues turquoise et pieds dans l'eau.", fx: { happiness: 10, energy: -10, health: 3 } },
  { id: "goree", name: "Île de Gorée", price: 5200, emoji: "⛴️", tag: "Culture", image: IMG.goree, desc: "Chaloupe, ruelles ocre et mémoire de l'histoire.", fx: { happiness: 18, energy: -14, knowledge: 4, reputation: 2 } },
  { id: "monument", name: "Monument de la Renaissance", price: 2000, emoji: "🗽", tag: "Iconique", image: IMG.monument, desc: "52 mètres de bronze face à l'Atlantique.", fx: { happiness: 10, energy: -8, knowledge: 3 } },
  { id: "mosquee", name: "Mosquée de la Divinité", price: 0, emoji: "🕌", tag: "Sérénité", image: IMG.mosque, desc: "Minarets blancs posés entre ciel et océan.", fx: { happiness: 7, energy: -5, health: 2 } },
  { id: "mosquee-medina", name: "Mosquée de la Médina", price: 0, emoji: "🕌", tag: "Recueillement", image: IMG.mosque, desc: "Un lieu de prière et de rencontre au cœur du quartier.", fx: { happiness: 7, energy: -5, health: 2 } },
  { id: "eglise", name: "Église Saint-Pierre", price: 0, emoji: "⛪", tag: "Recueillement", image: IMG.goree, desc: "Un lieu de prière, de chants et de solidarité pour la communauté chrétienne du jeu.", fx: { happiness: 7, energy: -5, health: 1 } },
  { id: "temple-hindou", name: "Maison de prière hindoue", price: 0, emoji: "🛕", tag: "Recueillement", image: IMG.market, desc: "Un espace fictif de prière et de rencontre pour des habitants hindous.", fx: { happiness: 7, energy: -5, health: 1 } },
  { id: "centre-meditation", name: "Centre de méditation", price: 0, emoji: "🪷", tag: "Méditation", image: IMG.baobab, desc: "Un lieu fictif de méditation et de pratique bouddhiste, ouvert aux visiteurs respectueux.", fx: { happiness: 7, energy: -4, health: 1 } },
  { id: "maison-cultures", name: "Maison des traditions", price: 0, emoji: "🌿", tag: "Patrimoine", image: IMG.baobab, desc: "Un espace culturel pour découvrir la diversité des traditions spirituelles locales, sans les réduire à une seule pratique.", fx: { happiness: 5, energy: -3, knowledge: 2 } },
  { id: "synagogue", name: "Maison communautaire Beth Shalom", price: 0, emoji: "✡️", tag: "Rencontre et recueillement", image: IMG.community, desc: "Un lieu fictif de rencontre et de recueillement pour les personnages juifs du jeu. Les visiteurs sont invités à respecter les pratiques et les temps de prière.", fx: { happiness: 7, energy: -4, knowledge: 2 } },
  { id: "gurdwara", name: "Gurdwara — Maison du partage", price: 0, emoji: "🪯", tag: "Service et partage", image: IMG.community, desc: "Un lieu fictif de prière et de service communautaire associé à la tradition sikhe. L'accueil et le partage y sont mis en avant.", fx: { happiness: 7, energy: -4, reputation: 2 } },
  { id: "sandaga", name: "Shopping à Sandaga", price: 3000, emoji: "🛍️", tag: "Marché", image: IMG.market, desc: "Le marché mythique : tout se trouve, tout se négocie.", fx: { happiness: 8, energy: -10, reputation: 2 } },
  { id: "stade", name: "Match des Lions", price: 1500, emoji: "⚽", tag: "Sport", image: IMG.stadium, desc: "Stade Abdoulaye Wade, ambiance de folie.", fx: { happiness: 12, energy: -6 } },
  { id: "lutte", name: "Combat de lutte", price: 2000, emoji: "🤼", tag: "Tradition", image: IMG.lutte, desc: "La lutte sénégalaise, sport roi, tambours et gris-gris.", fx: { happiness: 14, energy: -6, reputation: 1 } },
  { id: "sabar", name: "Soirée sabar", price: 4000, emoji: "🥁", tag: "Fête", image: IMG.sabar, desc: "Tambours sabar, danse jusqu'au bout de la nuit.", fx: { happiness: 14, energy: -12, reputation: 2 } },
  { id: "surf", name: "Surf à Yoff", price: 6000, emoji: "🏄", tag: "Océan", image: IMG.surf, desc: "Les vagues de la baie, session au coucher du soleil.", fx: { happiness: 13, energy: -18, health: 5 } },
  { id: "lacRose", name: "Lac Rose", price: 18000, emoji: "🧂", tag: "Excursion", image: IMG.lacRose, desc: "L'eau rose du lac Retba et les récolteurs de sel.", fx: { happiness: 25, energy: -20, knowledge: 2 } },
  { id: "saloum", name: "Delta du Saloum", price: 25000, emoji: "🛶", tag: "Aventure", image: IMG.baobab, desc: "Pirogue dans les bolongs, mangroves et baobabs.", fx: { happiness: 28, energy: -22, knowledge: 3 } },
];

/* ---------- Vie sociale ---------- */
export interface Social {
  id: string;
  name: string;
  price: number;
  emoji: string;
  image: string;
  desc: string;
  fx: Effects;
}
export const SOCIALS: Social[] = [
  { id: "famille", name: "Appeler la famille", price: 0, emoji: "📞", image: IMG.familySelfie, desc: "Des nouvelles de maman, des bénédictions en bonus.", fx: { happiness: 7, reputation: 3 } },
  { id: "attaya", name: "Attaya avec les amis", price: 500, emoji: "🍵", image: IMG.attaya, desc: "Trois doses de thé, refaire le monde jusqu'au crépuscule.", fx: { happiness: 7, reputation: 4, energy: 4 } },
  { id: "voisin", name: "Aider un voisin", price: 0, emoji: "🤝", image: IMG.community, desc: "Porter les sacs, garder les enfants. La vraie teranga.", fx: { happiness: 4, reputation: 8, energy: -10 } },
  { id: "amis", name: "Sortie entre amis", price: 2500, emoji: "😄", image: IMG.boatFriends, desc: "Balade en pirogue et éclats de rire sur l'eau.", fx: { happiness: 10, reputation: 3, energy: -8 } },
  { id: "ceremonie", name: "Cérémonie de quartier", price: 5000, emoji: "🎉", image: IMG.parade, desc: "Baptême ou mariage : tu donnes, tu manges, tu comptes.", fx: { happiness: 9, reputation: 9, satiety: 25 } },
];

export const DATE_COST = 8000;
export const MARRY_COST = 200000;
export const MARRY_DATES_REQUIRED = 4;

/* ---------- Business ---------- */
export interface Business {
  id: string;
  name: string;
  cost: number;
  income: number; // par jour
  emoji: string;
  image: string;
  desc: string;
  cityId?: "dakar" | "kaolack" | "thies" | "touba";
}
export const BUSINESSES: Business[] = [
  { id: "table", name: "Table au marché", cost: 60000, income: 2500, emoji: "🧺", image: IMG.market, desc: "Une table, des légumes frais, des clients fidèles." },
  { id: "boutique", name: "Boutique de quartier", cost: 350000, income: 10000, emoji: "🏪", image: IMG.marketBenin, desc: "Riz, huile, sucre : l'essentiel du quotidien." },
  { id: "resto", name: "Resto « Chez Awa »", cost: 900000, income: 18000, emoji: "🍲", image: IMG.mafe, desc: "Thieb le midi, yassa le soir. Ça ne désemplit pas." },
  { id: "taxi", name: "Taxi mis en location", cost: 1800000, income: 30000, emoji: "🚕", image: IMG.taxi, desc: "Un chauffeur, une voiture jaune, la recette du jour." },
  // Investissements locaux disponibles uniquement à Kaolack.
  { id: "table-kaolack", name: "Étal d'arachides et céréales", cost: 45000, income: 2200, emoji: "🥜", image: IMG.market, desc: "Un petit étal au marché central, approvisionné en arachides et céréales.", cityId: "kaolack" },
  { id: "boutique-kaolack", name: "Boutique de Kasnack", cost: 280000, income: 8000, emoji: "🏪", image: IMG.marketBenin, desc: "Une boutique de proximité pour les habitants du quartier.", cityId: "kaolack" },
  { id: "atelier-kaolack", name: "Atelier artisanal de Kaolack", cost: 450000, income: 12000, emoji: "🧵", image: IMG.fabrics, desc: "Un atelier qui fabrique et répare des articles pour les habitants.", cityId: "kaolack" },
  { id: "taxi-kaolack-business", name: "Taxi en location à Kaolack", cost: 1200000, income: 22000, emoji: "🚕", image: IMG.taxi, desc: "Un taxi confié à un chauffeur pour les déplacements urbains.", cityId: "kaolack" },
  { id: "etale-thies", name: "Étal du marché de Thiès", cost: 55000, income: 2800, emoji: "🧺", image: IMG.market, desc: "Un étal de produits du marché.", cityId: "thies" },
  { id: "atelier-thies", name: "Atelier de réparation de Thiès", cost: 390000, income: 10500, emoji: "🛠️", image: IMG.fabrics, desc: "Un atelier de réparation et de services.", cityId: "thies" },
  { id: "etale-touba", name: "Étal commercial de Touba", cost: 60000, income: 3000, emoji: "🛍️", image: IMG.market, desc: "Un commerce de proximité au marché.", cityId: "touba" },
  { id: "atelier-touba", name: "Atelier artisanal de Touba", cost: 420000, income: 11500, emoji: "🧵", image: IMG.fabrics, desc: "Un atelier artisanal avec clientèle locale.", cityId: "touba" },
];

/* ---------- Missions du monde ouvert ---------- */
export interface MissionDef {
  id: string;
  label: string;
  reward: number;
  emoji: string;
}
export const MISSIONS: MissionDef[] = [
  { id: "taxi_hopital", label: "Course : conduire le passager à l'hôpital", reward: 3500, emoji: "🚕" },
  { id: "taxi_ucad", label: "Course : déposer l'étudiant à l'UCAD", reward: 3000, emoji: "🚕" },
  { id: "livraison_ucad", label: "Livraison : colis urgent au Pr Fall (UCAD)", reward: 2500, emoji: "📦" },
  { id: "livraison_thieb", label: "Livraison : thieb chaud au Dr Kane (hôpital)", reward: 2800, emoji: "🍛" },
];
export const MAX_MISSIONS_PER_DAY = 3;

export const PROVERBS = [
  "« Ndank ndank mooy japp golo ci ñaay » — petit à petit, on attrape le singe dans la forêt.",
  "« Ku am ndeysane, am na yoon » — qui a de la patience trouve toujours un chemin.",
  "« Nit, nit ay garabam » — l'homme est le remède de l'homme. Aide ton voisin.",
  "« Bëgg bëgg, jëf jëf » — vouloir, c'est bien ; faire, c'est mieux. Va travailler !",
  "« Xam-xam bu ñu wéet » — le savoir qu'on partage ne diminue jamais. Révise à l'UCAD.",
];

/* ---------- Études ---------- */
export interface Exam {
  level: number;
  name: string;
  cost: number;
  req: number;
}
export const EXAMS: Exam[] = [
  { level: 1, name: "BFEM", cost: 5000, req: 25 },
  { level: 2, name: "Baccalauréat", cost: 15000, req: 50 },
  { level: 3, name: "Licence (UCAD)", cost: 60000, req: 80 },
  { level: 4, name: "Master (UCAD)", cost: 120000, req: 110 },
];
export const STUDY_COST = 1500;

/* ---------- Succès ---------- */
export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
}
export const ACHIEVEMENTS: Achievement[] = [
  { id: "salaire", name: "Premier salaire", desc: "Travailler une première journée", emoji: "💵" },
  { id: "bac", name: "Le Bac en poche", desc: "Obtenir le baccalauréat", emoji: "🎓" },
  { id: "master", name: "Diplômé Master", desc: "Atteindre le plus haut diplôme", emoji: "🧠" },
  { id: "goree", name: "Mémoire de Gorée", desc: "Visiter l'île de Gorée", emoji: "⛴️" },
  { id: "lacrose", name: "Lac Rose vu", desc: "Voir les eaux roses du lac Retba", emoji: "🧂" },
  { id: "explorer", name: "Explorateur", desc: "Visiter 6 lieux différents", emoji: "🧭" },
  { id: "millionaire", name: "Millionnaire", desc: "Posséder 1 000 000 FCFA", emoji: "💰" },
  { id: "married", name: "Marié(e)", desc: "Célébrer ton mariage", emoji: "💍" },
  { id: "villa", name: "Villa aux Almadies", desc: "Habiter une villa avec piscine", emoji: "🏝️" },
  { id: "empire", name: "Empire du business", desc: "Posséder 3 businesses", emoji: "🏗️" },
  { id: "teranga", name: "Star de la Teranga", desc: "Atteindre 80 de réputation", emoji: "🤝" },
  { id: "senior", name: "Promu Senior", desc: "25 jours dans le même métier", emoji: "📈" },
];

export const achievementCondition: Record<string, (s: PlayerState) => boolean> = {
  salaire: (s) => s.totalShifts >= 1,
  bac: (s) => s.education >= 2,
  master: (s) => s.education >= 4,
  goree: (s) => s.visited.includes("goree"),
  lacrose: (s) => s.visited.includes("lacRose"),
  explorer: (s) => s.visited.length >= 6,
  millionaire: (s) => s.money >= 1000000,
  married: (s) => s.relation >= 2,
  villa: (s) => s.homeId === "villa",
  empire: (s) => s.businesses.length >= 3,
  teranga: (s) => s.stats.reputation >= 80,
  senior: (s) => s.shifts >= 25,
};

/* ---------- Événements aléatoires de la vie dakaroise ---------- */
export interface RandomEvent {
  w: number;
  text: string;
  icon: string;
  tone: Tone;
  fx: Effects;
  cond?: (s: PlayerState) => boolean;
}
export const RANDOM_EVENTS: RandomEvent[] = [
  { w: 10, text: "Hivernage : une pluie torrentielle inonde les rues de ton quartier.", icon: "🌧️", tone: "bad", fx: { happiness: -5, health: -2 } },
  { w: 8, text: "Coupure Senelec ! Pas de courant ce soir, tu veilles à la bougie.", icon: "🕯️", tone: "bad", fx: { energy: -6, happiness: -3 } },
  { w: 10, text: "Un voisin partage son thieb avec toi. La teranga dans toute sa splendeur !", icon: "🍛", tone: "good", fx: { satiety: 15, happiness: 5, reputation: 2 } },
  { w: 8, text: "Les Lions du Sénégal gagnent ! Tout le quartier danse dans la rue.", icon: "⚽", tone: "good", fx: { happiness: 10 } },
  { w: 9, text: "Embouteillage monstre sur la VDN. Deux heures perdues dans un car rapide.", icon: "🚌", tone: "bad", fx: { energy: -8, happiness: -3 } },
  { w: 6, text: "Tu trouves un billet de 2 000 FCFA près de l'arrêt de bus !", icon: "💸", tone: "good", fx: { money: 2000, happiness: 4 } },
  { w: 5, text: "Un pickpocket sévit à Sandaga... Ton portefeuille s'allège.", icon: "😤", tone: "bad", fx: { money: -3000, happiness: -5 }, cond: (s) => s.money > 6000 },
  { w: 6, text: "La famille t'envoie un mandat : « Achète-toi à manger, mon enfant. »", icon: "📱", tone: "good", fx: { money: 5000, happiness: 5 } },
  { w: 7, text: "Nuit de moustiques. Petite fièvre au réveil, palu qui rôde.", icon: "🦟", tone: "bad", fx: { health: -7, energy: -4 } },
  { w: 7, text: "Concert gratuit sur la Corniche ! Tu danses le mbalax jusqu'au soir.", icon: "🎶", tone: "good", fx: { happiness: 8, energy: -4 } },
  { w: 6, text: "Le marchand de café Touba te sert un verre offert. « Yalla na Yalla dolli. »", icon: "☕", tone: "good", fx: { energy: 8, happiness: 3 } },
  { w: 5, text: "La brise marine des Almadies chasse la chaleur. Nuit parfaite.", icon: "🌊", tone: "good", fx: { health: 3, happiness: 4 } },
  { w: 5, text: "Coupure d'eau en plein ménage. Tu attends la citerne du quartier.", icon: "🚰", tone: "bad", fx: { happiness: -4 } },
  { w: 4, text: "Un touriste te prend en photo avec son grand appareil. Star locale !", icon: "📸", tone: "good", fx: { reputation: 4, happiness: 4 } },
];

export const pickWeighted = (events: RandomEvent[], s: PlayerState): RandomEvent | null => {
  const pool = events.filter((e) => !e.cond || e.cond(s));
  const total = pool.reduce((a, e) => a + e.w, 0);
  let r = Math.random() * total;
  for (const e of pool) {
    r -= e.w;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1] ?? null;
};

export const WORK_FLAVORS = [
  "Journée rondement menée, le patron sourit.",
  "Tu as géré comme un chef aujourd'hui.",
  "Grosse affluence, mais tu tiens le rythme.",
  "Un collègue t'a couvert pendant la pause attaya.",
  "Le travail était dur, mais digne.",
];

export const homeById = (id: string) => HOMES.find((h) => h.id === id) ?? HOMES[0];
export const jobById = (id: string | null) => (id ? JOBS.find((j) => j.id === id) ?? null : null);
export const originById = (id: string) => ORIGINS.find((o) => o.id === id) ?? ORIGINS[0];
