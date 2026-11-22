"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import {
  ACHIEVEMENTS, BUSINESSES, EDU_NAMES, HOMES, MARRY_DATES_REQUIRED, SLOT_NAMES, ageOf, fmtMoney, jobById, originById,
} from "@/lib/data";
import type { GameEvent, PlayerState } from "@/lib/types";
import { ProgressBar } from "../ui";
import { CareerPanel, CityPanel, DailyPanel, HomePanel, SocialPanel } from "../panels";

type AppId = "daily" | "career" | "city" | "social" | "home" | "family" | "finance" | "journal" | "profile";

const APPS: { id: AppId; emoji: string; label: string; bg: string }[] = [
  { id: "daily", emoji: "🍽️", label: "Quotidien", bg: "from-orange-400 to-flame-500" },
  { id: "career", emoji: "💼", label: "Carrière", bg: "from-sky-400 to-blue-600" },
  { id: "city", emoji: "🗺️", label: "Guide", bg: "from-teranga-400 to-teranga-600" },
  { id: "social", emoji: "🤝", label: "Teranga", bg: "from-pink-400 to-rose-600" },
  { id: "home", emoji: "🏠", label: "Logement", bg: "from-gold-300 to-gold-500" },
  { id: "family", emoji: "👨‍👩‍👧", label: "Famille", bg: "from-fuchsia-400 to-purple-600" },
  { id: "finance", emoji: "💳", label: "Finances", bg: "from-emerald-400 to-green-700" },
  { id: "journal", emoji: "📜", label: "Journal", bg: "from-violet-400 to-purple-600" },
  { id: "profile", emoji: "🏆", label: "Profil", bg: "from-slate-400 to-slate-600" },
];

const SLOT_TIME = ["08:12", "14:30", "19:45", "23:58"];

export default function Phone({
  player,
  events,
  act,
  busy,
  onClose,
}: {
  player: PlayerState;
  events: GameEvent[];
  act: (type: string, id?: string) => void;
  busy: boolean;
  onClose: () => void;
}) {
  const [app, setApp] = useState<AppId | null>(null);
  const panelProps = { player, act, busy };
  const job = jobById(player.jobId);
  const home = HOMES.find((item) => item.id === player.homeId) ?? HOMES[0];

  const goals: { emoji: string; label: string; progress: number }[] = [];
  if (player.education < 2) goals.push({ emoji: "🎓", label: "Décrocher le Bac", progress: (player.knowledge / 50) * 100 });
  if (player.relation < 2)
    goals.push({ emoji: "💍", label: player.partnerName ? `Épouser ${player.partnerName}` : "Trouver le grand amour", progress: (player.dates / MARRY_DATES_REQUIRED) * 100 });
  if (player.money < 1000000) goals.push({ emoji: "💰", label: "Atteindre 1 000 000 FCFA", progress: (player.money / 1000000) * 100 });
  if (player.homeId !== "villa") goals.push({ emoji: "🏝️", label: "Villa aux Almadies", progress: (player.money / 2400000) * 100 });
  if (player.businesses.length < 3) goals.push({ emoji: "🏗️", label: "Bâtir 3 businesses", progress: (player.businesses.length / 3) * 100 });

  const appTitle = APPS.find((a) => a.id === app)?.label ?? "";

  const exportSave = () => {
    const backup = {
      format: "life-in-the-world-save",
      version: 1,
      exportedAt: new Date().toISOString(),
      player,
      events,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `life-in-the-world-${player.name.trim().replace(/[^a-z0-9-]/gi, "-").toLowerCase()}-jour-${player.day}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-end bg-black/45 p-2 backdrop-blur-[2px] sm:p-5" onClick={onClose}>
      <div
        className="phone-in relative flex h-[min(730px,100%)] w-[min(400px,100%)] flex-col overflow-hidden rounded-[2.4rem] border-[5px] border-night-600 bg-night-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* encoche */}
        <div className="absolute left-1/2 top-2 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-night-950" />

        {/* barre de statut */}
        <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[10px] font-bold text-white/60">
          <span>{SLOT_TIME[Math.min(player.slot, 3)]}</span>
          <span>SeneMobile 🇸🇳</span>
          <span>🔋 87%</span>
        </div>

        {app === null ? (
          /* ===== écran d'accueil ===== */
          <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-5 pt-4">
            <p className="font-display text-xl font-extrabold">
              Nanga def, <span className="text-gold-300">{player.name.split(" ")[0]}</span> 👋🏾
            </p>
            <p className="text-xs text-white/50">Jour {player.day} · {SLOT_NAMES[Math.min(player.slot, 3)]} · {ageOf(player.day)} ans</p>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-teranga-600 to-night-700 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Solde Wave & Orange Money</p>
              <p className="font-display text-2xl font-extrabold text-gold-300">{fmtMoney(player.money)} <span className="text-sm">FCFA</span></p>
              <p className="mt-1 text-[10px] text-white/55">
                {job ? `${job.emoji} ${job.title}` : "Sans emploi"} · {EDU_NAMES[player.education]}
                {player.partnerName ? ` · 💞 ${player.partnerName}` : ""}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {APPS.map((a) => (
                <button key={a.id} onClick={() => setApp(a.id)} className="group flex flex-col items-center gap-1.5">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.bg} text-2xl shadow-lg transition group-hover:scale-110`}>
                    {a.emoji}
                  </span>
                  <span className="text-[9px] font-bold text-white/70">{a.label}</span>
                </button>
              ))}
              <button onClick={onClose} className="group flex flex-col items-center gap-1.5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-400 to-flame-500 text-2xl shadow-lg transition group-hover:scale-110">
                  🌍
                </span>
                <span className="text-[9px] font-bold text-white/70">Explorer</span>
              </button>
            </div>

            <div className="mt-auto pt-5 text-center text-[10px] text-white/35">
              P ou Échap pour fermer · la ville t&apos;attend
            </div>
          </div>
        ) : (
          /* ===== application ouverte ===== */
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
              <button onClick={() => setApp(null)} className="glass flex h-8 w-8 items-center justify-center rounded-lg text-white/70">
                <ChevronLeft size={16} />
              </button>
              <p className="flex-1 font-display text-sm font-extrabold">{appTitle}</p>
              <button onClick={onClose} className="text-white/40 transition hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {app === "daily" && <DailyPanel {...panelProps} />}
              {app === "career" && <CareerPanel {...panelProps} />}
              {app === "city" && <CityPanel {...panelProps} />}
              {app === "social" && <SocialPanel {...panelProps} />}
              {app === "home" && <HomePanel {...panelProps} />}
              {app === "finance" && (
                <div className="space-y-4">
                  <section className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 p-4 ring-1 ring-emerald-300/20">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/70">Patrimoine disponible</p>
                    <p className="mt-1 font-display text-2xl font-extrabold text-emerald-200">{fmtMoney(player.money)} FCFA</p>
                    <p className="mt-1 text-xs text-white/55">Solde de ta partie · Jour {player.day}</p>
                  </section>
                  <section className="glass rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold-300">Revenus passifs quotidiens</p>
                    <p className="mt-1 text-xl font-extrabold text-emerald-200">+{fmtMoney(player.businesses.reduce((sum, id) => sum + (BUSINESSES.find((b) => b.id === id)?.income ?? 0), 0))} FCFA</p>
                    <p className="mt-1 text-[10px] text-white/45">Versés au début d&apos;une nouvelle journée lorsque tu dors.</p>
                  </section>
                  <section className="space-y-2">
                    <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-gold-300">Investissements disponibles</p><span className="text-[10px] text-white/40">{player.businesses.length}/{BUSINESSES.length} acquis</span></div>
                    {BUSINESSES.map((business) => {
                      const owned = player.businesses.includes(business.id);
                      return <div key={business.id} className="glass flex items-center gap-3 rounded-xl p-3">
                        <span className="text-2xl">{business.emoji}</span>
                        <div className="min-w-0 flex-1"><p className="text-xs font-bold text-white">{business.name}</p><p className="text-[10px] text-white/45">{owned ? `Rapporte ${fmtMoney(business.income)} FCFA par jour` : `Coût : ${fmtMoney(business.cost)} FCFA · +${fmtMoney(business.income)}/jour`}</p></div>
                        {owned ? <span className="rounded-lg bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">Possédé</span> : <button onClick={() => act("buy", business.id)} disabled={busy || player.money < business.cost} className="rounded-lg bg-emerald-500/20 px-2.5 py-2 text-[10px] font-bold text-emerald-100 disabled:opacity-30">Investir</button>}
                      </div>;
                    })}
                  </section>
                  <p className="text-[10px] leading-relaxed text-white/35">Les revenus et investissements utilisent le système économique existant de la simulation. Les montants sont fictifs et propres à ta partie.</p>
                </div>
              )}
              {app === "family" && (
                <div className="space-y-4">
                  <section className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 p-4 ring-1 ring-fuchsia-300/20">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-200/70">Mon foyer</p>
                    <h3 className="mt-1 font-display text-xl font-extrabold">{player.relation >= 2 ? `La famille de ${player.name}` : `Le foyer de ${player.name}`}</h3>
                    <p className="mt-1 text-xs text-white/60">{home.name} · {home.quartier}</p>
                  </section>
                  <section className="glass rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gold-300">Vie sentimentale</p>
                    {player.partnerName ? (
                      <>
                        <p className="mt-2 text-lg font-bold">💞 {player.partnerName}</p>
                        <p className="mt-1 text-xs text-white/60">{player.relation >= 2 ? "Vous êtes mariés dans cette partie." : `Relation en construction · ${player.dates}/${MARRY_DATES_REQUIRED} rendez-vous réalisés.`}</p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-white/70">Tu n&apos;as pas encore de partenaire. Les rencontres peuvent commencer sur la Corniche.</p>
                    )}
                  </section>
                  <section className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gold-300">Enfants du foyer</p>
                      <span className="text-[10px] text-white/40">{(player.children ?? []).length}/3</span>
                    </div>
                    {(player.children ?? []).length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {(player.children ?? []).map((child) => (
                          <div key={child.id} className="rounded-xl bg-white/[0.04] p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-white">{child.gender === "H" ? "👦" : "👧"} {child.name}</p>
                              <span className="text-[10px] text-fuchsia-100">{Math.floor(child.ageDays / 360)} an(s)</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-white/50"><span>Bien-être</span><span>{child.happiness}/100</span></div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-fuchsia-400" style={{ width: `${child.happiness}%` }} /></div>
                            <button onClick={() => { act("parenting", child.id); setApp(null); }} disabled={busy || player.slot >= 3 || player.money < 1000 || player.stats.energy < 5} className="mt-3 w-full rounded-lg bg-fuchsia-500/20 px-3 py-2 text-[10px] font-bold text-fuchsia-100 disabled:opacity-40">🧸 Passer du temps avec {child.name} · 1 000 FCFA</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs leading-relaxed text-white/55">Aucun enfant dans ton foyer pour le moment. Le projet d&apos;adoption devient accessible après le mariage.</p>
                    )}
                    {player.relation >= 2 && (player.children ?? []).length < 3 && (
                      <button onClick={() => { act("adopt_child"); setApp(null); }} disabled={busy || player.slot >= 3 || player.money < 50000 || player.stats.energy < 12} className="mt-3 w-full rounded-xl bg-emerald-500/20 px-3 py-2.5 text-xs font-bold text-emerald-100 disabled:opacity-40">🤝 Préparer une adoption · 50 000 FCFA</button>
                    )}
                    <p className="mt-2 text-[10px] leading-relaxed text-white/35">Simulation fictive : l&apos;accueil d&apos;un enfant est représenté par une adoption simplifiée, sans démarche administrative réelle.</p>
                  </section>
                  <section className="glass rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gold-300">Vie familiale au quotidien</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/65">{player.relation >= 2 ? `Ton foyer partage désormais le quotidien avec ${player.partnerName}. Des moments d'entraide, des repas et parfois de petits désaccords peuvent survenir au fil des journées.` : player.partnerName ? `Ta relation avec ${player.partnerName} évolue au fil de vos échanges. Prendre du temps ensemble aide à entretenir ce lien.` : "Ta famille d'origine garde une place dans ton histoire. Des appels, des repas partagés et des nouvelles des proches peuvent ponctuer tes journées."}</p>
                    <p className="mt-2 text-[10px] text-fuchsia-200/70">Les événements familiaux se déclenchent automatiquement au passage d&apos;une nouvelle journée.</p>
                    <button onClick={() => { act("social", "famille"); setApp(null); }} disabled={busy} className="mt-3 w-full rounded-xl bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-white/15 disabled:opacity-40">📞 Appeler la famille</button>
                    <button onClick={() => { act("family_visit"); setApp(null); }} disabled={busy || player.slot >= 3 || player.money < 2000 || player.stats.energy < 8} className="mt-2 w-full rounded-xl bg-fuchsia-500/20 px-3 py-2.5 text-xs font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/30 disabled:opacity-40">🏡 Rendre visite à la famille · 2 000 FCFA</button>
                    <p className="mt-2 text-[10px] text-white/40">Cette visite prend un moment de la journée et améliore ton bonheur et ta réputation.</p>
                  </section>
                  <p className="text-[10px] leading-relaxed text-white/35">Les enfants grandissent au fil des jours. L&apos;adoption et les activités parentales sont disponibles dans cette version ; la grossesse, l&apos;école et les interactions autonomes avancées restent à développer.</p>
                </div>
              )}
              {app === "journal" && (
                <div className="space-y-2">
                  {events.map((e) => (
                    <div
                      key={e.id}
                      className={`flex items-start gap-2 rounded-xl border-l-2 bg-white/[0.03] p-2.5 ${
                        e.tone === "good" ? "border-teranga-400" : e.tone === "bad" ? "border-flame-500" : e.tone === "epic" ? "border-gold-400" : "border-white/20"
                      }`}
                    >
                      <span className="text-base leading-none">{e.icon}</span>
                      <p className="flex-1 text-[11px] leading-relaxed text-white/75">{e.text}</p>
                      <span className="shrink-0 rounded bg-white/5 px-1 py-0.5 text-[9px] font-bold text-white/35">J{e.day}</span>
                    </div>
                  ))}
                  {events.length === 0 && <p className="text-xs text-white/40">Ton histoire commence ici…</p>}
                </div>
              )}
              {app === "profile" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={player.avatar} alt={player.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-gold-400/50" />
                    <div>
                      <p className="font-display text-lg font-extrabold">{player.name}</p>
                      <p className="text-[11px] text-white/55">
                        {ageOf(player.day)} ans · {originById(player.origin).emoji} {originById(player.origin).name}
                      </p>
                      <p className="text-[11px] text-white/55">
                        {EDU_NAMES[player.education]}{job ? ` · ${job.title}` : ""}{player.relation >= 2 ? ` · 💍 ${player.partnerName}` : ""}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-display text-xs font-extrabold uppercase tracking-wider text-gold-300">✨ Prochains rêves</p>
                    <div className="space-y-2.5">
                      {goals.slice(0, 4).map((g) => (
                        <div key={g.label}>
                          <div className="mb-1 flex justify-between text-[11px]">
                            <span className="font-semibold text-white/80">{g.emoji} {g.label}</span>
                            <span className="tabular-nums text-white/40">{Math.min(99, Math.round(g.progress))}%</span>
                          </div>
                          <ProgressBar value={g.progress} />
                        </div>
                      ))}
                      {goals.length === 0 && <p className="text-xs text-teranga-300">Tous tes rêves sont réalisés 🏆</p>}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-display text-xs font-extrabold uppercase tracking-wider text-gold-300">
                      🏆 Succès · {player.achievements.length}/{ACHIEVEMENTS.length}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {ACHIEVEMENTS.map((a) => {
                        const unlocked = player.achievements.includes(a.id);
                        return (
                          <div key={a.id} title={`${a.name} — ${a.desc}`} className={`rounded-xl p-2 text-center ${unlocked ? "bg-gold-400/15 ring-1 ring-gold-400/50" : "bg-white/5 opacity-35 grayscale"}`}>
                            <span className="text-xl">{a.emoji}</span>
                            <p className="mt-0.5 truncate text-[8px] font-bold text-white/70">{a.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/[0.03] p-3 text-[11px] text-white/60">
                    <p>💼 Journées travaillées : <b className="text-white">{player.totalShifts}</b></p>
                    <p>📍 Missions aujourd&apos;hui : <b className="text-white">{player.missionsToday}/3</b></p>
                    <p>🗺️ Lieux visités : <b className="text-white">{player.visited.length}/11</b></p>
                    <p>🏗️ Businesses : <b className="text-white">{player.businesses.length}/4</b></p>
                  </div>

                  <section className="glass rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold-300">Sauvegarde de ta vie</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/60">Crée une copie de ta progression et de ton journal dans un fichier JSON. Conserve ce fichier dans ton téléphone pour garder une sauvegarde supplémentaire.</p>
                    <button onClick={exportSave} className="mt-3 w-full rounded-xl bg-gold-400/15 px-3 py-3 text-xs font-bold text-gold-200 ring-1 ring-gold-300/20 transition hover:bg-gold-400/25">⬇️ Exporter ma sauvegarde</button>
                    <p className="mt-2 text-[10px] text-white/35">L&apos;export ne remplace pas la sauvegarde automatique locale. La restauration depuis un fichier sera ajoutée dans une prochaine version.</p>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
