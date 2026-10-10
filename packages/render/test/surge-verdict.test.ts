import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  type SimEvent,
  type SurgeState,
  startWave,
  step,
  surgeBand,
  surgeBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { surgeGripCircle } from "../src/surge-grip.js";
import { drawSurgeAsked, drawSurgeVerdicts, SurgeMarks } from "../src/surge-marks.js";
import { surgeBulbCentre, surgeBulbRx, surgeBulbRy } from "../src/surge-shape.js";
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
 * **THE SURGE's grip marks answer a touch the way THE INSTAR's marks do**
 * (`surge-marks.ts`, `.claude/skills/new-boss` §5): a mark whose seat is
 * asked to hold wears the halo on that seat's screen and the partner's ring
 * and clock on the other; nothing asks inside the band or while the bulb
 * re-seals; a thumb landing washes its mark green, a lift judged both marks;
 * a desk press on a mark is signed with its seat; and the verdict reaches
 * the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function hung(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("surge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function bulb(world: World): SurgeState {
  const s = surgeBoss(world);
  if (s === null) throw new Error("the surge wave hung no bulb");
  s.pressureMilli = 0;
  s.rockId = -1;
  return s;
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

/** The bulb at rest, as `surgeMarkSeat` reads it. */
function rest(l: Layout, s: SurgeState) {
  return { c: surgeBulbCentre(l, CFG, s), rx: surgeBulbRx(l, CFG), ry: surgeBulbRy(l) };
}

function asked(world: World, s: SurgeState, role: ViewRole): string {
  return drawn(role, (ctx, l) => {
    const { c, rx, ry } = rest(l, s);
    drawSurgeAsked(ctx, l, world, s, c, rx, ry, 1.2);
  });
}

describe("THE SURGE's grip marks asking", () => {
  it("halo this seat's mark and ring the partner's clock while both thumbs are off", () => {
    const world = hung();
    const s = bulb(world);
    for (const role of ["p1", "p2"] as const) {
      expect(count(asked(world, s, role), HALO), role).toBe(1);
    }
    s.heldP1 = true;
    expect(count(asked(world, s, "p1"), HALO)).toBe(0);
    expect(asked(world, s, "p1")).not.toBe("");
    expect(count(asked(world, s, "p2"), HALO)).toBe(1);
  });

  it("ask nothing inside the band, while the bulb re-seals, or of the pilot under its rock", () => {
    const world = hung();
    const s = bulb(world);
    s.pressureMilli = surgeBand(s, CFG).low;
    expect(asked(world, s, "p1")).toBe("");
    s.pressureMilli = 0;
    s.burstBeat = world.beat;
    expect(asked(world, s, "p2")).toBe("");
    s.burstBeat = -1;
    // A stand-in for the bulb's rock, with the one field `surgeWarding` reads.
    world.creatures.push({ id: 9999 } as Creature);
    s.rockId = 9999;
    expect(count(asked(world, s, "p1"), HALO)).toBe(0);
    expect(count(asked(world, s, "p2"), HALO)).toBe(1);
  });
});

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.4,
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

describe("a desk press on a grip mark", () => {
  it("is signed with the mark's seat, whichever seat is asked first", () => {
    const world = hung();
    const s = bulb(world);
    const l = layout("test");
    const { c, rx, ry } = rest(l, s);
    const left = surgeGripCircle(l, CFG, c, rx, ry, -1);
    const right = surgeGripCircle(l, CFG, c, rx, ry, 1);
    expect(deskDown(l, left.x, left.y, [2, 1], (seat) => field(world, seat))?.player).toBe(1);
    expect(deskDown(l, right.x, right.y, [1, 2], (seat) => field(world, seat))?.player).toBe(2);
  });
});

describe("THE SURGE's verdict on a touch", () => {
  it("keeps each seat's apart, judges a lift on both, and forgets them on reset", () => {
    const marks = new SurgeMarks();
    marks.ingest([{ type: "surgeGrip", player: 2, col: 5 }]);
    expect(marks.verdicts.at(2)?.good).toBe(true);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([{ type: "surgeLost", col: 5 }]);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    expect(marks.verdicts.at(2)?.good).toBe(false);
    marks.ingest([{ type: "surgeVent", col: 5, notches: 1, row: 3 }]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(2)).toBeNull();
    marks.ingest([{ type: "surgeBurst", col: 5, blisters: 2 }]);
    marks.clear();
    expect(marks.verdicts.at(1)).toBeNull();
  });

  it("rings both marks on every screen, since both screens draw them", () => {
    const world = hung();
    const s = bulb(world);
    for (const role of ROLES) {
      for (const seat of [1, 2] as const) {
        const v = new GripVerdicts();
        v.mark(seat, false);
        const log = drawn(role, (ctx, l) => {
          const { c, rx, ry } = rest(l, s);
          drawSurgeVerdicts(ctx, l, world, c, rx, ry, v);
        });
        expect(count(log, PALETTE.red), `${role} ${seat}`).toBeGreaterThan(0);
      }
    }
  });

  /** Two beats of the bulb hanging, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(hung(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const lost: SimEvent[] = [{ type: "surgeLost", col: 5 }];
    expect(count(frames(role, lost), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
