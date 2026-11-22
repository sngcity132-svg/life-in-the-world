"use client";

import { ArrowRight, Play, Sparkles, Trash2 } from "lucide-react";
import { IMG, fmtMoney, originById } from "@/lib/data";
import type { GameSummary } from "@/lib/types";

const MARQUEE = [
  "DAKAR", "GORÉE", "LAC ROSE", "TERANGA", "SANDAGA", "ALMADIES",
  "SALOUM", "YOFF", "MÉDINA", "TOUBA", "MBALAX", "ATTAYA",
];

const FEATURES = [
  {
    image: IMG.dev,
    emoji: "💼",
    title: "Carrière & Business",
    desc: "9 métiers réels, du vendeur de Sandaga au médecin. Grimpe les échelons, lance ta boutique, ton resto, ton taxi.",
  },
  {
    image: IMG.goree,
    emoji: "🗺️",
    title: "Explore le pays",
    desc: "Gorée, Lac Rose, Monument de la Renaissance, combat de lutte, delta du Saloum… 11 lieux iconiques en photos réelles.",
  },
  {
    image: IMG.attaya,
    emoji: "🤝",
    title: "Teranga & Amour",
    desc: "Attaya entre amis, cérémonies de quartier, appels à la famille. Rencontre l'âme sœur et célèbre ton mariage.",
  },
  {
    image: IMG.market,
    emoji: "💰",
    title: "Économie en FCFA",
    desc: "Salaires, loyers, thieb à 2 500 F, Tabaski, coupures Senelec : la vraie vie dakaroise, avec ses joies et ses galères.",
  },
];

export default function Landing({
  games,
  onNew,
  onContinue,
  onDelete,
}: {
  games: GameSummary[];
  onNew: () => void;
  onContinue: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const latest = games.find((g) => g.alive) ?? games[0];

  return (
    <div className="min-h-screen bg-night-950">
      {/* Nav */}
      <header className="glass-deep fixed inset-x-0 top-0 z-50 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teranga-500 via-gold-400 to-flame-500 text-night-950">
              <Sparkles size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              LIFE IN THE WORLD
            </span>
            <span className="ml-1 hidden rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/50 sm:block">
              🌍 OPEN WORLD
            </span>
          </div>
          <button onClick={onNew} className="btn-gold rounded-xl px-4 py-2 text-xs font-bold">
            Nouvelle vie
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[94vh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.hero} alt="Dakar, Sénégal" className="kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/45 to-night-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,11,9,0.55)_100%)]" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-36">
          <div className="fade-up max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-night-950/60 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300 backdrop-blur-md">
              🎮 CHAPITRE 1 — SÉNÉGAL · MONDE OUVERT
            </span>
            <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">
              Construis ta vie
              <br />
              dans <span className="text-flag">le monde</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Commence au Sénégal et explore progressivement un monde vivant : <strong className="text-white">marche, cours, conduis des taxis, parle aux habitants</strong>,
              fais des missions du village de Yoff aux villas des Almadies. Travaille à Sandaga, révise à l&apos;UCAD, marie-toi au son du sabar —
              chaque choix écrit ton destin.
            </p>
            <p className="mt-3 text-xs font-bold text-white/50">
              🕹️ ZQSD / WASD / flèches pour marcher · Maj courir · E interagir & conduire · P téléphone · M carte — joystick tactile sur mobile
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={onNew} className="btn-gold flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-extrabold">
                <Play size={17} fill="currentColor" /> Commencer ma vie
              </button>
              {latest && (
                <button
                  onClick={() => onContinue(latest.id)}
                  className="glass flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold text-white transition hover:border-gold-400/40 hover:bg-white/10"
                >
                  Continuer — {latest.name} <ArrowRight size={15} />
                </button>
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-2.5">
              {[
                ["9", "métiers réels"],
                ["11", "lieux iconiques"],
                ["5", "logements"],
                ["12", "succès à débloquer"],
                ["∞", "teranga"],
              ].map(([n, label]) => (
                <span key={label} className="glass rounded-xl px-3.5 py-2 text-xs text-white/70">
                  <strong className="font-display text-base font-extrabold text-gold-300">{n}</strong> {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-white/5 bg-night-900 py-3.5">
        <div className="marquee flex w-max gap-8 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-8 font-display text-sm font-bold tracking-[0.25em] text-white/35">
              {m} <span className="text-gold-400/60">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Saves */}
      {games.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Tes vies en cours</h2>
          <p className="mt-1 text-sm text-white/50">Sauvegarde automatique après chaque action.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <div key={g.id} className="glass card-lift flex items-center gap-4 rounded-2xl p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.avatar} alt={g.name} className="h-16 w-16 rounded-xl object-cover ring-2 ring-gold-400/30" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold">{g.name}</p>
                  <p className="text-xs text-white/50">
                    {originById(g.origin).name} · Jour {g.day}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-gold-300">{fmtMoney(g.money)} FCFA</p>
                  <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${g.alive ? "bg-teranga-500/20 text-teranga-300" : "bg-flame-500/20 text-flame-400"}`}>
                    {g.alive ? "● En vie" : "✝ Vie terminée"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => onContinue(g.id)} className="btn-gold rounded-lg px-3 py-1.5 text-[11px] font-bold">
                    {g.alive ? "Jouer" : "Revoir"}
                  </button>
                  <button
                    onClick={() => onDelete(g.id)}
                    className="flex items-center justify-center rounded-lg bg-white/5 px-3 py-1.5 text-white/40 transition hover:bg-flame-500/20 hover:text-flame-400"
                    title="Supprimer cette vie"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Une vie entière, <span className="text-flag">un pays vibrant</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          Le premier chapitre reproduit le quotidien sénégalais : l&apos;économie en francs CFA, la chaleur de la teranga,
          les fêtes religieuses, la débrouille et les grands rêves. En photos réelles haute résolution.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass card-lift overflow-hidden rounded-2xl">
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.image} alt={f.title} loading="lazy" className="zoom-img h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/85 to-transparent" />
                <span className="absolute bottom-2 left-3 text-2xl">{f.emoji}</span>
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Crée ton personnage", "Nom, visage, quartier d'origine : Médina, Plateau, Yoff ou Parcelles. Chaque départ offre un bonus unique."],
            ["02", "Vis tes journées", "Matin, après-midi, soir : 3 moments par jour. Travaille, mange, étudie, aime, explore — puis dors."],
            ["03", "Construis ton destin", "Diplômes, promotions, mariage, businesses, million en FCFA, villa aux Almadies. 12 succès t'attendent."],
          ].map(([n, title, desc]) => (
            <div key={n} className="glass rounded-2xl p-6">
              <span className="font-display text-4xl font-extrabold text-gold-400/30">{n}</span>
              <h3 className="mt-2 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote banner */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.baobab} alt="Baobabs au coucher du soleil" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-night-950/70" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center">
          <p className="font-display text-2xl font-bold leading-snug text-gold-200 sm:text-3xl">
            « Ndank ndank mooy japp golo ci ñaay »
          </p>
          <p className="mt-3 text-sm text-white/70">
            Petit à petit, on attrape le singe dans la forêt. — Proverbe wolof
          </p>
          <button onClick={onNew} className="btn-gold mx-auto mt-8 flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-extrabold">
            <Play size={16} fill="currentColor" /> Écrire mon histoire
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-night-950">
        <div className="h-1 w-full bg-gradient-to-r from-teranga-500 via-gold-400 to-flame-500" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center">
          <p className="font-display text-sm font-bold">
            LIFE IN THE WORLD — fait avec teranga 🇸🇳
          </p>
          <p className="text-[11px] text-white/40">
            Photos réelles haute résolution : photographes Pexels du Sénégal & d&apos;Afrique. Sauvegardes stockées en base PostgreSQL.
          </p>
        </div>
      </footer>
    </div>
  );
}
