"use client";

import { Briefcase, GraduationCap } from "lucide-react";
import {
  BUSINESSES,
  DATE_COST,
  EDU_NAMES,
  EXAMS,
  FOODS,
  HOMES,
  IMG,
  JOBS,
  MARRY_COST,
  MARRY_DATES_REQUIRED,
  PLACES,
  SOCIALS,
  STUDY_COST,
  fmtMoney,
  homeById,
  jobById,
  jobSalaryPreview,
  rankOf,
  weeklyRent,
} from "@/lib/data";
import type { PlayerState } from "@/lib/types";
import { ActionCard, EffectChips, Money, ProgressBar, SectionHead } from "./ui";

export interface PanelProps {
  player: PlayerState;
  act: (type: string, id?: string) => void;
  busy: boolean;
}

const night = (p: PlayerState) => p.slot >= 3;
const NIGHT_REASON = "🌙 La nuit est tombée — dors pour continuer.";

/* ================= QUOTIDIEN ================= */
export function DailyPanel({ player, act, busy }: PanelProps) {
  return (
    <div className="space-y-8">
      <section>
        <SectionHead title="🍽️ Se nourrir" sub="La cuisine sénégalaise, carburant de la vie. (Ne consomme pas de moment)" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {FOODS.map((f) => {
            const broke = player.money < f.price;
            const full = player.stats.satiety >= 98;
            return (
              <ActionCard
                key={f.id}
                image={f.image}
                emoji={f.emoji}
                title={f.name}
                desc={f.desc}
                fx={f.fx}
                price={f.price}
                buttonLabel="Manger"
                onAction={() => act("eat", f.id)}
                busy={busy}
                disabled={broke || full}
                reason={full ? "Tu es rassasié(e)." : broke ? `Il manque ${fmtMoney(f.price - player.money)} F.` : undefined}
              />
            );
          })}
        </div>
      </section>

      <section>
        <SectionHead title="🧘🏾 Bien-être" sub="Repos, soins et sommeil — chaque moment compte." />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          <ActionCard
            image={IMG.beach}
            emoji="😴"
            title="Sieste à l'ombre"
            desc="Un somme sous le manguier pendant que le quartier bourdonne."
            fx={{ energy: 22, happiness: 2, satiety: -4 }}
            buttonLabel="Se reposer"
            onAction={() => act("rest")}
            busy={busy}
            disabled={night(player)}
            reason={NIGHT_REASON}
          />
          <ActionCard
            image={IMG.doctor}
            emoji="🏥"
            title="Hôpital Principal"
            desc="Consultation, traitement anti-palu et vitamines. Santé remontée à 92."
            price={12500}
            buttonLabel="Se soigner"
            onAction={() => act("hospital")}
            busy={busy}
            disabled={night(player) || player.money < 12500}
            reason={night(player) ? NIGHT_REASON : player.money < 12500 ? "Fonds insuffisants." : undefined}
          />
          <ActionCard
            image={IMG.sunset}
            emoji="🌙"
            title="Dormir"
            desc={`Termine la journée. Loyer, business et événements se règlent pendant la nuit.`}
            badge={`Jour ${player.day + 1}`}
            buttonLabel="Dormir →"
            onAction={() => act("sleep")}
            busy={busy}
          />
        </div>
      </section>
    </div>
  );
}

/* ================= CARRIÈRE ================= */
export function CareerPanel({ player, act, busy }: PanelProps) {
  const job = jobById(player.jobId);
  const rank = rankOf(player.shifts);
  const nextExam = player.education < 4 ? EXAMS[player.education] : null;

  return (
    <div className="space-y-8">
      {/* Poste actuel */}
      <section>
        <SectionHead title="💼 Ton gagne-pain" sub="Un moment de la journée par session de travail." />
        {job ? (
          <div className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={job.image} alt={job.title} className="h-24 w-full rounded-xl object-cover sm:w-36" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-display text-lg font-bold">{job.emoji} {job.title}</h4>
                <span className="rounded-md bg-gold-400/15 px-2 py-0.5 text-[10px] font-bold text-gold-300">{rank.label} ×{rank.mult}</span>
              </div>
              <p className="mt-1 text-xs text-white/50">
                {player.shifts} jour(s) travaillés · Salaire estimé :{" "}
                <strong className="text-gold-300">{fmtMoney(jobSalaryPreview(job, player.shifts, player.stats.energy, player.stats.happiness))} FCFA</strong>
              </p>
              {player.shifts < 25 ? (
                <div className="mt-2 max-w-xs">
                  <p className="mb-1 text-[10px] text-white/40">
                    Prochaine promotion : {player.shifts < 10 ? `Confirmé dans ${10 - player.shifts} j` : `Senior dans ${25 - player.shifts} j`}
                  </p>
                  <ProgressBar value={(player.shifts / (player.shifts < 10 ? 10 : 25)) * 100} />
                </div>
              ) : (
                <p className="mt-2 text-[10px] font-bold text-teranga-300">Rang maximum atteint 🏆</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => act("work")}
                disabled={busy || night(player) || player.stats.energy < job.energy || player.stats.health < 20}
                className="btn-gold rounded-xl px-5 py-3 text-xs font-extrabold"
                title={night(player) ? NIGHT_REASON : player.stats.energy < job.energy ? "Énergie insuffisante" : undefined}
              >
                Travailler
              </button>
              <button onClick={() => act("quit")} disabled={busy} className="glass rounded-xl px-3 py-3 text-xs font-bold text-white/60 transition hover:text-flame-400">
                Démissionner
              </button>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl border-dashed p-5 text-center text-sm text-white/55">
            Pas encore de métier. Postule ci-dessous — <strong className="text-gold-300">chaque franc compte</strong> à Dakar.
          </div>
        )}
      </section>

      {/* Études */}
      <section>
        <SectionHead
          title="🎓 Études & diplômes"
          sub={`Diplôme actuel : ${EDU_NAMES[player.education]} · Savoir : ${player.knowledge}/160`}
          right={<GraduationCap size={18} className="text-gold-300" />}
        />
        <div className="mb-3 max-w-md">
          <ProgressBar value={(player.knowledge / 160) * 100} gradient="from-teranga-300 to-teranga-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            image={IMG.students}
            emoji="📖"
            title="Cours du soir"
            desc="Révise à la lumière d'une lampe, entre deux coupures Senelec. +6 à 9 savoir."
            fx={{ knowledge: 7, energy: -18, happiness: -2 }}
            price={STUDY_COST}
            buttonLabel="Réviser"
            onAction={() => act("study")}
            busy={busy}
            disabled={night(player) || player.money < STUDY_COST || player.stats.energy < 20}
            reason={night(player) ? NIGHT_REASON : player.stats.energy < 20 ? "Trop fatigué(e) pour réviser." : player.money < STUDY_COST ? "Fonds insuffisants." : undefined}
          />
          {nextExam ? (
            <ActionCard
              image={IMG.campus}
              emoji="🎓"
              title={`Examen : ${nextExam.name}`}
              desc={`Savoir requis : ${nextExam.req}. Plus tu révises, plus tes chances grimpent (55% à 95%).`}
              price={nextExam.cost}
              badge={EDU_NAMES[nextExam.level]}
              buttonLabel="Passer l'examen"
              onAction={() => act("exam")}
              busy={busy}
              disabled={night(player) || player.knowledge < nextExam.req || player.money < nextExam.cost || player.stats.energy < 15}
              reason={
                night(player) ? NIGHT_REASON
                : player.knowledge < nextExam.req ? `Savoir ${player.knowledge}/${nextExam.req} — révise encore.`
                : player.money < nextExam.cost ? "Frais d'examen trop chers pour l'instant."
                : player.stats.energy < 15 ? "Repose-toi avant l'épreuve." : undefined
              }
            />
          ) : (
            <div className="glass flex flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center">
              <span className="text-4xl">🧠</span>
              <p className="font-display text-sm font-bold text-gold-300">Master obtenu !</p>
              <p className="text-[11px] text-white/50">Tu es au sommet de la pyramide scolaire sénégalaise.</p>
            </div>
          )}
        </div>
      </section>

      {/* Métiers */}
      <section>
        <SectionHead title="🛠️ Offres d'emploi" sub="Du petit commerce aux grandes carrières — tout commence quelque part." right={<Briefcase size={18} className="text-gold-300" />} />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {JOBS.map((j) => {
            const lockedEdu = player.education < j.edu;
            const lockedRep = player.stats.reputation < j.rep;
            const current = player.jobId === j.id;
            return (
              <ActionCard
                key={j.id}
                image={j.image}
                emoji={j.emoji}
                title={j.title}
                desc={j.desc}
                fx={{ money: j.salary, energy: -j.energy }}
                badge={j.edu > 0 ? EDU_NAMES[j.edu] : "Accessible"}
                buttonLabel={current ? "Poste actuel" : "Postuler"}
                onAction={() => act("apply", j.id)}
                busy={busy}
                owned={current}
                disabled={lockedEdu || lockedRep}
                reason={lockedEdu ? `Diplôme requis : ${EDU_NAMES[j.edu]}.` : lockedRep ? `Réputation ${player.stats.reputation}/${j.rep} requise.` : undefined}
                extra={j.rep > 0 ? <p className="text-[10px] text-white/40">🤝 Réputation {j.rep}+ requise</p> : undefined}
              />
            );
          })}
        </div>
      </section>

      {/* Business */}
      <section>
        <SectionHead title="🏗️ Investir dans un business" sub="Revenus automatiques chaque nuit. L'argent travaille pendant que tu dors." />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {BUSINESSES.map((b) => {
            const owned = player.businesses.includes(b.id);
            const broke = player.money < b.cost;
            return (
              <ActionCard
                key={b.id}
                image={b.image}
                emoji={b.emoji}
                title={b.name}
                desc={b.desc}
                price={b.cost}
                owned={owned}
                buttonLabel="Investir"
                onAction={() => act("buy", b.id)}
                busy={busy}
                disabled={!owned && broke}
                reason={broke ? `Il manque ${fmtMoney(b.cost - player.money)} F.` : undefined}
                extra={<span className="w-fit rounded-md bg-gold-400/15 px-2 py-0.5 text-[10px] font-bold text-gold-300">+{fmtMoney(b.income)} F / nuit</span>}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ================= VILLE ================= */
export function CityPanel({ player, act, busy }: PanelProps) {
  return (
    <div>
      <SectionHead title="🗺️ Explorer le Sénégal" sub="Chaque sortie consomme un moment de la journée. Les premières visites marquent l'esprit." />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {PLACES.map((p) => {
          const visited = player.visited.includes(p.id);
          const broke = player.money < p.price;
          const tired = player.stats.energy < 12;
          return (
            <ActionCard
              key={p.id}
              image={p.image}
              emoji={p.emoji}
              title={p.name}
              desc={p.desc}
              fx={p.fx}
              price={p.price}
              badge={visited ? "✓ Visité" : p.tag}
              buttonLabel="Y aller"
              onAction={() => act("visit", p.id)}
              busy={busy}
              disabled={night(player) || broke || tired}
              reason={night(player) ? NIGHT_REASON : broke ? `Il manque ${fmtMoney(p.price - player.money)} F.` : tired ? "Énergie insuffisante." : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ================= TERANGA / SOCIAL ================= */
export function SocialPanel({ player, act, busy }: PanelProps) {
  const canMarry = player.relation === 1 && player.dates >= MARRY_DATES_REQUIRED;
  return (
    <div className="space-y-8">
      {/* Amour */}
      <section>
        <SectionHead title="💘 Vie amoureuse" sub="De la rencontre sur la Corniche au grand mariage." />
        <div className="glass relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.sunset} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-night-950/90 via-night-950/70 to-night-950/40" />
          <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              {player.partnerName ? (
                <>
                  <p className="font-display text-xl font-extrabold">
                    {player.relation >= 2 ? "💍" : "💞"} {player.partnerName}
                  </p>
                  <p className="mt-1 text-xs text-white/65">
                    {player.relation >= 2
                      ? "Marié(e) ! Le foyer rayonne, +3 bonheur chaque nuit."
                      : `En couple · ${player.dates} rendez-vous${player.dates < MARRY_DATES_REQUIRED ? ` — encore ${MARRY_DATES_REQUIRED - player.dates} avant le mariage` : " — le mariage est possible !"}`}
                  </p>
                  {player.relation < 2 && (
                    <div className="mt-2 max-w-xs">
                      <ProgressBar value={(player.dates / MARRY_DATES_REQUIRED) * 100} gradient="from-flame-400 to-gold-400" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="font-display text-xl font-extrabold">Célibataire</p>
                  <p className="mt-1 text-xs text-white/65">Le grand amour t&apos;attend quelque part entre Yoff et la Corniche…</p>
                </>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                onClick={() => act("date")}
                disabled={busy || night(player) || player.money < DATE_COST}
                className="btn-gold rounded-xl px-4 py-3 text-xs font-extrabold"
              >
                {player.partnerName ? "Sortir ensemble" : "Rencontrer quelqu'un"} · {fmtMoney(DATE_COST)} F
              </button>
              {player.relation === 1 && (
                <button
                  onClick={() => act("marry")}
                  disabled={busy || !canMarry || night(player) || player.money < MARRY_COST}
                  title={!canMarry ? `Encore ${MARRY_DATES_REQUIRED - player.dates} rendez-vous` : player.money < MARRY_COST ? "La cérémonie coûte 200 000 F" : undefined}
                  className="glass rounded-xl px-4 py-3 text-xs font-extrabold text-gold-300 transition enabled:hover:border-gold-400/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  💍 Demander sa main · {fmtMoney(MARRY_COST)} F
                </button>
              )}
            </div>
          </div>
        </div>
        {night(player) && <p className="mt-2 text-[11px] text-flame-400/80">{NIGHT_REASON}</p>}
      </section>

      <section>
        <SectionHead title="🤝 Teranga & communauté" sub="La réputation ouvre les portes des meilleurs métiers." />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {SOCIALS.map((s) => {
            const broke = player.money < s.price;
            return (
              <ActionCard
                key={s.id}
                image={s.image}
                emoji={s.emoji}
                title={s.name}
                desc={s.desc}
                fx={s.fx}
                price={s.price}
                buttonLabel="Participer"
                onAction={() => act("social", s.id)}
                busy={busy}
                disabled={night(player) || broke}
                reason={night(player) ? NIGHT_REASON : broke ? "Fonds insuffisants." : undefined}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ================= LOGEMENT ================= */
export function HomePanel({ player, act, busy }: PanelProps) {
  const current = homeById(player.homeId);
  const daysToRent = 7 - (player.day % 7);
  return (
    <div className="space-y-8">
      <section>
        <SectionHead title="🏠 Ton chez-toi" sub="Le confort améliore le sommeil et l'humeur." />
        <div className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.image} alt={current.name} className="h-24 w-full rounded-xl object-cover sm:w-36" />
          <div className="flex-1">
            <h4 className="font-display text-lg font-bold">{current.name}</h4>
            <p className="text-xs text-white/55">📍 {current.quartier} · Confort {"★".repeat(current.comfort)}{"☆".repeat(5 - current.comfort)}</p>
            <p className="mt-1 text-xs text-white/65">
              {current.rent > 0 ? (
                <>Loyer : <Money value={weeklyRent(current.rent)} suffix="F / semaine" className="font-bold text-gold-300" /> · prochain paiement dans <strong>{daysToRent} j</strong></>
              ) : (
                "Logé(e) gratuitement par la famille. Teranga power."
              )}
            </p>
          </div>
          <EffectChips fx={{ energy: 35 + current.comfort * 13 }} />
        </div>
      </section>

      <section>
        <SectionHead title="🔑 Déménager" sub="Caution + première semaine à payer à l'entrée. Loyer prélevé tous les 7 jours." />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {HOMES.map((h) => {
            const owned = player.homeId === h.id;
            const upfront = weeklyRent(h.rent) * 2;
            const broke = player.money < upfront;
            return (
              <ActionCard
                key={h.id}
                image={h.image}
                emoji={h.comfort >= 4 ? "✨" : "🏠"}
                title={h.name}
                desc={`${h.desc} — ${h.quartier}.`}
                price={upfront}
                owned={owned}
                badge={"★".repeat(h.comfort)}
                buttonLabel="Déménager"
                onAction={() => act("move", h.id)}
                busy={busy}
                disabled={!owned && broke}
                reason={broke ? `Il manque ${fmtMoney(upfront - player.money)} F.` : undefined}
                extra={
                  <span className="w-fit rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                    {h.rent > 0 ? `Loyer ${fmtMoney(h.rent)} F / mois` : "Gratuit"}
                  </span>
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
