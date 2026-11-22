import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gameEvents, players } from "@/db/schema";
import { performAction, rowToState, stateToRow } from "@/lib/engine";
import type { ActionPayload, Tone } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(players).where(eq(players.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Partie introuvable." }, { status: 404 });

  let payload: ActionPayload;
  try {
    payload = (await req.json()) as ActionPayload;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const current = rowToState(row);
  const result = performAction(current, payload);

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error, player: current, newEvents: [] });
  }

  await db.update(players).set(stateToRow(result.state)).where(eq(players.id, id));

  const inserted = result.drafts.length
    ? await db
        .insert(gameEvents)
        .values(
          result.drafts.map((d) => ({
            playerId: id,
            day: result.state.day,
            text: d.text,
            tone: d.tone,
            icon: d.icon,
          })),
        )
        .returning()
    : [];

  return NextResponse.json({
    ok: true,
    player: result.state,
    newEvents: inserted
      .map((e) => ({ id: e.id, day: e.day, text: e.text, tone: e.tone as Tone, icon: e.icon }))
      .reverse(),
  });
}
