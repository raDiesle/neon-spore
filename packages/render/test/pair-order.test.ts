import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  instarBoss,
  instarHeld,
  NO_BEARING,
  NOT_DONE,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Who goes when is said by the marks, never by a line over the cannon.**
 *
 * The owner, 24 September 2026, generic: *when both red circles are shown, it
 * is clear that it is either order … if it would not be either order, the
 * circle should first be shown for the first player, and then, when it is the
 * right time, for player 2.* The seat-and-clock line — `EITHER ORDER`,
 * `P2 NOW · 3 BEATS LEFT` — said a second time what the marks already say,
 * and it went.
 *
 * Pinned from both ends: no line naming a seat's turn reaches the glass on
 * THE INSTAR's counted pose with one mark in, nor on THE TASTER with the pry
 * running. The other half — THE TASTER's navigator shown her mark only once
 * the pilot's pry has opened her window, which is what makes the line
 * unneeded — is `boss-cue-taster.test.ts`'s, *before it asks her for
 * anything*.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

type Kind = Parameters<typeof waveWith>[0];

/** A wave carrying this boss, stepped until its body is hung, on a beat boundary. */
function hung(kind: Kind): World {
  const world = createWorld(CFG, 3);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  while (world.tick % TPB !== 0) step(world, []);
  if (world.boss?.kind !== kind) throw new Error(`the ${kind} wave hung no ${kind}`);
  return world;
}

/** Every string written on the glass across a few frames. */
function said(world: World, role: (typeof ROLES)[number]): string[] {
  const texts: TextBox[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.texts = texts;
    },
  });
  return texts.map((t) => t.text);
}

/** A line calling a seat on, or counting its window down. */
function aCall(text: string): boolean {
  return /\bNOW$|BEATS? LEFT$|EITHER ORDER|FINISH TOGETHER|BEFORE IT CLOSES/.test(text);
}

/** THE INSTAR on its first pose of two counted marks, the first of them in. */
function instarOneIn(): World {
  const world = hung("instar");
  const s = instarBoss(world);
  if (s === null) throw new Error("no instar");
  const at = s.steps.findIndex(
    (st) => st.marks.length >= 2 && st.marks.every((m) => !instarHeld(m.gesture)),
  );
  if (at < 0) throw new Error("the script has no step of two counted marks");
  const n = s.steps[at]?.marks.length ?? 0;
  s.cursor = at;
  s.phase = "act";
  s.phaseBeat = world.beat;
  s.progress = Array.from({ length: n }, () => 0);
  s.doneBeat = Array.from({ length: n }, () => NOT_DONE);
  s.ref = Array.from({ length: n }, () => NO_BEARING);
  s.thumbs = Array.from({ length: n }, () => 0);
  s.doneBeat[0] = world.beat;
  return world;
}

describe("the pair's order, said by the marks alone", () => {
  it.each(ROLES)("THE INSTAR writes no seat's turn on the glass, on %s", (role) => {
    expect(said(instarOneIn(), role).filter(aCall)).toEqual([]);
  });

  it.each(ROLES)("THE TASTER writes no seat's turn while the pry runs, on %s", (role) => {
    const world = hung("taster");
    const t = world.boss;
    if (t?.kind !== "taster") throw new Error("no taster");
    t.pryBeat = world.beat;
    expect(said(world, role).filter(aCall)).toEqual([]);
  });
});
