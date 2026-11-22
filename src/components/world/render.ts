import {
  BAOBABS, BUILDINGS, Building, DISTRICTS, HUTS, LAMPS, PALMS, PIROGUES,
  ROADS, SPOTS, STALLS, WORLD, NpcDef, TrafficDef, doorPos,
} from "@/lib/world";

export interface NpcRuntime {
  def: NpcDef;
  x: number; y: number; dir: number; moving: boolean; phase: number;
  tx: number; ty: number; pause: number; routineIndex: number;
  bond: number; // relation sociale locale avec le joueur (0 à 5)
}
export interface TrafficRuntime {
  def: TrafficDef;
  x: number; y: number; angle: number; seg: number;
  parked: boolean; held: boolean;
}
export interface PlayerRuntime {
  x: number; y: number; dir: number; moving: boolean; run: boolean; phase: number;
  vehicle: TrafficRuntime | null;
  name: string; shirt: string; skin: string;
}
export interface SceneState {
  t: number;
  ambient: number; // 0 = plein jour, 1 = nuit
  evening: number; // teinte chaude du soir
  cam: { x: number; y: number; zoom: number };
  player: PlayerRuntime;
  npcs: NpcRuntime[];
  traffic: TrafficRuntime[];
  mission: { x: number; y: number } | null;
  homeId: string;
  jobId: string | null;
  bigMap: boolean;
}

const FONT = '"Bricolage Grotesque", Inter, sans-serif';

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

const hash = (ix: number, iy: number) => {
  const s = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/* ================= PERSONNAGE ================= */
function drawPerson(
  ctx: CanvasRenderingContext2D, x: number, y: number, dir: number,
  moving: boolean, phase: number, shirt: string, skin: string,
  opts: { player?: boolean; name?: string; showName?: boolean; hijab?: string } = {},
) {
  const bob = moving ? Math.sin(phase * 10) * 1.2 : 0;
  // ombre
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  if (opts.player) {
    ctx.strokeStyle = "rgba(245,185,66,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 2, 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  // jambes
  const leg = moving ? Math.sin(phase * 10) * 4 : 0;
  ctx.fillStyle = "#2b2b2b";
  ctx.beginPath(); ctx.arc(x - 3 + Math.cos(dir) * leg * 0.4, y + 7 + leg * 0.5, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3 - Math.cos(dir) * leg * 0.4, y + 7 - leg * 0.5, 2.6, 0, Math.PI * 2); ctx.fill();
  // corps
  ctx.fillStyle = shirt;
  rr(ctx, x - 7, y - 6 + bob, 14, 14, 5);
  ctx.fill();
  // bras
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(x - 8, y + 1 + bob + leg * 0.3, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 8, y + 1 + bob - leg * 0.3, 2.4, 0, Math.PI * 2); ctx.fill();
  // tête
  if (opts.hijab) {
    // Foulard couvrant les cheveux et les épaules, visible aussi en vue rapprochée.
    ctx.fillStyle = opts.hijab;
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 17 + bob);
    ctx.quadraticCurveTo(x - 13, y - 10 + bob, x - 10, y + 2 + bob);
    ctx.quadraticCurveTo(x, y + 8 + bob, x + 10, y + 2 + bob);
    ctx.quadraticCurveTo(x + 13, y - 10 + bob, x + 7, y - 17 + bob);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(x, y - 11 + bob, 5.2, 0, Math.PI * 2); ctx.fill();
  if (opts.hijab) {
    ctx.fillStyle = opts.hijab;
    ctx.beginPath(); ctx.arc(x, y - 15 + bob, 6.2, Math.PI, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = "#151312";
    ctx.beginPath(); ctx.arc(x, y - 13 + bob, 5.4, Math.PI, Math.PI * 2); ctx.fill();
  }
  // direction (petit nez)
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(x + Math.cos(dir) * 5, y - 11 + bob + Math.sin(dir) * 4, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // nom
  if (opts.name && (opts.player || opts.showName)) {
    ctx.font = `700 10px ${FONT}`;
    const w = ctx.measureText(opts.name).width + 12;
    ctx.fillStyle = opts.player ? "rgba(245,185,66,0.92)" : "rgba(9,14,11,0.78)";
    rr(ctx, x - w / 2, y - 34, w, 15, 7);
    ctx.fill();
    ctx.fillStyle = opts.player ? "#1a1204" : "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(opts.name, x, y - 23);
    ctx.textAlign = "left";
  }
}

/* ================= VÉHICULE ================= */
function drawVehicle(ctx: CanvasRenderingContext2D, v: TrafficRuntime, night: boolean, driven: boolean, t: number) {
  const bus = v.def.kind === "bus";
  const L = bus ? 72 : 48, W = bus ? 26 : 24;
  ctx.save();
  ctx.translate(v.x, v.y);
  ctx.rotate(v.angle);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  rr(ctx, -L / 2 + 3, -W / 2 + 4, L, W, 8); ctx.fill();
  if (driven) {
    ctx.strokeStyle = "rgba(245,185,66,0.95)";
    ctx.lineWidth = 2.5;
    rr(ctx, -L / 2 - 4, -W / 2 - 4, L + 8, W + 8, 10); ctx.stroke();
  }
  // roues
  ctx.fillStyle = "#17181a";
  for (const sx of [-L / 2 + 8, L / 2 - 14]) {
    rr(ctx, sx, -W / 2 - 2, 9, 4, 2); ctx.fill();
    rr(ctx, sx, W / 2 - 2, 9, 4, 2); ctx.fill();
  }
  // carrosserie
  ctx.fillStyle = v.def.color;
  rr(ctx, -L / 2, -W / 2, L, W, 7); ctx.fill();
  if (bus) {
    ctx.fillStyle = "#fdd835";
    rr(ctx, -L / 2, -3, L, 6, 2); ctx.fill();
    ctx.fillStyle = "rgba(20,30,40,0.75)";
    for (let i = 0; i < 4; i++) { rr(ctx, -L / 2 + 8 + i * 15, -W / 2 + 3, 10, 6, 2); ctx.fill(); }
  } else {
    ctx.fillStyle = "rgba(20,30,40,0.8)";
    rr(ctx, L / 2 - 20, -W / 2 + 3, 10, W - 6, 3); ctx.fill();
    rr(ctx, -L / 2 + 8, -W / 2 + 3, 8, W - 6, 3); ctx.fill();
    if (v.def.kind === "taxi") {
      ctx.fillStyle = "#17181a";
      rr(ctx, -5, -5, 12, 10, 2); ctx.fill();
      ctx.fillStyle = "#fdd835";
      ctx.font = `700 6px ${FONT}`;
      ctx.fillText("TAXI", -4, 2);
    }
  }
  // phares
  ctx.fillStyle = night ? "#fff3c4" : "rgba(255,240,200,0.5)";
  ctx.beginPath(); ctx.arc(L / 2 - 2, -W / 2 + 5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(L / 2 - 2, W / 2 - 5, 2.2, 0, Math.PI * 2); ctx.fill();
  if (night && !v.parked) {
    const g = ctx.createLinearGradient(L / 2, 0, L / 2 + 110, 0);
    g.addColorStop(0, "rgba(255,240,190,0.28)");
    g.addColorStop(1, "rgba(255,240,190,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(L / 2, -W / 2 + 4);
    ctx.lineTo(L / 2 + 110, -W - 14);
    ctx.lineTo(L / 2 + 110, W + 14);
    ctx.lineTo(L / 2, W / 2 - 4);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  void t;
}

/* ================= BÂTIMENTS ================= */
function drawBuilding(ctx: CanvasRenderingContext2D, b: Building, s: SceneState) {
  const { x, y, w, h } = b;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  rr(ctx, x + 7, y + 9, w, h, 6); ctx.fill();

  if (b.kind === "stadium") {
    ctx.fillStyle = "#9aa79c";
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2f7d4f";
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 26, h / 2 - 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 40, h / 2 - 34, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w / 2, y + 24); ctx.lineTo(x + w / 2, y + h - 24); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 16, 0, Math.PI * 2); ctx.stroke();
  } else if (b.kind === "arena") {
    ctx.fillStyle = "#a87b45";
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e0c188";
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2 - 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(60,40,20,0.5)";
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + w / 2 + Math.cos(a) * (w / 2 - 8), y + h / 2 + Math.sin(a) * (w / 2 - 8), 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = b.wall;
    rr(ctx, x, y, w, h, 5); ctx.fill();
    ctx.fillStyle = b.roof;
    rr(ctx, x + 5, y + 5, w - 10, h - 10, 4); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 5, y + h / 2); ctx.lineTo(x + w - 5, y + h / 2); ctx.stroke();

    if (b.kind === "church") {
      ctx.fillStyle = "#f7f1e6";
      ctx.beginPath(); ctx.moveTo(x + w / 2, y - 18); ctx.lineTo(x + w / 2 - 17, y + 12); ctx.lineTo(x + w / 2 + 17, y + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff8e8"; rr(ctx, x + w / 2 - 8, y + h / 2 - 12, 16, 32, 3); ctx.fill();
      ctx.fillStyle = "#a33b32"; rr(ctx, x + w / 2 - 2, y - 10, 4, 20, 1); ctx.fill(); rr(ctx, x + w / 2 - 7, y - 3, 14, 4, 1); ctx.fill();
    }
    if (b.kind === "temple") {
      ctx.fillStyle = "#e7a34f"; ctx.beginPath(); ctx.moveTo(x + w / 2, y - 22); ctx.lineTo(x + w / 2 - 25, y + 18); ctx.lineTo(x + w / 2 + 25, y + 18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#f7e4c9"; rr(ctx, x + w / 2 - 15, y + h / 2 - 12, 30, 34, 3); ctx.fill();
    }
    if (b.kind === "meditation") {
      ctx.fillStyle = "#d8b56d"; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 - 8, 24, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#f3eadb"; rr(ctx, x + w / 2 - 20, y + h / 2 - 8, 40, 28, 4); ctx.fill();
      ctx.fillStyle = "#b47c39"; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 - 4, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (b.kind === "culture") {
      ctx.strokeStyle = "#f0d5a1"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 23, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#f0d5a1"; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (b.kind === "synagogue") {
      ctx.fillStyle = "#f5f2e9"; ctx.beginPath(); ctx.moveTo(x + w / 2, y + 16); ctx.lineTo(x + w / 2 - 24, y + 42); ctx.lineTo(x + w / 2 + 24, y + 42); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#e9dcae"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + w / 2, y + 27); ctx.lineTo(x + w / 2, y + 54); ctx.moveTo(x + w / 2 - 12, y + 35); ctx.lineTo(x + w / 2 + 12, y + 35); ctx.stroke();
    }
    if (b.kind === "gurdwara") {
      ctx.fillStyle = "#f7e6c8"; ctx.beginPath(); ctx.arc(x + w / 2, y + 32, 23, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#f5f0e6"; rr(ctx, x + w / 2 - 28, y + 32, 56, 32, 4); ctx.fill();
      ctx.fillStyle = "#c58b3d"; ctx.beginPath(); ctx.arc(x + w / 2, y + 35, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (b.kind === "mosque") {
      ctx.fillStyle = "#1f8a70";
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 - 8, 26, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#f3ede1";
      rr(ctx, x + w - 34, y - 26, 18, h + 20, 4); ctx.fill();
      ctx.fillStyle = "#1f8a70";
      ctx.beginPath(); ctx.arc(x + w - 25, y - 26, 9, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#f5b942";
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 - 36, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    if (b.kind === "tower") {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
          rr(ctx, x + 16 + i * ((w - 40) / 3), y + 16 + j * ((h - 40) / 3), (w - 60) / 3, (h - 60) / 3, 2);
          ctx.fill();
        }
    }
    if (b.kind === "campus") {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < 5; i++) { rr(ctx, x + 22 + i * ((w - 50) / 5), y + 14, 10, h - 28, 3); ctx.fill(); }
    }
    if (b.kind === "hospital") {
      ctx.fillStyle = "#c0392b";
      rr(ctx, x + w / 2 - 5, y + h / 2 - 18, 10, 36, 2); ctx.fill();
      rr(ctx, x + w / 2 - 18, y + h / 2 - 5, 36, 10, 2); ctx.fill();
    }
    if (b.kind === "villa") {
      ctx.fillStyle = "#37b6e0";
      rr(ctx, x + w - 62, y + h - 46, 48, 32, 8); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        ctx.moveTo(x + w - 56, y + h - 38 + i * 9);
        ctx.quadraticCurveTo(x + w - 44, y + h - 42 + i * 9, x + w - 32, y + h - 38 + i * 9);
      }
      ctx.stroke();
    }
    if (b.kind === "market") {
      for (let i = 0; i < Math.floor(w / 24); i++) {
        ctx.fillStyle = i % 2 ? "#fdd835" : "#e53935";
        rr(ctx, x + 6 + i * 24, y + h - 22, 20, 16, 3); ctx.fill();
      }
    }
    if (b.kind === "station") {
      // Abribus stylisé : toit, poteaux et banc visibles depuis la caméra.
      ctx.fillStyle = b.roof;
      rr(ctx, x - 5, y + 3, w + 10, 13, 4); ctx.fill();
      ctx.fillStyle = "#d7e8e8";
      ctx.globalAlpha = 0.82;
      rr(ctx, x + 10, y + 18, 7, h - 23, 2); ctx.fill();
      rr(ctx, x + w - 17, y + 18, 7, h - 23, 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#76543a";
      rr(ctx, x + 35, y + h - 19, w - 70, 7, 3); ctx.fill();
      ctx.fillStyle = "#fff7e8";
      rr(ctx, x + w / 2 - 15, y + 21, 30, 18, 3); ctx.fill();
      ctx.fillStyle = "#244b5b"; ctx.font = `800 11px ${FONT}`;
      ctx.textAlign = "center"; ctx.fillText("BUS", x + w / 2, y + 34);
    }
    // porte
    ctx.fillStyle = "#241a10";
    rr(ctx, x + w / 2 - 8, y + h - 6, 16, 8, 2); ctx.fill();
  }

  // plaque nominative
  const isHome = b.home === s.homeId;
  const isWork = b.job != null && b.job === s.jobId;
  ctx.font = `700 11px ${FONT}`;
  const label = `${b.emoji} ${b.name}`;
  const tw = ctx.measureText(label).width + 14;
  const px_ = x + w / 2 - tw / 2, py_ = y - 24;
  ctx.fillStyle = isHome ? "rgba(245,185,66,0.95)" : isWork ? "rgba(47,191,113,0.95)" : "rgba(9,14,11,0.72)";
  rr(ctx, px_, py_, tw, 18, 8); ctx.fill();
  ctx.fillStyle = isHome || isWork ? "#10130d" : "#f2f5f1";
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, py_ + 13);
  if (isHome || isWork) {
    ctx.font = `800 8px ${FONT}`;
    ctx.fillStyle = isHome ? "#f5b942" : "#2fbf71";
    ctx.fillText(isHome ? "★ CHEZ TOI" : "● TON TRAVAIL", x + w / 2, py_ - 5);
  }
  ctx.textAlign = "left";
}

/* ================= DÉCOR ================= */
function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const sway = Math.sin(t * 0.8 + x * 0.01) * 0.06;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(x + 4, y + 4, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#8a5a33"; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 6, y - 22, x + 10 + sway * 40, y - 40); ctx.stroke();
  const cx = x + 10 + sway * 40, cy = y - 42;
  ctx.strokeStyle = "#2f7d4f"; ctx.lineWidth = 4;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + sway;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 10 - 6, cx + Math.cos(a) * 26, cy + Math.sin(a) * 16 + 4);
    ctx.stroke();
  }
  ctx.fillStyle = "#b5763c";
  ctx.beginPath(); ctx.arc(cx - 3, cy + 3, 3, 0, Math.PI * 2); ctx.fill();
}

function drawBaobab(ctx: CanvasRenderingContext2D, x: number, y: number, sc: number) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(x + 6, y + 6, 26 * sc, 9 * sc, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#9c7a52";
  ctx.beginPath();
  ctx.moveTo(x - 14 * sc, y);
  ctx.quadraticCurveTo(x - 10 * sc, y - 34 * sc, x - 5 * sc, y - 44 * sc);
  ctx.lineTo(x + 5 * sc, y - 44 * sc);
  ctx.quadraticCurveTo(x + 10 * sc, y - 34 * sc, x + 14 * sc, y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#8a6a45"; ctx.lineWidth = 4 * sc; ctx.lineCap = "round";
  for (const [dx, dy] of [[-22, -58], [-8, -64], [8, -64], [22, -58], [0, -68]]) {
    ctx.beginPath(); ctx.moveTo(x, y - 42 * sc); ctx.lineTo(x + dx * sc, y + dy * sc); ctx.stroke();
  }
  ctx.fillStyle = "#4a7c46";
  for (const [dx, dy, r] of [[-22, -60, 10], [-8, -68, 11], [8, -68, 11], [22, -60, 10], [0, -72, 12]]) {
    ctx.beginPath(); ctx.arc(x + dx * sc, y + dy * sc, r * sc, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPirogue(ctx: CanvasRenderingContext2D, p: { x: number; y: number; rot: number; c1: string; c2: string }, t: number) {
  ctx.save();
  ctx.translate(p.x, p.y + Math.sin(t * 1.2 + p.y) * 1.5);
  ctx.rotate(p.rot);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath(); ctx.ellipse(2, 4, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p.c1;
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.quadraticCurveTo(-20, -9, 0, -9);
  ctx.quadraticCurveTo(24, -9, 36, -2);
  ctx.quadraticCurveTo(24, 8, 0, 8);
  ctx.quadraticCurveTo(-20, 8, -34, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = p.c2; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-28, -1); ctx.quadraticCurveTo(0, -6, 30, -2); ctx.stroke();
  ctx.restore();
}

function drawMonument(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(x + 4, y + 6, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a6a45";
  ctx.beginPath();
  ctx.moveTo(x - 26, y); ctx.lineTo(x - 14, y - 34); ctx.lineTo(x + 14, y - 34); ctx.lineTo(x + 26, y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#b08d57";
  rr(ctx, x - 12, y - 72, 9, 40, 4); ctx.fill();
  rr(ctx, x + 2, y - 64, 8, 32, 4); ctx.fill();
  rr(ctx, x - 4, y - 84, 7, 26, 3); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 8, y - 76, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 6, y - 68, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 1, y - 88, 4, 0, Math.PI * 2); ctx.fill();
}

/* ================= CARTE (minimap & grande carte) ================= */
function drawMap(ctx: CanvasRenderingContext2D, s: SceneState, mx: number, my: number, mw: number, mh: number, big: boolean) {
  const sc = Math.min(mw / WORLD.w, mh / WORLD.h);
  const ox = mx + (mw - WORLD.w * sc) / 2, oy = my + (mh - WORLD.h * sc) / 2;
  const X = (x: number) => ox + x * sc, Y = (y: number) => oy + y * sc;

  ctx.fillStyle = big ? "rgba(7,11,9,0.97)" : "rgba(9,14,11,0.82)";
  rr(ctx, mx - 6, my - 6, mw + 12, mh + 12, big ? 18 : 12); ctx.fill();
  ctx.strokeStyle = "rgba(245,185,66,0.4)"; ctx.lineWidth = 1.5;
  rr(ctx, mx - 6, my - 6, mw + 12, mh + 12, big ? 18 : 12); ctx.stroke();

  // terre & océan
  ctx.fillStyle = "#1c221a";
  ctx.fillRect(X(0), Y(0), WORLD.w * sc, WORLD.h * sc);
  ctx.fillStyle = "#123a52";
  ctx.fillRect(X(0), Y(0), WORLD.seaEdge * sc, WORLD.h * sc);
  ctx.fillStyle = "#8a7a52";
  ctx.fillRect(X(WORLD.seaEdge), Y(0), (WORLD.beachEdge - WORLD.seaEdge) * sc, WORLD.h * sc);

  // routes
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = big ? 5 : 2;
  for (const r of ROADS) {
    ctx.beginPath(); ctx.moveTo(X(r.x1), Y(r.y1)); ctx.lineTo(X(r.x2), Y(r.y2)); ctx.stroke();
  }
  // bâtiments
  for (const b of BUILDINGS) {
    const home = b.home === s.homeId, work = b.job != null && b.job === s.jobId;
    ctx.fillStyle = home ? "#f5b942" : work ? "#2fbf71" : "rgba(255,255,255,0.45)";
    ctx.fillRect(X(b.x), Y(b.y), Math.max(3, b.w * sc), Math.max(3, b.h * sc));
    if (big) {
      ctx.font = `600 12px ${FONT}`;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "center";
      ctx.fillText(`${b.emoji}`, X(b.x + b.w / 2), Y(b.y + b.h / 2) + 4);
      ctx.textAlign = "left";
    }
  }
  if (big) {
    for (const d of DISTRICTS) {
      ctx.font = `800 20px ${FONT}`;
      ctx.fillStyle = "rgba(245,185,66,0.55)";
      ctx.textAlign = "center";
      ctx.fillText(d.name, X(d.x + d.w / 2), Y(d.y + 40));
      ctx.font = `500 11px ${FONT}`;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(d.sub, X(d.x + d.w / 2), Y(d.y + 58));
      ctx.textAlign = "left";
    }
    for (const sp of SPOTS) {
      ctx.font = `600 14px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText(sp.emoji, X(sp.x), Y(sp.y) + 5);
      ctx.textAlign = "left";
    }
  } else {
    for (const sp of SPOTS) {
      ctx.fillStyle = sp.color;
      ctx.beginPath(); ctx.arc(X(sp.x), Y(sp.y), 2, 0, Math.PI * 2); ctx.fill();
    }
    for (const n of s.npcs) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.arc(X(n.x), Y(n.y), 1.6, 0, Math.PI * 2); ctx.fill();
    }
    for (const v of s.traffic) {
      if (v.held) continue;
      ctx.fillStyle = v.def.kind === "taxi" ? "#fdd835" : "rgba(255,255,255,0.5)";
      ctx.fillRect(X(v.x) - 1.5, Y(v.y) - 1.5, 3, 3);
    }
  }
  // mission
  if (s.mission) {
    const pulse = 4 + Math.sin(s.t * 5) * 2;
    ctx.fillStyle = "#fdd835";
    ctx.beginPath(); ctx.arc(X(s.mission.x), Y(s.mission.y), big ? 8 : pulse, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(253,216,53,0.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(X(s.mission.x), Y(s.mission.y), (big ? 8 : pulse) + 5, 0, Math.PI * 2); ctx.stroke();
  }
  // joueur
  const pxr = X(s.player.x), pyr = Y(s.player.y);
  ctx.save();
  ctx.translate(pxr, pyr);
  ctx.rotate(s.player.dir);
  ctx.fillStyle = "#f5b942";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  const tr = big ? 9 : 6;
  ctx.beginPath();
  ctx.moveTo(tr, 0); ctx.lineTo(-tr * 0.7, tr * 0.6); ctx.lineTo(-tr * 0.7, -tr * 0.6);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* ================= SCÈNE PRINCIPALE ================= */
export function drawScene(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number, s: SceneState) {
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  if (s.bigMap) {
    ctx.fillStyle = "#070b09";
    ctx.fillRect(0, 0, W, H);
    const pad = 40;
    drawMap(ctx, s, pad, pad, W - pad * 2, H - pad * 2, true);
    ctx.font = `700 13px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText("M ou Échap pour fermer — ★ or : chez toi · ● vert : ton travail · jaune : mission", W / 2, H - 14);
    ctx.textAlign = "left";
    ctx.restore();
    return;
  }

  const z = s.cam.zoom;
  ctx.translate(W / 2, H / 2);
  ctx.scale(z, z);
  ctx.translate(-s.cam.x, -s.cam.y);

  const vx = s.cam.x - W / 2 / z - 80, vy = s.cam.y - H / 2 / z - 80;
  const vw = W / z + 160, vh = H / z + 160;
  const inView = (x: number, y: number, m = 0) => x > vx - m && x < vx + vw + m && y > vy - m && y < vy + vh + m;

  // sol
  ctx.fillStyle = "#d8c188";
  ctx.fillRect(vx, vy, vw, vh);
  // taches de sol déterministes
  for (let gx = Math.floor(vx / 90); gx < (vx + vw) / 90; gx++) {
    for (let gy = Math.floor(vy / 90); gy < (vy + vh) / 90; gy++) {
      const h1 = hash(gx, gy);
      if (h1 > 0.55) {
        ctx.fillStyle = h1 > 0.8 ? "rgba(160,130,80,0.35)" : "rgba(190,160,105,0.4)";
        ctx.beginPath();
        ctx.arc(gx * 90 + h1 * 70, gy * 90 + hash(gy, gx) * 70, 2 + h1 * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // zones vertes (campus, plaza)
  ctx.fillStyle = "#9db877";
  rr(ctx, 1860, 760, 1020, 420, 30); ctx.fill();
  ctx.beginPath(); ctx.arc(1720, 1100, 120, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(120,150,90,0.5)";
  for (let i = 0; i < 12; i++) {
    const h1 = hash(i, 7);
    ctx.beginPath(); ctx.arc(1900 + h1 * 900, 800 + hash(i, 13) * 340, 4, 0, Math.PI * 2); ctx.fill();
  }

  // océan
  const seaG = ctx.createLinearGradient(0, 0, WORLD.seaEdge, 0);
  seaG.addColorStop(0, "#0d3f63");
  seaG.addColorStop(0.7, "#1a6a94");
  seaG.addColorStop(1, "#3fa3c4");
  ctx.fillStyle = seaG;
  ctx.fillRect(vx < 0 ? vx : 0, vy, Math.min(vw, WORLD.seaEdge - vx), vh);
  // vagues
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) {
    const wx = 330 + i * 46;
    ctx.beginPath();
    for (let y = vy; y < vy + vh; y += 14) {
      const x = wx + Math.sin(y * 0.02 + s.t * (1.1 + i * 0.3)) * 10;
      if (y === vy) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // plage
  const beachG = ctx.createLinearGradient(WORLD.seaEdge, 0, WORLD.beachEdge, 0);
  beachG.addColorStop(0, "#efe0b2");
  beachG.addColorStop(1, "#dcc48c");
  ctx.fillStyle = beachG;
  ctx.fillRect(WORLD.seaEdge, vy, WORLD.beachEdge - WORLD.seaEdge, vh);
  // écume
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let y = vy; y < vy + vh; y += 12) {
    const x = WORLD.seaEdge + Math.sin(y * 0.03 + s.t * 1.6) * 6;
    if (y === vy) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // routes
  for (const r of ROADS) {
    const horizontal = r.y1 === r.y2;
    const rx = horizontal ? Math.min(r.x1, r.x2) : r.x1 - r.w / 2;
    const ry = horizontal ? r.y1 - r.w / 2 : Math.min(r.y1, r.y2);
    const rw = horizontal ? Math.abs(r.x2 - r.x1) : r.w;
    const rh = horizontal ? r.w : Math.abs(r.y2 - r.y1);
    if (!inView(rx + rw / 2, ry + rh / 2, Math.max(rw, rh))) continue;
    ctx.fillStyle = "#b8a878";
    ctx.fillRect(rx - 10, ry - 10, rw + 20, rh + 20);
    ctx.fillStyle = "#4a4a48";
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = "rgba(245,200,80,0.75)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([24, 20]);
    ctx.beginPath();
    ctx.moveTo(r.x1, r.y1);
    ctx.lineTo(r.x2, r.y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // spots
  for (const sp of SPOTS) {
    if (!inView(sp.x, sp.y)) continue;
    if (sp.id === "monument") drawMonument(ctx, sp.x, sp.y - 14);
    const pulse = 24 + Math.sin(s.t * 3 + sp.x) * 3;
    ctx.strokeStyle = sp.color;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(sp.x, sp.y, pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = sp.color;
    ctx.beginPath(); ctx.arc(sp.x, sp.y, pulse, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = "18px serif";
    ctx.textAlign = "center";
    ctx.fillText(sp.emoji, sp.x, sp.y + 6);
    ctx.textAlign = "left";
  }

  // pirogues & étals
  for (const p of PIROGUES) if (inView(p.x, p.y)) drawPirogue(ctx, p, s.t);
  for (const st of STALLS) {
    if (!inView(st.x, st.y)) continue;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    rr(ctx, st.x + 3, st.y + 4, st.w, 34, 4); ctx.fill();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? st.c1 : st.c2;
      rr(ctx, st.x + i * (st.w / 4), st.y, st.w / 4, 34, 3); ctx.fill();
    }
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(st.x + 3, st.y + 34, 3, 10);
    ctx.fillRect(st.x + st.w - 6, st.y + 34, 3, 10);
  }

  // maisonnettes décoratives
  for (const h of HUTS) {
    if (!inView(h.x, h.y, 120)) continue;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    rr(ctx, h.x + 5, h.y + 6, h.w, h.h, 5); ctx.fill();
    ctx.fillStyle = h.wall;
    rr(ctx, h.x, h.y, h.w, h.h, 5); ctx.fill();
    ctx.fillStyle = h.roof;
    rr(ctx, h.x + 4, h.y + 4, h.w - 8, h.h - 8, 4); ctx.fill();
    ctx.fillStyle = "#241a10";
    rr(ctx, h.x + h.w / 2 - 6, h.y + h.h - 5, 12, 7, 2); ctx.fill();
  }

  // bâtiments interactifs
  for (const b of BUILDINGS) if (inView(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h))) drawBuilding(ctx, b, s);

  // arbres
  for (const p of PALMS) if (inView(p.x, p.y, 80)) drawPalm(ctx, p.x, p.y, s.t);
  for (const b of BAOBABS) if (inView(b.x, b.y, 120)) drawBaobab(ctx, b.x, b.y, b.s);

  // lampadaires (poteaux)
  for (const l of LAMPS) {
    if (!inView(l.x, l.y, 100)) continue;
    ctx.strokeStyle = "#3a3a38"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x, l.y - 30); ctx.stroke();
    ctx.fillStyle = s.ambient > 0.25 ? "#ffe9a8" : "#c9c9c9";
    ctx.beginPath(); ctx.arc(l.x, l.y - 32, 4, 0, Math.PI * 2); ctx.fill();
  }

  // entités triées par y
  const entities: { y: number; draw: () => void }[] = [];
  for (const n of s.npcs) {
    if (!inView(n.x, n.y, 60)) continue;
    const near = Math.hypot(n.x - s.player.x, n.y - s.player.y) < 140;
    entities.push({ y: n.y, draw: () => drawPerson(ctx, n.x, n.y, n.dir, n.moving, n.phase, n.def.shirt, n.def.skin, { name: n.def.name, showName: near, hijab: n.def.hijab }) });
  }
  for (const v of s.traffic) {
    if (!inView(v.x, v.y, 120)) continue;
    entities.push({ y: v.y, draw: () => drawVehicle(ctx, v, s.ambient > 0.3, v.held, s.t) });
  }
  if (!s.player.vehicle) {
    entities.push({
      y: s.player.y,
      draw: () => drawPerson(ctx, s.player.x, s.player.y, s.player.dir, s.player.moving, s.player.phase, s.player.shirt, s.player.skin, { player: true, name: s.player.name }),
    });
  }
  entities.sort((a, b) => a.y - b.y);
  for (const e of entities) e.draw();

  // marqueur de mission
  if (s.mission && inView(s.mission.x, s.mission.y, 200)) {
    const m = s.mission;
    const pulse = 30 + Math.sin(s.t * 5) * 5;
    const beam = ctx.createLinearGradient(0, m.y - 130, 0, m.y);
    beam.addColorStop(0, "rgba(253,216,53,0)");
    beam.addColorStop(1, "rgba(253,216,53,0.4)");
    ctx.fillStyle = beam;
    ctx.fillRect(m.x - 14, m.y - 130, 28, 130);
    ctx.strokeStyle = "#fdd835"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(m.x, m.y, pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(253,216,53,0.2)";
    ctx.beginPath(); ctx.arc(m.x, m.y, pulse, 0, Math.PI * 2); ctx.fill();
  }

  // ambiance nuit / soir
  if (s.ambient > 0.01) {
    ctx.fillStyle = `rgba(8,12,38,${(s.ambient * 0.68).toFixed(3)})`;
    ctx.fillRect(vx, vy, vw, vh);
  }
  if (s.evening > 0.01) {
    ctx.fillStyle = `rgba(255,110,40,${(s.evening * 0.12).toFixed(3)})`;
    ctx.fillRect(vx, vy, vw, vh);
  }
  // lumières après l'assombrissement
  if (s.ambient > 0.2) {
    for (const l of LAMPS) {
      if (!inView(l.x, l.y, 120)) continue;
      const g = ctx.createRadialGradient(l.x, l.y - 30, 4, l.x, l.y - 30, 95);
      g.addColorStop(0, `rgba(255,225,150,${0.34 * s.ambient})`);
      g.addColorStop(1, "rgba(255,225,150,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.x, l.y - 30, 95, 0, Math.PI * 2); ctx.fill();
    }
    for (const b of BUILDINGS) {
      if (!inView(b.x, b.y, 160)) continue;
      ctx.fillStyle = `rgba(255,220,140,${0.75 * s.ambient})`;
      for (let i = 0; i < 3; i++) {
        rr(ctx, b.x + 14 + i * (b.w - 40) / 2, b.y + b.h - 18, 9, 7, 2); ctx.fill();
      }
    }
    const pl = s.player;
    const g = ctx.createRadialGradient(pl.x, pl.y, 6, pl.x, pl.y, 80);
    g.addColorStop(0, `rgba(255,235,180,${0.22 * s.ambient})`);
    g.addColorStop(1, "rgba(255,235,180,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(pl.x, pl.y, 80, 0, Math.PI * 2); ctx.fill();
  }

  // retour espace écran
  ctx.restore();
  ctx.save();
  ctx.scale(dpr, dpr);

  // flèche mission hors écran
  if (s.mission) {
    const sx = (s.mission.x - s.cam.x) * z + W / 2;
    const sy = (s.mission.y - s.cam.y) * z + H / 2;
    if (sx < 30 || sx > W - 30 || sy < 30 || sy > H - 30) {
      const cx = Math.max(36, Math.min(W - 36, sx));
      const cy = Math.max(36, Math.min(H - 36, sy));
      const ang = Math.atan2(sy - H / 2, sx - W / 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.fillStyle = "#fdd835";
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, 0); ctx.lineTo(-8, 10); ctx.lineTo(-4, 0); ctx.lineTo(-8, -10);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(4,7,5,0.5)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // minimap
  if (W > 760) {
    drawMap(ctx, s, 20, H - 170, 200, 150, false);
    ctx.font = `600 10px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText("M — carte complète", 24, H - 176);
  }

  ctx.restore();
}

export const homeDoor = (homeId: string) => {
  const b = BUILDINGS.find((x) => x.home === homeId);
  return b ? doorPos(b) : WORLD.spawn;
};
export const workDoor = (jobId: string | null) => {
  if (!jobId) return null;
  const b = BUILDINGS.find((x) => x.job === jobId);
  return b ? doorPos(b) : null;
};
