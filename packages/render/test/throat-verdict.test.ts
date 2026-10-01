import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type SimEvent, step, ticksPerBeat } from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import type { Layout, ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { throatAimCircle, throatPumpCircle } from "../src/throat-grip.js";
import { drawThroatAsked, drawThroatVerdicts, ThroatMarks } from "../src/throat-marks.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
} from "./frame-harness.js";
import { field, LAYOUT, opened } from "./throat-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE THROAT's mouth and pump answer a touch the way THE INSTAR's marks do**
 * (`throat-marks.ts`, `.claude/skills/new-boss` §5): the handle that asks this
 * seat for a thumb wears the halo — the mouth on the navigator's screen, the
 * pump on the pilot's — with no partner's clock anywhere; a swallow washes the
 * mouth green and a refusal reddens the handle of the seat it names; a desk
 * press is signed with the handle's seat; and the verdict reaches the field's
 * frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, LAYOUT[role]);
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

describe("THE THROAT's handles asking", () => {
  it("each halos on its own seat's screen alone, and stops once taken", () => {
    const { t } = opened();
    const halos = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawThroatAsked(ctx, l, CFG, t, 1.2)),
        HALO,
      );
    expect(halos("p1")).toBe(1);
    expect(halos("p2")).toBe(1);
    expect(halos("test")).toBe(2);
    t.aimFromXMilli = t.aimXMilli;
    t.aimFromYMilli = t.aimYMilli;
    expect(halos("p2")).toBe(0);
    t.pumpDir = 1;
    expect(halos("p1")).toBe(0);
    t.aimFromXMilli = -1;
    t.pumpDir = 0;
    t.phase = "everts";
    expect(halos("test")).toBe(0);
  });
});

describe("a desk press", () => {
  it("on the mouth is signed with the navigator, on the pump with the pilot", () => {
    const { world, t } = opened();
    const l = LAYOUT.test;
    const a = throatAimCircle(l, CFG, t);
    const onAim = deskDown(l, a.x, a.y, [1, 2], (seat) => field(world, seat));
    expect(onAim?.player).toBe(2);
    expect(onAim?.command).toMatchObject({ target: "throatAim" });
    const p = throatPumpCircle(l, CFG);
    const onPump = deskDown(l, p.x, p.y, [2, 1], (seat) => field(world, seat));
    expect(onPump?.player).toBe(1);
    expect(onPump?.command).toMatchObject({ target: "throatPump" });
  });
});

describe("THE THROAT's verdict on a touch", () => {
  it("keeps each handle's verdict under its key, fades it and forgets it on reset", () => {
    const marks = new ThroatMarks();
    marks.ingest([{ type: "throatSwallow", col: 3 }]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.ingest([{ type: "throatRefuse", col: 3, part: "red", player: 2 }]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    marks.ingest([{ type: "throatRefuse", col: 3, part: "shield", player: 1 }]);
    expect(marks.verdicts.at(1)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([{ type: "throatSwallow", col: 3 }]);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  it("rings each handle on every screen, since both screens draw both", () => {
    const { t } = opened();
    for (const role of ROLES) {
      for (const key of [0, 1]) {
        for (const good of [true, false]) {
          const v = new GripVerdicts();
          v.mark(key, good);
          const log = drawn(role, (ctx, l) => drawThroatVerdicts(ctx, l, CFG, t, v));
          expect(count(log, good ? PALETTE.good : PALETTE.red), role).toBeGreaterThan(0);
        }
      }
    }
  });

  it("draws nothing while the tube everts", () => {
    const { t } = opened();
    t.phase = "everts";
    const v = new GripVerdicts();
    v.mark(0, true);
    v.mark(1, false);
    expect(drawn("p1", (ctx, l) => drawThroatVerdicts(ctx, l, CFG, t, v))).toBe("");
  });

  /** Two beats of the gullet sucking, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(opened().world, role, TPB * 2, {
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
    const refused: SimEvent[] = [{ type: "throatRefuse", col: 3, part: "cyan", player: 1 }];
    expect(count(frames(role, refused), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
