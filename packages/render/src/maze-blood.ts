import { blobPath } from "@neon-spore/content";
import type { MazeState } from "@neon-spore/sim";

/**
 * What THE MAZE's heart leaves on the floor of its room when it is hit, and
 * why it is still there next round.
 *
 * **The drum is replaced; the heart is not.** A round finished swaps the sheet
 * for a harder one, and the owner asked that the body in the middle carry on
 * from where it was left — so the blood a hit threw is still lying there when
 * the next maze comes up, and the next hit throws more of it. That is the only
 * thing on this boss that says how far in the pair is, and it says it without
 * a bar or a number.
 *
 * **Nothing is stored to draw it.** Where every splash lands is worked out
 * from the round it was thrown in and its own index, by an integer hash — so
 * both phones lie the blood in the same places, a restart lays it in the same
 * places again, and `Effects.reset()` has nothing of this to clear. A list of
 * splashes kept in the world would be a field two devices could disagree
 * about, for a thing neither of them can shoot.
 */

/** Splashes one hit throws. The second hit throws twice this, and so on. */
const PER_HIT = 9;
/** Beats a fresh splash takes to fly out and settle. */
const FLY = 1.4;

/** One splash: where it lies, how big, and which way round it fell. */
export interface Splash {
  a: number;
  dist: number;
  size: number;
  turn: number;
  seed: number;
}

/**
 * A whole number out of two, spread evenly. Not `sim`'s `Rng`: nothing here is
 * in the fingerprint and a stream would have to be wound forward the same way
 * on both phones, where a hash of the two indices simply cannot drift.
 */
function scatter(hit: number, i: number, salt: number): number {
  const n = Math.imul(hit * 2654435761 + i * 40503 + salt * 97, 2246822519) >>> 8;
  return (n % 10_000) / 10_000;
}

/**
 * Everything thrown by hit number `hit` (counted from 1), lying where it fell.
 * Later hits throw more and throw it further, which is what makes the middle
 * of the drum read as getting worse rather than as merely being marked.
 */
export function splashesOf(hit: number): Splash[] {
  const out: Splash[] = [];
  const many = PER_HIT * hit;
  for (let i = 0; i < many; i++) {
    out.push({
      a: scatter(hit, i, 1) * Math.PI * 2,
      dist: 0.62 + scatter(hit, i, 2) * (0.34 + 0.12 * hit),
      size: 0.09 + scatter(hit, i, 3) * 0.15,
      turn: scatter(hit, i, 4) * Math.PI,
      seed: 1 + Math.floor(scatter(hit, i, 5) * 90),
    });
  }
  return out;
}

/**
 * How many hits the heart has taken, and how far the newest one has flown.
 *
 * The count comes off the boss's own hull rather than off a field of its own:
 * a round finished takes an equal share of it (`maze-verdict.ts`), so the share
 * that is gone *is* the number of times the pair has reached the middle.
 */
export function bloodOf(
  m: MazeState,
  beat: number,
  beatPhase: number,
): { hits: number; fresh: number } {
  const rounds = Math.max(1, m.rounds.length);
  const hits = Math.round(((100_000 - m.hullMilli) * rounds) / 100_000);
  if (m.phase !== "verdict" || m.verdict !== 1) return { hits, fresh: 1 };
  const age = beat - m.phaseBeat + beatPhase;
  return { hits, fresh: Math.max(0, Math.min(1, age / FLY)) };
}

/**
 * The blood itself, lying round the heart. `r` is the room it is in and `tint`
 * the colour the heart was running when it was hit — which changes every
 * round, so the floor ends up carrying both.
 */
export function drawMazeBlood(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  m: MazeState,
  bloodOfRound: (round: number) => string,
  beat: number,
  beatPhase: number,
): void {
  const { hits, fresh } = bloodOf(m, beat, beatPhase);
  if (hits <= 0) return;
  ctx.save();
  for (let hit = 1; hit <= hits; hit++) {
    // The newest hit is still flying out and drying; every older one is where
    // it settled. `hit - 1` is the round it was thrown in, so the two colours
    // alternate down the pile exactly as the heart did.
    const young = hit === hits ? fresh : 1;
    if (young <= 0) continue;
    ctx.fillStyle = bloodOfRound(hit - 1);
    for (const s of splashesOf(hit)) {
      const dist = r * s.dist * (0.25 + 0.75 * young);
      const size = r * s.size * (0.5 + 0.5 * young);
      ctx.globalAlpha = (0.34 + 0.3 * (hit / hits)) * (0.35 + 0.65 * young);
      ctx.save();
      ctx.translate(cx + Math.cos(s.a) * dist, cy + Math.sin(s.a) * dist);
      ctx.rotate(s.turn);
      // A splash is a body like everything else here: a lobed contour, not a
      // dot. Three lobes cut deep is what makes it read as thrown.
      ctx.fill(new Path2D(blobPath(0, 0, size, size * 0.72, 3, 0.34, 0.12, s.seed, s.seed, 14)));
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
