import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import { GALL_POINTS, gallSeatAt, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { gallPointCircle } from "../src/gall-grip.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS } from "./frame-harness.js";
import { CLOSE, posed, stood } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A real finger on THE GALL**, and what the simulation cannot be asked:
 * whether each point the picture draws on the seam is where a press is taken,
 * and only from the seat whose half it is on; whether the press names the
 * point it went down on as its `id`, as it lands and on the lift; and whether
 * a real press on the gall's point closes it, while one left where it was
 * does nothing once it has jumped.
 */

const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, stood().cfg, role);

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: BEAT_PHASE,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: world.cfg,
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function held(touch: ReturnType<typeof touchDown>): { target: string; id?: number } | null {
  return touch?.hold?.kind === "drag" ? touch.hold : null;
}

const POINTS = Array.from({ length: GALL_POINTS }, (_, p) => p);

describe("a finger on THE GALL", () => {
  it.each(ROLES)("takes each point from the seat whose half it is on, on %s", (role) => {
    const world = stood();
    posed(world, CLOSE);
    for (const p of POINTS) {
      const at = gallPointCircle(layout(role), world.cfg, p);
      const own = gallSeatAt(p);
      const mine = held(press(world, role, own, at));
      expect(mine?.target).toBe("gallPress");
      expect(mine?.id).toBe(p);
      expect(held(press(world, role, own === 1 ? 2 : 1, at))?.target).not.toBe("gallPress");
    }
  });

  it("names the nearest point for a finger landing off the nodule, and nothing off the seam's row", () => {
    const world = stood();
    posed(world, CLOSE);
    const l = layout("p1");
    const at = gallPointCircle(l, world.cfg, 0);
    expect(
      held(press(world, "p1", 1, { x: at.x + l.tile * 0.9, y: at.y - l.tile * 0.6 }))?.id,
    ).toBe(0);
    expect(held(press(world, "p1", 1, { x: at.x, y: at.y + l.tile * 3 }))?.target).not.toBe(
      "gallPress",
    );
  });

  it("stands the ghost thumb on the gall's point, and nothing once the root is bared", () => {
    const world = stood();
    const s = posed(world, CLOSE, 2);
    const l = layout("p2");
    expect(handleCircle(l, world, "gallPress", BEAT_PHASE)).toEqual(
      gallPointCircle(l, world.cfg, 2),
    );
    const at = gallPointCircle(l, world.cfg, 2);
    s.bared = true;
    expect(handleCircle(l, world, "gallPress", BEAT_PHASE)).toBeNull();
    expect(held(press(world, "p2", 2, at))?.target).not.toBe("gallPress");
  });

  it("sends the point as the press lands and on the lift, one finger and no pair", () => {
    const world = stood();
    posed(world, CLOSE, 3);
    const l = layout("p2");
    const at = gallPointCircle(l, world.cfg, 3);
    const down = press(world, "p2", 2, at);
    expect(down?.command).toMatchObject({ target: "gallPress", on: true, id: 3 });
    if (down?.hold?.kind !== "drag") throw new Error("no press hold");
    expect(touchUp(l, down.hold, at)?.command).toMatchObject({
      target: "gallPress",
      on: false,
      id: 3,
    });
  });

  it("closes the gall on a real press, and a press left where it was does nothing once it jumps", () => {
    const world = stood();
    const s = posed(world, CLOSE, 0);
    const l = layout("p1");
    const at = gallPointCircle(l, world.cfg, 0);
    const down = press(world, "p1", 1, at);
    if (!down?.command || down.hold?.kind !== "drag") throw new Error("no press");
    step(world, [{ tick: world.tick, player: 1, command: down.command }]);
    expect(world.events.some((e) => e.type === "gallPress")).toBe(true);
    const wander = touchMove(l, down.hold, at.x + l.tile * 0.4, at.y);
    if (!wander?.command) throw new Error("no move");
    step(world, [{ tick: world.tick, player: 1, command: wander.command }]);
    expect(world.events.some((e) => e.type === "gallSlip")).toBe(false);
    let closed = false;
    for (let i = 0; i < ticksPerBeat(world.cfg) * (world.cfg.gallShutBeats + 1) && !closed; i++) {
      step(world, []);
      closed = world.events.some((e) => e.type === "gallClose");
    }
    expect(closed).toBe(true);
    expect(s.point).not.toBe(0);
    step(world, [{ tick: world.tick, player: 1, command: down.command }]);
    expect(s.gapMilli).toBe(world.cfg.gallOpenMilli);
  });
});
