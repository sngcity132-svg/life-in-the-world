import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  serial,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  avatar: text("avatar").notNull(),
  origin: text("origin").notNull(),

  day: integer("day").notNull().default(1),
  slot: integer("slot").notNull().default(0),
  money: integer("money").notNull().default(30000),

  health: integer("health").notNull().default(80),
  energy: integer("energy").notNull().default(90),
  satiety: integer("satiety").notNull().default(70),
  happiness: integer("happiness").notNull().default(65),
  reputation: integer("reputation").notNull().default(20),

  knowledge: integer("knowledge").notNull().default(0),
  education: integer("education").notNull().default(0),
  jobId: text("job_id"),
  shifts: integer("shifts").notNull().default(0),
  totalShifts: integer("total_shifts").notNull().default(0),
  missionsToday: integer("missions_today").notNull().default(0),

  homeId: text("home_id").notNull().default("famille"),
  businesses: jsonb("businesses").$type<string[]>().notNull().default([]),
  visited: jsonb("visited").$type<string[]>().notNull().default([]),

  partnerName: text("partner_name"),
  relation: integer("relation").notNull().default(0),
  dates: integer("dates").notNull().default(0),

  achievements: jsonb("achievements").$type<string[]>().notNull().default([]),
  alive: boolean("alive").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const gameEvents = pgTable("game_events", {
  id: serial("id").primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  text: text("text").notNull(),
  tone: text("tone").notNull().default("info"),
  icon: text("icon").notNull().default("✨"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PlayerRow = typeof players.$inferSelect;
export type GameEventRow = typeof gameEvents.$inferSelect;
