import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LedgerState,
  ledgerBoss,
  ledgerSeamCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { LedgerFx } from "../src/ledger-fx.js";
import { drawLedgerRoot } from "../src/ledger-root.js";
import { PALETTE } from "../src/palette.js";
import { stubCanvas, type TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LEDGER's body, seam and cord, on all three screens.
 *
 * The states are **set** rather than played to, `taster-frame.test.ts`'
 * arrangement: `sim/test/ledger.test.ts` proves the cadence, the ward, the
 * whip and the tear, and what this file asks is whether every state of the
 * picture is one a canvas accepts — the cord paying out, a return coming down
 * it, the seam widening, the cord taut, the halves parted, the boss gone —
 * and the three things nothing else in the suite could catch.
 *
 * **The split is the first in the codebase that cuts one drawn object in
 * half**, so it is proved both ways and in the strongest form the stub
 * allows: the navigator's screen draws *exactly as many calls* with three
 * ordinary returns on the cord as with none, because none of them is hers to
 * see, while the pilot's grows by them; the socket and its white lock are on
 * hers and not his; and the last return is on both.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** The cord going in: a wave one beat old, still inside `ledgerRootBeats`. */
function open(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

/**
 * The same wave a few beats in, for the states counted **backwards** from the
 * beat: an `outBeat` four beats before the first beat of the wave is a
 * negative number, which is not *out* at all but `-1`'s own meaning
 * (`ledgerPhase`).
 */
function late(): World {
  const world = open();
  for (let i = 0; i < 6 * TPB; i++) step(world, []);
  return world;
}

function cord(world: World): LedgerState {
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  return t;
}

/** The same cord with the rooting behind it: the movement the fight is played in. */
function rooted(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  return t;
}

/**
 * `n` returns on the cord, spread down it, and none of them the last.
 *
 * The span is written as the configured number rather than asked of
 * `ledgerCadence`, which is not on the package's surface and has no business
 * being there for a picture's sake: with nothing yet down the seam the cadence
 * *is* `ledgerCadenceBeats`, and how long a bead took is only where this file
 * draws it (`sim/test/ledger.test.ts` is where the number is the subject).
 */
function bills(world: World, n: number): LedgerState {
  const t = rooted(world);
  const span = CFG.ledgerCadenceBeats;
  for (let i = 0; i < n; i++) t.beads.push({ beat: world.beat + 1 + i, span, last: false });
  return t;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
): { calls: number; text: string; texts: TextBox[] } {
  const log: string[] = [];
  const texts: TextBox[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
      c.texts = texts;
    },
  });
  return { calls: ctx.calls, text: log.join("|"), texts };
}

/**
 * The same picture with the world **held still**: the frames are drawn and
 * nothing is stepped.
 *
 * For the states counted from a beat in the past. `stepLedger` nulls the boss
 * `ledgerOutBeats` after the tear — that is the wave being allowed to end
 * (`bossHoldsWave`) — so a frame of the *drawer* past its own last beat can
 * only be asked for by not stepping into it.
 */
function frozen(world: World, role: ViewRole): number {
  const { ctx } = runFrames(world, role, 3, { every: 3, onTick: () => {} });
  return ctx.calls;
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** The same state drawn on each of the three screens, as counts of one hex. */
function perSeat(build: (w: World) => unknown, colour: string): Record<ViewRole, number> {
  const out = {} as Record<ViewRole, number>;
  for (const role of ROLES) {
    const world = open();
    build(world);
    out[role] = count(drawn(world, role, 3).text, colour);
  }
  return out;
}

/** Every bare number on the screen: the beats left of each return, and nothing else. */
function numbers(frame: { texts: TextBox[] }): string[] {
  return frame.texts.filter((t) => /^\d+$/.test(t.text)).map((t) => t.text);
}

describe("THE LEDGER's cord", () => {
  it.each(ROLES)("pays the cord out and stands the body whole, on %s", (role) => {
    const world = open();
    const frame = drawn(world, role, 2 * TPB);
    expect(frame.calls).toBeGreaterThan(200);
    // The body is metal, the same material as THE TASTER's blades, and the
    // cord is the hull's own violet because what travels it is the ship's.
    expect(frame.text).toContain(PALETTE.rock);
    expect(frame.text).toContain(PALETTE.hullRim);
  });

  it.each(ROLES)("widens the seam as the hits land, on %s", (role) => {
    const whole = open();
    rooted(whole).want = "red";
    const split = open();
    const t = rooted(split);
    t.want = "red";
    t.seam = CFG.ledgerSeamHits - 1;
    // There is no bar: a body with nothing down it draws no slot at all, and
    // the split between the halves is lit the wider it gets (`ledger-draw.ts`).
    const before = count(drawn(whole, role, 3).text, PALETTE.redRim);
    const after = count(drawn(split, role, 3).text, PALETTE.redRim);
    expect(after).toBeGreaterThan(before);
  });

  it.each(ROLES)("lights the cut faces in the colour the seam is showing, on %s", (role) => {
    const red = open();
    rooted(red).want = "red";
    const cyan = open();
    rooted(cyan).want = "cyan";
    // The colour is on the two faces of the cut and never through the body:
    // the one surface a bolt up the seam's column actually meets.
    expect(count(drawn(red, role, 3).text, PALETTE.red)).toBeGreaterThan(
      count(drawn(cyan, role, 3).text, PALETTE.red),
    );
  });

  it.each(ROLES)("parts the halves at the tear and then draws nothing, on %s", (role) => {
    const holding = late();
    rooted(holding).seam = CFG.ledgerSeamHits;
    const torn = late();
    const t = rooted(torn);
    t.seam = CFG.ledgerSeamHits;
    t.outBeat = torn.beat;
    const gone = late();
    const g = rooted(gone);
    g.seam = CFG.ledgerSeamHits;
    g.outBeat = gone.beat - CFG.ledgerOutBeats - 1;
    // The cord has gone with the plating, so the torn frame is fewer calls
    // than the taut one; and past its last beat the halves have faded out
    // altogether, so the drawer returns before its first path.
    const held = frozen(holding, role);
    const out = frozen(torn, role);
    expect(out).toBeLessThan(held);
    expect(frozen(gone, role)).toBeLessThan(out);
    // The halves themselves are still metal while they part.
    expect(drawn(torn, role, 3).text).toContain(PALETTE.rock);
  });

  it("shows the returns and their beats to the pilot and not the navigator", () => {
    const empty = { p1: 0, p2: 0 } as Record<ViewRole, number>;
    const three = { p1: 0, p2: 0 } as Record<ViewRole, number>;
    const said: Record<ViewRole, string[]> = { p1: [], p2: [], test: [] };
    for (const role of ROLES) {
      // Both frames are silent of cues on her screen, so the only thing
      // between them is the beads: an empty cord with the cannon off the seam
      // asks *him* for the column, and a loaded one with the plate already in
      // the socket asks her for nothing (`boss-cue-read-o.ts`).
      const bare = open();
      const idle = rooted(bare);
      bare.cannonCol = ledgerSeamCol(idle, CFG) === 0 ? 1 : 0;
      empty[role] = drawn(bare, role, 3).calls;
      const loaded = open();
      const busy = bills(loaded, 3);
      busy.socket = loaded.shieldCol;
      const frame = drawn(loaded, role, 3);
      three[role] = frame.calls;
      said[role] = numbers(frame);
    }
    // Hers is the same picture either way, to the call: three returns on the
    // cord and not one of them drawn. His grew by them, and by the count of
    // beats left written beside each.
    expect(three.p2).toBe(empty.p2);
    expect(three.p1).toBeGreaterThan(empty.p1);
    expect(said.p1.length).toBeGreaterThanOrEqual(3);
    expect(said.p2.length).toBe(0);
    expect(said.test.length).toBeGreaterThanOrEqual(3);
  });

  it("draws the last return on both screens", () => {
    // The one exception to the split, and the design's beat 13: both seats are
    // shown the bead that tears the cord out, and neither is asked to stop it.
    const bare = open();
    rooted(bare);
    const held = open();
    const t = rooted(held);
    t.seam = CFG.ledgerSeamHits;
    // The seam is full, so the cadence is at its floor: `ledgerCadenceMinBeats`.
    t.beads.push({ beat: held.beat + 2, span: CFG.ledgerCadenceMinBeats, last: true });
    for (const role of ROLES) {
      expect(drawn(held, role, 3).calls).toBeGreaterThan(drawn(bare, role, 3).calls);
    }
  });

  it("shows the socket and its lock to the navigator and not the pilot", () => {
    // The hole in the plating is the hull's violet and the lock that names its
    // column is white, which is the one white mark this boss puts on the field.
    const seen = perSeat((w) => rooted(w), PALETTE.text);
    expect(seen.p2).toBeGreaterThan(seen.p1);
    expect(seen.test).toBeGreaterThan(seen.p1);
  });

  it("puts the navigator's lock on the plating and not on the hull line", () => {
    // **The defect this file could not have caught before it was a file.** Both
    // of her marks were drawn with the body, in the field pass, and the ship
    // pass paints over that — so the lock was recorded as drawn and buried
    // under the plating it is about (`ledger-root.ts`). It is on the finished
    // ship now, sitting on the surface it is a hole in, which is a thing the
    // log can be asked: every coordinate of it is at the plate this hands it
    // and nowhere near the hull line the cord is drawn to.
    const world = open();
    rooted(world);
    const l = computeLayout(VIEWPORT, CFG, "p2");
    const plate = l.hullY - l.tile * 2;
    const log: string[] = [];
    const { ctx } = stubCanvas();
    ctx.log = log;
    drawLedgerRoot(ctx as unknown as CanvasRenderingContext2D, l, world, 0, () => plate);
    expect(log.join("|")).toContain(PALETTE.text);
    const ys = log.flatMap((one) => {
      const args = /^Path2D[.](?:moveTo|lineTo|ellipse|arc)\(([^)]*)\)$/.exec(one);
      const y = Number(args?.[1]?.split(",")[1]);
      return Number.isFinite(y) ? [y] : [];
    });
    expect(ys.length).toBeGreaterThan(6);
    for (const y of ys) expect(Math.abs(y - plate)).toBeLessThan(l.tile);
  });

  it("whips a warded return back up the cord, and keeps nothing of it", () => {
    const fx = new LedgerFx();
    expect(fx.whipU).toBe(-1);
    fx.ingest([{ type: "ledgerWard", col: 3 }], L, CFG, 0.5, () => {});
    expect(fx.whipU).toBeGreaterThan(0);
    fx.update(1);
    expect(fx.whipU).toBe(-1);
  });

  it("keeps the tear's flash as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "ledgerTear", col: 3 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
