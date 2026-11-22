export type Gender = "H" | "F";
export type Tone = "good" | "bad" | "info" | "epic";

export interface Stats {
  health: number;
  energy: number;
  satiety: number;
  happiness: number;
  reputation: number;
}

export interface ChildState {
  id: string;
  name: string;
  gender: Gender;
  ageDays: number;
  happiness: number;
}

export interface PlayerState {
  id: string;
  name: string;
  gender: Gender;
  avatar: string;
  origin: string;
  cityId?: "dakar" | "kaolack" | "thies" | "touba";
  day: number;
  slot: number;
  money: number;
  stats: Stats;
  knowledge: number;
  education: number;
  jobId: string | null;
  shifts: number;
  totalShifts: number;
  missionsToday: number;
  homeId: string;
  businesses: string[];
  businessOps?: Record<string, { stock: number; employees: number; level: number; branches?: number }>;
  visited: string[];
  partnerName: string | null;
  relation: number;
  dates: number;
  children: ChildState[];
  achievements: string[];
  alive: boolean;
  createdAt: string;
}

export interface GameEvent {
  id: number;
  day: number;
  text: string;
  tone: Tone;
  icon: string;
}

export interface GameSummary {
  id: string;
  name: string;
  avatar: string;
  origin: string;
  day: number;
  money: number;
  alive: boolean;
}

export interface ActionPayload {
  type: string;
  id?: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  player: PlayerState;
  newEvents: GameEvent[];
}

export interface DraftEvent {
  text: string;
  tone: Tone;
  icon: string;
}

export interface Effects {
  money?: number;
  health?: number;
  energy?: number;
  satiety?: number;
  happiness?: number;
  reputation?: number;
  knowledge?: number;
}
