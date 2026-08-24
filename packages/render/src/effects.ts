import { crystalPath, METEOR } from "@neon-spore/content";
import type { PodKind, SimEvent } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { Sparks } from "./sparks.js";

interface Deflect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  vs: number;
  life: number;
}
interface Shock {
  x: number;
  y: number;
  r: number;
  life: number;
}

const DEFLECT_LIFE = 1.1;
const SHOCK_LIFE = 0.5;
/** How long "DEFLECTED" stays up. Long enough to look at, short enough to miss. */
const BANNER_LIFE = 0.9;
/**
 * The swallow, end to end: the skin comes apart, then the ship lights up —
 * two movements, one timer, so the flash never arrives before the chewing.
 */
const SWALLOW_LIFE = 1.05;
const CHEW_SHARE = 0.55;

/** The one-word receipt for what a pod just gave, and the colour it reads in. */
const POD_RECEIPT: Record<PodKind, { text: string; hex: string }> = {
  mend: { text: "+HULL", hex: PALETTE.pod },
  purge: { text: "SWEPT", hex: PALETTE.ember },
  ward: { text: "WARDED", hex: PALETTE.shieldRim },
};

/**
 * Everything transient. Effects own their own state, are fed only by
 * `SimEvent`s, and write nothing back — the world does not know they exist.
 *
 * The deflection gets the most work by a wide margin, and deliberately: it is
 * the one moment that needs both players, and docs/spec/systems.md 5.8 says a pair that cannot
 * see it worked will never learn the timing. So the rock bounces visibly out of
 * frame, a pressure wave runs outward, and the word appears.
 */
export class Effects {
  private sparks = new Sparks();
  private deflects: Deflect[] = [];
  private shocks: Shock[] = [];
  private blockedUntil = new Map<number, number>();
  private guardHit = 0;
  /** Counts down from `SWALLOW_LIFE` while a pod is being taken in. */
  private swallow = 0;
  /** Which kind the swallow currently running is for, for the receipt. */
  private podKind: PodKind | null = null;

  /** Per-creature grey flash after a wrong-colour hit, keyed by creature id. */
  get blocked(): ReadonlyMap<number, number> {
    return this.blockedUntil;
  }

  get deflectFlash(): number {
    return this.guardHit;
  }

  /** 0..1 while the membrane around the maw is coming apart. */
  get chew(): number {
    const done = 1 - this.swallow / SWALLOW_LIFE;
    if (this.swallow <= 0 || done > CHEW_SHARE) return 0;
    // Up fast, then held: the ship bites and keeps its mouth busy.
    return Math.min(1, done / (CHEW_SHARE * 0.3));
  }

  /** 0..1 for the light that goes through the ship once the pod is inside. */
  get charge(): number {
    const done = 1 - this.swallow / SWALLOW_LIFE;
    if (this.swallow <= 0 || done < CHEW_SHARE) return 0;
    const after = (done - CHEW_SHARE) / (1 - CHEW_SHARE);
    // A flash is all attack and no sustain: full at once, then gone.
    return Math.max(0, 1 - after) ** 1.6;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    creatureIdAt: (col: number, row: number) => number,
  ): void {
    for (const e of events) {
      switch (e.type) {
        case "destroy": {
          const hex = e.color === "red" ? PALETTE.red : PALETTE.cyan;
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 12, hex);
          break;
        }
        case "reject": {
          const id = creatureIdAt(e.col, e.row);
          if (id) this.blockedUntil.set(id, 0.35);
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 5, PALETTE.sparkDim);
          break;
        }
        case "hole":
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 5, PALETTE.rock);
          break;
        case "breach":
          this.burst(tileCX(l, e.col), l.hullY, 16, PALETTE.red);
          break;
        case "podLoose":
          this.burst(tileCX(l, e.col), tileCY(l, e.row), 10, PALETTE.ember);
          break;
        case "podTaken": {
          // Sparks flying *inwards*: the one moment in the game where the ship
          // takes something instead of losing it.
          this.sparks.implode(tileCX(l, e.col), l.hullY, 22, PALETTE.pod, l.tile * 1.9);
          this.swallow = SWALLOW_LIFE;
          this.podKind = e.kind;
          break;
        }
        case "podLost":
          this.burst(tileCX(l, e.col), l.hullY, 12, PALETTE.sparkDim);
          break;
        case "deflect": {
          const x = tileCX(l, e.col);
          const y = l.hullY;
          this.deflects.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 90,
            vy: -260 - Math.random() * 80,
            spin: Math.random() * 6.28,
            vs: (Math.random() - 0.5) * 7,
            life: DEFLECT_LIFE,
          });
          this.shocks.push({ x, y, r: l.tile * 0.4, life: SHOCK_LIFE });
          this.burst(x, y, 26, PALETTE.shieldRim);
          this.guardHit = BANNER_LIFE;
          break;
        }
        default:
          break;
      }
    }
  }

  update(dt: number, l: Layout): void {
    this.sparks.update(dt);
    for (let i = this.deflects.length - 1; i >= 0; i--) {
      const d = this.deflects[i]!;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 120 * dt;
      d.spin += d.vs * dt;
      d.life -= dt;
      if (d.life <= 0 || d.y < -60) this.deflects.splice(i, 1);
    }
    for (let i = this.shocks.length - 1; i >= 0; i--) {
      const s = this.shocks[i]!;
      s.r += l.tile * 4.5 * dt;
      s.life -= dt;
      if (s.life <= 0) this.shocks.splice(i, 1);
    }
    for (const [id, t] of this.blockedUntil) {
      const left = t - dt;
      if (left <= 0) this.blockedUntil.delete(id);
      else this.blockedUntil.set(id, left);
    }
    this.guardHit = Math.max(0, this.guardHit - dt);
    this.swallow = Math.max(0, this.swallow - dt);
  }

  /** Drawn under the hull, so a deflected rock passes behind nothing. */
  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const d of this.deflects) {
      const r = l.tile * 0.4;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.globalAlpha = Math.min(1, d.life / 0.5);
      ctx.rotate(d.spin);
      const path = new Path2D(
        crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed),
      );
      const rg = ctx.createLinearGradient(-r, -r, r, r);
      rg.addColorStop(0, "#9DA3B0");
      rg.addColorStop(0.55, "#6B707E");
      rg.addColorStop(1, PALETTE.rockDark);
      ctx.fillStyle = rg;
      ctx.fill(path);
      ctx.strokeStyle = PALETTE.shieldRim;
      ctx.lineWidth = 1.8;
      ctx.stroke(path);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    for (const s of this.shocks) {
      const a = Math.max(0, s.life / SHOCK_LIFE);
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = PALETTE.shieldRim;
      ctx.lineWidth = 3 * a + 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, Math.PI, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      halo(ctx, s.x, s.y, s.r * 0.5, PALETTE.shield, a * 0.4);
    }

    this.sparks.draw(ctx);
  }

  /** The word itself, over the hull — DEFLECTED, or a pod's one-word receipt. */
  drawBanner(ctx: CanvasRenderingContext2D, l: Layout): void {
    if (this.guardHit > 0) {
      drawWord(ctx, l, "DEFLECTED", PALETTE.shieldRim, Math.min(1, this.guardHit / 0.6), 0.9);
    }
    if (this.swallow <= 0 || !this.podKind) return;
    const done = 1 - this.swallow / SWALLOW_LIFE;
    if (done < CHEW_SHARE) return; // wait for the chewing to finish first
    const after = (done - CHEW_SHARE) / (1 - CHEW_SHARE);
    const a = Math.min(1, 1 - after);
    if (a <= 0) return;
    const { text, hex } = POD_RECEIPT[this.podKind];
    drawWord(ctx, l, text, hex, a, 0.55);
  }

  private burst(x: number, y: number, n: number, hex: string): void {
    this.sparks.burst(x, y, n, hex);
  }
}

/** One word, centred above the hull. `tiles` is how far above `l.hullY`. */
function drawWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  text: string,
  hex: string,
  alpha: number,
  tiles: number,
): void {
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.fillStyle = hex;
  ctx.font = '600 15px "Courier New",monospace';
  ctx.fillText(text, l.width / 2, l.hullY - l.tile * tiles);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}
