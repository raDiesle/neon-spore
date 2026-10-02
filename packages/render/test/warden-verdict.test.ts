import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_TETHER,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  WARDEN_PHASES,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { WARDEN_EYE_MARK, WardenFx } from "../src/warden-fx.js";
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
 * **THE WARDEN's eye answers a touch the way THE INSTAR's marks do**
 * (`instar-verdict.test.ts`, `.claude/skills/new-boss` §5): a thumb landed or
 * a hatch thrown washes the eye green, a refused press red; the seat the eye
 * asks for sees a halo under its ring, the other a turning ring and a clock;
 * and the verdict is a transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const NARROW = WARDEN_PHASES[0]!.above;
const GLARE = WARDEN_PHASES[1]!.above;

/** THE WARDEN's wave on `plates`, stepped until the eye has a fight to ask in. */
function asking(plates: number): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("the warden's wave installed no warden");
  b.plates = plates;
  let guard = 0;
  while (plates === NARROW && b.tetherId === NO_TETHER && guard++ < 60 * ticksPerBeat(CFG)) {
    step(world, []);
  }
  return world;
}

/** Nine ticks drawn, with `said` thrown on the first. */
function drawn(role: ViewRole, said: SimEvent[], world: World = asking(NARROW)): string {
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string): number => text.split(colour).length - 1;

const held: SimEvent = { type: "wardenHold", col: 5 };
const thrown: SimEvent = { type: "wardenThrow", col: 5 };
const refused: SimEvent = { type: "wardenRefuse", col: 5, player: 1 };

describe("THE WARDEN's verdict on a touch", () => {
  it.each(ROLES)(
    "washes the eye green when a thumb landed or the hatch was thrown, on %s",
    (role) => {
      expect(count(drawn(role, []), PALETTE.good)).toBe(0);
      expect(count(drawn(role, [held]), PALETTE.good)).toBeGreaterThan(0);
      expect(count(drawn(role, [thrown], asking(GLARE)), PALETTE.good)).toBeGreaterThan(0);
    },
  );

  it.each(ROLES)("washes the eye red when a press was refused, on %s", (role) => {
    const red = (t: string) => count(t, PALETTE.red);
    expect(red(drawn(role, [refused]))).toBeGreaterThan(red(drawn(role, [])));
    expect(count(drawn(role, [refused]), PALETTE.good)).toBe(0);
  });

  it("puts the halo on the seat the eye asks for, and the partner's ring and clock on the other", () => {
    // Round the eye the halo is the one radial light it adds
    // (`mark-feedback.ts`); along the hatch's track it is the channel lit
    // red from inside, breathing, so it is counted by its colour with any
    // alpha (`warden-track.ts`, the INSTAR track's own).
    const ring = "createRadialGradient";
    const track = rgba(PALETTE.red, 0).slice(0, -2);
    const theirs = rgba(PALETTE.text, 0.8);
    const clock = rgba(PALETTE.text, 0.85);
    // NARROW asks the navigator; GLARE the pilot. The test screen is both seats.
    for (const [plates, mine, other, halo] of [
      [NARROW, "p2", "p1", ring],
      [GLARE, "p1", "p2", track],
    ] as const) {
      const own = drawn(mine, [], asking(plates));
      const partner = drawn(other, [], asking(plates));
      const test = drawn("test", [], asking(plates));
      expect(count(own, halo), `${plates} ${mine}`).toBeGreaterThan(count(partner, halo));
      expect(count(own, theirs), `${plates} ${mine}`).toBe(0);
      expect(count(partner, theirs), `${plates} ${other}`).toBeGreaterThan(0);
      expect(count(partner, clock), `${plates} ${other}`).toBeGreaterThan(0);
      expect(count(test, theirs), `${plates} test`).toBe(0);
    }
  });

  it("keeps the eye's verdict in the fx, fades it and forgets it on reset", () => {
    const fx = new WardenFx();
    fx.ingest([refused]);
    expect(fx.verdicts.at(WARDEN_EYE_MARK)?.good).toBe(false);
    fx.ingest([held]);
    expect(fx.verdicts.at(WARDEN_EYE_MARK)?.good).toBe(true);
    fx.update(1);
    expect(fx.verdicts.at(WARDEN_EYE_MARK)).toBeNull();
    fx.ingest([thrown]);
    fx.reset();
    expect(fx.verdicts.at(WARDEN_EYE_MARK)).toBeNull();
  });
});
