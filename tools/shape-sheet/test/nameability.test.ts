import { describe, expect, it } from "bun:test";
import { type Beats, livingSilhouette, type Pose, rimCount, SWAY_PUMP } from "@neon-spore/content";
import { confusable, nameability } from "../src/nameability.js";
import { livingKinds } from "../src/subjects.js";

/**
 * The gate that has to hold before any pose amplitude is raised.
 *
 * Two people describe shapes to each other across a voice delay, so a
 * silhouette must mean the same word every time — and every amplitude in the
 * `docs/alive.md` batch is one somebody will want to raise once the game is on
 * a phone. "A reviewer remembers the rule" is not a mechanism. This is.
 *
 * The rule is three axes and an all-three conjunction: two kinds are the same
 * word only when they overlap on aspect *and* lobe count *and* drawn size.
 * `nameability.ts` carries why one axis could not do it.
 *
 * Where it binds today, and it is worth knowing before raising anything:
 * **BULB and WISP** are held apart by the lobe axis alone, and the bulb's
 * volume-preserving pump sits exactly on its ceiling. At 0.10 the nine lobes
 * still out-weigh the ellipse the squash adds; at 0.11 they do not, and the
 * bulb's read flips between "nine bumps" and "an oval" from frame to frame.
 * D3's landing squash of 18–22% is red here on arrival.
 *
 * It used to be BULB and THROB, which is the structural crowding
 * `docs/alive.md` closes on — three of four living kinds at aspect ~1.0. That
 * pair is not the tight one any more: the throb wears six clubs on a small
 * core now, so it is separated on lobe *and* size and the bulb cannot be
 * squashed into it at any amplitude. The ceiling did not move; what it binds
 * against did.
 */

const KINDS = livingKinds();

describe("nameability", () => {
  it("has a living roster to measure", () => {
    expect(KINDS.length).toBeGreaterThan(1);
  });

  const axes = new Map(KINDS.map((kind) => [kind, nameability(kind)]));

  for (const kind of KINDS) {
    it(`${kind} draws the lobe count it was authored with`, () => {
      const n = axes.get(kind)!;
      // `rimCount`, not `lobes`: a clubbed body's lobes are the core under the
      // rim and nobody counts those. The throb is authored with three and
      // wears six clubs, and six is what an eye and this axis both find.
      const authored = rimCount(livingSilhouette(kind));
      // A span, not a number, and the span must be a point. The lobe axis is
      // the one holding this roster apart; the moment a pose squashes a body
      // far enough that the ellipse out-weighs its own lobes, the span opens
      // to include 2 and the body has no lobe count at all — it has one on
      // some frames and another on others, which is worse than either.
      expect([n.lobe.lo, n.lobe.hi]).toEqual([authored, authored]);
    });
  }

  for (let i = 0; i < KINDS.length; i++) {
    for (let j = i + 1; j < KINDS.length; j++) {
      const a = KINDS[i]!;
      const b = KINDS[j]!;
      it(`${a} and ${b} are not the same word`, () => {
        const x = axes.get(a)!;
        const y = axes.get(b)!;
        if (confusable(x, y)) {
          throw new Error(
            `${a} and ${b} overlap on all three axes — aspect ${fmt(x.aspect)} vs ${fmt(y.aspect)}, ` +
              `lobe ${fmt(x.lobe)} vs ${fmt(y.lobe)}, size ${fmt(x.size)} vs ${fmt(y.size)}. ` +
              "Run `bun run shapes:report` and read the TOLD APART BY block.",
          );
        }
      });
    }
  }

  /**
   * The gate refuses what it is for, rather than merely passing.
   *
   * A check that is green and could not go red is a check nobody has tested.
   * This opens exactly one amplitude — SWAY_PUMP's pump, the bulb's whole
   * squash — by a tenth, and the bulb walks into the wisp.
   *
   * The widening is a *factor on the real motion*, never a retyped copy of it:
   * `purity.test.ts` already has a row for `livingMotion` precisely because a
   * second copy of a sway drifts, and a gate that guards amplitudes by
   * transcribing them would be guarding last week's.
   */
  it("goes red when the bulb's pump is opened a tenth past where it stands", () => {
    const wider =
      (factor: number) =>
      (t: Beats): Pose => {
        const p = SWAY_PUMP.poseAt(t);
        return { ...p, sx: 1 + (p.sx - 1) * factor, sy: 1 + (p.sy - 1) * factor };
      };
    const wisp = axes.get("wisp")!;
    expect(confusable(nameability("bulb", wider(1)), wisp)).toBe(false);
    expect(confusable(nameability("bulb", wider(1.1)), wisp)).toBe(true);
  });
});

function fmt(s: { lo: number; hi: number }): string {
  return `${s.lo.toFixed(2)}-${s.hi.toFixed(2)}`;
}
