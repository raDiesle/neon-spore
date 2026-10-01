import { type SimConfig, type ThroatState, throatHomeCol } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { throatSway } from "./throat-sway.js";

/**
 * Where every part of THE THROAT is, as numbers — no canvas in this file.
 *
 * The gullet is five ring muscles stacked between the hull, where it is fixed
 * to the ship the way the cannon is, and the mouth, which stands wherever the
 * navigator has carried it — and **not one of the rings is stored anywhere**.
 * The simulation holds a phase, the mouth's place, a slack count and a receipt
 * beat (`sim/throat.ts`), and everything the picture needs is arithmetic over
 * those — the bargain `baton-draw.ts` takes, and the reason it does not own an
 * `Effects` field. A restart cannot show this fight the last one's gullet
 * because there is nothing here to carry.
 *
 * Kept apart from the drawing because the two are read for different reasons:
 * a reviewer asking *which ring is slack* or *where does the tube lean* wants
 * this file and nothing else, and both questions had to be decided by a
 * convention rather than looked up.
 */

/** How far into the hull the tube's root sits, in tiles — it grows out of it. */
export const ROOT = 0.15;

/** A ring's half-width at the root and just under the mouth, as shares of a tile. */
const TOP_RX = 0.82;
const LOW_RX = 0.46;

/** How tall a ring is against its own width, tight and gone slack. */
const TIGHT_RY = 0.3;
const SLACK_RY = 0.13;

/** How much wider than its station a slack ring hangs. */
const SLACK_SPREAD = 0.22;

/** How far under the mouth the last ring stands, in tiles. */
const UNDER_MOUTH = 0.62;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** One ring, placed and sized for this frame. */
export interface Ring {
  /** 0 at the root in the hull, `throatRings - 1` just under the mouth. */
  index: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  /** 1 when this ring has lost its tension for good, 0 while it holds. */
  slack: number;
  /** How hard it is squeezing right now, 0..1 — the gulp passing through it. */
  squeeze: number;
}

/**
 * **Which rings are slack, and it is a convention rather than a fact.**
 *
 * `b.slack` is a count and the simulation never records *which* muscle a
 * swallow spent — deliberately, because nothing in the rules cares. So the
 * picture has to choose, and the choice has to be a function of the count
 * alone or two screens would draw two different gullets from the same world.
 *
 * The rings go slack **from the mouth downward**: what is swallowed is taken
 * at the mouth, and the tube gives out from there toward the hull.
 */
export function ringSlack(cfg: SimConfig, b: ThroatState, index: number): number {
  return index >= cfg.throatRings - b.slack ? 1 : 0;
}

/**
 * **The gulp**: a contraction that starts at the mouth on the beat of a
 * swallow and travels down the gullet into the ship at one ring a beat.
 *
 * It is a receipt: it says *it has just taken something*, on both screens,
 * and it runs away from the field because that is the way a throat works.
 * Read off `fedBeat`, the last swallow's beat, so a second swallow restarts it
 * rather than adding a second wave.
 */
export function ringSqueeze(
  cfg: SimConfig,
  b: ThroatState,
  index: number,
  beat: number,
  beatPhase: number,
): number {
  if (b.fedBeat < 0) return 0;
  const k = beat - b.fedBeat;
  if (k < 0 || k >= cfg.throatRings) return 0;
  const down = cfg.throatRings - 1 - index;
  return Math.max(0, 1 - Math.abs(down - (k + beatPhase)));
}

/**
 * The mouth's place: where the navigator has carried it, to the thousandth of
 * a tile. Nothing is eased — the thumb is the easing, and the circle the suck
 * is judged against is centred exactly here.
 */
export function mouthX(l: Layout, b: ThroatState): number {
  return tileCX(l, b.aimXMilli / 1000);
}

export function mouthY(l: Layout, b: ThroatState): number {
  return tileCY(l, b.aimYMilli / 1000);
}

/** How far round the gullet's outline its whole body stands, in tiles. */
export const GULLET_PAD = 0.3;

/** The whole gullet as points: every ring's two sides, top down, and the mouth. */
export function throatGullet(
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): { x: number; y: number }[] {
  const all = rings(l, cfg, b, beat, beatPhase);
  return [
    ...all.map((r) => ({ x: r.x - r.rx, y: r.y })),
    ...all.map((r) => ({ x: r.x + r.rx, y: r.y })),
    { x: mouthX(l, b), y: mouthY(l, b) },
  ];
}

/**
 * Every ring of the gullet, from the hull up.
 *
 * **The tube leans toward the mouth**, and how far down the lean reaches is
 * the slack: a whole gullet bends only near the mouth and stands straight
 * out of the hull, and one with four muscles gone sags across the field from
 * its root — *the tube can no longer hold its own shape*, said with the one
 * number that already exists. On top of the lean the free middle sways, both
 * ends held (`throat-sway.ts`).
 */
export function rings(
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): Ring[] {
  const rootY = l.hullY + l.tile * ROOT;
  const lowY = mouthY(l, b) + l.tile * UNDER_MOUTH;
  const homeX = tileCX(l, throatHomeCol(cfg));
  const mx = mouthX(l, b);
  // 2 while the gullet is whole and 1 once every ring is gone: the exponent is
  // where the bend sits, and a straight tube is one whose root does not lean.
  const power = 2 - clamp01(b.slack / cfg.throatRings);
  const out: Ring[] = [];
  for (let i = 0; i < cfg.throatRings; i++) {
    const t = cfg.throatRings === 1 ? 1 : i / (cfg.throatRings - 1);
    const slack = ringSlack(cfg, b, i);
    const squeeze = ringSqueeze(cfg, b, i, beat, beatPhase);
    // A squeezing ring is narrower and a slack one is wider than its station,
    // so the silhouette alone says which muscles are left (`bosses.md` §11.0).
    const rx =
      l.tile * (TOP_RX + (LOW_RX - TOP_RX) * t) * (1 - 0.22 * squeeze + SLACK_SPREAD * slack);
    out.push({
      index: i,
      x: homeX + (mx - homeX) * t ** power + throatSway(l, cfg, beat, beatPhase, t),
      y: rootY + (lowY - rootY) * t,
      rx,
      ry: rx * (slack > 0 ? SLACK_RY : TIGHT_RY + 0.06 * squeeze),
      slack,
      squeeze,
    });
  }
  return out;
}
