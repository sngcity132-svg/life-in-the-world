import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { gameEvents, players } from "@/db/schema";
import { initialState, rowToState, welcomeEvents } from "@/lib/engine";
import { AVATARS, ORIGINS } from "@/lib/data";
import type { Gender } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(players)
    .orderBy(desc(players.updatedAt))
    .limit(12);
  return NextResponse.json({
    games: rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      origin: r.origin,
      day: r.day,
      money: r.money,
      alive: r.alive,
    })),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 40);
    const gender: Gender = body.gender === "F" ? "F" : "H";
    const avatar = String(body.avatar ?? "");
    const origin = String(body.origin ?? "medina");

    if (!name) return NextResponse.json({ error: "Choisis un nom pour commencer ta vie." }, { status: 400 });
    if (!AVATARS.some((a) => a.url === avatar))
      return NextResponse.json({ error: "Choisis un avatar." }, { status: 400 });
    if (!ORIGINS.some((o) => o.id === origin))
      return NextResponse.json({ error: "Choisis ton quartier d'origine." }, { status: 400 });

    const state = initialState({ name, gender, avatar, origin });
    const [row] = await db
      .insert(players)
      .values({
        name: state.name,
        gender: state.gender,
        avatar: state.avatar,
        origin: state.origin,
        money: state.money,
        health: state.stats.health,
        energy: state.stats.energy,
        satiety: state.stats.satiety,
        happiness: state.stats.happiness,
        reputation: state.stats.reputation,
      })
      .returning();

    const drafts = welcomeEvents(state);
    const inserted = await db
      .insert(gameEvents)
      .values(drafts.map((d) => ({ playerId: row.id, day: 1, text: d.text, tone: d.tone, icon: d.icon })))
      .returning();

    return NextResponse.json({
      player: rowToState(row),
      events: inserted
        .map((e) => ({ id: e.id, day: e.day, text: e.text, tone: e.tone, icon: e.icon }))
        .reverse(),
    });
  } catch {
    return NextResponse.json({ error: "Impossible de créer la partie." }, { status: 500 });
  }
}
