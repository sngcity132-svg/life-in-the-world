"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BUILDINGS, Building, DISTRICTS, District, MISSION_TARGETS, NPCS, NpcDef,
  SPOTS, Spot, TRAFFIC, WORLD, collide, dist, districtAt, doorPos, LOVE_PORTRAITS,
} from "@/lib/world";
import {
  BUSINESSES, EDU_NAMES, EXAMS, FOODS, HOMES, JOBS, MAX_MISSIONS_PER_DAY,
  MARRY_COST, MARRY_DATES_REQUIRED, MISSIONS, PLACES, PROVERBS, fmtMoney,
  jobSalaryPreview, weeklyRent,
} from "@/lib/data";
import type { PlayerState, Tone } from "@/lib/types";
import { getLocalBonds, saveLocalBond } from "@/lib/offline-store";
import { drawScene, homeDoor, NpcRuntime, PlayerRuntime, TrafficRuntime } from "./render";
import Dialogue, { DialogueChoice, DialogueData } from "./Dialogue";

interface ActiveMission {
  id: string;
  label: string;
  target: { x: number; y: number };
  taxi: boolean;
  deadline: number;
}
interface Sim {
  pr: PlayerRuntime;
  npcs: NpcRuntime[];
  traffic: TrafficRuntime[];
  cam: { x: number; y: number; zoom: number };
  ambient: number;
  evening: number;
  t: number;
  mission: ActiveMission | null;
  lastDistrict: string | null;
  promptClock: number;
  missionClock: number;
  lastHint: number;
  bannerTimer: ReturnType<typeof setTimeout> | null;
}
type Interact =
  | { kind: "exit" }
  | { kind: "vehicle"; v: TrafficRuntime }
  | { kind: "npc"; n: NpcRuntime }
  | { kind: "building"; b: Building }
  | { kind: "spot"; sp: Spot };

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const AMBIENT_BY_SLOT = [0.02, 0.1, 0.38, 0.68];
const vehicleName = (v: TrafficRuntime) =>
  v.def.kind === "bus" ? "Car rapide" : v.def.kind === "taxi" ? "Taxi jaune" : "Voiture";

export default function WorldGame({
  player,
  act,
  busy,
  phoneOpen,
  onPhone,
  notify,
}: {
  player: PlayerState;
  act: (type: string, id?: string) => void;
  busy: boolean;
  phoneOpen: boolean;
  onPhone: () => void;
  notify: (text: string, tone: Tone, icon: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [district, setDistrict] = useState<District | null>(null);
  const [missionUi, setMissionUi] = useState<{ label: string; time: number; dist: number; taxi: boolean } | null>(null);
  const [bigMap, setBigMap] = useState(false);
  const [help, setHelp] = useState(true);
  const [touchRun, setTouchRun] = useState(false);
  const [mapPosition, setMapPosition] = useState({ x: WORLD.spawn.x, y: WORLD.spawn.y });
  const [mapExpanded, setMapExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => { window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, []);
  const isTouch = useMemo(
    () => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0),
    [],
  );

  const propsRef = useRef({ player, busy, phoneOpen, dialogueOpen: false, bigMap });
  propsRef.current = { player, busy, phoneOpen, dialogueOpen: dialogue !== null, bigMap };
  const actionsRef = useRef({ act, notify, onPhone });
  actionsRef.current = { act, notify, onPhone };

  const simRef = useRef<Sim | null>(null);
  const inputRef = useRef({ up: false, down: false, left: false, right: false, run: false });
  const joyRef = useRef({ x: 0, y: 0 });
  const runToggleRef = useRef(false);
  const interactRef = useRef<Interact | null>(null);
  const helpHiddenRef = useRef(false);
  const handlersRef = useRef({ interact: () => {}, toggleMap: () => {}, phone: () => {}, escape: () => {} });

  /* ---------- initialisation du monde ---------- */
  useEffect(() => {
    const spawn = player.cityId === "kaolack" ? { x: 3730, y: 720 } : player.cityId === "thies" ? { x: 3730, y: 2700 } : player.cityId === "touba" ? { x: 3730, y: 3900 } : homeDoor(player.homeId);
    const opp = player.gender === "H" ? "F" : "H";
    const savedBonds = getLocalBonds(player.id);
    const npcs: NpcRuntime[] = NPCS.map((def) => {
      const d: NpcDef = { ...def };
      if (d.id === "love") {
        d.portrait = LOVE_PORTRAITS[opp];
        d.name = player.partnerName ?? "Sur la Corniche…";
      }
      return { def: d, x: d.x, y: d.y, dir: 0, moving: false, phase: Math.random() * 10, tx: d.x, ty: d.y, pause: Math.random() * 2, routineIndex: 0, bond: savedBonds[def.id] ?? 0 };
    });
    const traffic: TrafficRuntime[] = TRAFFIC.map((def, i) => ({
      def, x: def.path[0].x, y: def.path[0].y,
      angle: Math.atan2(def.path[1].y - def.path[0].y, def.path[1].x - def.path[0].x),
      seg: i % def.path.length, parked: false, held: false,
    }));
    simRef.current = {
      pr: {
        x: spawn.x, y: spawn.y + 26, dir: -Math.PI / 2, moving: false, run: false, phase: 0,
        vehicle: null, name: player.name, shirt: "#17a35a", skin: "#6b4226",
      },
      npcs, traffic,
      cam: { x: spawn.x, y: spawn.y, zoom: 1 },
      ambient: AMBIENT_BY_SLOT[Math.min(player.slot, 3)],
      evening: player.slot === 2 ? 1 : 0,
      t: 0, mission: null, lastDistrict: null, promptClock: 0, missionClock: 0, lastHint: 0,
      bannerTimer: null,
    };
    helpHiddenRef.current = false;
    setHelp(true);
    setDialogue(null);
    setMissionUi(null);
    setBigMap(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.id, player.cityId]);

  /* ---------- boucle de jeu ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let nextMapUpdate = 0;

    const step = (dt: number) => {
      const sim = simRef.current;
      if (!sim) return;
      const P = propsRef.current;
      const A = actionsRef.current;
      sim.t += dt;
      const pr = sim.pr;
      if (sim.t >= nextMapUpdate) {
        nextMapUpdate = sim.t + 0.18;
        setMapPosition({ x: pr.x, y: pr.y });
      }
      pr.name = P.player.name;

      // ambiance selon le moment de la journée
      const slot = Math.min(P.player.slot, 3);
      sim.ambient += (AMBIENT_BY_SLOT[slot] - sim.ambient) * Math.min(1, dt * 1.6);
      sim.evening += ((slot === 2 ? 1 : 0) - sim.evening) * Math.min(1, dt * 1.6);

      // PNJ âme sœur dynamique
      const love = sim.npcs.find((n) => n.def.id === "love");
      if (love) {
        const opp = P.player.gender === "H" ? "F" : "H";
        love.def.portrait = LOVE_PORTRAITS[opp];
        love.def.name = P.player.partnerName ?? "Sur la Corniche…";
        love.def.role = P.player.relation >= 2 ? "Ton époux(se)" : P.player.partnerName ? "En couple avec toi" : "Un regard qui intrigue";
      }

      const paused = P.phoneOpen || P.dialogueOpen || P.bigMap || !P.player.alive;
      const k = inputRef.current;
      const j = joyRef.current;
      let ix = (k.right ? 1 : 0) - (k.left ? 1 : 0) + j.x;
      let iy = (k.down ? 1 : 0) - (k.up ? 1 : 0) + j.y;
      const len = Math.hypot(ix, iy);
      if (len > 1) { ix /= len; iy /= len; }
      if (paused) { ix = 0; iy = 0; }
      const moving = Math.hypot(ix, iy) > 0.05;
      const run = k.run || runToggleRef.current;
      pr.moving = moving;
      pr.run = run;

      if (moving) {
        if (!helpHiddenRef.current) {
          helpHiddenRef.current = true;
          setHelp(false);
        }
        const dir = Math.atan2(iy, ix);
        if (pr.vehicle) {
          const v = pr.vehicle;
          const speed = 310;
          const np = collide(pr.x + ix * speed * dt, pr.y + iy * speed * dt, 24);
          pr.x = np.x; pr.y = np.y;
          let da = dir - v.angle;
          while (da > Math.PI) da -= Math.PI * 2;
          while (da < -Math.PI) da += Math.PI * 2;
          v.angle += da * Math.min(1, dt * 8);
          v.x = pr.x; v.y = pr.y;
          pr.dir = v.angle;
        } else {
          const speed = run ? 238 : 158;
          const np = collide(pr.x + ix * speed * dt, pr.y + iy * speed * dt, 12);
          pr.x = np.x; pr.y = np.y;
          pr.dir = dir;
          pr.phase += dt * (run ? 1.5 : 1);
        }
      }

      // caméra
      sim.cam.x += (pr.x - sim.cam.x) * Math.min(1, dt * 5);
      sim.cam.y += (pr.y - sim.cam.y) * Math.min(1, dt * 5);
      const targetZoom = pr.vehicle ? 0.82 : 1;
      sim.cam.zoom += (targetZoom - sim.cam.zoom) * Math.min(1, dt * 3);

      // PNJ
      for (const n of sim.npcs) {
        if (n.pause > 0) {
          n.pause -= dt;
          n.moving = false;
          continue;
        }
        const dx = n.tx - n.x, dy = n.ty - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 4) {
          n.pause = n.def.routineStops?.length ? 3 + Math.random() * 4 : 1 + Math.random() * 3.5;
          const scheduledStops = n.def.routineBySlot?.[slot as 0 | 1 | 2 | 3] ?? n.def.routineStops;
          if (scheduledStops?.length) {
            n.routineIndex = (n.routineIndex + 1) % scheduledStops.length;
            const stop = scheduledStops[n.routineIndex];
            n.tx = stop.x;
            n.ty = stop.y;
          } else {
            n.tx = n.def.x + (Math.random() * 2 - 1) * n.def.radius;
            n.ty = n.def.y + (Math.random() * 2 - 1) * n.def.radius;
          }
          n.moving = false;
        } else {
          const sp = 42;
          n.x += (dx / d) * sp * dt;
          n.y += (dy / d) * sp * dt;
          n.dir = Math.atan2(dy, dx);
          n.moving = true;
          n.phase += dt * 0.8;
        }
      }

      // circulation
      for (const v of sim.traffic) {
        if (v.held || v.parked) continue;
        const path = v.def.path;
        const next = path[(v.seg + 1) % path.length];
        const cur = path[v.seg % path.length];
        const segDx = next.x - cur.x, segDy = next.y - cur.y;
        const segLen = Math.hypot(segDx, segDy) || 1;
        const nx = -segDy / segLen, ny = segDx / segLen;
        const tx = next.x + nx * 13, ty = next.y + ny * 13;
        const dx = tx - v.x, dy = ty - v.y;
        const d = Math.hypot(dx, dy);
        if (d < 10) {
          v.seg = (v.seg + 1) % path.length;
        } else {
          v.x += (dx / d) * v.def.speed * dt;
          v.y += (dy / d) * v.def.speed * dt;
          v.angle = Math.atan2(dy, dx);
        }
      }

      // mission active
      if (sim.mission) {
        const m = sim.mission;
        const remaining = m.deadline - sim.t;
        const d = dist(pr, m.target);
        if (remaining <= 0) {
          sim.mission = null;
          setMissionUi(null);
          A.notify("Mission expirée… Le client est parti. Retente ta chance auprès d'Ousmane ou Cheikh.", "bad", "⏱️");
        } else if (d < 90) {
          if (m.taxi && !pr.vehicle) {
            if (sim.t - sim.lastHint > 5) {
              sim.lastHint = sim.t;
              A.notify("Il faut une voiture pour déposer le passager ! Approche-toi d'un véhicule et appuie sur E.", "info", "🚕");
            }
          } else {
            A.act("mission", m.id);
            sim.mission = null;
            setMissionUi(null);
          }
        }
        sim.missionClock += dt;
        if (sim.mission && sim.missionClock > 0.4) {
          sim.missionClock = 0;
          setMissionUi({ label: m.label, time: Math.max(0, Math.ceil(remaining)), dist: Math.round(d / 10), taxi: m.taxi });
        }
      }

      // invite d'interaction
      sim.promptClock += dt;
      if (sim.promptClock > 0.12) {
        sim.promptClock = 0;
        let best: Interact | null = null;
        let bestD = Infinity;
        let label: string | null = null;
        if (pr.vehicle) {
          best = { kind: "exit" };
          label = "Sortir du véhicule";
        } else if (!paused) {
          for (const n of sim.npcs) {
            const d = dist(pr, n);
            if (d < 58 && d < bestD) { bestD = d; best = { kind: "npc", n }; label = `Parler à ${n.def.name}`; }
          }
          for (const b of BUILDINGS) {
            const d = dist(pr, doorPos(b));
            if (d < 66 && d < bestD) { bestD = d; best = { kind: "building", b }; label = `${b.emoji} ${b.name}`; }
          }
          for (const sp of SPOTS) {
            const d = dist(pr, sp);
            if (d < 60 && d < bestD) { bestD = d; best = { kind: "spot", sp }; label = `${sp.emoji} ${sp.name}`; }
          }
          for (const v of sim.traffic) {
            if (v.held) continue;
            const d = dist(pr, v);
            if (d < 62 && d < bestD) { bestD = d; best = { kind: "vehicle", v }; label = `Prendre le volant — ${vehicleName(v)}`; }
          }
        }
        interactRef.current = best;
        setPrompt((prev) => (prev === label ? prev : label));
      }

      // quartier
      const dHere = districtAt(pr.x, pr.y);
      const dId = dHere?.id ?? null;
      if (dId !== sim.lastDistrict) {
        sim.lastDistrict = dId;
        setDistrict(dHere);
        if (sim.bannerTimer) clearTimeout(sim.bannerTimer);
        sim.bannerTimer = setTimeout(() => setDistrict(null), 3600);
      }
    };

    const draw = () => {
      const sim = simRef.current;
      if (!sim || W === 0) return;
      const P = propsRef.current;
      drawScene(ctx, W, H, dpr, {
        t: sim.t,
        ambient: sim.ambient,
        evening: sim.evening,
        cam: sim.cam,
        player: sim.pr,
        npcs: sim.npcs,
        traffic: sim.traffic,
        mission: sim.mission ? sim.mission.target : null,
        homeId: P.player.homeId,
        jobId: P.player.jobId,
        bigMap: P.bigMap,
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      const sim = simRef.current;
      if (sim?.bannerTimer) clearTimeout(sim.bannerTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.id, player.cityId]);

  /* ---------- dialogues ---------- */
  const actClose = (type: string, id?: string) => {
    actionsRef.current.act(type, id);
    setDialogue(null);
  };
  const leave: DialogueChoice = { label: "👋🏾 Partir", onSelect: () => setDialogue(null) };
  const talk = (lines: string[]): DialogueChoice => ({
    label: "💬 Discuter",
    onSelect: () => setDialogue((d) => (d ? { ...d, text: pick(lines) } : d)),
  });
  const eatChoices = (): DialogueChoice[] =>
    FOODS.filter((f) => f.id !== "cafe").map((f) => ({
      label: `${f.emoji} ${f.name} · ${fmtMoney(f.price)} F`,
      sub: `Ventre +${f.fx.satiety ?? 0} · Bonheur +${f.fx.happiness ?? 0}`,
      onSelect: () => actClose("eat", f.id),
    }));
  const jobChoices = (jobId: string): DialogueChoice[] => {
    const j = JOBS.find((x) => x.id === jobId);
    if (!j) return [];
    const p = propsRef.current.player;
    if (p.jobId === jobId)
      return [{
        label: "💼 Travailler une journée",
        sub: `~${fmtMoney(jobSalaryPreview(j, p.shifts, p.stats.energy, p.stats.happiness))} F · consomme 1 moment`,
        primary: true,
        onSelect: () => actClose("work"),
      }];
    return [{
      label: `🤝 Postuler : ${j.title}`,
      sub: `${fmtMoney(j.salary)} F/jour${j.edu ? ` · diplôme ${EDU_NAMES[j.edu]}` : ""}${j.rep ? ` · réputation ${j.rep}+` : ""}`,
      primary: true,
      onSelect: () => actClose("apply", jobId),
    }];
  };
  const missionChoice = (id: string): DialogueChoice | null => {
    const p = propsRef.current.player;
    if (p.missionsToday >= MAX_MISSIONS_PER_DAY) return null;
    const m = MISSIONS.find((x) => x.id === id);
    if (!m) return null;
    return {
      label: `${m.emoji} Mission : +${fmtMoney(m.reward)} F`,
      sub: m.label,
      onSelect: () => startMission(id),
    };
  };
  const businessChoice = (bizId: string): DialogueChoice | null => {
    const p = propsRef.current.player;
    if (p.businesses.includes(bizId)) return null;
    const b = BUSINESSES.find((x) => x.id === bizId);
    if (!b) return null;
    return {
      label: `🏗️ Investir : ${b.name}`,
      sub: `${fmtMoney(b.cost)} F · revenu brut potentiel : ${fmtMoney(b.income)} F/jour`,
      onSelect: () => actClose("buy", bizId),
    };
  };
  const businessManagementChoices = (bizId: string): DialogueChoice[] => {
    const p = propsRef.current.player;
    if (!p.businesses.includes(bizId)) return [];
    const biz = BUSINESSES.find((x) => x.id === bizId);
    if (!biz) return [];
    const state = p.businessOps?.[bizId] ?? { stock: 0, employees: 0, level: 1, branches: 1 };
    const stockUnits = Math.min(3, 10 - state.stock);
    const stockCost = stockUnits > 0 ? Math.max(1000, Math.round(Math.max(5000, biz.cost * 0.025) * stockUnits / 3)) : 0;
    const upgradeCost = Math.round(biz.cost * (0.35 + state.level * 0.15));
    const branchCost = Math.round(biz.cost * 0.6);
    const branches = state.branches ?? 1;
    return [
      ...(stockUnits > 0 ? [{ label: `📦 Réapprovisionner · ${fmtMoney(stockCost)} F`, sub: `Stock actuel : ${state.stock}/10 · +${stockUnits} unité(s)`, onSelect: () => actClose("manage-business", `stock:${bizId}`) }] : []),
      ...(state.employees < 3 ? [{ label: "👥 Recruter un employé · 5 000 F", sub: `Effectif : ${state.employees}/3 · salaire 1 800 F/jour`, onSelect: () => actClose("manage-business", `hire:${bizId}`) }] : []),
      ...(state.level < 3 ? [{ label: `📈 Améliorer l'entreprise · ${fmtMoney(upgradeCost)} F`, sub: `Niveau ${state.level} → ${state.level + 1}`, onSelect: () => actClose("manage-business", `upgrade:${bizId}`) }] : []),
      ...(branches < 3 ? [{ label: `🏬 Ouvrir une succursale · ${fmtMoney(branchCost)} F`, sub: `${branches}/3 points de vente · stock supplémentaire nécessaire`, onSelect: () => actClose("manage-business", `branch:${bizId}`) }] : []),
    ];
  };

  const studyChoices = (): DialogueChoice[] => {
    const p = propsRef.current.player;
    const arr: DialogueChoice[] = [{
      label: "📖 Suivre un cours · 1 500 F",
      sub: `Savoir actuel : ${p.knowledge}/160 · +6 à 9`,
      primary: true,
      onSelect: () => actClose("study"),
    }];
    if (p.education < 4) {
      const ex = EXAMS[p.education];
      arr.push({
        label: `🎓 Passer le ${ex.name} · ${fmtMoney(ex.cost)} F`,
        sub: `Savoir requis : ${ex.req} ${p.knowledge >= ex.req ? "✓" : `(tu as ${p.knowledge})`}`,
        onSelect: () => actClose("exam"),
      });
    }
    return arr;
  };

  const startMission = (id: string) => {
    const sim = simRef.current;
    const p = propsRef.current.player;
    if (!sim) return;
    if (p.missionsToday >= MAX_MISSIONS_PER_DAY) {
      actionsRef.current.notify(`Maximum ${MAX_MISSIONS_PER_DAY} missions par jour. Reviens demain !`, "bad", "😮‍💨");
      return;
    }
    const def = MISSIONS.find((m) => m.id === id);
    const target = MISSION_TARGETS[id];
    if (!def || !target) return;
    sim.mission = { id, label: def.label, target: target.dropoff, taxi: id.startsWith("taxi"), deadline: sim.t + 150 };
    sim.missionClock = 1;
    setDialogue(null);
    actionsRef.current.notify(`Mission acceptée : ${def.label}. Suis le marqueur jaune ! (150 s)`, "info", "📍");
    if (id.startsWith("taxi")) {
      actionsRef.current.notify("Prends le volant d'un véhicule (E près d'une voiture) pour transporter le passager.", "info", "🚕");
    }
  };

  const mount = (v: TrafficRuntime) => {
    const sim = simRef.current;
    if (!sim) return;
    v.held = true;
    v.parked = false;
    sim.pr.vehicle = v;
    sim.pr.x = v.x;
    sim.pr.y = v.y;
    setDialogue(null);
    actionsRef.current.notify("En voiture ! Conduis avec ZQSD / flèches, E pour sortir.", "info", "🚗");
  };
  const doExit = () => {
    const sim = simRef.current;
    if (!sim || !sim.pr.vehicle) return;
    const v = sim.pr.vehicle;
    v.held = false;
    v.parked = true;
    sim.pr.vehicle = null;
    const np = collide(v.x + Math.cos(v.angle + Math.PI / 2) * 38, v.y + Math.sin(v.angle + Math.PI / 2) * 38, 12);
    sim.pr.x = np.x;
    sim.pr.y = np.y;
  };

  const npcDialogue = (n: NpcRuntime): DialogueData => {
    const p = propsRef.current.player;
    const base = { portrait: n.def.portrait, name: n.def.name, role: n.def.role };
    const mk = (text: string, choices: (DialogueChoice | null)[]): DialogueData => ({
      ...base, text, choices: [...choices.filter((c): c is DialogueChoice => c !== null), leave],
    });
    const friendshipChoice: DialogueChoice | null = n.bond >= 5 ? null : {
      label: n.bond === 0 ? "🤝 Faire connaissance" : "☕ Passer un moment ensemble",
      sub: `Amitié : ${n.bond}/5 · Progression enregistrée sur cet appareil`,
      primary: true,
      onSelect: () => {
        n.bond = Math.min(5, n.bond + 1);
        saveLocalBond(p.id, n.def.id, n.bond);
        actionsRef.current.notify(n.bond >= 5 ? `${n.def.name} est devenu(e) un(e) ami(e) proche !` : `Tu renforces ton lien avec ${n.def.name}. Amitié : ${n.bond}/5.`, "good", "🤝");
        setDialogue(npcDialogue(n));
      },
    };
    switch (n.def.id) {
      case "awa":
        return mk("Sama waay, assieds-toi ! Mon thiéboudienne est le meilleur de tout Dakar. Tu veux goûter ?", [
          ...eatChoices(), missionChoice("livraison_thieb"), businessChoice("resto"), ...businessManagementChoices("resto"),
          talk(["Le secret ? Du riz brisé, du poisson frais de Soumbédioune et beaucoup d'amour.", "Les affaires marchent doucement… mais Yalla gère.", "Reviens ce soir, je prépare le yassa."]),
        ]);
      case "modou":
        return mk("Regarde ce boubou brodé ! Pour la Tabaski, tout le quartier commande chez moi. Tu veux apprendre le métier ?", [
          ...jobChoices("couturier"),
          talk(["Un bon tailleur habille trois générations d'une même famille.", "Le tissu wax parle, il faut savoir l'écouter.", "Ma machine Singer a plus d'années que toi !"]),
        ]);
      case "ibou":
        return mk("La mer était généreuse ce matin. Des thiof gros comme ça ! La pirogue t'attend si tu as le cœur marin.", [
          ...jobChoices("pecheur"),
          talk(["Mon père pêchait ici, et son père avant lui. Yoff est dans mon sang.", "Attention au courant près de la pointe des Almadies.", "Le vent tourne… on sortira la pirogue à l'aube."]),
        ]);
      case "cheikh":
        return mk("Bienvenue à Sandaga ! Ici, tout s'achète et tout se négocie. Tu cherches du travail ou tu veux faire affaire ?", [
          ...jobChoices("vendeur"), missionChoice("livraison_ucad"), businessChoice("table"), ...businessManagementChoices("table"),
          talk(["Le premier prix n'est jamais le vrai prix. Jamais.", "J'ai commencé avec une table et trois mangues. Regarde-moi maintenant.", "Les clients du Plateau paient bien, mais ils négocient dur."]),
        ]);
      case "fall":
        return mk("La connaissance est la seule richesse qu'on ne peut pas te voler. Assieds-toi, mon enfant, et étudie.", [
          ...studyChoices(),
          talk(PROVERBS),
        ]);
      case "kane":
        return mk("Tu as l'air fatigué(e). Le palu ne pardonne pas en hivernage. Une consultation et ça repart !", [
          { label: "🏥 Consultation complète · 12 500 F", sub: "Santé → 92 · Énergie → 65", primary: true, onSelect: () => actClose("hospital") },
          ...(p.education >= 4 ? jobChoices("medecin") : []),
          talk(["Dors sous moustiquaire, c'est non négociable.", "Bois de l'eau, beaucoup d'eau. La chaleur de Dakar est traître.", "L'hôpital Principal ne ferme jamais ses portes."]),
        ]);
      case "ousmane":
        return mk("Woy, tu veux rouler ? Les courses ne manquent pas : l'hôpital, la fac… Prends un taxi et fais-toi de l'argent !", [
          missionChoice("taxi_hopital"), missionChoice("taxi_ucad"), businessChoice("taxi"), ...businessManagementChoices("taxi"),
          talk(["Un bon taxi connaît chaque raccourci de la VDN.", "Les embouteillages du matin ? Pars par la Corniche.", "Le car rapide, c'est folklore. Le taxi, c'est business."]),
        ]);
      case "fatou":
        return mk("Viens prendre l'attaya sous le baobab. Trois doses : la première amère comme la vie, la dernière douce comme l'amour.", [
          { label: "🍵 Attaya avec le groupe · 500 F", sub: "Bonheur +7 · Teranga +4", primary: true, onSelect: () => actClose("social", "attaya") },
          talk([
            "On dit que la famille du Plateau cherche quelqu'un de fiable…",
            `Ton loyer tombe tous les 7 jours, ne l'oublie pas. Nous sommes au jour ${p.day}.`,
            "La Corniche au coucher du soleil… c'est là que les cœurs se rencontrent.",
            ...PROVERBS,
          ]),
        ]);
      case "imam":
        return mk("As-salamu alaykum. La mosquée est ouverte à tous. Les cinq prières rythment la journée des fidèles ; chacun avance à son rythme et dans le respect des autres.", [
          { label: "🕌 Entrer en prière", sub: "Gratuit · Bonheur +7 · Santé +2", primary: true, onSelect: () => actClose("visit", "mosquee") },
          talk(["La patience est une prière silencieuse.", "La sadaqa peut aussi être un sourire ou une aide apportée au voisin.", "Que la paix soit sur toi et ta famille."]),
        ]);
      case "sokhna":
        return mk("As-salamu alaykum ! Je suis enseignante. Ma foi m'accompagne dans mon quotidien : je prends du temps pour la prière, l'étude et le service aux autres. Le foulard est aussi un choix personnel auquel je tiens.", [
          friendshipChoice,
          { label: "🕌 Visiter la mosquée de la Médina", sub: "Gratuit · Temps de recueillement", onSelect: () => actClose("visit", "mosquee-medina") },
          talk(["L'éducation des filles et des garçons mérite la même attention.", "J'essaie d'organiser ma journée autour de mes cours, de ma famille et des prières.", "La modestie, la bienveillance et le savoir peuvent avancer ensemble."]),
        ]);
      case "khadija":
        return mk("Wa alaykum salam ! Je travaille comme infirmière. Être présente pour les patients est une responsabilité importante. Je suis musulmane pratiquante et je porte le hijab par conviction.", [
          friendshipChoice,
          { label: "🕌 Visiter la mosquée de la Médina", sub: "Gratuit · Temps de recueillement", onSelect: () => actClose("visit", "mosquee-medina") },
          talk(["À l'hôpital, je soigne tout le monde avec le même respect.", "La foi m'aide à garder patience pendant les longues gardes.", "Prendre soin de soi permet aussi de mieux prendre soin des autres."]),
        ]);
      case "jean-baptiste":
        return mk("Bonjour et bienvenue. Je suis chrétien pratiquant. Ma foi compte dans ma vie, mais elle ne m'empêche jamais de soigner et de respecter les personnes de toutes convictions.", [
          friendshipChoice,
          { label: "⛪ Visiter l'église Saint-Pierre", sub: "Gratuit · Temps de recueillement", onSelect: () => actClose("visit", "eglise") },
          talk(["La prière et le service aux autres m'aident à garder le cap.", "À l'hôpital, chaque patient mérite la même attention.", "Le dialogue entre voisins de religions différentes est précieux."]),
        ]);
      case "priya":
        return mk("Namaste ! Je suis hindoue pratiquante et commerçante. Mes traditions, mes prières et les fêtes de ma famille font partie de mon quotidien. Je respecte aussi les chemins spirituels des autres.", [
          friendshipChoice,
          { label: "🛕 Visiter la maison de prière", sub: "Gratuit · Découverte respectueuse", onSelect: () => actClose("visit", "temple-hindou") },
          talk(["La diversité des traditions hindoues est très grande.", "La famille et l'accueil occupent une place importante dans ma vie.", "On peut apprendre les uns des autres sans se ressembler."]),
        ]);
      case "ananda":
        return mk("Bonjour. Je suis bouddhiste pratiquant. La méditation m'aide à cultiver l'attention, la compassion et la patience. Tu es libre de découvrir cet espace sans obligation de participer.", [
          friendshipChoice,
          { label: "🪷 Découvrir le centre de méditation", sub: "Gratuit · Moment de calme", onSelect: () => actClose("visit", "centre-meditation") },
          talk(["La méditation est une pratique, pas une compétition.", "La compassion commence aussi par de petits gestes.", "Chacun peut poser des questions avec respect."]),
        ]);
      case "binta-sarr":
        return mk("Bonjour. Je travaille à faire connaître les patrimoines et les traditions spirituelles sérères. Ces traditions sont diverses et vivantes ; je préfère les expliquer avec précision plutôt que les réduire à des clichés.", [
          friendshipChoice,
          { label: "🌿 Découvrir la Maison des traditions", sub: "Gratuit · Culture et transmission", onSelect: () => actClose("visit", "maison-cultures") },
          talk(["Les traditions locales ne sont pas toutes identiques.", "L'histoire orale mérite d'être écoutée et documentée.", "Le respect commence quand on laisse les personnes parler de leur propre culture."]),
        ]);
      case "esther-cohen":
        return mk("Bonjour, je suis médecin et juive pratiquante. Ma tradition, ma famille et mon travail comptent beaucoup pour moi. Je suis toujours heureuse de dialoguer dans le respect des convictions de chacun.", [
          friendshipChoice,
          { label: "✡️ Découvrir la maison communautaire", sub: "Gratuit · Rencontre et recueillement", onSelect: () => actClose("visit", "synagogue") },
          talk(["Le judaïsme rassemble des traditions et des communautés diverses.", "Le soin des patients et la solidarité sont au cœur de mon engagement.", "Le dialogue commence par l'écoute et la curiosité respectueuse."]),
        ]);
      case "harjit-singh":
        return mk("Sat sri akal ! Je suis entrepreneur et sikh pratiquant. Le service désintéressé, le partage et l'égalité sont des valeurs importantes dans ma vie.", [
          friendshipChoice,
          { label: "🪯 Découvrir le gurdwara", sub: "Gratuit · Partage et service", onSelect: () => actClose("visit", "gurdwara") },
          talk(["Le seva, le service rendu sans attendre de récompense, est une pratique importante pour moi.", "Au gurdwara, le repas communautaire est un symbole de partage et d'égalité.", "On peut travailler ensemble malgré nos différences."]),
        ]);
      case "maya-fall":
        return mk("Salut ! Je suis étudiante. Je n'appartiens à aucune religion et je préfère construire mes convictions personnelles. Je respecte les croyants comme les personnes sans religion.", [
          friendshipChoice,
          talk(["Ne pas avoir de religion ne signifie pas manquer de valeurs.", "J'aime apprendre auprès de personnes qui ont des parcours différents.", "La liberté de conscience doit être respectée pour tout le monde."]),
        ]);
      case "coach":
        return mk("Les Lions s'entraînent dur ! Viens au stade, l'ambiance est électrique. Et la lutte, tu connais ? Le vrai sport national !", [
          { label: "⚽ Assister au match · 1 500 F", sub: "Bonheur +12 · Les Lions peuvent gagner !", primary: true, onSelect: () => actClose("visit", "stade") },
          { label: "🤼 Voir un combat de lutte · 2 000 F", sub: "Bonheur +14 · Tambours et gris-gris", onSelect: () => actClose("visit", "lutte") },
          talk(["Mané, Sarr, Koulibaly… quelle génération !", "La lutte, c'est 50% de force et 50% de mystique.", "Un jour, tu porteras le maillot vert. Continue de t'entraîner."]),
        ]);
      case "ndeye":
        return mk("Mon bissap est glacé, bien rouge, bien sucré ! Aide-moi à porter ces caisses et je te raconte les nouvelles du quartier.", [
          { label: "🤝 L'aider à porter les caisses", sub: "Teranga +8 · Énergie −10", primary: true, onSelect: () => actClose("social", "voisin") },
          talk(["Le quartier parle de toi, en bien paraît-il !", "Maman Awa cherche quelqu'un pour livrer son thieb…", "La vie est dure mais le bissap est doux."]),
        ]);
      case "coumba":
        return mk("Je révise mon droit civil… La fac est dure mais le diplôme ouvre toutes les portes. On étudie ensemble ?", [
          { label: "📖 Réviser avec elle · 1 500 F", sub: "+6 à 9 savoir", primary: true, onSelect: () => actClose("study") },
          talk(["Le Pr Fall est exigeant mais juste.", "Avec une Licence, Diamniadio Tech recrute sans hésiter.", "La bibliothèque est calme… quand il n'y a pas de coupure de clim."]),
        ]);
      case "love": {
        const opp = p.gender === "H" ? "F" : "H";
        const name = p.partnerName ?? "Un regard sur la Corniche";
        const portrait = LOVE_PORTRAITS[opp];
        if (p.relation >= 2)
          return {
            portrait, name, role: "Ton époux(se)",
            text: `${name} t'attend face à l'océan. « Chaque coucher de soleil avec toi est une fête. »`,
            choices: [
              { label: `❤️ Dîner en amoureux · 8 000 F`, sub: "Bonheur +12", primary: true, onSelect: () => actClose("date") },
              talk(["Notre maison, notre avenir… on en parle chaque soir.", "La famille veut qu'on vienne manger dimanche."]),
              leave,
            ],
          };
        if (p.partnerName)
          return {
            portrait, name, role: "En couple avec toi",
            text: `${name} sourit en te voyant arriver. ${p.dates >= MARRY_DATES_REQUIRED ? "« J'ai quelque chose de sérieux à te dire… »" : `Encore ${MARRY_DATES_REQUIRED - p.dates} rendez-vous avant la grande question.`}`,
            choices: [
              { label: "💞 Passer un moment ensemble · 8 000 F", sub: `Rendez-vous n°${p.dates + 1}`, primary: true, onSelect: () => actClose("date") },
              ...(p.dates >= MARRY_DATES_REQUIRED
                ? [{ label: `💍 Demander sa main · ${fmtMoney(MARRY_COST)} F`, sub: "Dot, traiteur, sabar — la grande fête !", primary: true, onSelect: () => actClose("marry") }]
                : []),
              leave,
            ],
          };
        return {
          portrait, name, role: "Inconnu(e) au bord de l'eau",
          text: "Quelqu'un regarde l'océan, un sourire en coin. Le soleil descend sur la Corniche… C'est le moment ou jamais.",
          choices: [
            { label: "💘 Engager la conversation · 8 000 F", sub: "Un rendez-vous au coucher du soleil", primary: true, onSelect: () => actClose("date") },
            leave,
          ],
        };
      }
      case "liwei":
      case "meichen":
      case "daniel":
      case "sofia":
      case "maria":
      case "yuki":
      case "thomas":
      case "amina": {
        const greetings: Record<string, string> = {
          liwei: "Je travaille sur des bâtiments qui respectent le climat et les usages locaux. Dakar est une ville passionnante.",
          meichen: "Je découvre le commerce sénégalais et j'apprends quelques expressions en wolof. J'aime beaucoup l'énergie du campus.",
          daniel: "Les journées à l'hôpital sont intenses. Mais prendre soin des gens donne du sens à mon travail.",
          sofia: "Je photographie les scènes de rue, les marchés et les couchers de soleil. Chaque quartier raconte une histoire.",
          maria: "La cuisine capverdienne et la cuisine sénégalaise ont tant à partager. J'aimerais organiser un repas culturel.",
          yuki: "Je développe des outils numériques et je cherche toujours de nouvelles idées. Tu travailles dans la tech ?",
          thomas: "J'enseigne les langues. Parler avec les habitants est la meilleure façon de comprendre une ville.",
          amina: "Je développe une petite activité entre le Mali et le Sénégal. Le réseau et la confiance sont essentiels.",
        };
        const bondText = n.bond === 0 ? "Vous venez de vous rencontrer." : n.bond < 3 ? `Vous commencez à vous connaître. Niveau d'amitié : ${n.bond}/5.` : n.bond < 5 ? `Vous êtes de bons amis. Niveau d'amitié : ${n.bond}/5.` : "Vous êtes des amis proches. Vous vous faites confiance.";
        return mk(`${greetings[n.def.id] ?? "Ravi(e) de te rencontrer."} ${bondText}`, [friendshipChoice, talk(["Tu connais un bon endroit pour manger dans le quartier ?", "On devrait se retrouver un de ces jours.", "C'est agréable de rencontrer des personnes de cultures différentes."]) ]);
      }
      default:
        const cityName = ({ dakar: "Dakar", kaolack: "Kaolack", thies: "Thiès", touba: "Touba" } as const)[p.cityId ?? "dakar"];
        return mk(`Nanga def ? La vie suit son cours à ${cityName}.`, [friendshipChoice, talk(PROVERBS)]);
    }
  };

  const buildingDialogue = (b: Building): DialogueData => {
    const p = propsRef.current.player;
    const base = { portrait: null as string | null, emoji: b.emoji, name: b.name, role: "Bâtiment" };
    const mk = (text: string, choices: (DialogueChoice | null)[]): DialogueData => ({
      ...base, text, choices: [...choices.filter((c): c is DialogueChoice => c !== null), leave],
    });
    if (b.home) {
      const home = HOMES.find((h) => h.id === b.home);
      if (p.homeId === b.home)
        return mk("Ton chez-toi. Le lit n'attend que toi… ou continue d'explorer la ville.", [
          { label: `😴 Dormir → Jour ${p.day + 1}`, sub: "Récupère énergie & santé · loyers et business la nuit", primary: true, onSelect: () => actClose("sleep") },
          { label: "📱 Ouvrir le téléphone", onSelect: () => { setDialogue(null); actionsRef.current.onPhone(); } },
        ]);
      return mk(`${home?.desc ?? ""} Loyer : ${home && home.rent > 0 ? `${fmtMoney(home.rent)} F/mois` : "gratuit"}.`, [
        { label: "🔑 Emménager ici", sub: `Entrée : ${fmtMoney(weeklyRent(home?.rent ?? 0) * 2)} F (caution + semaine)`, primary: true, onSelect: () => actClose("move", b.home) },
      ]);
    }
    switch (b.id) {
      case "awa":
        return mk("L'odeur du thieb flotte depuis la rue. Maman Awa est aux fourneaux.", [
          ...eatChoices(), missionChoice("livraison_thieb"), businessChoice("resto"), ...businessManagementChoices("resto"),
        ]);
      case "sandaga":
        return mk("Le marché gronde : tissus, radios, négociations. Le cœur du commerce dakarois.", [
          ...jobChoices("vendeur"), missionChoice("livraison_ucad"), businessChoice("table"), ...businessManagementChoices("table"),
        ]);
      case "tailleur": return mk("Les ciseaux chantent, la machine Singer bat la mesure.", jobChoices("couturier"));
      case "peche": return mk("Filets, écailles et sel : le quai des pêcheurs de Yoff.", jobChoices("pecheur"));
      case "tech": return mk("Baies vitrées, clim et lignes de code. La Silicon Valley de l'Afrique de l'Ouest.", jobChoices("developpeur"));
      case "lycee": return mk("Des craies, des tableaux noirs et l'avenir du Sénégal en rangées de bancs.", jobChoices("enseignant"));
      case "hopital":
        return mk("Le grand bâtiment blanc. Ici, on soigne tout Dakar.", [
          { label: "🏥 Consultation · 12 500 F", sub: "Santé → 92 · Énergie → 65", primary: true, onSelect: () => actClose("hospital") },
          ...jobChoices("medecin"),
        ]);
      case "ucad":
        return mk("Amphis, baobabs et révisions : l'Université Cheikh Anta Diop. Un arrêt de transport collectif permet de rejoindre la Médina.", [
          ...studyChoices(),
          { label: "🚌 Médina · 400 F", sub: "Prendre le transport collectif", onSelect: () => travelByTransport("ucad-medina", 1510, 1245, "la Médina", 400) },
        ]);
      case "biblio":
        return mk("Amphis, baobabs et révisions : l'Université Cheikh Anta Diop.", studyChoices());
      case "mosquee":
      case "mosquee-medina":
        return mk("La mosquée est un lieu de prière, de recueillement et de rencontre pour les fidèles du quartier. Les visiteurs sont invités à respecter les lieux et les personnes.", [
          { label: "🕌 Entrer en prière", sub: "Gratuit · Bonheur +7 · Santé +2", primary: true, onSelect: () => actClose("visit", b.id === "mosquee-medina" ? "mosquee-medina" : "mosquee") },
        ]);
      case "eglise":
        return mk("Cette église fictive du quartier accueille la communauté chrétienne pour la prière, les chants, les rencontres et l'entraide. Les visiteurs de toutes convictions sont invités à respecter le lieu.", [
          { label: "⛪ Entrer pour un moment de recueillement", sub: "Gratuit · Bonheur +7", primary: true, onSelect: () => actClose("visit", "eglise") },
        ]);
      case "temple-hindou":
        return mk("Cet espace fictif représente un lieu de prière et de rencontre de la communauté hindoue du jeu. Les traditions hindoues sont multiples ; les visiteurs sont invités à s'informer avec respect.", [
          { label: "🛕 Découvrir ce lieu", sub: "Gratuit · Bonheur +7", primary: true, onSelect: () => actClose("visit", "temple-hindou") },
        ]);
      case "centre-meditation":
        return mk("Un centre fictif dédié à la méditation et à la pratique bouddhiste. Le calme et le respect des pratiquants sont de mise.", [
          { label: "🪷 Prendre un moment de calme", sub: "Gratuit · Bonheur +7", primary: true, onSelect: () => actClose("visit", "centre-meditation") },
        ]);
      case "maison-cultures":
        return mk("Un espace culturel fictif où les habitants transmettent des récits, des patrimoines et des traditions spirituelles locales dans toute leur diversité.", [
          { label: "🌿 Découvrir les traditions", sub: "Gratuit · Savoir +2", primary: true, onSelect: () => actClose("visit", "maison-cultures") },
        ]);
      case "synagogue":
        return mk("Un lieu communautaire fictif associé aux personnages juifs du jeu. Il représente un espace de rencontre et de recueillement ; les pratiques et traditions juives sont diverses.", [
          { label: "✡️ Entrer pour découvrir le lieu", sub: "Gratuit · Bonheur +7 · Savoir +2", primary: true, onSelect: () => actClose("visit", "synagogue") },
        ]);
      case "gurdwara":
        return mk("Un gurdwara fictif, lieu de rassemblement de la communauté sikhe du jeu. L'accueil, le service et le partage y sont mis en valeur. Les visiteurs sont invités à respecter les usages du lieu.", [
          { label: "🪯 Découvrir le gurdwara", sub: "Gratuit · Bonheur +7 · Teranga +2", primary: true, onSelect: () => actClose("visit", "gurdwara") },
        ]);
      case "stade":
        return mk("La pelouse est parfaite, les tribunes n'attendent que toi.", [
          { label: "⚽ Assister au match des Lions · 1 500 F", sub: "Bonheur +12", primary: true, onSelect: () => actClose("visit", "stade") },
        ]);
      case "arene":
        return mk("Le sable est ratissé, les tambours chauffent. La lutte, sport roi !", [
          { label: "🤼 Voir le combat · 2 000 F", sub: "Bonheur +14 · Teranga +1", primary: true, onSelect: () => actClose("visit", "lutte") },
        ]);
      case "taxis":
        return mk("Les taxis jaunes ronronnent en file. Ousmane distribue les courses.", [
          missionChoice("taxi_hopital"), missionChoice("taxi_ucad"), businessChoice("taxi"), ...businessManagementChoices("taxi"),
        ]);
      case "station-yoff":
        return mk("Monte à bord d'un car rapide pour rejoindre un autre quartier. Le trajet est instantané dans cette version ; les tarifs sont fictifs et propres au jeu.", [
          { label: "🚌 Médina · 500 F", sub: "Trajet collectif · arrivée au pôle Médina", primary: true, onSelect: () => travelByTransport("yoff-medina", 1510, 1245, "la Médina", 500) },
          { label: "🏙️ Plateau · 700 F", sub: "Trajet collectif · arrivée au Plateau", onSelect: () => travelByTransport("yoff-plateau", 2740, 1385, "le Plateau", 700) },
        ]);
      case "station-medina":
        return mk("Choisis ta destination et règle ton ticket. Les lignes et tarifs sont fictifs et servent uniquement à la simulation.", [
          { label: "🏖️ Yoff · 500 F", sub: "Arrivée à l'arrêt de Yoff", onSelect: () => travelByTransport("medina-yoff", 900, 690, "Yoff", 500) },
          { label: "🏙️ Plateau · 500 F", sub: "Arrivée au Plateau", primary: true, onSelect: () => travelByTransport("medina-plateau", 2740, 1385, "le Plateau", 500) },
          { label: "🎓 Campus UCAD · 400 F", sub: "Arrivée près de l'université", onSelect: () => travelByTransport("medina-ucad", 2200, 1060, "au Campus UCAD", 400) },
        ]);
      case "station-plateau":
        return mk("Choisis une ligne de transport collectif. Le déplacement et le paiement sont pris en compte dans ta partie.", [
          { label: "🚌 Kaolack · 3 500 F", sub: "Voyage interurbain · Médina Baye, centre-ville et Kasnack", primary: true, onSelect: () => travelToCity("dakar-kaolack", "Kaolack") },
          { label: "🏘️ Médina · 500 F", sub: "Arrivée au pôle Médina", primary: true, onSelect: () => travelByTransport("plateau-medina", 1510, 1245, "la Médina", 500) },
          { label: "🎓 Campus UCAD · 500 F", sub: "Arrivée près de l'université", onSelect: () => travelByTransport("plateau-ucad", 2200, 1060, "au Campus UCAD", 500) },
        ]);
      case "gare-dakar":
        return mk("Gare interurbaine de Dakar. Les lignes vers Kaolack et Thiès sont disponibles. Tarifs fictifs de simulation.", [
          { label: "🚌 Départ pour Kaolack · 3 500 F", sub: "Arrivée dans le quartier Médina Baye", primary: true, onSelect: () => travelToCity("dakar-kaolack", "Kaolack") },
          { label: "🚌 Départ pour Thiès · 2 500 F", sub: "Arrivée au centre-ville de Thiès", onSelect: () => travelToCity("dakar-thies", "Thiès") },
          leave,
        ]);
      case "kaolack-gare":
        return mk("Gare routière de Kaolack. Les cars relient Dakar, Thiès et Touba. Tarifs fictifs de simulation.", [
          { label: "🚌 Dakar · 3 500 F", sub: "Retour vers la capitale", primary: true, onSelect: () => travelToCity("kaolack-dakar", "Dakar") },
          { label: "🚌 Thiès · 2 500 F", sub: "Voyage interurbain", onSelect: () => travelToCity("kaolack-thies", "Thiès") },
          businessChoice("taxi-kaolack-business"), ...businessManagementChoices("taxi-kaolack-business"), leave,
        ]);
      case "thies-gare":
        return mk("Gare routière de Thiès. Les liaisons vers Dakar, Kaolack et Touba sont disponibles dans cette simulation.", [
          { label: "🚌 Dakar · 2 500 F", sub: "Retour vers la capitale", onSelect: () => travelToCity("thies-dakar", "Dakar") },
          { label: "🚌 Kaolack · 2 500 F", sub: "Voyage interurbain", primary: true, onSelect: () => travelToCity("thies-kaolack", "Kaolack") },
          { label: "🚌 Touba · 3 000 F", sub: "Voyage interurbain", onSelect: () => travelToCity("thies-touba", "Touba") }, leave,
        ]);
      case "touba-gare":
        return mk("Gare routière de Touba. Retour vers Thiès.", [
          { label: "🚌 Thiès · 3 000 F", sub: "Voyage interurbain", primary: true, onSelect: () => travelToCity("touba-thies", "Thiès") }, leave,
        ]);
      case "kaolack-mosquee":
        return mk("La Grande Mosquée de Médina Baye est un lieu spirituel important de Kaolack. Dans le jeu, tu peux y faire une pause de recueillement.", [
          { label: "🤲 Prendre un moment de recueillement", sub: "Activité de rôle sans effet religieux imposé", primary: true, onSelect: () => { actionsRef.current.notify("Tu prends un moment de calme à Médina Baye.", "good", "🕌"); setDialogue(null); } },
          leave,
        ]);
      case "kaolack-marche":
        return mk("Le marché central est un lieu animé de commerce. Tu peux y chercher un emploi ou investir dans un étal local.", [
          ...jobChoices("vendeur-kaolack"),
          { label: "🛍️ Explorer le marché", sub: "Découvrir les étals et les commerçants", onSelect: () => { actionsRef.current.notify("Tu explores les allées du marché de Kaolack.", "good", "🛍️"); setDialogue(null); } },
          businessChoice("table-kaolack"), ...businessManagementChoices("table-kaolack"),
          businessChoice("boutique-kaolack"), ...businessManagementChoices("boutique-kaolack"),
        ]);
      case "kaolack-atelier":
        return mk("L'atelier de Kasnack travaille le textile, la réparation et l'artisanat. Tu peux y postuler ou investir.", [
          ...jobChoices("artisan-kaolack"),
          businessChoice("atelier-kaolack"), ...businessManagementChoices("atelier-kaolack"),
        ]);
      case "kaolack-hopital":
        return mk("L'hôpital régional accueille les habitants de Kaolack et des environs.", [
          { label: "🏥 Consultation · 12 500 F", sub: "Soins · Santé +35", primary: true, onSelect: () => actClose("hospital") },
          ...jobChoices("infirmier-kaolack"),
        ]);
      case "kaolack-ecole":
        return mk("L'école de quartier accueille les enfants et les jeunes du secteur.", jobChoices("enseignant-kaolack"));
      case "thies-marche":
        return mk("Le marché de Thiès rassemble commerçants, artisans et habitants. Tu peux y travailler ou investir.", [ ...jobChoices("vendeur-thies"), businessChoice("etale-thies"), ...businessManagementChoices("etale-thies") ]);
      case "thies-hopital":
        return mk("Le centre hospitalier de Thiès accueille les habitants et les communes voisines.", [ { label: "🏥 Consultation · 12 500 F", sub: "Soins · Santé +35", primary: true, onSelect: () => actClose("hospital") }, ...jobChoices("infirmier-thies") ]);
      case "thies-ecole":
        return mk("Une école de quartier où les élèves poursuivent leur apprentissage.", jobChoices("enseignant-thies"));
      case "thies-atelier":
        return mk("Atelier de réparation et de services de Thiès.", [ businessChoice("atelier-thies"), ...businessManagementChoices("atelier-thies") ]);
      case "touba-mosquee":
        return mk("La Grande Mosquée de Touba est représentée ici comme un lieu de recueillement respectueux. Aucune pratique religieuse n'est imposée au joueur.", [ { label: "🤲 Prendre un moment de calme", sub: "Activité de rôle gratuite", primary: true, onSelect: () => { actionsRef.current.notify("Tu prends un moment de calme à Touba.", "good", "🕌"); setDialogue(null); } }, leave ]);
      case "touba-marche":
        return mk("Le marché de Touba propose des activités de commerce dans cette zone de simulation.", [ ...jobChoices("vendeur-touba"), businessChoice("etale-touba"), ...businessManagementChoices("etale-touba") ]);
      case "touba-atelier":
        return mk("Un atelier consacré à l'artisanat et à la réparation.", [ ...jobChoices("artisan-touba"), businessChoice("atelier-touba"), ...businessManagementChoices("atelier-touba") ]);
      case "boutique":
        return mk("Riz, huile, sucre, savon : l'essentiel du quartier, du sol au plafond.", [businessChoice("boutique"), ...businessManagementChoices("boutique")]);
      case "banque":
        return mk("Le marbre frais du Plateau. Ton argent y serait en sécurité… si tu en avais beaucoup.", [
          talk(["Un conseiller murmure : « Les vrais investissent dans l'immobilier et les taxis. »", "Le distributeur affiche un sourire de 5 000 F maximum par retrait."]),
        ]);
      case "resort":
        return mk("Piscine à débordement, jus de bissap glacé et vue sur l'Atlantique.", [
          { label: "😄 Soirée entre amis · 2 500 F", sub: "Bonheur +10 · Teranga +3", primary: true, onSelect: () => actClose("social", "amis") },
          ...eatChoices().slice(0, 1),
        ]);
      default:
        return mk("Un lieu de vie de la ville.", []);
    }
  };

  const spotDialogue = (sp: Spot): DialogueData => {
    const place = PLACES.find((pl) => pl.id === sp.action.id);
    const p = propsRef.current.player;
    if (sp.action.type === "date") {
      const love = simRef.current?.npcs.find((n) => n.def.id === "love");
      if (love) return npcDialogue(love);
    }
    return {
      portrait: null, emoji: sp.emoji, name: sp.name, role: "Point d'intérêt",
      text: place?.desc ?? "Un endroit à découvrir.",
      choices: [
        {
          label: `${sp.emoji} ${sp.action.type === "visit" ? "Visiter" : "Profiter"}${place && place.price > 0 ? ` · ${fmtMoney(place.price)} F` : " · Gratuit"}`,
          sub: place ? `Bonheur +${place.fx.happiness ?? 0}${p.visited.includes(place.id) ? " · déjà visité" : " · première visite !"}` : undefined,
          primary: true,
          onSelect: () => actClose(sp.action.type, sp.action.id),
        },
        leave,
      ],
    };
  };

  const travelToCity = (routeId: string, destination: string) => {
    const fare = routeId === "dakar-thies" || routeId === "thies-dakar" || routeId === "kaolack-thies" || routeId === "thies-kaolack" ? 2500 : routeId === "thies-touba" || routeId === "touba-thies" ? 3000 : 3500;
    if (propsRef.current.player.money < fare) {
      actionsRef.current.notify(`Solde insuffisant : ${fare} FCFA sont nécessaires pour ce voyage.`, "bad", "💸");
      return;
    }
    if (simRef.current?.pr.vehicle) doExit();
    setDialogue(null);
    actionsRef.current.act("transport", routeId);
    actionsRef.current.notify(`Billet validé. Départ vers ${destination}…`, "good", "🚌");
  };

  const travelByTransport = (routeId: string, x: number, y: number, destination: string, fare: number) => {
    const sim = simRef.current;
    if (!sim) return;
    if (propsRef.current.player.money < fare) {
      actionsRef.current.notify(`Solde insuffisant : ${fare} FCFA sont nécessaires pour ce trajet.`, "bad", "💸");
      return;
    }
    if (sim.pr.vehicle) doExit();
    actionsRef.current.act("transport", routeId);
    sim.pr.x = x;
    sim.pr.y = y;
    sim.pr.dir = -Math.PI / 2;
    sim.pr.moving = false;
    sim.pr.run = false;
    sim.cam.x = x;
    sim.cam.y = y;
    sim.mission = null;
    setMissionUi(null);
    setDialogue(null);
    actionsRef.current.notify(`Tu arrives à ${destination}. Bon voyage !`, "good", "🚌");
  };

  const vehicleDialogue = (v: TrafficRuntime): DialogueData => ({
    portrait: null,
    emoji: v.def.kind === "bus" ? "🚌" : v.def.kind === "taxi" ? "🚕" : "🚗",
    name: vehicleName(v),
    role: "Véhicule",
    text: v.def.kind === "bus"
      ? "Le mythique car rapide bleu et jaune, « Ndiaga Ndiaye ». Le volant t'appelle."
      : "Le moteur tourne, la radio crache du mbalax. Tu prends le volant ?",
    choices: [
      { label: "🔑 Prendre le volant", sub: "Conduis avec ZQSD / flèches · E pour sortir", primary: true, onSelect: () => mount(v) },
      ...(v.def.kind === "taxi" && propsRef.current.player.missionsToday < MAX_MISSIONS_PER_DAY
        ? [{
            label: "🚕 Accepter une course · +3 500 F",
            sub: "Conduire le passager à l'hôpital (150 s)",
            onSelect: () => { mount(v); startMission("taxi_hopital"); },
          }]
        : []),
      leave,
    ],
  });

  /* ---------- handlers clavier / tactile ---------- */
  handlersRef.current = {
    interact: () => {
      const P = propsRef.current;
      if (P.busy || P.phoneOpen || P.dialogueOpen || P.bigMap || !P.player.alive) return;
      const it = interactRef.current;
      if (!it) return;
      if (it.kind === "exit") doExit();
      else if (it.kind === "vehicle") setDialogue(vehicleDialogue(it.v));
      else if (it.kind === "npc") setDialogue(npcDialogue(it.n));
      else if (it.kind === "building") setDialogue(buildingDialogue(it.b));
      else if (it.kind === "spot") setDialogue(spotDialogue(it.sp));
    },
    toggleMap: () => {
      if (propsRef.current.phoneOpen || propsRef.current.dialogueOpen) return;
      setBigMap((m) => !m);
    },
    phone: () => {
      setDialogue(null);
      actionsRef.current.onPhone();
    },
    escape: () => {
      setDialogue(null);
      setBigMap(false);
    },
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const c = e.code;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "Tab"].includes(c)) e.preventDefault();
      const k = inputRef.current;
      if (c === "KeyW" || c === "KeyZ" || c === "ArrowUp") k.up = true;
      else if (c === "KeyS" || c === "ArrowDown") k.down = true;
      else if (c === "KeyA" || c === "KeyQ" || c === "ArrowLeft") k.left = true;
      else if (c === "KeyD" || c === "ArrowRight") k.right = true;
      else if (c === "ShiftLeft" || c === "ShiftRight") k.run = true;
      else if (c === "KeyE") handlersRef.current.interact();
      else if (c === "KeyP" || c === "Tab") handlersRef.current.phone();
      else if (c === "KeyM") handlersRef.current.toggleMap();
      else if (c === "Escape") handlersRef.current.escape();
    };
    const up = (e: KeyboardEvent) => {
      const c = e.code;
      const k = inputRef.current;
      if (c === "KeyW" || c === "KeyZ" || c === "ArrowUp") k.up = false;
      else if (c === "KeyS" || c === "ArrowDown") k.down = false;
      else if (c === "KeyA" || c === "KeyQ" || c === "ArrowLeft") k.left = false;
      else if (c === "KeyD" || c === "ArrowRight") k.right = false;
      else if (c === "ShiftLeft" || c === "ShiftRight") k.run = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* ---------- joystick tactile ---------- */
  const joyCenter = useRef({ x: 0, y: 0 });
  const onJoyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    joyCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    e.currentTarget.setPointerCapture(e.pointerId);
    onJoyMove(e);
  };
  const onJoyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    const dx = (e.clientX - joyCenter.current.x) / 44;
    const dy = (e.clientY - joyCenter.current.y) / 44;
    const len = Math.hypot(dx, dy);
    const cl = len > 1 ? 1 / len : 1;
    joyRef.current = { x: dx * cl, y: dy * cl };
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx * cl * 30}px, ${dy * cl * 30}px)`;
  };
  const onJoyUp = () => {
    joyRef.current = { x: 0, y: 0 };
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
  };

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div ref={wrapRef} className="absolute inset-0 select-none overflow-hidden bg-night-950">
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Mini-carte persistante : position du joueur synchronisée avec la caméra */}
      {!bigMap && (
        <div className={`absolute left-3 top-3 z-20 overflow-hidden rounded-2xl border border-white/20 bg-[#101713]/90 shadow-2xl backdrop-blur-md ${mapExpanded ? "w-[min(88vw,360px)]" : "w-[174px]"}`}>
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-[9px] font-black uppercase tracking-[.16em] text-white/80">🧭 {({ dakar: "Dakar", kaolack: "Kaolack", thies: "Thiès", touba: "Touba" } as const)[player.cityId ?? "dakar"]} · GPS</span>
            <button onClick={() => setMapExpanded(v => !v)} className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gold-300">{mapExpanded ? "−" : "+"}</button>
          </div>
          <svg viewBox="0 0 5200 2300" className="block h-auto w-full" role="img" aria-label="Mini-carte du monde de jeu et position du joueur">
            <rect width="5200" height="2300" fill="#c9b887"/>
            <rect x="0" y="0" width="600" height="2300" fill="#367f91"/>
            <path d="M470 0 Q540 260 480 520 T520 1050 T485 1600 T530 2300" fill="none" stroke="#e4d6ae" strokeWidth="34"/>
            {DISTRICTS.map(d => <g key={d.id}><rect x={d.x} y={d.y} width={d.w} height={d.h} rx="30" fill="#a5b47c" opacity=".55"/><text x={d.x+28} y={d.y+55} fill="#34412d" fontSize="48" fontWeight="bold">{d.name}</text></g>)}
            {[[640,160,640,2160],[640,700,2900,700],[640,1240,2900,1240],[640,1840,2620,1840],[1780,700,1780,1840],[2560,700,2560,2160],[640,2020,1240,2020],[1100,1840,1100,2020],[2860,1385,3350,1385],[3350,420,3350,2020],[3350,800,5000,800],[3350,1500,5000,1500],[4200,800,4200,2020]].map((r,i)=><g key={i}><path d={`M${r[0]} ${r[1]} L${r[2]} ${r[3]}`} stroke="#f0e8d2" strokeWidth="70" fill="none"/><path d={`M${r[0]} ${r[1]} L${r[2]} ${r[3]}`} stroke="#9b8b69" strokeWidth="5" strokeDasharray="35 35" fill="none"/></g>)}
            {BUILDINGS.map(b=><circle key={b.id} cx={b.x+b.w/2} cy={b.y+b.h/2} r="28" fill="#fff4d6" stroke="#5e523a" strokeWidth="9"/>)}
            <circle cx={mapPosition.x} cy={mapPosition.y} r="82" fill="#ffd34e" opacity=".28"/>
            <circle cx={mapPosition.x} cy={mapPosition.y} r="42" fill="#ffd34e" stroke="#fff" strokeWidth="16"/>
          </svg>
          <div className="flex items-center justify-between border-t border-white/10 px-2.5 py-1.5 text-[9px] text-white/65">
            <span>● Position en direct</span><span>{districtAt(mapPosition.x, mapPosition.y)?.name ?? "Exploration"}</span>
          </div>
        </div>
      )}

      <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-[#101713]/85 px-2.5 py-1.5 text-[9px] font-bold text-white/75 backdrop-blur-md">
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${isOnline ? "bg-teranga-400" : "bg-gold-400"}`} />
        {isOnline ? "EN LIGNE" : "HORS LIGNE · SAUVEGARDE LOCALE"}
      </div>

      {/* Tracker de mission */}
      {missionUi && (
        <div className="glass-deep absolute right-3 top-3 z-20 w-64 rounded-xl border border-gold-400/40 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold-300">📍 Mission en cours</p>
          <p className="mt-1 text-xs font-semibold leading-snug text-white/90">{missionUi.label}</p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] font-bold tabular-nums">
            <span className={missionUi.time < 30 ? "text-flame-400" : "text-white/70"}>⏱️ {mmss(missionUi.time)}</span>
            <span className="text-white/70">📏 {missionUi.dist} m</span>
            {missionUi.taxi && <span className="text-gold-300">🚕 véhicule requis</span>}
          </div>
        </div>
      )}

      {/* Bannière de quartier */}
      {district && !bigMap && (
        <div key={district.id} className="fade-up pointer-events-none absolute bottom-28 right-5 z-10 text-right">
          <p className="font-display text-4xl font-extrabold italic tracking-tight text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.9)] sm:text-5xl">
            {district.name}
          </p>
          <p className="text-sm font-bold text-gold-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{district.sub}</p>
        </div>
      )}

      {/* Invite d'interaction */}
      {prompt && !dialogue && !phoneOpen && !bigMap && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2 sm:bottom-16">
          <div className="glass-deep flex items-center gap-2 rounded-xl px-4 py-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold-400 font-display text-xs font-extrabold text-night-950">E</span>
            <span className="whitespace-nowrap text-xs font-bold text-white sm:text-sm">{prompt}</span>
          </div>
        </div>
      )}

      {/* Aide contrôles */}
      {help && !isTouch && !dialogue && !phoneOpen && !bigMap && (
        <div className="glass-deep absolute bottom-16 left-1/2 z-10 w-[min(94%,540px)] -translate-x-1/2 rounded-2xl p-4 text-center">
          <p className="font-display text-sm font-extrabold text-gold-300">🎮 Bienvenue dans ton monde ouvert</p>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-white/75">
            <span><b className="text-white">ZQSD / WASD / ↑↓←→</b> marcher</span>
            <span><b className="text-white">Maj</b> courir</span>
            <span><b className="text-white">E</b> interagir / conduire</span>
            <span><b className="text-white">P</b> téléphone</span>
            <span><b className="text-white">M</b> carte</span>
          </div>
          <p className="mt-2 text-[10px] text-white/45">Parle aux habitants, travaille, prends un taxi, suis les marqueurs jaunes…</p>
        </div>
      )}

      {/* Boutons desktop */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-2">
        {!isTouch && (
          <>
            <button onClick={() => setHelp((h) => !h)} className="glass-deep flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white/70 transition hover:text-white" title="Aide">?</button>
            <button onClick={() => handlersRef.current.toggleMap()} className="glass-deep flex h-11 w-11 items-center justify-center rounded-xl text-lg transition hover:border-gold-400/40" title="Carte (M)">🗺️</button>
          </>
        )}
        {isTouch && (
          <button
            onClick={() => handlersRef.current.interact()}
            className="btn-gold flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-extrabold"
            title="Interagir"
          >
            E
          </button>
        )}
        <button onClick={() => handlersRef.current.phone()} className="btn-gold flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold" title="Téléphone (P)">
          📱 <span className="hidden sm:inline">Téléphone</span>
        </button>
      </div>

      {/* Joystick tactile */}
      {isTouch && (
        <>
          <div
            className="glass-deep absolute bottom-5 left-5 z-20 flex h-32 w-32 touch-none items-center justify-center rounded-full"
            onPointerDown={onJoyDown}
            onPointerMove={onJoyMove}
            onPointerUp={onJoyUp}
            onPointerCancel={onJoyUp}
          >
            <div ref={knobRef} className="h-14 w-14 rounded-full bg-gold-400/80 shadow-lg" />
          </div>
          <button
            onClick={() => { runToggleRef.current = !runToggleRef.current; setTouchRun(runToggleRef.current); }}
            className={`absolute bottom-24 right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full text-lg ${touchRun ? "btn-gold" : "glass-deep"}`}
            title="Courir"
          >
            🏃
          </button>
          <button onClick={() => handlersRef.current.toggleMap()} className="glass-deep absolute bottom-40 right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full text-lg" title="Carte">
            🗺️
          </button>
        </>
      )}

      {/* Carte plein écran */}
      {bigMap && (
        <button onClick={() => setBigMap(false)} className="glass-deep absolute right-4 top-4 z-20 rounded-xl px-4 py-2 text-xs font-bold text-white/80">
          ✕ Fermer la carte (M)
        </button>
      )}

      {/* Dialogue */}
      {dialogue && <Dialogue data={dialogue} onClose={() => setDialogue(null)} />}
    </div>
  );
}
