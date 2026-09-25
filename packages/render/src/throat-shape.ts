import {
  midCol,
  type SimConfig,
  type ThroatState,
  throatEvery,
  throatInhales,
  throatMouthCol,
  throatMouthRow,
  throatStride,
} from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * Where every part of THE THROAT is, as numbers — no canvas in this file.
 *
 * The gullet is five ring muscles stacked between the top of the frame and the
 * mouth's row, and **not one of them is stored anywhere**. The simulation holds
 * a phase, an anchor, a slack count and two receipt beats (`sim/throat.ts`),
 * and everything the picture needs is arithmetic over those — which is the
 * same bargain `baton-draw.ts` takes, and the reason it does not own an `Effects` field. A restart cannot show this fight the
 * last one's gullet because there is nothing here to carry.
 *
 * Kept apart from the drawing because the two are read for different reasons:
 * a reviewer asking *which ring is slack* or *where does the tube lean* wants
 * this file and nothing else, and both questions had to be decided by a
 * convention rather than looked up.
 */

/** How far above row 0 the tube's root hangs, in tiles — the baton arm's. */
export const ROOT = 0.6;

/** A ring's half-width at the root and just above the mouth, as shares of a tile. */
const TOP_RX = 0.82;
const LOW_RX = 0.46;

/** How tall a ring is against its own width, tight and gone slack. */
const TIGHT_RY = 0.3;
const SLACK_RY = 0.13;

/** How much wider than its station a slack ring hangs. */
const SLACK_SPREAD = 0.22;

/** The share of a beat the mouth spends arriving in its new column. */
const SLIDE_SHARE = 0.35;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** One ring, placed and sized for this frame. */
export interface Ring {
  /** 0 at the root, `throatRings - 1` just above the mouth. */
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
 * `b.slack` is a count and the simulation never records *which* muscle a gum
 * choked — deliberately, because nothing in the rules cares. So the picture
 * has to choose, and the choice has to be a function of the count alone or two
 * screens would draw two different gullets from the same world.
 *
 * The rings go slack **from the mouth upward**: a choke lands at the mouth and
 * the damage climbs the gullet. It falls out of that, without a second rule,
 * that a swallow re-tightens the ring *furthest* from the mouth — the most
 * recent one to go — so a heal visibly undoes the last hit rather than handing
 * the pair back a muscle they took four gums ago.
 */
export function ringSlack(cfg: SimConfig, b: ThroatState, index: number): number {
  return index >= cfg.throatRings - b.slack ? 1 : 0;
}

/**
 * **The gulp**: a contraction that starts at the mouth on an inhale and travels
 * up the gullet at one ring a beat.
 *
 * It runs **bottom to top** because that is the direction a throat actually
 * works — what the mouth took is going *away* from the field — and because of
 * what the other direction would have been. A wave running down the tube and
 * arriving at the mouth on the inhale beat is a **countdown**, readable on
 * both screens, and the count is the one thing this fight gives player 2 alone
 * to say (`docs/spec/bosses-choreographed.md` §1). Running upward it is a
 * receipt instead: it says *it has just taken something*, which is a fact
 * neither player has to be told by the other, and it gives away no beat that
 * has not happened yet.
 *
 * `max` over the gulps still in the tube rather than a sum, so two of them
 * overlapping in phase `open` — where the inhale comes every beat — squeeze a
 * ring once and not twice.
 */
export function ringSqueeze(
  cfg: SimConfig,
  b: ThroatState,
  index: number,
  beat: number,
  beatPhase: number,
): number {
  if (throatEvery(cfg, b) <= 0) return 0;
  const up = cfg.throatRings - 1 - index;
  let out = 0;
  for (let k = 0; k < cfg.throatRings; k++) {
    if (!throatInhales(cfg, b, beat - k)) continue;
    out = Math.max(out, Math.max(0, 1 - Math.abs(up - (k + beatPhase))));
  }
  return out;
}

/**
 * The mouth's x, and the one place this file eases anything.
 *
 * It arrives in its column over the first third of the beat and then stands
 * still, rather than sliding across the whole of it. That order is the honest
 * one: `throatMouthCol` says the mouth **is** in this column for the whole of
 * this beat, a fling is judged against that column by a sweep, and a mouth
 * drawn still travelling toward it would be a picture disagreeing with the hit
 * test for two thirds of every beat — so it snaps, then rests.
 */
export function mouthX(
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): number {
  const col = throatMouthCol(cfg, b, beat);
  if (throatStride(cfg, b) <= 0) return tileCX(l, col);
  const from = throatMouthCol(cfg, b, beat - 1);
  const ease = clamp01(beatPhase / SLIDE_SHARE);
  return tileCX(l, from) + (tileCX(l, col) - tileCX(l, from)) * ease;
}

export function mouthY(l: Layout, cfg: SimConfig): number {
  return tileCY(l, throatMouthRow(cfg));
}

/**
 * Every ring of the gullet, top down.
 *
 * **The tube leans toward the mouth**, and how far up the lean reaches is the
 * slack: a whole gullet bends only in its lowest rings and hangs straight from
 * the root, and one with four muscles gone sags across the field from the top —
 * which is the design's *the tube can no longer hold its own shape*, said with
 * the one number that already exists rather than with a second clock.
 */
export function rings(
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): Ring[] {
  const rootY = tileCY(l, 0) - l.tile * ROOT;
  const lowY = mouthY(l, cfg) - l.tile * 0.62;
  const homeX = tileCX(l, midCol(cfg));
  const mx = mouthX(l, cfg, b, beat, beatPhase);
  // 2 while the gullet is whole and 1 once every ring is gone: the exponent is
  // where the bend sits, and a straight tube is one whose top does not move.
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
      x: homeX + (mx - homeX) * t ** power,
      y: rootY + (lowY - rootY) * t,
      rx,
      ry: rx * (slack > 0 ? SLACK_RY : TIGHT_RY + 0.06 * squeeze),
      slack,
      squeeze,
    });
  }
  return out;
}
