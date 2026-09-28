import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_SWELL,
  type BatonState,
  batonBoss,
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { batonSwellRest } from "../src/baton-grip.js";
import { BatonMarks, drawBatonAsked, drawBatonVerdicts } from "../src/baton-marks.js";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { Field } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE BATON's arm answers a touch the way THE INSTAR's marks do**
 * (`baton-marks.ts`, `.claude/skills/new-boss` §5): the ring that asks this
 * seat for a thumb wears the halo — the shell on the locked seat's screen, each
 * bead on its own seat's — with no partner's clock anywhere; a strip, a hold
 * and the merge wash their socket green and a refused press red; a desk press
 * is signed with the ring's seat; and the verdict reaches the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function opened(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("baton");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function arm(world: World): BatonState {
  const b = batonBoss(world);
  if (b === null) throw new Error("the baton wave installed no arm");
  return b;
}

function sitting(world: World): BatonState {
  for (let i = 0; i < (CFG.batonSockets + 1) * TPB; i++) step(world, []);
  const b = arm(world);
  if (b.stage !== "passing") throw new Error("the bead never sat");
  return b;
}

/** A shell coming away at socket 1, with `seat` locked out of the ship. */
function swelling(world: World, seat: 1 | 2): BatonState {
  const b = sitting(world);
  b.sockets[0] = BATON_SOCKET_DARK;
  b.sockets[1] = BATON_SOCKET_SWELL;
  b.swellSocket = 1;
  b.swellBeat = world.beat;
  const bead = b.beads[0];
  if (bead !== undefined) bead.socket = 2;
  b.lockUntil = [seat === 1 ? world.beat : -1, seat === 2 ? world.beat : -1];
  return b;
}

function merging(world: World): BatonState {
  const b = sitting(world);
  const first = b.beads[0];
  if (first === undefined) throw new Error("the arm has no bead");
  first.socket = CFG.batonSockets - 1;
  b.beads.push({ ...first, socket: CFG.batonSockets - 2, color: "cyan" });
  b.stage = "merging";
  b.stageBeat = world.beat;
  return b;
}

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, layout(role));
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

describe("THE BATON's rings asking", () => {
  it("the shell halos on the locked seat's screen alone, and not under its thumb", () => {
    const world = opened();
    const b = swelling(world, 1);
    const halos = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawBatonAsked(ctx, l, CFG, b, world.beat, 1.2)),
        HALO,
      );
    expect(halos("p1")).toBe(1);
    expect(halos("p2")).toBe(0);
    expect(halos("test")).toBe(1);
    b.stripThumbs = 1;
    expect(halos("p1")).toBe(0);
  });

  it("each bead halos on its own seat's screen until that thumb is down", () => {
    const world = opened();
    const b = merging(world);
    const halos = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawBatonAsked(ctx, l, CFG, b, world.beat, 1.2)),
        HALO,
      );
    expect(halos("p1")).toBe(1);
    expect(halos("p2")).toBe(1);
    expect(halos("test")).toBe(2);
    b.mergeThumbs = 1;
    expect(halos("p1")).toBe(0);
    expect(halos("p2")).toBe(1);
  });
});

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a desk press on the shell", () => {
  it("is signed with the locked seat, whichever seat the pointer prefers", () => {
    const world = opened();
    const b = swelling(world, 2);
    const l = layout("test");
    const at = batonSwellRest(l, CFG, b);
    if (at === null) throw new Error("no ring on the swelling socket");
    const touch = deskDown(l, at.x, at.y, [1, 2], (seat) => field(world, seat));
    expect(touch?.player).toBe(2);
    expect(touch?.command).toMatchObject({ target: "batonSocket", id: 1 });
  });
});

const at = (type: SimEvent["type"], socket: number): SimEvent =>
  ({ type, col: 4, socket, player: 1 }) as SimEvent;

describe("THE BATON's verdict on a touch", () => {
  it("keeps each socket's verdict under its index, fades it and forgets it on reset", () => {
    const marks = new BatonMarks();
    marks.ingest([at("batonStripped", 1)]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.ingest([at("batonRefused", 1)]);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    marks.ingest([at("batonHeld", 5), at("batonMerged", 6)]);
    expect(marks.verdicts.at(5)?.good).toBe(true);
    expect(marks.verdicts.at(6)?.good).toBe(true);
    marks.ingest([at("batonParted", 0)]);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.update(1);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([at("batonHeld", 5)]);
    marks.clear();
    expect(marks.verdicts.at(5)).toBeNull();
  });

  it("rings the socket on every screen, since both screens draw the arm", () => {
    const world = opened();
    const b = swelling(world, 1);
    for (const role of ROLES) {
      for (const good of [true, false]) {
        const v = new GripVerdicts();
        v.mark(1, good);
        const log = drawn(role, (ctx, l) => drawBatonVerdicts(ctx, l, CFG, b, v));
        expect(count(log, good ? PALETTE.good : PALETTE.red), role).toBeGreaterThan(0);
      }
    }
  });

  it("draws nothing while the arm is still unfolding", () => {
    const world = opened();
    const b = arm(world);
    b.stage = "unfolding";
    const v = new GripVerdicts();
    v.mark(1, true);
    expect(drawn("p1", (ctx, l) => drawBatonVerdicts(ctx, l, CFG, b, v))).toBe("");
  });

  /** Two beats of the arm swelling, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(opened(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 0) swelling(w, 1);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const refused = [at("batonRefused", 1)];
    expect(count(frames(role, refused), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
