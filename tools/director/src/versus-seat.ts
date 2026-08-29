import { Canvas2DRenderer, type ViewRole, type ViewState } from "@neon-spore/render";
import { ticksPerBeat } from "@neon-spore/sim";
import { seedRandom } from "../../versus/seed.js";
import { apply, restore, type Variant } from "../../versus/variant.js";
import type { Pose } from "./pose-kit.js";
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
 * the subtraction. A translucent one is not guaranteed the same immunity —
 * `cannon:shot`'s `streak` grows a tail long enough to blend over the strip
 * where the band begins, and alpha compositing is not linear in what sits
 * behind it: the delta a translucent layer adds depends on the background it
 * lands on, so the same tail can print a different difference over `p1`'s
 * band content than over `p2`'s even though the patch itself never reads
 * `role`. That is a real second screen, not a false one — this is exactly
 * the case the honest measurement exists to catch rather than assume away.
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

/** FNV-1a over the absolute per-channel difference of two same-sized
 * canvases — the pixel signature of what changed between them, not of
 * either picture on its own. */
function diffHash(a: HTMLCanvasElement, b: HTMLCanvasElement): string {
  const ca = a.getContext("2d");
  const cb = b.getContext("2d");
  if (!ca || !cb) return "";
  const da = ca.getImageData(0, 0, a.width, a.height).data;
  const db = cb.getImageData(0, 0, b.width, b.height).data;
  let h = 0x811c9dc5;
  for (let i = 0; i < da.length; i++) {
    h ^= Math.abs((da[i] ?? 0) - (db[i] ?? 0));
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** The patch's own difference from the shipped look, sampled across one loop
 * of the pose, at one seat. */
function diffSequence(pose: Pose, role: ViewRole, variant: Variant): string[] {
  const current = document.createElement("canvas");
  const candidate = document.createElement("canvas");
  const renderCurrent = new Canvas2DRenderer(current);
  const renderCandidate = new Canvas2DRenderer(candidate);
  renderCurrent.resize({ ...PROBE_PHONE, dpr: 1 });
  renderCandidate.resize({ ...PROBE_PHONE, dpr: 1 });
  let world = pose.build();
  let events = [...world.events];
  const view: ViewState = { world, beatPhase: 0, role, time: 0, dt: 1 / 60, events, running: true };
  const hashes: string[] = [];
  try {
    for (let tick = 0; tick < SAMPLES * SAMPLE_EVERY; tick++) {
      const next = advance(world, () => pose.build());
      world = next.world;
      events = next.events;
      if (tick % SAMPLE_EVERY !== 0) continue;
      const tpb = ticksPerBeat(world.cfg);
      view.world = world;
      view.beatPhase = (world.tick % tpb) / tpb;
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
      hashes.push(diffHash(current, candidate));
    }
  } finally {
    renderCurrent.dispose();
    renderCandidate.dispose();
  }
  return hashes;
}

function sameSequence(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((h, i) => h === b[i]);
}

/** `true` when the patch's own effect is not the same picture at `p1` and at
 * `p2`, anywhere across the sampled loop. */
export function seatsDiffer(pose: Pose, variant: Variant): boolean {
  return !sameSequence(diffSequence(pose, "p1", variant), diffSequence(pose, "p2", variant));
}
