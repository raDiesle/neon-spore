import { Canvas2DRenderer, type ViewRole, type ViewState } from "@neon-spore/render";
import { beatPhase } from "@neon-spore/sim";
import { seedRandom } from "../../versus/seed.js";
import { apply, restore, type Variant } from "../../versus/variant.js";
import type { Pose } from "./pose-kit.js";
import { bandTopPx, signature } from "./versus-diff.js";
import { advance } from "./versus-pair.js";

/**
 * Whether a candidate needs the other seat drawn beside it — decided once,
 * honestly, rather than guessed.
 *
 * The seat dropdown is gone; this is what replaces the looking it used to
 * stand in for, and it is not a plain "does p1's whole screen match p2's".
 * It never does: `showsCannon`/`showsShield` (`layout.ts`) mean the control
 * band always shows one player a lobe to aim and the other a shield to arm,
 * never both — that difference exists on every wave the game has ever drawn,
 * has nothing to do with any candidate, and comparing whole frames would
 * report every single slot as seat-dependent, which is the same failure the
 * queue entry names for a naive compare taken mid-animation, just from a
 * different cause. What the vote is actually about is whether **the patch's
 * own effect** looks the same from both seats — so this hashes the
 * *difference* the patch makes (current minus candidate, pixel for pixel) at
 * `p1` and again at `p2`, with the same seeded random stream both times, and
 * compares those two difference-pictures rather than the two raw frames. A
 * candidate confined to a fixed, opaque record — `ship:hull-skin`'s four body
 * stops — draws that difference identically from either seat: the field
 * itself is not seat-gated, only the band around it is, and an opaque patch
 * replaces pixels outright, so the seat-varying band underneath never enters
 * the subtraction.
 *
 * **The field and the band are judged differently, and that is the one line
 * of the argument above this lane overturns.** `cannon:shot`'s `streak` grows
 * a translucent tail long enough to blend over the strip where the band
 * begins, and alpha compositing is not linear in what sits behind it: the
 * *magnitude* of the difference a translucent layer adds depends on the
 * background it lands on, so an exact pixel-value hash of that magnitude
 * prints a different number over `p1`'s band content than over `p2`'s even
 * though the patch itself never reads `role` and draws the identical tail at
 * the identical column both times. Read narrowly that used to mean "a real
 * second screen". By the owner's rule it is not: it is the same tail on both
 * sides, and the only thing that differs is a strip of panel they were never
 * looking at — "A CANDIDATE THAT CHANGES THE SAME THING FOR BOTH SEATS GETS
 * ONE SCREEN, NOT TWO".
 *
 * So below `bandTop` — the play area's own boundary, computed the same way
 * the renderer computes it, never re-derived by hand — the two
 * difference-pictures are compared by **where they changed**, not by how
 * much. `touchFootprintHash` reduces every pixel to one bit: did this patch
 * move this pixel at all, past a threshold wide enough to swallow the
 * rounding an alpha blend leaves on two different backgrounds, but nowhere
 * near wide enough to swallow an actual stroke or lobe. A translucent tail on
 * the same column and rows regardless of seat lights the same bits on both
 * sides — same footprint, no seat difference reported — even though the exact
 * shade differs. A patch that genuinely draws something only one seat ever
 * shows — a lobe shape on the cannon strip `p2` never draws at all — lights a
 * footprint that exists on one seat and not the other, still caught, because
 * the *set* of touched pixels is what differs, not their brightness. Above
 * `bandTop`, on the field, the exact value hash from before is unchanged: a
 * field candidate is judged exactly as strictly as it always was.
 *
 * Samples several ticks across a full loop of the pose — long enough to
 * cross a rebuild and catch a transient event, not only the instant the pose
 * is named after — so a transient that only reads on one seat is not missed
 * because the sample landed elsewhere. Runs once, synchronously, when a
 * candidate's row is built, not on the animated loop, because the answer
 * does not change while the page is open.
 */
const PROBE_PHONE = { width: 380, height: 820 } as const;
/** How many ticks apart each sample is, and how many samples are taken —
 * `SAMPLES * SAMPLE_EVERY` ticks is comfortably past one `waveRestBeats`
 * rebuild at the default tempo, so a transient tied to the pose's opening
 * moment is not the only thing this ever looks at. */
const SAMPLE_EVERY = 6;
const SAMPLES = 24;

/**
 * What one seat has to say about a candidate: the sequence of differences it
 * draws, and whether it drew any at all.
 *
 * `unchanged` is the signature a picture makes against *itself* — every
 * per-channel difference zero, every touched bit clear — so it is the same
 * string for any two identical frames of this geometry. A sample equal to it
 * is a sample where the patch changed nothing on this seat, and a whole
 * sequence of them means this seat has nothing to show: `panel:action-face`
 * is exactly that on `p2`, which carries neither of the two buttons.
 */
interface Probe {
  hashes: string[];
  changed: boolean;
}

/** The patch's own difference from the shipped look, sampled across one loop
 * of the pose, at one seat. */
function diffSequence(pose: Pose, role: ViewRole, variant: Variant): Probe {
  const current = document.createElement("canvas");
  const candidate = document.createElement("canvas");
  const renderCurrent = new Canvas2DRenderer(current);
  const renderCandidate = new Canvas2DRenderer(candidate);
  renderCurrent.resize({ ...PROBE_PHONE, dpr: 1 });
  renderCandidate.resize({ ...PROBE_PHONE, dpr: 1 });
  let world = pose.build();
  const bandTop = bandTopPx(world.cfg, role);
  let events = [...world.events];
  const view: ViewState = { world, beatPhase: 0, role, time: 0, dt: 1 / 60, events, running: true };
  const hashes: string[] = [];
  let unchanged = "";
  try {
    for (let tick = 0; tick < SAMPLES * SAMPLE_EVERY; tick++) {
      const next = advance(world, () => pose.build());
      world = next.world;
      events = next.events;
      if (tick % SAMPLE_EVERY !== 0) continue;
      view.world = world;
      view.beatPhase = beatPhase(world.cfg, world.tick);
      view.time = tick / 60;
      view.events = events;

      const unseedA = seedRandom(tick + 1);
      try {
        renderCurrent.draw(view);
      } finally {
        unseedA();
      }
      const unseedB = seedRandom(tick + 1);
      const applied = apply(variant);
      try {
        renderCandidate.draw(view);
      } finally {
        restore(applied);
        unseedB();
      }
      const ca = current.getContext("2d");
      const cb = candidate.getContext("2d");
      if (!ca || !cb) continue;
      const { width, height } = current;
      const da = ca.getImageData(0, 0, width, height).data;
      const db = cb.getImageData(0, 0, width, height).data;
      if (unchanged === "") unchanged = signature(da, da, width, height, bandTop);
      hashes.push(signature(da, db, width, height, bandTop));
    }
  } finally {
    renderCurrent.dispose();
    renderCandidate.dispose();
  }
  return { hashes, changed: hashes.some((h) => h !== unchanged) };
}

function sameSequence(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((h, i) => h === b[i]);
}

/**
 * Which seats a candidate is worth drawing, in order.
 *
 * Two questions, and the second one is newer than the first. **Does this seat
 * show the patch at all?** A seat the candidate never touches is two identical
 * pictures — the same "a vote offered on a difference nobody could see"
 * failure `versus-pose.ts` was written to stop, arriving from the other
 * direction: the right pose, on a screen that does not carry the thing.
 * `panel:action-face` is the case that found it — GUARD and INTAKE are player
 * 1's buttons, so `p2`'s band draws neither, and the page put a whole second
 * unchanging phone under the first one. **And do the two seats show it
 * differently?** That is the older question, and it only gets asked when both
 * seats show it at all.
 *
 * Never empty: a candidate whose patch draws nothing anywhere still gets one
 * screen, where `onSettled`'s "THE SWAP DID NOT TAKE" banner is the honest
 * answer and a blank page is not.
 */
export function seatPlan(pose: Pose, variant: Variant): readonly ViewRole[] {
  const p1 = diffSequence(pose, "p1", variant);
  const p2 = diffSequence(pose, "p2", variant);
  if (!p1.changed && !p2.changed) return ["p1"];
  if (!p2.changed) return ["p1"];
  if (!p1.changed) return ["p2"];
  return sameSequence(p1.hashes, p2.hashes) ? ["p1"] : ["p1", "p2"];
}
