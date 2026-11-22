"use client";

import { X } from "lucide-react";

export interface DialogueChoice {
  label: string;
  sub?: string;
  primary?: boolean;
  onSelect: () => void;
}

export interface DialogueData {
  portrait: string | null;
  emoji?: string;
  name: string;
  role: string;
  text: string;
  choices: DialogueChoice[];
}

export default function Dialogue({ data, onClose }: { data: DialogueData; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:p-5">
      <div className="glass-deep fade-up w-full max-w-2xl rounded-2xl p-4 shadow-2xl">
        <div className="flex gap-3.5">
          {data.portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.portrait}
              alt={data.name}
              className="h-20 w-20 shrink-0 rounded-xl object-cover ring-2 ring-gold-400/50 sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white/5 text-4xl ring-2 ring-gold-400/30 sm:h-24 sm:w-24">
              {data.emoji ?? "👤"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-extrabold text-gold-300">{data.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{data.role}</p>
              </div>
              <button onClick={onClose} className="text-white/40 transition hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-white/85 sm:text-sm">{data.text}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {data.choices.map((c, i) => (
            <button
              key={i}
              onClick={c.onSelect}
              className={`rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition ${
                c.primary ? "btn-gold" : "glass text-white/85 hover:border-gold-400/40 hover:bg-white/10"
              }`}
            >
              <span className="block">{c.label}</span>
              {c.sub && <span className={`mt-0.5 block text-[10px] font-medium ${c.primary ? "text-night-950/70" : "text-white/45"}`}>{c.sub}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
