import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_CATCH,
  RATCHET_TEETH,
  type RatchetPhase,
  type RatchetState,
  ratchetBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { RatchetFx } from "../src/ratchet-fx.js";
import {
  ratchetCoils,
  ratchetGrind,
  ratchetKickLift,
  ratchetRackShake,
  ratchetSag,
} from "../src/ratchet-story.js";
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
 * THE RATCHET's story between the teeth, drawn (`render/src/ratchet-story.ts`):
 * the rack sagging a tooth, the pawl kicked out of its seat, the teeth
 * grinding with sparks and the spring run down and wound back. Set rather
 * than played to; `sim/test/ratchet-story.test.ts` proves the rules. What
 * this file asks is that each state is drawn on every screen and unlike the
 * rack without it, and that the answer so far — beats held, sets made —
 * closes the pose.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
/** A grip deep enough to hold: past the notch. */
const SET = CFG.ratchetGripMilli + 100;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("ratchet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  return world;
}

/** The rack in a story `phase`, a beat in, one clean tooth per state behind it. */
function at(world: World, phase: RatchetPhase): RatchetState {
  const s = ratchetBoss(world);
  if (s === null) throw new Error("the ratchet wave hung no rack");
  const behind = { slip: 1, kick: 2, bind: 3, wind: 4 } as Record<string, number>;
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.clean = behind[phase] ?? 1;
  s.teeth = RATCHET_TEETH - s.clean;
  s.catchMilli = NO_CATCH;
  s.catchSpent = false;
  s.pawlDown = false;
  s.holdBeats = 0;
  s.windSets = 0;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const count = (colour: string) => text.split(colour).length - 1;
  return count(hex) + count(`rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE RATCHET's slip", () => {
  it("sags the rack, less as her held beats count, and not at all outside it", () => {
    const world = hung();
    const s = at(world, "slip");
    const loose = ratchetSag(s, CFG, world.beat, 0.5);
    s.catchMilli = SET;
    s.holdBeats = CFG.ratchetSlipBeats - 1;
    const held = ratchetSag(s, CFG, world.beat, 0.5);
    expect(loose).toBeGreaterThan(held);
    s.phase = "work";
    expect(ratchetSag(s, CFG, world.beat, 0.5)).toBe(0);
  });

  it.each(ROLES)("draws the rack lower than it stands, on %s", (role) => {
    const work = frame(role, (w) => at(w, "work"));
    const slip = frame(role, (w) => at(w, "slip"));
    expect(slip).not.toBe(work);
  });
});

describe("THE RATCHET's kick", () => {
  it("springs the pawl, less as his held beats count, and not at all outside it", () => {
    const world = hung();
    const s = at(world, "kick");
    const sprung = ratchetKickLift(s, CFG, world.beat, 0.5);
    s.pawlDown = true;
    s.holdBeats = CFG.ratchetKickBeats - 1;
    const seated = ratchetKickLift(s, CFG, world.beat, 0.5);
    expect(sprung).toBeGreaterThan(1);
    expect(sprung).toBeGreaterThan(seated);
    s.phase = "slip";
    expect(ratchetKickLift(s, CFG, world.beat, 0.5)).toBe(0);
  });

  it.each(ROLES)("draws the pawl out of its seat, on %s", (role) => {
    const slip = frame(role, (w) => at(w, "slip"));
    const kick = frame(role, (w) => at(w, "kick"));
    expect(kick).not.toBe(slip);
  });
});

describe("THE RATCHET's bind", () => {
  it("shakes the rack, less as the chord counts, and not at all outside it", () => {
    const world = hung();
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const s = at(world, "bind");
    const loose = ratchetGrind(s, CFG, world.beat, 0.3);
    s.catchMilli = SET;
    s.pawlDown = true;
    s.holdBeats = CFG.ratchetBindBeats - 1;
    const meshed = ratchetGrind(s, CFG, world.beat, 0.3);
    expect(loose).toBeGreaterThan(meshed);
    expect(Math.abs(ratchetRackShake(l, loose, world.beat, 0.05))).toBeGreaterThan(0);
    s.phase = "kick";
    expect(ratchetGrind(s, CFG, world.beat, 0.3)).toBe(0);
    expect(ratchetRackShake(l, 0, world.beat, 0.05)).toBe(0);
  });

  it.each(ROLES)("throws sparks off the seam, on %s", (role) => {
    const kick = frame(role, (w) => at(w, "kick"));
    const bind = frame(role, (w) => at(w, "bind"));
    expect(tinted(kick, PALETTE.emberRim)).toBe(0);
    expect(tinted(bind, PALETTE.emberRim)).toBeGreaterThan(0);
  });
});

describe("THE RATCHET's wind", () => {
  it("runs the spring down to slack coils and winds a turn back per set", () => {
    const world = hung();
    const s = at(world, "wind");
    s.phaseBeat = world.beat - 2;
    const slack = ratchetCoils(s, CFG, world.beat, 0);
    s.windSets = 1;
    const once = ratchetCoils(s, CFG, world.beat, 0);
    expect(slack.coils).toBeLessThan(7);
    expect(once.coils).toBeGreaterThan(slack.coils);
    expect(once.width).toBeLessThan(slack.width);
    s.phase = "work";
    expect(ratchetCoils(s, CFG, world.beat, 0)).toEqual({ coils: 7, width: 0.22 });
  });

  it.each(ROLES)("draws the spring run down, and wound tighter by a set, on %s", (role) => {
    const work = frame(role, (w) => at(w, "work"));
    const wind = frame(role, (w) => at(w, "wind"));
    const wound = frame(role, (w) => {
      at(w, "wind").windSets = 2;
    });
    expect(wind).not.toBe(work);
    expect(wound).not.toBe(wind);
  });
});

it("draws the same bind the same way twice", () => {
  const arrange = (w: World) => {
    at(w, "bind").pawlDown = true;
  };
  expect(frame("p1", arrange)).toBe(frame("p1", arrange));
});

describe("what THE RATCHET's story throws", () => {
  /** One event through the rack's fx: the bursts, the blow, the shudder. */
  function thrown(type: SimEvent["type"], role: ViewRole): [number, number, number] {
    const fx = new RatchetFx();
    let bursts = 0;
    const e = { type, col: 5 } as SimEvent;
    fx.ingest([e], computeLayout(VIEWPORT, CFG, role), CFG, 0.5, role, () => {
      bursts++;
    });
    return [bursts, fx.hurt.value > 0 ? 1 : 0, fx.shock.now > 0 ? 1 : 0];
  }

  it.each(ROLES)("puffs as an ask opens, lands a step when it is answered, on %s", (role) => {
    for (const open of ["ratchetSlip", "ratchetKick", "ratchetBind", "ratchetWind"] as const) {
      expect(thrown(open, role), open).toEqual([1, 0, 0]);
    }
    for (const won of ["ratchetBite", "ratchetSeat", "ratchetMesh", "ratchetWound"] as const) {
      expect(thrown(won, role), won).toEqual([1, 1, 0]);
    }
  });

  it.each(ROLES)(
    "shudders the hull when an ask runs out, and deals the rack nothing, on %s",
    (role) => {
      for (const miss of ["ratchetDrop", "ratchetFly", "ratchetShake", "ratchetUnwind"] as const) {
        expect(thrown(miss, role), miss).toEqual([1, 0, 1]);
      }
    },
  );
});
