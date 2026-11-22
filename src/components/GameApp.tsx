"use client";

import { useCallback, useEffect, useState } from "react";
import Landing from "./Landing";
import CreateCharacter from "./CreateCharacter";
import GameScreen from "./GameScreen";
import type { GameSummary, PlayerState } from "@/lib/types";
import { listLocalGames, deleteLocalGame } from "@/lib/offline-store";

type Screen = "landing" | "create" | "game";

export default function GameApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [games, setGames] = useState<GameSummary[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      const res = await fetch("/api/games");
      if (!res.ok) throw new Error("API indisponible");
      const data = await res.json();
      const remote = (data.games ?? []) as GameSummary[];
      const local = listLocalGames();
      const seen = new Set(remote.map((g) => g.id));
      setGames([...remote, ...local.filter((g) => !seen.has(g.id))].slice(0, 12));
    } catch {
      setGames(listLocalGames());
    }
  }, []);

  useEffect(() => {
    if (screen === "landing") void loadGames();
  }, [screen, loadGames]);

  const deleteGame = useCallback(
    async (id: string) => {
      if (!window.confirm("Supprimer définitivement cette vie ? Cette action est irréversible.")) return;
      try {
        await fetch(`/api/games/${id}`, { method: "DELETE" });
      } catch {
        deleteLocalGame(id);
      } finally {
        deleteLocalGame(id);
        void loadGames();
      }
    },
    [loadGames],
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
