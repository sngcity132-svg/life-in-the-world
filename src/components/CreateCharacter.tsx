"use client";

import { useState } from "react";
import { ArrowLeft, Dices, Loader2, Play } from "lucide-react";
import { AVATARS, IMG, NAME_SUGGESTIONS, ORIGINS } from "@/lib/data";
import type { Gender, PlayerState } from "@/lib/types";
import { createLocalGame } from "@/lib/offline-store";

export default function CreateCharacter({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (player: PlayerState) => void;
}) {
  const [gender, setGender] = useState<Gender>("H");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("medina");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatars = AVATARS.filter((a) => a.gender === gender);
  const selectedOrigin = ORIGINS.find((o) => o.id === origin)!;
  const ready = name.trim().length > 0 && avatar !== null;

  const rollName = () => {
    const list = NAME_SUGGESTIONS[gender];
    setName(list[Math.floor(Math.random() * list.length)]);
  };

  const submit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), gender, avatar, origin }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        const local = createLocalGame({ name: name.trim(), gender, avatar, origin });
        onCreated(local.player);
        setSubmitting(false);
        return;
      }
      onCreated(data.player as PlayerState);
    } catch {
      const local = createLocalGame({ name: name.trim(), gender, avatar, origin });
      onCreated(local.player);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-night-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.heroCard} alt="" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/40 via-night-950/80 to-night-950" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <button onClick={onBack} className="glass mb-6 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white/70 transition hover:text-white">
          <ArrowLeft size={14} /> Retour
        </button>

        <div className="fade-up">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">Nouvelle vie · 18 ans · 30 000 FCFA</span>
          <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Qui seras-tu <span className="text-flag">à Dakar</span> ?
          </h1>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* Genre + avatars */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">1 · Choisis ton visage</h2>
                <div className="glass flex rounded-xl p-1">
                  {(["H", "F"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGender(g);
                        setAvatar(null);
                      }}
                      className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                        gender === g ? "bg-gold-400 text-night-950" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {g === "H" ? "Homme" : "Femme"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {avatars.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAvatar(a.url)}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition ${
                      avatar === a.url
                        ? "border-gold-400 shadow-[0_0_30px_-6px_rgba(245,185,66,0.5)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.url} alt={a.vibe} className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950/95 to-transparent p-2 pt-8">
                      <p className="text-left text-[10px] font-bold text-white/85">{a.vibe}</p>
                    </div>
                    {avatar === a.url && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-xs font-black text-night-950">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Nom */}
            <section>
              <h2 className="mb-3 font-display text-lg font-bold">2 · Ton nom</h2>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  placeholder={gender === "H" ? "Ex : Moussa Diop" : "Ex : Awa Diallo"}
                  className="glass w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white placeholder-white/30 outline-none transition focus:border-gold-400/50"
                />
                <button onClick={rollName} title="Nom aléatoire" className="glass flex items-center gap-2 rounded-xl px-4 text-xs font-bold text-gold-300 transition hover:border-gold-400/40">
                  <Dices size={16} /> <span className="hidden sm:inline">Au hasard</span>
                </button>
              </div>
            </section>

            {/* Origine */}
            <section>
              <h2 className="mb-3 font-display text-lg font-bold">3 · Ton quartier d&apos;origine</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {ORIGINS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setOrigin(o.id)}
                    className={`card-lift relative overflow-hidden rounded-2xl border-2 text-left transition ${
                      origin === o.id ? "border-gold-400 shadow-[0_0_30px_-8px_rgba(245,185,66,0.45)]" : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="relative h-24 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.image} alt={o.name} loading="lazy" className="zoom-img h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-night-950/90 to-transparent" />
                      <p className="absolute bottom-2 left-3 font-display text-base font-bold">
                        {o.emoji} {o.name}
                      </p>
                      {origin === o.id && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-xs font-black text-night-950">✓</span>
                      )}
                    </div>
                    <div className="bg-night-900/80 p-3">
                      <p className="text-[11px] leading-relaxed text-white/55">{o.desc}</p>
                      <span className="mt-2 inline-block rounded-md bg-teranga-500/15 px-2 py-0.5 text-[10px] font-bold text-teranga-300">
                        Bonus départ : {o.bonusLabel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Preview */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="glass overflow-hidden rounded-3xl">
              <div className="relative h-64 bg-night-800">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Ton avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl opacity-30">👤</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-display text-2xl font-extrabold">{name.trim() || "Ton nom ici…"}</p>
                  <p className="text-xs text-white/60">18 ans · {selectedOrigin.emoji} {selectedOrigin.name}</p>
                </div>
              </div>
              <div className="space-y-2.5 p-4 text-xs">
                <div className="flex justify-between"><span className="text-white/50">Argent de départ</span><strong className="text-gold-300">30 000 FCFA {origin === "plateau" ? "+ 15 000" : ""}</strong></div>
                <div className="flex justify-between"><span className="text-white/50">Logement</span><strong>Chez la famille, Médina</strong></div>
                <div className="flex justify-between"><span className="text-white/50">Diplôme</span><strong>Aucun (pour l&apos;instant)</strong></div>
                <div className="flex justify-between"><span className="text-white/50">Bonus</span><strong className="text-teranga-300">{selectedOrigin.bonusLabel}</strong></div>
                <button
                  onClick={submit}
                  disabled={!ready || submitting}
                  className="btn-gold mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold"
                >
                  {submitting ? <Loader2 size={17} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                  {submitting ? "Direction Dakar…" : "Commencer ma vie à Dakar"}
                </button>
                {!ready && <p className="text-center text-[10px] text-white/40">Choisis un visage et un nom pour continuer.</p>}
                {error && <p className="text-center text-[11px] font-semibold text-flame-400">{error}</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
