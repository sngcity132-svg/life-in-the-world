"use client";

import type { ReactNode } from "react";
import {
  BookOpen,
  Heart,
  HeartHandshake,
  Smile,
  UtensilsCrossed,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { fmtMoney } from "@/lib/data";
import type { Effects, Tone } from "@/lib/types";

/* ---------- Money ---------- */
export function Money({ value, suffix = "FCFA", className = "" }: { value: number; suffix?: string; className?: string }) {
  return (
    <span className={className}>
      {fmtMoney(value)} <span className="text-[0.72em] font-semibold opacity-70">{suffix}</span>
    </span>
  );
}

/* ---------- Stat bar ---------- */
export function StatBar({
  icon,
  label,
  value,
  gradient,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  gradient: string;
}) {
  const low = value < 25;
  return (
    <div className={`min-w-0 ${low ? "stat-low" : ""}`}>
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">
          <span className={low ? "text-flame-400" : "text-white/70"}>{icon}</span>
          <span className="truncate">{label}</span>
        </span>
        <span className={`text-xs font-bold tabular-nums ${low ? "text-flame-400" : "text-white/85"}`}>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`bar-fill h-full rounded-full bg-gradient-to-r ${low ? "from-flame-400 to-flame-500" : gradient}`}
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Progress ---------- */
export function ProgressBar({ value, gradient = "from-gold-300 to-gold-500" }: { value: number; gradient?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div className={`bar-fill h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${Math.min(100, Math.max(2, value))}%` }} />
    </div>
  );
}

/* ---------- Effect chips ---------- */
const FX_META: { key: keyof Effects; icon: ReactNode; label: string }[] = [
  { key: "money", icon: <Wallet size={11} />, label: "F" },
  { key: "health", icon: <Heart size={11} />, label: "Santé" },
  { key: "energy", icon: <Zap size={11} />, label: "Énergie" },
  { key: "satiety", icon: <UtensilsCrossed size={11} />, label: "Ventre" },
  { key: "happiness", icon: <Smile size={11} />, label: "Bonheur" },
  { key: "reputation", icon: <HeartHandshake size={11} />, label: "Teranga" },
  { key: "knowledge", icon: <BookOpen size={11} />, label: "Savoir" },
];

export function EffectChips({ fx }: { fx: Effects }) {
  return (
    <div className="flex flex-wrap gap-1">
      {FX_META.map(({ key, icon, label }) => {
        const v = fx[key];
        if (!v) return null;
        const positive = v > 0;
        return (
          <span
            key={key}
            title={label}
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
              positive ? "bg-teranga-500/15 text-teranga-300" : "bg-flame-500/15 text-flame-400"
            }`}
          >
            {icon}
            {positive ? "+" : "−"}
            {key === "money" ? fmtMoney(Math.abs(v)) : Math.abs(v)}
          </span>
        );
      })}
    </div>
  );
}

/* ---------- Section head ---------- */
export function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight text-white">{title}</h3>
        {sub && <p className="text-xs text-white/50">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ---------- Action card ---------- */
export function ActionCard({
  image,
  emoji,
  title,
  desc,
  fx,
  price,
  badge,
  buttonLabel,
  onAction,
  disabled,
  reason,
  owned,
  busy,
  extra,
}: {
  image: string;
  emoji: string;
  title: string;
  desc: string;
  fx?: Effects;
  price?: number;
  badge?: string;
  buttonLabel: string;
  onAction: () => void;
  disabled?: boolean;
  reason?: string;
  owned?: boolean;
  busy?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="glass card-lift group flex flex-col overflow-hidden rounded-2xl">
      <div className="relative h-28 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} loading="lazy" className="zoom-img h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent" />
        <span className="absolute left-2 top-2 rounded-lg bg-night-950/70 px-2 py-0.5 text-sm backdrop-blur-sm">{emoji}</span>
        {badge && (
          <span className="absolute right-2 top-2 rounded-md bg-gold-400/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-night-950">
            {badge}
          </span>
        )}
        {owned && (
          <span className="absolute right-2 top-2 rounded-md bg-teranga-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            ✓ Acquis
          </span>
        )}
        <h4 className="absolute bottom-2 left-3 right-3 truncate font-display text-sm font-bold text-white drop-shadow">{title}</h4>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-[11px] leading-relaxed text-white/55">{desc}</p>
        {fx && <EffectChips fx={fx} />}
        {extra}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {price !== undefined ? (
            price === 0 ? (
              <span className="text-[11px] font-bold text-teranga-300">Gratuit</span>
            ) : (
              <Money value={price} suffix="F" className="text-xs font-bold text-gold-300" />
            )
          ) : (
            <span />
          )}
          <button
            onClick={onAction}
            disabled={disabled || busy || owned}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
              owned
                ? "cursor-default bg-teranga-500/20 text-teranga-300"
                : disabled
                  ? "cursor-not-allowed bg-white/8 text-white/35"
                  : "btn-gold"
            }`}
          >
            {owned ? "✓ Actif" : buttonLabel}
          </button>
        </div>
        {disabled && reason && !owned && <p className="text-[10px] leading-tight text-flame-400/90">{reason}</p>}
      </div>
    </div>
  );
}

/* ---------- Toasts ---------- */
export interface ToastItem {
  id: number;
  text: string;
  tone: Tone;
  icon: string;
}

const TOAST_STYLE: Record<Tone, string> = {
  good: "border-teranga-400/40 bg-[#0c1f14]/95",
  bad: "border-flame-500/45 bg-[#26100a]/95",
  info: "border-white/15 bg-night-800/95",
  epic: "border-gold-400/55 bg-[#251a06]/95 shadow-[0_0_36px_-8px_rgba(245,185,66,0.45)]",
};

export function ToastStack({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3 backdrop-blur-xl ${TOAST_STYLE[t.tone]}`}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <p className="flex-1 text-xs leading-relaxed text-white/90">{t.text}</p>
          <button onClick={() => onClose(t.id)} className="text-white/40 transition hover:text-white">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
