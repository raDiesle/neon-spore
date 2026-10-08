import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import { bastionPlateOf, bastionPlateWay, type Command, step, type World } from "@neon-spore/sim";
import { type BastionMark, bastionMarkAt } from "../src/bastion-grip.js";
import { BastionVerdicts } from "../src/bastion-verdicts.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchUp } from "../src/touch.js";
import { touchMove } from "../src/touch-move.js";
import { posed, stood } from "./bastion-harness.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE BASTION** (`render/src/bastion-grip.ts`): whether the
 * knob the picture draws is where a press is taken, on either seat's
 * screen; whether a thumb carried out along a slab's way tears it, and one
 * let go short snaps it back; whether the rim turns the moon; and whether
 * the partner's knob is pressed through for the simulation to refuse aloud
 * — each answered by the verdict ring (`bastion-verdicts.ts`).
 */

const STANDARD: ControlSet = controlSet("default");
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function send(world: World, player: 1 | 2, command: Command | null | undefined): string[] {
  step(world, command ? [{ tick: world.tick, player, command }] : []);
  return world.events.map((e) => e.type);
}

function press(world: World, role: ViewRole, seat: 1 | 2, mark: BastionMark) {
  const s = world.boss;
  if (s?.kind !== "bastion") throw new Error("no moon");
  const at = bastionMarkAt(layout(role), CFG, s, mark);
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

/** A slab pressed on `seat`'s own knob and carried `tiles` out along its way. */
function pull(world: World, seat: 1 | 2, tiles: number) {
  const s = world.boss;
  if (s?.kind !== "bastion") throw new Error("no moon");
  const role = seat === 1 ? "p1" : "p2";
  const l = layout(role);
  const down = press(world, role, seat, seat === 1 ? 0 : 1);
  send(world, seat, down?.command);
  if (down?.hold?.kind !== "drag") throw new Error("the press took no hold");
  const [wx, wy] = bastionPlateWay(bastionPlateOf(s, seat === 1 ? 0 : 1));
  const x = down.hold.originX + (wx / 1000) * tiles * l.tile;
  const y = down.hold.originY + (wy / 1000) * tiles * l.tile;
  const moved = send(world, seat, touchMove(l, down.hold, x, y)?.command);
  return { l, hold: down.hold, at: { x, y }, moved };
}

describe("thumbs on THE BASTION", () => {
  it("answers a press where each knob is drawn, and the handle stands there too", () => {
    const world = stood();
    posed(world, "plates");
    for (const [role, seat, mark, target] of [
      ["p1", 1, 0, "bastionPlateLeft"],
      ["p2", 2, 1, "bastionPlateRight"],
    ] as const) {
      const s = posed(world, "plates");
      expect(handleCircle(layout(role), world, target, 0)).toMatchObject(
        bastionMarkAt(layout(role), CFG, s, mark),
      );
      expect(press(world, role, seat, mark)?.command).toMatchObject({ target, on: true });
    }
    posed(world, "ring");
    const rim = press(world, "p1", 1, 2);
    expect(rim?.command).toMatchObject({ target: "bastionSpin", on: true, fromMilli: 0 });
    expect(rim?.hold?.kind === "drag" && rim.hold.rim !== undefined).toBe(true);
  });

  it("takes no hold on a knob whose shell is not lit", () => {
    const world = stood();
    posed(world, "ring");
    expect(handleCircle(layout("p1"), world, "bastionPlateLeft", 0)).toBeNull();
    posed(world, "plates");
    expect(handleCircle(layout("p1"), world, "bastionSpin", 0)).toBeNull();
  });

  it("tears a slab carried out past the pull, and snaps one let go short", () => {
    const world = stood();
    const s = posed(world, "plates");
    const torn = pull(world, 1, 2.4);
    expect(torn.moved).toContain("bastionTear");
    expect(s.goneMask).not.toBe(0);
    const short = pull(world, 2, 0.8);
    expect(s.pullMilli[1]).toBeGreaterThan(500);
    const up = touchUp(short.l, short.hold, short.at);
    expect(send(world, 2, up?.command)).toContain("bastionSnap");
  });

  it("turns the moon by the rim carried round it", () => {
    const world = stood();
    const s = posed(world, "ring");
    const l = layout("p1");
    const down = press(world, "p1", 1, 2);
    send(world, 1, down?.command);
    if (down?.hold?.kind !== "drag") throw new Error("the press took no hold");
    send(world, 1, touchMove(l, down.hold, down.hold.originX + l.tile, down.hold.originY)?.command);
    expect(s.spinning).toBe(true);
    expect(s.yawMilli).not.toBe(0);
  });

  it("presses the partner's knob through, for the simulation to say no", () => {
    const world = stood();
    const s = posed(world, "plates");
    const slab = press(world, "p1", 1, 1);
    expect(slab?.command).toMatchObject({ target: "bastionPlateRight", on: true });
    expect(send(world, 1, slab?.command)).toContain("bastionWrong");
    expect(s.down).toEqual([false, false]);
    posed(world, "ring");
    expect(send(world, 2, press(world, "p2", 2, 2)?.command)).toContain("bastionWrong");
  });

  it("greens a slab torn and reddens the partner's knob pressed, from the simulation's words", () => {
    const world = stood();
    posed(world, "plates");
    const v = new BastionVerdicts();
    const s = posed(world, "plates");
    v.note(s);
    pull(world, 2, 2.4);
    v.ingest(world.events);
    expect(v.verdicts.at(1)?.good).toBe(true);
    send(world, 1, press(world, "p1", 1, 1)?.command);
    v.ingest(world.events);
    expect(v.verdicts.at(1)?.good).toBe(false);
    v.note(posed(world, "ring"));
    send(world, 2, press(world, "p2", 2, 2)?.command);
    v.ingest(world.events);
    expect(v.verdicts.at(2)?.good).toBe(false);
  });
});
