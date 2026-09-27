import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import { GALL_POINTS, gallSeatAt, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { gallPointCircle } from "../src/gall-grip.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { pinching, pinchSays } from "../src/pinch.js";
import { Pinches } from "../src/pinch-pair.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS } from "./frame-harness.js";
import { CLOSE, posed, stood } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real fingers on THE GALL**, and what the simulation cannot be asked:
 * whether each point the picture draws on the seam is where a press is taken,
 * and only from the seat whose half it is on; whether the press names the
 * point it went down on, and the pair sends it as the pinch's `id` on the
 * squeeze and on the lift; and whether a real pinch on the gall's point
 * closes it, while one left where it was does nothing once it has jumped.
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

describe("fingers on THE GALL", () => {
  it.each(ROLES)("takes each point from the seat whose half it is on, on %s", (role) => {
    const world = stood();
    posed(world, CLOSE);
    for (const p of POINTS) {
      const at = gallPointCircle(layout(role), world.cfg, p);
      const own = gallSeatAt(p);
      const mine = held(press(world, role, own, at));
      expect(mine?.target).toBe("gallPinch");
      expect(mine?.id).toBe(p);
      expect(held(press(world, role, own === 1 ? 2 : 1, at))?.target).not.toBe("gallPinch");
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
      "gallPinch",
    );
  });

  it("stands the ghost thumb on the gall's point, and nothing once the root is bared", () => {
    const world = stood();
    const s = posed(world, CLOSE, 2);
    const l = layout("p2");
    expect(handleCircle(l, world, "gallPinch", BEAT_PHASE)).toEqual(
      gallPointCircle(l, world.cfg, 2),
    );
    const at = gallPointCircle(l, world.cfg, 2);
    s.bared = true;
    expect(handleCircle(l, world, "gallPinch", BEAT_PHASE)).toBeNull();
    expect(held(press(world, "p2", 2, at))?.target).not.toBe("gallPinch");
  });

  it("says nothing on a finger alone, and the pair sends the point on the squeeze and the lift", () => {
    const world = stood();
    posed(world, CLOSE, 3);
    const l = layout("p2");
    const at = gallPointCircle(l, world.cfg, 3);
    const down = press(world, "p2", 2, at);
    expect(down?.command).toBeNull();
    if (!down?.hold || !pinching(down.hold)) throw new Error("no pinch hold");
    expect(touchMove(l, down.hold, at.x + l.tile, at.y)).toBeNull();
    expect(touchUp(l, down.hold, at)).toBeNull();
    const pair = new Pinches();
    expect(pair.down(l, 1, [down.hold], at.x, at.y)).toBeNull();
    const squeezed = pair.down(l, 2, [down.hold], at.x + l.tile * 1.8, at.y);
    expect(squeezed?.command).toMatchObject({ target: "gallPinch", on: true, fromMilli: 0, id: 3 });
    expect(pair.up(1)?.command).toMatchObject({ target: "gallPinch", on: false, id: 3 });
  });

  it("closes the gall on a real pinch, and a pinch left where it was does nothing once it jumps", () => {
    const world = stood();
    const s = posed(world, CLOSE, 0);
    const hold = press(world, "p1", 1, gallPointCircle(layout("p1"), world.cfg, 0))?.hold;
    if (!hold || !pinching(hold)) throw new Error("no pinch hold");
    step(world, [{ tick: world.tick, player: 1, command: pinchSays(hold, 0) }]);
    expect(world.events.some((e) => e.type === "gallPinch")).toBe(true);
    let closed = false;
    for (let i = 0; i < ticksPerBeat(world.cfg) * (world.cfg.gallShutBeats + 1) && !closed; i++) {
      step(world, []);
      closed = world.events.some((e) => e.type === "gallClose");
    }
    expect(closed).toBe(true);
    expect(s.point).not.toBe(0);
    step(world, [{ tick: world.tick, player: 1, command: pinchSays(hold, null) }]);
    step(world, [{ tick: world.tick, player: 1, command: pinchSays(hold, 0) }]);
    expect(s.gapMilli).toBe(world.cfg.gallOpenMilli);
  });
});
