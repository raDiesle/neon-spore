import { framePhase, instarActing, instarMarkDone, instarStep, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { INSTAR_WORDS } from "./instar-marks.js";
import { instarMarkPoint, instarMarkRadius } from "./instar-shape.js";
import { instarSway } from "./instar-sway.js";
import type { Layout } from "./layout.js";

/**
 * **THE INSTAR's marks, read as cues — for the desk, and for nothing that
 * draws.**
 *
 * This boss is the one whose marks are an authored beat list rather than a
 * reading of `World` (`sim/instar.ts`), and its ring draws its own frame, its
 * own glyph and its own two lines (`instar-marks.ts`, `instar-word.ts`). That
 * is why `bossCues` has no `case "instar"` and must never grow one: a cue
 * through `boss-cue-draw.ts` would put a second scan frame and a second copy
 * of the same verb around a place that already has both, which is the
 * four-pictures-for-one-idea mistake `target-lock.ts` records the owner
 * ending.
 *
 * The desk wants the marks for a different reason. The director's `3` presses
 * what the field is asking for, both seats at once, and on this boss it was
 * silent: the marks were nowhere in the list it reads
 * (`tools/director/src/stage-cue-key.ts`). This is that list, built out of
 * the ring's **own** source — `instarStep`'s marks, `instarMarkPoint`,
 * `INSTAR_WORDS` — so it cannot name a place or a verb the ring is not
 * already showing. Nothing here is a second opinion about what the boss
 * wants.
 *
 * A mark already answered is left out: its ring is a dot by then and there is
 * nothing under it to press (`instarMarkDone`).
 *
 * **A `both` mark is two cues on the one place**, and that is the whole
 * reason this reads the marks rather than the ring: THE INSTAR's last pose
 * wants the pilot's thumb *and* the navigator's on the same head, held
 * together, and a count that only ever sees one of them never starts
 * (`sim/instar.ts`, `thumbs`). One cue with `seat: null` would be worse than
 * none — the desk hands such a cue to the first free seat and moves on
 * (`cueAnswers`), which is exactly the one thumb the mark refuses.
 */
export function instarCues(l: Layout, world: World): readonly BossCue[] {
  const boss = world.boss;
  if (boss === null || boss.kind !== "instar") return [];
  if (!instarActing(boss)) return [];
  const step = instarStep(boss);
  if (step === null) return [];
  const r = instarMarkRadius(l, world.cfg);
  // The swing at the frame's own sub-beat, the one the ring is drawn and hit
  // at (`instar-mark-grip.ts`). The top of the beat is up to a third of the
  // field off at the fastest of the swing, which is a press on the partner's
  // ring when two sit that close — the lunge's brow and its eye.
  const sway = instarSway(boss, world.cfg, world.beat, framePhase(world));
  const out: BossCue[] = [];
  step.marks.forEach((mark, id) => {
    if (instarMarkDone(boss, id)) return;
    const { kind, word } = INSTAR_WORDS[mark.gesture];
    const at = instarMarkPoint(l, mark, sway);
    const seats: readonly (1 | 2)[] =
      mark.seat === "both" ? [1, 2] : mark.seat === "p1" ? [1] : [2];
    for (const seat of seats)
      out.push({ seat, kind, word, x: at.x, y: at.y, halfW: r, halfH: r, seed: 70 + id });
  });
  return out;
}
