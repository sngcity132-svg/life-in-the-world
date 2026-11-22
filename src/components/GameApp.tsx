"use client";

import { useCallback, useEffect, useState } from "react";
import Landing from "./Landing";
import CreateCharacter from "./CreateCharacter";
import GameScreen from "./GameScreen";
import type { GameSummary, PlayerState } from "@/lib/types";
import { listLocalGames, deleteLocalGame } from "@/lib/offline-store";

type Screen = "landing" | "create" | "game";

async function fetchGames(): Promise<GameSummary[]> {
  try {
    const res = await fetch("/api/games");
    if (!res.ok) throw new Error("API indisponible");
    const data = await res.json();
    const remote = (data.games ?? []) as GameSummary[];
    const local = listLocalGames();
    const seen = new Set(remote.map((g) => g.id));
    return [...remote, ...local.filter((g) => !seen.has(g.id))].slice(0, 12);
  } catch {
    return listLocalGames();
  }
}

export default function GameApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [games, setGames] = useState<GameSummary[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    if (screen !== "landing") return;
    let cancelled = false;
    void fetchGames().then((list) => {
      if (!cancelled) setGames(list);
    });
    return () => {
      cancelled = true;
    };
  }, [screen]);

  const deleteGame = useCallback(
    async (id: string) => {
      if (!window.confirm("Supprimer définitivement cette vie ? Cette action est irréversible.")) return;
      try {
        await fetch(`/api/games/${id}`, { method: "DELETE" });
      } catch {
        deleteLocalGame(id);
      } finally {
        deleteLocalGame(id);
        setGames(await fetchGames());
      }
    },
    [],
  );

  if (screen === "create") {
    return (
      <CreateCharacter
        onBack={() => setScreen("landing")}
        onCreated={(p: PlayerState) => {
          setGameId(p.id);
          setScreen("game");
        }}
      />
    );
  }

  if (screen === "game" && gameId) {
    return (
      <GameScreen
        key={gameId}
        gameId={gameId}
        onExit={() => setScreen("landing")}
        onRestart={() => setScreen("create")}
      />
    );
  }

  return (
    <Landing
      games={games}
      onNew={() => setScreen("create")}
      onContinue={(id) => {
        setGameId(id);
        setScreen("game");
      }}
      onDelete={(id) => void deleteGame(id)}
    />
  );
}
