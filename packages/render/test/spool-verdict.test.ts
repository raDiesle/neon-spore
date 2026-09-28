import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_BRAKE,
  type SimEvent,
  spoolBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { SPOOL_BRAKE_MARK, SpoolFx } from "../src/spool-fx.js";
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
 * **THE SPOOL's brake answers a touch the way THE INSTAR's marks do**
 * (`instar-verdict.test.ts`, `.claude/skills/new-boss` §5): the grip washes
 * the knob green, the navigator's refused press red; while the line runs and
 * nobody holds it, the pilot sees a halo under the knob and the navigator the
 * partner's turning ring and a clock where it rests; and the verdict is a
 * transient the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** The spool mid-movement past its grace, nobody on the brake — or `phase`. */
function hung(phase: "pay" | "ease" = "pay", brake = NO_BRAKE): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("spool");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = spoolBoss(world);
  if (s === null) throw new Error("the spool wave hung no spool");
  s.phase = phase;
  s.phaseBeat = world.beat - 5;
  s.brakeMilli = brake;
  s.wantMilli = 400;
  s.paidMilli = 400;
  return world;
}

/** Nine ticks drawn with the state held, `said` thrown on the first. */
function drawn(role: ViewRole, said: SimEvent[], world: World = hung()): string {
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      if (tick === 0) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string): number => text.split(colour).length - 1;

const gripped: SimEvent = { type: "spoolGrip", col: 5 };
const refused: SimEvent = { type: "spoolRefuse", col: 5, player: 2 };

describe("THE SPOOL's verdict on a touch", () => {
  it.each(ROLES)("washes the knob green when the pilot takes the brake, on %s", (role) => {
    expect(count(drawn(role, []), PALETTE.good)).toBe(0);
    expect(count(drawn(role, [gripped]), PALETTE.good)).toBeGreaterThan(0);
  });

  it.each(ROLES)("washes the knob red when the navigator's press was refused, on %s", (role) => {
    const red = (t: string) => count(t, PALETTE.red);
    expect(red(drawn(role, [refused]))).toBeGreaterThan(red(drawn(role, [])));
    expect(count(drawn(role, [refused]), PALETTE.good)).toBe(0);
  });

  it("puts the halo on the pilot's knob, and the partner's ring and clock on the navigator's", () => {
    const halo = "createRadialGradient";
    const theirs = rgba(PALETTE.text, 0.8);
    const clock = rgba(PALETTE.text, 0.85);
    const his = drawn("p1", []);
    const hers = drawn("p2", []);
    const test = drawn("test", []);
    expect(count(his, halo)).toBeGreaterThan(count(drawn("p1", [], hung("pay", 300)), halo));
    expect(count(his, theirs)).toBe(0);
    expect(count(hers, theirs)).toBeGreaterThan(0);
    expect(count(hers, clock)).toBeGreaterThan(0);
    expect(count(test, theirs)).toBe(0);
  });

  it("asks for nothing once he holds it, or while no line runs", () => {
    const theirs = rgba(PALETTE.text, 0.8);
    expect(count(drawn("p2", [], hung("pay", 300)), theirs)).toBe(0);
    expect(count(drawn("p2", [], hung("ease")), theirs)).toBe(0);
    const halo = "createRadialGradient";
    expect(count(drawn("p1", [], hung("ease")), halo)).toBe(
      count(drawn("p1", [], hung("ease", 300)), halo),
    );
  });

  it("keeps the knob's verdict in the fx, fades it and forgets it on reset", () => {
    const fx = new SpoolFx();
    const l = { tile: 40 } as never;
    const burst = () => {};
    fx.ingest([refused], l, CFG, burst);
    expect(fx.verdicts.at(SPOOL_BRAKE_MARK)?.good).toBe(false);
    fx.ingest([gripped], l, CFG, burst);
    expect(fx.verdicts.at(SPOOL_BRAKE_MARK)?.good).toBe(true);
    fx.update(1);
    expect(fx.verdicts.at(SPOOL_BRAKE_MARK)).toBeNull();
    fx.ingest([gripped], l, CFG, burst);
    fx.clear();
    expect(fx.verdicts.at(SPOOL_BRAKE_MARK)).toBeNull();
  });
});
