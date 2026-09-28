import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type MirrorState,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { mirrorGripSeat, mirrorLobeCircle, mirrorLobeUnder } from "../src/mirror-grip.js";
import { drawMirrorAsked, drawMirrorVerdicts, MirrorMarks } from "../src/mirror-marks.js";
import { PALETTE } from "../src/palette.js";
import type { Field } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MIRROR's lobes answer a touch the way THE INSTAR's marks do**
 * (`instar-verdict.test.ts`, `.claude/skills/new-boss` §5): a step made right
 * on a lobe, or the pin landing, washes it green, a wrong step or the other
 * seat's refused press red; a lobe asked of this seat wears the halo and one
 * asked only of the partner their turning ring and a clock; a desk press is
 * signed with the seat the lobe is asked of; and the verdict is a transient
 * the next run does not inherit.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

const SHIELD_COL = 4;

/** The last round, listening: `reflect` — or what `overrides` says. */
function mirror(overrides: Partial<MirrorState> = {}): MirrorState {
  return {
    kind: "mirror",
    rounds: [["guard"], ["cannonLeft", "guard", "fireRed"]],
    round: 1,
    phase: "listen",
    phaseBeat: 4,
    matched: 0,
    shown: 3,
    cannonCol: 2,
    hullMilli: 100_000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
    holdThumbs: 0,
    holdBeat: -1,
    ...overrides,
  };
}

const hold = (overrides: Partial<MirrorState> = {}) =>
  mirror({ phase: "hold", hullMilli: 0, ...overrides });

/** What the asking draws on a role's screen. */
function asked(role: ViewRole, m: MirrorState): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  drawMirrorAsked(
    ctx as unknown as CanvasRenderingContext2D,
    layout(role),
    CFG,
    m,
    SHIELD_COL,
    1.2,
  );
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

describe("THE MIRROR's lobes asking", () => {
  it("under reflect: both halo for player 1, and player 2 has its cannon and waits on the shield", () => {
    expect(count(asked("p1", mirror()), HALO)).toBe(2);
    expect(count(asked("p1", mirror()), THEIRS)).toBe(0);
    expect(count(asked("p2", mirror()), HALO)).toBe(1);
    expect(count(asked("p2", mirror()), THEIRS)).toBe(1);
    expect(count(asked("p2", mirror()), CLOCK)).toBe(1);
  });

  it("under the pin: one lobe each, and the halo leaves the lobe this thumb holds", () => {
    for (const role of ["p1", "p2"] as const) {
      expect(count(asked(role, hold()), HALO)).toBe(1);
      expect(count(asked(role, hold()), CLOCK)).toBe(1);
    }
    expect(count(asked("p1", hold({ holdThumbs: 1 })), HALO)).toBe(0);
    // The partner's thumb on its lobe is not drawn: the clock is the same.
    expect(count(asked("p1", hold({ holdThumbs: 2 })), CLOCK)).toBe(1);
  });

  it("draws no partner's clock on a lobe that stands inside this seat's own", () => {
    const stacked = mirror({ cannonCol: SHIELD_COL });
    expect(count(asked("p2", stacked), HALO)).toBe(1);
    expect(count(asked("p2", stacked), THEIRS)).toBe(0);
    expect(count(asked("p2", stacked), CLOCK)).toBe(0);
  });

  it("asks nothing on the panel's rounds or while it performs", () => {
    for (const role of ROLES) {
      expect(asked(role, mirror({ round: 0 }))).toBe("");
      expect(asked(role, mirror({ phase: "show" }))).toBe("");
    }
  });
});

const field = (seat: 1 | 2, boss: MirrorState): Field => ({
  creatures: [],
  cannonCol: 4,
  shieldCol: SHIELD_COL,
  beatPhase: 0.5,
  skinY: null,
  beat: 6,
  waveBeat: 6,
  tick: 0,
  seat,
  cfg: CFG,
  boss,
  controls: controlSet("default"),
  faults: [],
  well: false,
});

describe("a desk press on a lobe", () => {
  const l = layout("test");
  const at = (id: 0 | 1, m: MirrorState) =>
    mirrorLobeCircle(l, CFG, id, id === 0 ? m.cannonCol : SHIELD_COL);

  it("names the seat a lobe is asked of, and nobody where both seats answer it", () => {
    const shield = at(1, hold());
    const cannon = at(0, hold());
    expect(mirrorGripSeat(l, shield.x, shield.y, field(1, hold()))).toBe(2);
    expect(mirrorGripSeat(l, cannon.x, cannon.y, field(1, hold()))).toBe(1);
    const reflectCannon = at(0, mirror());
    expect(mirrorGripSeat(l, reflectCannon.x, reflectCannon.y, field(1, mirror()))).toBeUndefined();
  });

  it("is signed with that seat, so one mouse takes the navigator's lobe under the pin", () => {
    const shield = at(1, hold());
    const touch = deskDown(l, shield.x, shield.y, [1, 2], (seat) => field(seat, hold()));
    expect(touch?.player).toBe(2);
    expect(touch?.hold).not.toBeNull();
  });

  it("gives a thumb its own lobe where the two stand one inside the other", () => {
    const p2 = layout("p2");
    const stacked = mirror({ cannonCol: SHIELD_COL });
    const shield = mirrorLobeCircle(p2, CFG, 1, SHIELD_COL);
    const touch = mirrorLobeUnder(p2, shield.x, shield.y, field(2, stacked));
    expect(touch?.command).toMatchObject({ id: 0 });
    expect(touch?.hold).not.toBeNull();
  });
});

const touched: SimEvent = { type: "mirrorTouch", col: 2, id: 0, right: true };
const wrong: SimEvent = { type: "mirrorTouch", col: 4, id: 1, right: false };
const refused: SimEvent = { type: "mirrorRefuse", col: 4, id: 1, player: 2 };

describe("THE MIRROR's verdict on a touch", () => {
  it("keeps each lobe's verdict under its id, fades it and forgets it on reset", () => {
    const marks = new MirrorMarks();
    marks.ingest([touched, wrong]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    marks.ingest([{ type: "mirrorGrip", col: 2, on: true }]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.ingest([refused]);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([touched]);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  it("a pin lost is no verdict", () => {
    const marks = new MirrorMarks();
    marks.ingest([{ type: "mirrorGrip", col: 2, on: false }]);
    expect(marks.verdicts.at(0)).toBeNull();
  });

  it("draws the ring on the lobe it is kept under, green or red", () => {
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    const v = new GripVerdicts();
    v.mark(0, true);
    drawMirrorVerdicts(
      ctx as unknown as CanvasRenderingContext2D,
      layout("p1"),
      CFG,
      mirror(),
      SHIELD_COL,
      v,
    );
    expect(count(log.join("|"), PALETTE.good)).toBeGreaterThan(0);
    expect(count(log.join("|"), PALETTE.red)).toBe(0);
  });

  /** Nine ticks of its wave, on its last round, `said` thrown on the first. */
  function drawn(role: ViewRole, said: SimEvent[]): string {
    const world = createWorld(CFG, 7);
    const index = waveWith("mirror");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    for (let i = 0; i < ticksPerBeat(CFG) * 2; i++) step(world, []);
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

  it.each(ROLES)("reaches the field from the effects, on %s", (role) => {
    expect(count(drawn(role, [touched]), PALETTE.good)).toBeGreaterThan(
      count(drawn(role, []), PALETTE.good),
    );
    expect(count(drawn(role, [refused]), PALETTE.red)).toBeGreaterThan(
      count(drawn(role, []), PALETTE.red),
    );
  });
});
