import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { gameEvents, players } from "@/db/schema";
import { rowToState } from "@/lib/engine";
import type { Tone } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(players).where(eq(players.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });

  const events = await db
    .select()
    .from(gameEvents)
    .where(eq(gameEvents.playerId, id))
    .orderBy(desc(gameEvents.id))
    .limit(100);

  return NextResponse.json({
    player: rowToState(row),
    events: events.map((e) => ({
      id: e.id,
      day: e.day,
      text: e.text,
      tone: e.tone as Tone,
      icon: e.icon,
    })),
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(players).where(eq(players.id, id));
  return NextResponse.json({ ok: true });
}
