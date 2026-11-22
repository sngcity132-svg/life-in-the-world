import {
  ACHIEVEMENTS,
  BUSINESSES,
  DATE_COST,
  EDU_NAMES,
  EXAMS,
  FOODS,
  HOMES,
  JOBS,
  MARRY_COST,
  MARRY_DATES_REQUIRED,
  MAX_MISSIONS_PER_DAY,
  MISSIONS,
  ORIGINS,
  originById,
  PARTNER_NAMES,
  PLACES,
  RANDOM_EVENTS,
  SOCIALS,
  STUDY_COST,
  WORK_FLAVORS,
  achievementCondition,
  homeById,
  jobById,
  pickWeighted,
  rankOf,
  weeklyRent,
} from "./data";
import type {
  ActionPayload,
  ChildState,
  DraftEvent,
  Effects,
  Gender,
  PlayerState,
} from "./types";
import type { PlayerRow } from "@/db/schema";

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const FAMILY_META_PREFIX = "__litw_family_v1__:";
const CITY_META_PREFIX = "__litw_city_v1__:";
const BIZ_META_PREFIX = "__litw_business_ops_v1__:";

function extractFamilyMeta(achievements: string[] = []): { achievements: string[]; children: ChildState[]; cityId: "dakar" | "kaolack" | "thies" | "touba"; businessOps: NonNullable<PlayerState["businessOps"]> } {
  const marker = achievements.find((item) => item.startsWith(FAMILY_META_PREFIX));
  let children: ChildState[] = [];
  if (marker) {
    try {
      const parsed = JSON.parse(decodeURIComponent(marker.slice(FAMILY_META_PREFIX.length)));
      if (Array.isArray(parsed)) children = parsed.filter((child) => child && typeof child.id === "string" && typeof child.name === "string");
    } catch { children = []; }
  }
  const cityMarker = achievements.find((item) => item.startsWith(CITY_META_PREFIX));
  const rawCity = cityMarker?.slice(CITY_META_PREFIX.length);
  const cityId = rawCity === "kaolack" || rawCity === "thies" || rawCity === "touba" ? rawCity : "dakar";
  const bizMarker = achievements.find((item) => item.startsWith(BIZ_META_PREFIX));
  let businessOps: NonNullable<PlayerState["businessOps"]> = {};
  if (bizMarker) { try { const parsed = JSON.parse(decodeURIComponent(bizMarker.slice(BIZ_META_PREFIX.length))); if (parsed && typeof parsed === "object") businessOps = parsed; } catch { businessOps = {}; } }
  return { achievements: achievements.filter((item) => !item.startsWith(FAMILY_META_PREFIX) && !item.startsWith(CITY_META_PREFIX) && !item.startsWith(BIZ_META_PREFIX)), children, cityId, businessOps };
}

function persistAchievements(s: PlayerState): string[] {
  const clean = (s.achievements ?? []).filter((item) => !item.startsWith(FAMILY_META_PREFIX) && !item.startsWith(CITY_META_PREFIX) && !item.startsWith(BIZ_META_PREFIX));
  const metadata = [...clean, `${CITY_META_PREFIX}${s.cityId ?? "dakar"}`, `${BIZ_META_PREFIX}${encodeURIComponent(JSON.stringify(s.businessOps ?? {}))}`];
  if (!s.children?.length) return metadata;
  return [...metadata, `${FAMILY_META_PREFIX}${encodeURIComponent(JSON.stringify(s.children))}`];
}

const CHILD_NAMES: Record<Gender, string[]> = {
  H: ["Moussa", "Ibrahima", "Amadou", "Cheikh", "Mamadou", "Ousmane"],
  F: ["Aïssatou", "Fatou", "Mariama", "Aminata", "Ndeye", "Sokhna"],
};

export function rowToState(r: PlayerRow): PlayerState {
  const family = extractFamilyMeta(r.achievements ?? []);
  return {
    id: r.id,
    name: r.name,
    gender: r.gender as Gender,
    avatar: r.avatar,
    origin: r.origin,
    cityId: family.cityId,
    day: r.day,
    slot: r.slot,
    money: r.money,
    stats: {
      health: r.health,
      energy: r.energy,
      satiety: r.satiety,
      happiness: r.happiness,
      reputation: r.reputation,
    },
    knowledge: r.knowledge,
    education: r.education,
    jobId: r.jobId,
    shifts: r.shifts,
    totalShifts: r.totalShifts,
    missionsToday: r.missionsToday,
    homeId: r.homeId,
    businesses: r.businesses ?? [],
    businessOps: family.businessOps,
    visited: r.visited ?? [],
    partnerName: r.partnerName,
    relation: r.relation,
    dates: r.dates,
    achievements: family.achievements,
    children: family.children,
    alive: r.alive,
    createdAt: r.createdAt.toISOString(),
  };
}

export function stateToRow(s: PlayerState) {
  return {
    name: s.name,
    gender: s.gender,
    avatar: s.avatar,
    origin: s.origin,
    day: s.day,
    slot: s.slot,
    money: s.money,
    health: s.stats.health,
    energy: s.stats.energy,
    satiety: s.stats.satiety,
    happiness: s.stats.happiness,
    reputation: s.stats.reputation,
    knowledge: s.knowledge,
    education: s.education,
    jobId: s.jobId,
    shifts: s.shifts,
    totalShifts: s.totalShifts,
    missionsToday: s.missionsToday,
    homeId: s.homeId,
    businesses: s.businesses,
    visited: s.visited,
    partnerName: s.partnerName,
    relation: s.relation,
    dates: s.dates,
    achievements: persistAchievements(s),
    alive: s.alive,
    updatedAt: new Date(),
  };
}

export function applyEffects(s: PlayerState, fx: Effects) {
  if (fx.money) s.money = Math.max(0, s.money + fx.money);
  if (fx.health) s.stats.health = clamp(s.stats.health + fx.health);
  if (fx.energy) s.stats.energy = clamp(s.stats.energy + fx.energy);
  if (fx.satiety) s.stats.satiety = clamp(s.stats.satiety + fx.satiety);
  if (fx.happiness) s.stats.happiness = clamp(s.stats.happiness + fx.happiness);
  if (fx.reputation) s.stats.reputation = clamp(s.stats.reputation + fx.reputation);
  if (fx.knowledge) s.knowledge = Math.min(160, s.knowledge + fx.knowledge);
}

export function initialState(input: {
  name: string;
  gender: Gender;
  avatar: string;
  origin: string;
}): PlayerState {
  const origin = ORIGINS.find((o) => o.id === input.origin) ?? ORIGINS[0];
  const s: PlayerState = {
    id: "",
    name: input.name,
    gender: input.gender,
    avatar: input.avatar,
    origin: origin.id,
    cityId: "dakar",
    day: 1,
    slot: 0,
    money: 30000,
    stats: { health: 80, energy: 90, satiety: 70, happiness: 65, reputation: 20 },
    knowledge: 0,
    education: 0,
    jobId: null,
    shifts: 0,
    totalShifts: 0,
    missionsToday: 0,
    homeId: "famille",
    businesses: [],
    businessOps: {},
    visited: [],
    partnerName: null,
    relation: 0,
    dates: 0,
    children: [],
    achievements: [],
    alive: true,
    createdAt: new Date().toISOString(),
  };
  applyEffects(s, origin.bonus);
  return s;
}

export function welcomeEvents(s: PlayerState): DraftEvent[] {
  return [
    {
      text: `Dalal ak diam, ${s.name} ! 🇸🇳 Te voilà à ${originById(s.origin).name}, à Dakar, à 18 ans, avec ${new Intl.NumberFormat("fr-FR").format(s.money)} FCFA en poche et toute la vie devant toi.`,
      tone: "epic",
      icon: "🌅",
    },
    {
      text: "Déplace-toi avec ZQSD / WASD / flèches, cours avec Maj, interagis avec E, ouvre ton téléphone avec P. Explore la ville, parle aux habitants, conduis des taxis !",
      tone: "info",
      icon: "🎮",
    },
    {
      text: "Chaque journée offre 3 moments : matin, après-midi et soir. Travaille, mange, explore… puis dors chez toi pour passer au jour suivant.",
      tone: "info",
      icon: "💡",
    },
  ];
}

function checkAchievements(s: PlayerState, drafts: DraftEvent[]) {
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements.includes(a.id) && achievementCondition[a.id]?.(s)) {
      s.achievements.push(a.id);
      applyEffects(s, { happiness: 5 });
      drafts.push({ text: `Succès débloqué — ${a.name} ${a.emoji} : ${a.desc}.`, tone: "epic", icon: "🏆" });
    }
  }
}

function checkDeath(s: PlayerState, drafts: DraftEvent[]) {
  if (s.stats.health <= 0 && s.alive) {
    s.alive = false;
    drafts.push({
      text: `Ton corps a lâché après ${s.day} jours de lutte. La vie à Dakar t'a emporté… mais chaque histoire mérite une suite.`,
      tone: "bad",
      icon: "🕊️",
    });
  }
}

function advanceDay(s: PlayerState, drafts: DraftEvent[]) {
  const home = homeById(s.homeId);
  const oldDay = s.day;

  // Sommeil
  applyEffects(s, { energy: 35 + home.comfort * 13, satiety: -18 });
  if (s.stats.satiety <= 5) {
    applyEffects(s, { health: -10, happiness: -5 });
    drafts.push({ text: "Tu t'es endormi le ventre vide. Ton santé en pâtit sérieusement.", tone: "bad", icon: "😖" });
  } else if (s.stats.satiety > 40) {
    applyEffects(s, { health: 4 });
  }

  // Humeur
  let mood = s.stats.happiness > 55 ? -2 : 2;
  mood += home.comfort - 1;
  if (s.relation >= 2) mood += 3;
  if (s.stats.satiety < 25) mood -= 6;
  applyEffects(s, { happiness: mood });

  // Gestion quotidienne : stock, employés, niveau et charges d'exploitation.
  let netBusiness = 0;
  for (const id of s.businesses) {
    const biz = BUSINESSES.find((b) => b.id === id);
    if (!biz) continue;
    const ops = s.businessOps ?? (s.businessOps = {});
    const state = ops[id] ?? (ops[id] = { stock: 3, employees: 0, level: 1 });
    const branches = Math.max(1, state.branches ?? 1);
    const stockFactor = state.stock > 0 ? 1 : 0;
    const levelFactor = 1 + Math.max(0, state.level - 1) * 0.18;
    const employeeFactor = 1 + Math.min(state.employees, 3) * 0.12;
    const sameCityCount = s.businesses.filter((ownedId) => {
      const owned = BUSINESSES.find((item) => item.id === ownedId);
      return (owned?.cityId ?? "dakar") === (biz.cityId ?? "dakar");
    }).length;
    const competitionFactor = Math.max(0.68, 1 - Math.max(0, sameCityCount - 1) * 0.055);
    const marketVariation = 0.88 + Math.random() * 0.25;
    const gross = Math.round(biz.income * stockFactor * levelFactor * employeeFactor * branches * competitionFactor * marketVariation);
    const wages = state.employees * 1800;
    const operating = Math.round(biz.income * 0.12 * branches);
    const net = gross - wages - operating;
    netBusiness += net;
    if (state.stock > 0) state.stock = Math.max(0, state.stock - branches);
  }
  if (netBusiness !== 0) {
    applyEffects(s, { money: netBusiness });
    drafts.push({ text: `Bilan de tes entreprises : ${netBusiness >= 0 ? "+" : "−"}${new Intl.NumberFormat("fr-FR").format(Math.abs(netBusiness))} FCFA net après charges et salaires.`, tone: netBusiness >= 0 ? "good" : "bad", icon: "💰" });
  }

  // Loyer hebdomadaire
  if (oldDay % 7 === 0 && home.rent > 0) {
    const rent = weeklyRent(home.rent);
    if (s.money >= rent) {
      applyEffects(s, { money: -rent });
      drafts.push({ text: `Fin de semaine : loyer de ${new Intl.NumberFormat("fr-FR").format(rent)} FCFA payé pour « ${home.name} ».`, tone: "info", icon: "🏠" });
    } else {
      s.money = 0;
      s.homeId = "famille";
      applyEffects(s, { happiness: -12, reputation: -6 });
      drafts.push({ text: "Loyer impayé… Le propriétaire t'a mis dehors. Retour chez la famille à la Médina.", tone: "bad", icon: "📦" });
    }
  }

  s.day += 1;
  s.slot = 0;
  s.missionsToday = 0;

  // Les enfants grandissent avec le calendrier de la partie.
  for (const child of s.children ?? []) {
    child.ageDays += 1;
    if (Math.random() < 0.16) {
      const change = rand(-2, 4);
      child.happiness = clamp(child.happiness + change);
      if (change >= 3) drafts.push({ text: `${child.name} a passé une belle journée. Un moment de jeu et d'attention lui a fait du bien.`, tone: "good", icon: "🧸" });
      else if (change <= -2) drafts.push({ text: `${child.name} réclame davantage d'attention aujourd'hui. Prendre du temps ensemble pourra lui faire du bien.`, tone: "info", icon: "🧒" });
    }
    if (child.ageDays > 0 && child.ageDays % 360 === 0) {
      drafts.push({ text: `Anniversaire de ${child.name} ! ${Math.floor(child.ageDays / 360)} an(s) déjà. Le temps passe vite dans votre famille.`, tone: "epic", icon: "🎂" });
      applyEffects(s, { happiness: 8 });
    }
  }

  // Fêtes religieuses et nationales
  if (s.day % 30 === 0) {
    if (s.money >= 25000) {
      applyEffects(s, { money: -25000, happiness: 12, reputation: 8, satiety: 30 });
      drafts.push({ text: "Tabaski ! Tu participes au mouton de la famille (−25 000 FCFA). Grillades et bénédictions pour tous.", tone: "epic", icon: "🐏" });
    } else {
      applyEffects(s, { happiness: -5, satiety: 10 });
      drafts.push({ text: "C'est la Tabaski… Pas de mouton cette année, mais les voisins partagent leur viande.", tone: "info", icon: "🐏" });
    }
  } else if (s.day % 45 === 12) {
    applyEffects(s, { happiness: 8, reputation: 5, energy: -8 });
    drafts.push({ text: "Magal de Touba : la ville tourne au ralenti, ferveur et prières sur toutes les routes.", tone: "info", icon: "🕌" });
  } else if (s.day % 20 === 5) {
    applyEffects(s, { happiness: 6, reputation: 3 });
    drafts.push({ text: "Appel à la prière au crépuscule, les tambours du quartier résonnent. Dakar est vivante.", tone: "good", icon: "🥁" });
  } else if (Math.random() < 0.65) {
    const ev = pickWeighted(RANDOM_EVENTS, s);
    if (ev) {
      applyEffects(s, ev.fx);
      drafts.push({ text: ev.text, tone: ev.tone, icon: ev.icon });
    }
  }

  // Vie familiale autonome : des événements narratifs surviennent au fil des jours.
  // Ils utilisent les statistiques déjà sauvegardées et ne nécessitent pas de migration.
  if (s.partnerName && s.relation >= 1 && Math.random() < 0.42) {
    const householdEvent = rand(1, 4);
    if (s.relation >= 2) {
      if (householdEvent === 1) {
        applyEffects(s, { happiness: 4, satiety: 10 });
        drafts.push({ text: `${s.partnerName} a préparé le petit-déjeuner. Vous commencez la journée en prenant le temps de discuter ensemble.`, tone: "good", icon: "🥣" });
      } else if (householdEvent === 2) {
        applyEffects(s, { happiness: 5, energy: 5 });
        drafts.push({ text: `${s.partnerName} t'encourage dans tes projets. Ce soutien te redonne de l'énergie pour la journée.`, tone: "good", icon: "💞" });
      } else if (householdEvent === 3) {
        applyEffects(s, { happiness: -3 });
        drafts.push({ text: `Un petit désaccord sur l'organisation du foyer avec ${s.partnerName}. Vous devrez en reparler calmement.`, tone: "info", icon: "💬" });
      } else {
        applyEffects(s, { satiety: 8, happiness: 3 });
        drafts.push({ text: `Vous organisez ensemble les repas et les dépenses de la maison. La vie commune demande de l'entraide.`, tone: "good", icon: "🏡" });
      }
    } else {
      applyEffects(s, { happiness: householdEvent === 3 ? -2 : 3 });
      drafts.push({
        text: householdEvent === 3
          ? `${s.partnerName} est très occupé(e) aujourd'hui. Vous convenez de prendre du temps ensemble bientôt.`
          : `Un message de ${s.partnerName} au réveil. Vous échangez quelques nouvelles et prenez de vos projets.`,
        tone: householdEvent === 3 ? "info" : "good",
        icon: "💌",
      });
    }
  } else if (!s.partnerName && Math.random() < 0.18) {
    const familyEvent = rand(1, 3);
    if (familyEvent === 1) {
      applyEffects(s, { satiety: 10, happiness: 3 });
      drafts.push({ text: "Un proche t'envoie un repas préparé à la maison. Un geste simple qui te rappelle que tu peux compter sur les tiens.", tone: "good", icon: "🍲" });
    } else if (familyEvent === 2) {
      applyEffects(s, { happiness: 4, reputation: 1 });
      drafts.push({ text: "Un ancien de la famille t'appelle pour prendre de tes nouvelles et te donner un conseil. Tu te sens soutenu(e).", tone: "good", icon: "📞" });
    } else {
      applyEffects(s, { happiness: 2 });
      drafts.push({ text: "Des nouvelles circulent dans la famille. Tu prends quelques minutes pour répondre aux messages des proches.", tone: "info", icon: "👨‍👩‍👧‍👦" });
    }
  }

  const currentCity = ({ dakar: "Dakar", kaolack: "Kaolack", thies: "Thiès", touba: "Touba" } as const)[s.cityId ?? "dakar"];
  drafts.push({ text: `Jour ${s.day} — ${s.name}, ${18 + Math.floor((s.day - 1) / 30)} ans. Le soleil se lève sur ${currentCity}.`, tone: "info", icon: "🌅" });
  checkDeath(s, drafts);
}

export interface EngineResult {
  error?: string;
  state: PlayerState;
  drafts: DraftEvent[];
}

export function performAction(current: PlayerState, action: ActionPayload): EngineResult {
  const s: PlayerState = structuredClone(current);
  s.children = Array.isArray(s.children) ? s.children : [];
  const drafts: DraftEvent[] = [];
  const fail = (error: string): EngineResult => ({ error, state: current, drafts: [] });

  if (!s.alive) return fail("Cette vie est terminée. Commence une nouvelle histoire.");

  const needSlot = () => s.slot >= 3;
  const slotError = `La nuit est tombée sur ${({ dakar: "Dakar", kaolack: "Kaolack", thies: "Thiès", touba: "Touba" } as const)[s.cityId ?? "dakar"]}. Dors pour commencer une nouvelle journée. 🌙`;

  switch (action.type) {
    case "sleep": {
      advanceDay(s, drafts);
      break;
    }

    case "mission": {
      const mission = MISSIONS.find((m) => m.id === action.id);
      if (!mission) return fail("Mission inconnue.");
      if (s.missionsToday >= MAX_MISSIONS_PER_DAY)
        return fail(`Tu as déjà fait ${MAX_MISSIONS_PER_DAY} missions aujourd'hui. Repose-toi, demain sera un autre jour.`);
      if (s.stats.energy < 8) return fail("Trop épuisé(e) pour une mission. Mange ou dors d'abord.");
      applyEffects(s, { money: mission.reward, reputation: 2, happiness: 2, energy: -8 });
      s.missionsToday += 1;
      drafts.push({
        text: `${mission.label} — accomplie ! +${new Intl.NumberFormat("fr-FR").format(mission.reward)} FCFA. Le quartier te fait confiance.`,
        tone: "good",
        icon: mission.emoji,
      });
      break;
    }

    case "eat": {
      const food = FOODS.find((f) => f.id === action.id);
      if (!food) return fail("Plat introuvable.");
      if (s.stats.satiety >= 98) return fail("Tu es complètement rassasié(e). Garde une place pour le thieb de demain !");
      if (s.money < food.price) return fail(`Il te faut ${food.price} FCFA pour ${food.name}.`);
      applyEffects(s, { money: -food.price, ...food.fx });
      drafts.push({ text: `${food.name} ${food.emoji} — un régal ! ${food.price > 0 ? `−${food.price} FCFA.` : ""}`, tone: "good", icon: food.emoji });
      break;
    }

    case "work": {
      const job = jobById(s.jobId);
      if (!job) return fail("Tu n'as pas de métier. Parle aux commerçants ou postule via ton téléphone (P).");
      if (needSlot()) return fail(slotError);
      if (s.stats.health < 20) return fail("Tu es trop malade pour travailler. Va à l'hôpital.");
      if (s.stats.energy < job.energy) return fail("Tu es épuisé(e). Mange un morceau, fais une sieste ou dors.");
      const before = rankOf(s.shifts).label;
      const gain = Math.round((job.salary * rankOf(s.shifts).mult * (0.85 + s.stats.energy / 400 + s.stats.happiness / 500)) / 50) * 50;
      applyEffects(s, { money: gain, energy: -job.energy, satiety: -12, happiness: -4, reputation: 1 });
      s.shifts += 1;
      s.totalShifts += 1;
      s.slot += 1;
      drafts.push({ text: `${job.title} : +${new Intl.NumberFormat("fr-FR").format(gain)} FCFA. ${pick(WORK_FLAVORS)}`, tone: "good", icon: job.emoji });
      const after = rankOf(s.shifts).label;
      if (after !== before) {
        applyEffects(s, { happiness: 8, reputation: 4 });
        drafts.push({ text: `Promotion ! Te voilà ${after} — ton salaire augmente. Yewwi na ! 📈`, tone: "epic", icon: "📈" });
      }
      break;
    }

    case "rest": {
      if (needSlot()) return fail(slotError);
      applyEffects(s, { energy: 22, satiety: -4, happiness: 2 });
      s.slot += 1;
      drafts.push({ text: "Sieste à l'ombre du manguier. Le quartier bourdonne doucement. 😴", tone: "info", icon: "😴" });
      break;
    }

    case "hospital": {
      if (needSlot()) return fail(slotError);
      if (s.money < 12500) return fail("La consultation coûte 12 500 FCFA. La famille peut peut-être aider…");
      applyEffects(s, { money: -12500 });
      s.stats.health = 92;
      s.stats.energy = 65;
      s.slot += 1;
      drafts.push({ text: "Hôpital Principal : consultation, piqûre contre le palu et vitamines. Te voilà requinqué(e) ! 🏥", tone: "good", icon: "🏥" });
      break;
    }

    case "study": {
      if (needSlot()) return fail(slotError);
      if (s.stats.energy < 20) return fail("Trop fatigué(e) pour réviser. Repose-toi d'abord.");
      if (s.money < STUDY_COST) return fail(`Les fournitures coûtent ${STUDY_COST} FCFA.`);
      const gain = rand(6, 9);
      applyEffects(s, { money: -STUDY_COST, energy: -18, satiety: -6, happiness: -2, knowledge: gain });
      s.slot += 1;
      drafts.push({ text: `Cours du soir à la fac : +${gain} connaissances. Le savoir est la vraie richesse. 📖`, tone: "good", icon: "📖" });
      break;
    }

    case "exam": {
      if (s.education >= 4) return fail("Tu as déjà le Master, le sommet des diplômes !");
      const exam = EXAMS[s.education];
      if (needSlot()) return fail(slotError);
      if (s.knowledge < exam.req) return fail(`Il faut ${exam.req} connaissances pour tenter le ${exam.name} (tu en as ${s.knowledge}).`);
      if (s.money < exam.cost) return fail(`Les frais d'examen coûtent ${new Intl.NumberFormat("fr-FR").format(exam.cost)} FCFA.`);
      if (s.stats.energy < 15) return fail("Impossible de passer un examen en étant épuisé(e).");
      applyEffects(s, { money: -exam.cost, energy: -15, satiety: -6 });
      s.slot += 1;
      const chance = Math.min(0.95, 0.55 + (s.knowledge - exam.req) * 0.012 + s.stats.energy / 500);
      if (Math.random() < chance) {
        s.education = exam.level;
        applyEffects(s, { happiness: 15, reputation: 6 });
        drafts.push({ text: `ADMIS(E) AU ${exam.name.toUpperCase()} ! 🎉 La famille organise une cérémonie, tout le quartier est fier.`, tone: "epic", icon: "🎓" });
      } else {
        applyEffects(s, { happiness: -8, knowledge: 4 });
        drafts.push({ text: `Échec au ${exam.name}… « Ndank ndank mooy japp golo ci ñaay » — doucement, doucement, on attrape le singe dans la forêt. Retente ta chance.`, tone: "bad", icon: "📉" });
      }
      break;
    }

    case "apply": {
      const job = JOBS.find((j) => j.id === action.id);
      if (!job) return fail("Métier introuvable.");
      if (job.cityId && job.cityId !== (s.cityId ?? "dakar")) return fail(`Ce poste est proposé uniquement à ${({ dakar: "Dakar", kaolack: "Kaolack", thies: "Thiès", touba: "Touba" } as const)[job.cityId]}.`);
      if (s.jobId === job.id) return fail("Tu occupes déjà ce poste.");
      if (s.education < job.edu) return fail(`Ce poste exige le diplôme : ${EDU_NAMES[job.edu]}.`);
      if (s.stats.reputation < job.rep) return fail(`Il faut ${job.rep} de réputation pour ce poste (tu en as ${s.stats.reputation}).`);
      s.jobId = job.id;
      s.shifts = 0;
      applyEffects(s, { happiness: 4 });
      drafts.push({ text: `Embauché(e) ! ${job.emoji} ${job.title} — environ ${new Intl.NumberFormat("fr-FR").format(job.salary)} FCFA par journée travaillée.`, tone: "epic", icon: "💼" });
      break;
    }

    case "quit": {
      if (!s.jobId) return fail("Tu n'as pas de poste à quitter.");
      const job = jobById(s.jobId);
      s.jobId = null;
      s.shifts = 0;
      drafts.push({ text: `Tu quittes ton poste de ${job?.title ?? "travail"}. Nouveau chapitre.`, tone: "info", icon: "🚪" });
      break;
    }

    case "move": {
      const home = HOMES.find((h) => h.id === action.id);
      if (!home) return fail("Logement introuvable.");
      if (s.homeId === home.id) return fail("Tu habites déjà ici.");
      const upfront = weeklyRent(home.rent) * 2;
      if (s.money < upfront) return fail(`Il faut ${new Intl.NumberFormat("fr-FR").format(upfront)} FCFA (caution + première semaine).`);
      applyEffects(s, { money: -upfront, happiness: home.comfort * 2 });
      s.homeId = home.id;
      drafts.push({
        text: home.id === "famille"
          ? "Retour chez la famille à la Médina. Le thieb de maman n'a pas de prix."
          : `Déménagement ! ${home.name} aux ${home.quartier}. ${upfront > 0 ? `−${new Intl.NumberFormat("fr-FR").format(upfront)} FCFA (caution + semaine).` : ""}`,
        tone: home.comfort >= 4 ? "epic" : "good",
        icon: "🏠",
      });
      break;
    }

    case "visit": {
      const place = PLACES.find((p) => p.id === action.id);
      if (!place) return fail("Lieu introuvable.");
      if (needSlot()) return fail(slotError);
      if (s.stats.health < 15) return fail("Trop affaibli(e) pour sortir. Soigne-toi d'abord.");
      if (s.stats.energy < 12) return fail("Tu n'as plus d'énergie pour cette sortie.");
      if (s.money < place.price) return fail(`Cette sortie coûte ${new Intl.NumberFormat("fr-FR").format(place.price)} FCFA.`);
      applyEffects(s, { money: -place.price, ...place.fx });
      s.slot += 1;
      const first = !s.visited.includes(place.id);
      if (first) s.visited.push(place.id);
      drafts.push({ text: `${place.name} ${place.emoji} — ${place.desc}${first ? " (première visite !)" : ""}`, tone: "good", icon: place.emoji });
      if (place.id === "stade" && Math.random() < 0.55) {
        applyEffects(s, { happiness: 6 });
        drafts.push({ text: "GOOOAL des Lions ! Le stade explose, tu perds ta voix dans les chants. 🦁", tone: "epic", icon: "⚽" });
      }
      break;
    }

    case "social": {
      const social = SOCIALS.find((x) => x.id === action.id);
      if (!social) return fail("Activité introuvable.");
      if (needSlot()) return fail(slotError);
      if (s.money < social.price) return fail(`Il te faut ${new Intl.NumberFormat("fr-FR").format(social.price)} FCFA.`);
      if ((social.fx.energy ?? 0) < 0 && s.stats.energy < 10) return fail("Trop fatigué(e) pour cette activité.");
      applyEffects(s, { money: -social.price, ...social.fx });
      s.slot += 1;
      drafts.push({ text: `${social.name} ${social.emoji} — ${social.desc}`, tone: "good", icon: social.emoji });
      break;
    }

    case "adopt_child": {
      if (s.relation < 2 || !s.partnerName) return fail("Ce projet familial nécessite d'abord un mariage dans cette partie.");
      if ((s.children ?? []).length >= 3) return fail("Ton foyer accueille déjà trois enfants dans cette version.");
      if (needSlot()) return fail(slotError);
      const adoptionCost = 50000;
      if (s.money < adoptionCost) return fail(`Prévois ${new Intl.NumberFormat("fr-FR").format(adoptionCost)} FCFA pour les frais et les premiers besoins de l'accueil.`);
      if (s.stats.energy < 12) return fail("Tu as besoin de repos avant de préparer l'accueil d'un enfant.");
      const gender: Gender = Math.random() < 0.5 ? "H" : "F";
      const child: ChildState = {
        id: `child-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: pick(CHILD_NAMES[gender]),
        gender,
        ageDays: 2 * 360,
        happiness: 70,
      };
      s.children = [...(s.children ?? []), child];
      applyEffects(s, { money: -adoptionCost, energy: -12, happiness: 18, reputation: 3 });
      s.slot += 1;
      drafts.push({ text: `Un nouveau chapitre commence : ${child.name} (${gender === "H" ? "garçon" : "fille"}, 2 ans) rejoint votre foyer dans le cadre d'une adoption. Vous préparez ensemble son accueil et son avenir.`, tone: "epic", icon: "🧸" });
      break;
    }

    case "parenting": {
      const child = (s.children ?? []).find((item) => item.id === action.id);
      if (!child) return fail("Enfant introuvable dans ce foyer.");
      if (needSlot()) return fail(slotError);
      if (s.money < 1000) return fail("Il te faut 1 000 FCFA pour cette sortie ou activité familiale.");
      if (s.stats.energy < 5) return fail("Tu es trop fatigué(e) pour t'occuper de l'enfant maintenant.");
      applyEffects(s, { money: -1000, energy: -5, happiness: 8 });
      child.happiness = clamp(child.happiness + 14);
      s.slot += 1;
      drafts.push({ text: `Tu consacres un moment à ${child.name} : jeu, discussion et attention. Son bien-être progresse et votre lien se renforce.`, tone: "good", icon: "👨‍👧" });
      break;
    }

    case "family_visit": {
      if (needSlot()) return fail(slotError);
      const visitCost = 2000;
      if (s.stats.energy < 8) return fail("Tu es trop fatigué(e) pour rendre visite à ta famille. Repose-toi d'abord.");
      if (s.money < visitCost) return fail(`Le déplacement pour voir ta famille coûte ${new Intl.NumberFormat("fr-FR").format(visitCost)} FCFA.`);
      applyEffects(s, { money: -visitCost, energy: -8, satiety: -4, happiness: 14, reputation: 4 });
      s.slot += 1;
      drafts.push({
        text: s.homeId === "famille"
          ? "Après une journée bien remplie, tu partages un moment avec les tiens à la Médina. Les nouvelles, les conseils et le repas familial te font du bien."
          : "Tu rends visite à tes proches. Les nouvelles du quartier, les conseils des anciens et ce moment partagé te redonnent du courage.",
        tone: "good",
        icon: "👨‍👩‍👧‍👦",
      });
      break;
    }

    case "date": {
      if (needSlot()) return fail(slotError);
      if (s.money < DATE_COST) return fail(`Un beau rendez-vous coûte ${new Intl.NumberFormat("fr-FR").format(DATE_COST)} FCFA.`);
      applyEffects(s, { money: -DATE_COST, happiness: 12, energy: -6 });
      s.slot += 1;
      if (!s.partnerName) {
        const opposite: Gender = s.gender === "H" ? "F" : "H";
        s.partnerName = pick(PARTNER_NAMES[opposite]);
        s.relation = 1;
        s.dates = 1;
        drafts.push({ text: `Coucher de soleil sur la Corniche… Tu rencontres ${s.partnerName}. Le courant passe, vos rires se répondent. 💘`, tone: "epic", icon: "💘" });
      } else if (s.relation >= 2) {
        s.dates += 1;
        drafts.push({ text: `Dîner en amoureux avec ${s.partnerName}. Poisson braisé, bougies et projets d'avenir.`, tone: "good", icon: "❤️" });
      } else {
        s.dates += 1;
        const ready = s.dates >= MARRY_DATES_REQUIRED;
        drafts.push({
          text: ready
            ? `${s.dates} rendez-vous avec ${s.partnerName}… C'est le grand amour. Le mariage est désormais possible ! 💍`
            : `Rendez-vous n°${s.dates} avec ${s.partnerName} au bord de l'océan. Ça devient sérieux (${MARRY_DATES_REQUIRED} rendez-vous avant le mariage).`,
          tone: ready ? "epic" : "good",
          icon: "💞",
        });
      }
      break;
    }

    case "marry": {
      if (!s.partnerName || s.relation < 1) return fail("Il faut d'abord rencontrer l'âme sœur…");
      if (s.relation >= 2) return fail(`Tu es déjà marié(e) avec ${s.partnerName} !`);
      if (s.dates < MARRY_DATES_REQUIRED) return fail(`Encore ${MARRY_DATES_REQUIRED - s.dates} rendez-vous avant de demander la main de ${s.partnerName}.`);
      if (needSlot()) return fail(slotError);
      if (s.money < MARRY_COST) return fail(`La cérémonie coûte ${new Intl.NumberFormat("fr-FR").format(MARRY_COST)} FCFA (dot, traiteur, sabar).`);
      applyEffects(s, { money: -MARRY_COST, happiness: 25, reputation: 15, satiety: 30 });
      s.relation = 2;
      s.slot += 1;
      drafts.push({ text: `MARIAGE avec ${s.partnerName} ! 💍 Trois jours de fête, boubous brodés, sabar et bénédictions des anciens. Ngëneel lu am solo !`, tone: "epic", icon: "💍" });
      break;
    }

    case "transport": {
      const routes: Record<string, { from: string; to: string; fare: number }> = {
        "yoff-medina": { from: "Yoff", to: "Médina", fare: 500 },
        "yoff-plateau": { from: "Yoff", to: "Plateau", fare: 700 },
        "medina-yoff": { from: "Médina", to: "Yoff", fare: 500 },
        "medina-plateau": { from: "Médina", to: "Plateau", fare: 500 },
        "medina-ucad": { from: "Médina", to: "Campus UCAD", fare: 400 },
        "plateau-medina": { from: "Plateau", to: "Médina", fare: 500 },
        "plateau-ucad": { from: "Plateau", to: "Campus UCAD", fare: 500 },
        "ucad-medina": { from: "Campus UCAD", to: "Médina", fare: 400 },
        "dakar-kaolack": { from: "Dakar", to: "Kaolack", fare: 3500 },
        "kaolack-dakar": { from: "Kaolack", to: "Dakar", fare: 3500 },
        "dakar-thies": { from: "Dakar", to: "Thiès", fare: 2500 },
        "thies-dakar": { from: "Thiès", to: "Dakar", fare: 2500 },
        "kaolack-thies": { from: "Kaolack", to: "Thiès", fare: 2500 },
        "thies-kaolack": { from: "Thiès", to: "Kaolack", fare: 2500 },
        "thies-touba": { from: "Thiès", to: "Touba", fare: 3000 },
        "touba-thies": { from: "Touba", to: "Thiès", fare: 3000 },
      };
      const route = action.id ? routes[action.id] : undefined;
      if (!route) return fail("Cette ligne de transport n'existe pas.");
      if (s.money < route.fare) return fail(`Il te faut ${route.fare} FCFA pour le trajet ${route.from} → ${route.to}.`);
      applyEffects(s, { money: -route.fare, happiness: 2, energy: -1 });
      const destinations: Record<string, PlayerState["cityId"]> = { "dakar-kaolack": "kaolack", "kaolack-dakar": "dakar", "dakar-thies": "thies", "thies-dakar": "dakar", "kaolack-thies": "thies", "thies-kaolack": "kaolack", "thies-touba": "touba", "touba-thies": "thies" };
      if (action.id && destinations[action.id]) s.cityId = destinations[action.id];
      drafts.push({ text: `Trajet interurbain : ${route.from} → ${route.to}. −${route.fare} FCFA.`, tone: "good", icon: "🚌" });
      break;
    }

    case "buy": {
      const biz = BUSINESSES.find((b) => b.id === action.id);
      if (!biz) return fail("Business introuvable.");
      if (biz.cityId && biz.cityId !== (s.cityId ?? "dakar")) return fail(`Cet investissement est disponible uniquement à ${({ dakar: "Dakar", kaolack: "Kaolack", thies: "Thiès", touba: "Touba" } as const)[biz.cityId]}.`);
      if (s.businesses.includes(biz.id)) return fail("Tu possèdes déjà ce business.");
      if (s.money < biz.cost) return fail(`Investissement requis : ${new Intl.NumberFormat("fr-FR").format(biz.cost)} FCFA.`);
      applyEffects(s, { money: -biz.cost, happiness: 6, reputation: 3 });
      s.businesses.push(biz.id);
      s.businessOps ??= {};
      s.businessOps[biz.id] = { stock: 3, employees: 0, level: 1, branches: 1 };
      drafts.push({ text: `${biz.name} ${biz.emoji} lancé ! Stock initial : 3 unités. Pense à réapprovisionner et à suivre les charges pour rester rentable.`, tone: "epic", icon: "🏗️" });
      break;
    }

    case "manage-business": {
      const [operation, businessId] = (action.id ?? "").split(":");
      const biz = BUSINESSES.find((b) => b.id === businessId);
      if (!biz || !s.businesses.includes(businessId)) return fail("Cette entreprise ne t'appartient pas.");
      s.businessOps ??= {};
      const state = s.businessOps[businessId] ?? (s.businessOps[businessId] = { stock: 0, employees: 0, level: 1, branches: 1 });
      if (operation === "stock") {
        const units = Math.min(3, 10 - state.stock);
        if (units <= 0) return fail("Le stock est déjà au maximum de 10 unités.");
        const cost = Math.max(1000, Math.round(Math.max(5000, biz.cost * 0.025) * units / 3));
        if (s.money < cost) return fail(`Réapprovisionnement : ${new Intl.NumberFormat("fr-FR").format(cost)} FCFA nécessaires.`);
        applyEffects(s, { money: -cost }); state.stock += units;
        drafts.push({ text: `Stock renouvelé pour ${biz.name} : +${units} unité(s). Dépense : ${cost.toLocaleString("fr-FR")} FCFA.`, tone: "good", icon: "📦" });
      } else if (operation === "hire") {
        if (state.employees >= 3) return fail("Cette entreprise a déjà atteint son effectif maximal de 3 employés.");
        const cost = 5000;
        if (s.money < cost) return fail("Il faut 5 000 FCFA pour recruter et former un employé.");
        applyEffects(s, { money: -cost }); state.employees += 1;
        drafts.push({ text: `Un employé rejoint ${biz.name}. Prévois 1 800 FCFA de salaire quotidien supplémentaire.`, tone: "good", icon: "👥" });
      } else if (operation === "branch") {
        const branches = Math.max(1, state.branches ?? 1);
        if (branches >= 3) return fail("Tu possèdes déjà trois points de vente pour cette enseigne.");
        const cost = Math.round(biz.cost * 0.6);
        if (s.money < cost) return fail(`Nouvelle succursale : ${new Intl.NumberFormat("fr-FR").format(cost)} FCFA nécessaires.`);
        applyEffects(s, { money: -cost, reputation: 2 }); state.branches = branches + 1; state.stock = Math.min(10, state.stock + 2);
        drafts.push({ text: `Nouvelle succursale ouverte pour ${biz.name} ! Tu gères maintenant ${state.branches} points de vente.`, tone: "epic", icon: "🏬" });
      } else if (operation === "upgrade") {
        if (state.level >= 3) return fail("Cette entreprise a déjà atteint le niveau maximal.");
        const cost = Math.round(biz.cost * (0.35 + state.level * 0.15));
        if (s.money < cost) return fail(`Amélioration : ${new Intl.NumberFormat("fr-FR").format(cost)} FCFA nécessaires.`);
        applyEffects(s, { money: -cost, reputation: 2 }); state.level += 1;
        drafts.push({ text: `${biz.name} passe au niveau ${state.level}. Sa capacité de revenus augmente, avec des charges d'exploitation.`, tone: "epic", icon: "📈" });
      } else return fail("Opération de gestion inconnue.");
      break;
    }

    default:
      return fail("Action inconnue.");
  }

  checkAchievements(s, drafts);
  checkDeath(s, drafts);
  return { state: s, drafts };
}
