"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Heart, HeartHandshake, Smile, Sparkles, UtensilsCrossed, Zap,
} from "lucide-react";
import { EDU_NAMES, IMG, SLOT_ICONS, SLOT_NAMES, ageOf, jobById } from "@/lib/data";
import type { GameEvent, PlayerState, Stats, Tone } from "@/lib/types";
import { getLocalGame, actLocalGame, cacheLocalGame } from "@/lib/offline-store";
import { Money, StatBar, ToastStack, type ToastItem } from "./ui";
import WorldGame from "./world/WorldGame";
import Phone from "./world/Phone";

const STAT_META: { key: keyof Stats; label: string; icon: typeof Heart; gradient: string }[] = [
  { key: "health", label: "Santé", icon: Heart, gradient: "from-rose-400 to-flame-500" },
  { key: "energy", label: "Énergie", icon: Zap, gradient: "from-gold-300 to-gold-500" },
  { key: "satiety", label: "Ventre", icon: UtensilsCrossed, gradient: "from-orange-300 to-orange-500" },
  { key: "happiness", label: "Bonheur", icon: Smile, gradient: "from-teranga-300 to-teranga-500" },
  { key: "reputation", label: "Teranga", icon: HeartHandshake, gradient: "from-sky-300 to-cyan-500" },
];

export default function GameScreen({
  gameId,
  onExit,
  onRestart,
}: {
  gameId: string;
  onExit: () => void;
  onRestart: () => void;
}) {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const toastId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/games/${gameId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setPlayer(data.player);
          setEvents(data.events ?? []);
          cacheLocalGame(data.player, data.events ?? []);
        }
      } catch {
        const local = getLocalGame(gameId);
        if (!cancelled && local) { setPlayer(local.player); setEvents(local.events); }
        else if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
    };
  }, [gameId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") setPhoneOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToasts = useCallback(
    (list: GameEvent[]) => {
      list.slice(0, 3).forEach((e) => {
        const id = ++toastId.current;
        setToasts((prev) => [...prev.slice(-3), { id, text: e.text, tone: e.tone, icon: e.icon }]);
        timers.current.push(setTimeout(() => closeToast(id), 5200));
      });
    },
    [closeToast],
  );

  const notify = useCallback(
    (text: string, tone: Tone, icon: string) => {
      pushToasts([{ id: 0, day: 0, text, tone, icon }]);
    },
    [pushToasts],
  );

  const act = useCallback(
    async (type: string, id?: string) => {
      if (busy) return;
      setBusy(true);
      try {
        const res = await fetch(`/api/games/${gameId}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, id }),
        });
        const data = await res.json();
        if (!res.ok) {
          const local = actLocalGame(gameId, { type, id });
          if (local.ok && local.player) {
            setPlayer(local.player);
            setEvents((prev) => [...(local.newEvents ?? []), ...prev].slice(0, 150));
            pushToasts(local.newEvents ?? []);
          } else notify(local.error ?? "Service indisponible.", "bad", "📡");
        } else if (data.error) {
          notify(data.error ?? "Erreur réseau, réessaie.", "bad", "⚠️");
        } else if (!data.ok) {
          notify(data.error, "bad", "🚫");
        } else {
          setPlayer(data.player);
          setEvents((prev) => {
            const next = [...(data.newEvents ?? []), ...prev].slice(0, 150);
            cacheLocalGame(data.player, next);
            return next;
          });
          pushToasts(data.newEvents ?? []);
        }
      } catch {
        const local = actLocalGame(gameId, { type, id });
        if (local.ok && local.player) {
          setPlayer(local.player);
          setEvents((prev) => [...(local.newEvents ?? []), ...prev].slice(0, 150));
          pushToasts(local.newEvents ?? []);
        } else {
          notify(local.error ?? "Connexion perdue. Réessaie.", "bad", "📡");
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, gameId, notify, pushToasts],
  );

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-night-950 px-4 text-center">
        <span className="text-5xl">🌵</span>
        <p className="font-display text-xl font-bold">Cette vie est introuvable.</p>
        <button onClick={onExit} className="btn-gold rounded-xl px-6 py-3 text-sm font-bold">Retour à l'accueil</button>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-night-950">
        <span className="pulse-soft flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teranga-500 via-gold-400 to-flame-500 text-night-950">
          <Sparkles size={26} />
        </span>
        <p className="font-display text-sm font-bold text-white/60">Construction de Dakar… routes, marchés, pirogues…</p>
        <div className="shimmer h-2 w-52 rounded-full" />
      </div>
    );
  }

  const job = jobById(player.jobId);
  const isNight = player.slot >= 3;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-night-950">
      {/* ===== HUD ===== */}
      <header className="glass-deep relative z-30 border-b border-white/5">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4">
          <div className="flex items-center gap-2.5 py-2">
            <button onClick={onExit} title="Accueil (sauvegarde auto)" className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:text-white">
              <ArrowLeft size={16} />
            </button>
            <span className="hidden font-display text-sm font-extrabold tracking-tight lg:block">
              LIFE IN THE WORLD
            </span>

            <div className="glass flex items-center gap-2 rounded-xl px-2.5 py-1.5">
              <span className="font-display text-xs font-extrabold text-white">Jour {player.day}</span>
              <span className="hidden text-[10px] text-white/45 sm:block">{ageOf(player.day)} ans</span>
              <span className="mx-0.5 h-4 w-px bg-white/10" />
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    title={SLOT_NAMES[i]}
                    className={`rounded-md px-1 py-0.5 text-xs ${
                      i < player.slot
                        ? "bg-white/5 opacity-30"
                        : i === player.slot && !isNight
                          ? "bg-gold-400/20 ring-1 ring-gold-400/60"
                          : "bg-white/5 opacity-60"
                    }`}
                  >
                    {SLOT_ICONS[i]}
                  </span>
                ))}
                {isNight && <span className="pulse-soft rounded-md bg-indigo-400/20 px-1 py-0.5 text-xs ring-1 ring-indigo-300/50">🌙</span>}
              </div>
            </div>

            <div className="flex-1" />

            <Money key={player.money} value={player.money} className="fade-up font-display text-lg font-extrabold tabular-nums text-gold-300 sm:text-xl" />

            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={player.avatar} alt={player.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-gold-400/50" />
              <div className="hidden leading-tight sm:block">
                <p className="max-w-[130px] truncate text-xs font-bold">{player.name}</p>
                <p className="text-[10px] text-white/45">{EDU_NAMES[player.education]}{job ? ` · ${job.emoji}` : ""}{player.relation >= 2 ? " · 💍" : ""}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-x-3 gap-y-1 pb-2 sm:gap-x-5">
            {STAT_META.map(({ key, label, icon: Icon, gradient }) => (
              <StatBar key={key} icon={<Icon size={12} />} label={label} value={player.stats[key]} gradient={gradient} />
            ))}
          </div>
        </div>
      </header>

      {/* ===== Monde ouvert ===== */}
      <div className="relative min-h-0 flex-1">
        <WorldGame
          player={player}
          act={act}
          busy={busy}
          phoneOpen={phoneOpen}
          onPhone={() => setPhoneOpen((o) => !o)}
          notify={notify}
        />
        {phoneOpen && (
          <Phone player={player} events={events} act={act} busy={busy} onClose={() => setPhoneOpen(false)} />
        )}
      </div>

      {/* ===== Game Over ===== */}
      {!player.alive && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-night-950/95 backdrop-blur-xl">
          <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
            <div className="relative mb-6 h-44 w-full overflow-hidden rounded-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.baobab} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 to-transparent" />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-4xl">🕊️</span>
            </div>
            <h2 className="font-display text-4xl font-extrabold tracking-tight">Une vie s'achève</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {player.name} a vécu <strong className="text-white">{player.day} jours</strong> à Dakar.
              Chaque vie laisse une trace — la prochaine sera encore plus belle.
            </p>
            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              {[
                ["💰", "Argent final", `${new Intl.NumberFormat("fr-FR").format(player.money)} F`],
                ["💼", "Journées travaillées", String(player.totalShifts)],
                ["🗺️", "Lieux visités", `${player.visited.length}/11`],
                ["🏆", "Succès", `${player.achievements.length}/12`],
              ].map(([emoji, label, value]) => (
                <div key={label} className="glass rounded-2xl p-4">
                  <span className="text-xl">{emoji}</span>
                  <p className="mt-1 font-display text-lg font-extrabold text-gold-300">{value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={onRestart} className="btn-gold rounded-2xl px-7 py-3.5 text-sm font-extrabold">
                🌅 Revivre une nouvelle vie
              </button>
              <button onClick={onExit} className="glass rounded-2xl px-6 py-3.5 text-sm font-bold text-white/70 transition hover:text-white">
                Accueil
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onClose={closeToast} />
    </div>
  );
}
