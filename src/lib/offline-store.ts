import type { GameEvent, GameSummary, PlayerState, ActionPayload } from "./types";
import { initialState, performAction, welcomeEvents } from "./engine";

const GAMES_KEY = "sama-life-games-v1";
const MAX_GAMES = 12;
const MAX_EVENTS = 150;
const RETRY_EVENTS = 40;

type LocalGame = { player: PlayerState; events: GameEvent[] };
type GameStore = Record<string, LocalGame>;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // JSON corrompu, stockage bloqué ou mode privé : l'application reste utilisable.
    return fallback;
  }
}

function isLocalGame(value: unknown): value is LocalGame {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LocalGame>;
  return Boolean(
    candidate.player &&
    typeof candidate.player.id === "string" &&
    typeof candidate.player.name === "string" &&
    typeof candidate.player.day === "number" &&
    Array.isArray(candidate.events),
  );
}

function readGames(): GameStore {
  const raw = read<Record<string, unknown>>(GAMES_KEY, {});
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, LocalGame] => isLocalGame(entry[1])),
  );
}

/**
 * Écrit d'abord normalement. Si le quota est atteint, réduit l'historique,
 * puis supprime les sauvegardes les plus anciennes sauf celle en cours.
 */
function persistGames(games: GameStore, protectedId?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    return true;
  } catch {
    // Deuxième tentative : conserver l'état du joueur mais raccourcir le journal.
  }

  const compacted: GameStore = Object.fromEntries(
    Object.entries(games).map(([id, game]) => [id, { ...game, events: game.events.slice(0, RETRY_EVENTS) }]),
  );
  try {
    window.localStorage.setItem(GAMES_KEY, JSON.stringify(compacted));
    return true;
  } catch {
    // Dernier recours : libérer les parties les moins récemment avancées.
  }

  const removable = Object.entries(compacted)
    .filter(([id]) => id !== protectedId)
    .sort((a, b) => a[1].player.day - b[1].player.day);

  while (removable.length > 0) {
    const [oldestId] = removable.shift()!;
    delete compacted[oldestId];
    try {
      window.localStorage.setItem(GAMES_KEY, JSON.stringify(compacted));
      return true;
    } catch {
      // Continuer jusqu'à libérer suffisamment d'espace.
    }
  }
  return false;
}

export function listLocalGames(): GameSummary[] {
  return Object.values(readGames())
    .map(({ player }) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      origin: player.origin,
      day: player.day,
      money: player.money,
      alive: player.alive,
    }))
    .sort((a, b) => b.day - a.day)
    .slice(0, MAX_GAMES);
}

export function getLocalGame(id: string): LocalGame | null {
  const game = readGames()[id];
  return game && isLocalGame(game) ? game : null;
}

export function cacheLocalGame(player: PlayerState, events: GameEvent[] = []): boolean {
  const games = readGames();
  games[player.id] = { player, events: events.slice(0, MAX_EVENTS) };
  return persistGames(games, player.id);
}

export function createLocalGame(input: { name: string; gender: "H" | "F"; avatar: string; origin: string }) {
  const player = initialState(input);
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  player.id = `local-${randomPart}`;
  const events = welcomeEvents(player).map((event, index) => ({ ...event, id: index + 1, day: 1 }));
  const games = readGames();
  games[player.id] = { player, events };
  persistGames(games, player.id);
  return { player, events };
}

export function actLocalGame(id: string, action: ActionPayload) {
  const games = readGames();
  const game = games[id];
  if (!game) return { ok: false, error: "Partie introuvable." };

  const result = performAction(game.player, action);
  if (result.error) return { ok: false, error: result.error, player: game.player, newEvents: [] };

  const lastEventId = game.events.reduce((max, event) => Math.max(max, event.id), 0);
  const newEvents = result.drafts.map((event, index) => ({
    ...event,
    id: lastEventId + index + 1,
    day: result.state.day,
  }));
  game.player = result.state;
  game.events = [...newEvents, ...game.events].slice(0, MAX_EVENTS);
  games[id] = game;
  const saved = persistGames(games, id);

  return {
    ok: true,
    player: game.player,
    newEvents,
    ...(saved ? {} : { warning: "La partie continue, mais le navigateur n'a pas pu enregistrer la sauvegarde locale." }),
  };
}

export function deleteLocalGame(id: string): boolean {
  const games = readGames();
  delete games[id];
  if (typeof window !== "undefined") {
    try { window.localStorage.removeItem(`${BONDS_PREFIX}${id}`); } catch { /* stockage indisponible */ }
  }
  return persistGames(games);
}


const BONDS_PREFIX = "sama-life-bonds-v1:";

/** Relations sociales persistées séparément pour ne pas modifier le format des anciennes sauvegardes. */
export function getLocalBonds(gameId: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(`${BONDS_PREFIX}${gameId}`);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 5),
    ) as Record<string, number>;
  } catch {
    return {};
  }
}

export function saveLocalBond(gameId: string, npcId: string, level: number): boolean {
  if (typeof window === "undefined" || !gameId || !npcId) return false;
  try {
    const bonds = getLocalBonds(gameId);
    bonds[npcId] = Math.max(0, Math.min(5, Math.round(level)));
    window.localStorage.setItem(`${BONDS_PREFIX}${gameId}`, JSON.stringify(bonds));
    return true;
  } catch {
    return false;
  }
}
