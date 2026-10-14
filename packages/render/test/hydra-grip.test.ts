import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import { type Command, type HydraState, step, type World } from "@neon-spore/sim";
import { handleCircle } from "../src/handle-place.js";
import {
  type HydraMark,
  hydraCoilRim,
  hydraMarkAt,
  hydraMarkKind,
  hydraNeckWay,
} from "../src/hydra-grip.js";
import { HydraVerdicts } from "../src/hydra-verdicts.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchUp } from "../src/touch.js";
import { touchMove } from "../src/touch-move.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";
import { hung, posed } from "./hydra-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE HYDRA** (`render/src/hydra-grip.ts`): whether each
 * knob, lever and head of eyes the picture draws is where a press is taken,
 * on either seat's screen; whether a swipe across a neck the way it points
 * cuts it and one let go short glances off; whether a lever turned round
 * the way its coil unwinds turns it off; whether a tap on an open eye puts
 * it out and one on a shut eye is refused; and whether the partner's mark is
 * pressed through for the simulation to refuse aloud — each answered by the
 * verdict ring (`hydra-verdicts.ts`).
 */

const STANDARD: ControlSet = controlSet("default");
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);
const roleOf = (seat: 1 | 2): ViewRole => (seat === 1 ? "p1" : "p2");

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

/** The verdicts listening to every step a test sends, as the renderer's fx hears every frame. */
const listening: HydraVerdicts[] = [];

function send(world: World, player: 1 | 2, command: Command | null | undefined): string[] {
  step(world, command ? [{ tick: world.tick, player, command }] : []);
  for (const v of listening) v.ingest(world.events);
  return world.events.map((e) => e.type);
}

function hydra(world: World): HydraState {
  const s = world.boss;
  if (s?.kind !== "hydra") throw new Error("no hydra");
  return s;
}

function press(world: World, role: ViewRole, seat: 1 | 2, mark: HydraMark) {
  const at = hydraMarkAt(layout(role), CFG, hydra(world), mark);
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

/** `seat`'s own neck pressed and swiped `milli` across it the way it points, then let go. */
function swipe(world: World, seat: 1 | 2, milli: number): string[] {
  const l = layout(roleOf(seat));
  const side = seat === 1 ? 0 : 1;
  const way = hydraNeckWay(hydra(world), side);
  const down = press(world, roleOf(seat), seat, side);
  if (down?.hold?.kind !== "drag") throw new Error("the press took no hold");
  const heard = send(world, seat, down.command);
  let at = { x: down.hold.originX, y: down.hold.originY };
  for (let m = Math.min(400, milli); ; m = Math.min(milli, m + 400)) {
    at = { x: down.hold.originX + (way * m * l.tile) / 1000, y: down.hold.originY };
    heard.push(...send(world, seat, touchMove(l, down.hold, at.x, at.y)?.command));
    if (m >= milli) break;
  }
  heard.push(...send(world, seat, touchUp(l, down.hold, at)?.command));
  return heard;
}

/** `seat`'s own coil's lever taken and carried `turns` times round, the way given. */
function turn(world: World, seat: 1 | 2, turns: number, way: -1 | 1): string[] {
  const l = layout(roleOf(seat));
  const side = seat === 1 ? 0 : 1;
  const down = press(world, roleOf(seat), seat, side === 0 ? 2 : 3);
  if (down?.hold?.kind !== "drag") throw new Error("the press took no hold");
  const heard = send(world, seat, down.command);
  const rim = hydraCoilRim(l, CFG, side);
  const from = Math.atan2(down.hold.originY - rim.y, down.hold.originX - rim.x);
  const steps = Math.ceil(turns * 16);
  for (let k = 1; k <= steps; k++) {
    const a = from + (way * k * Math.PI * 2 * turns) / steps;
    const x = rim.x + Math.cos(a) * rim.r;
    const y = rim.y + Math.sin(a) * rim.r;
    heard.push(...send(world, seat, touchMove(l, down.hold, x, y)?.command));
  }
  return heard;
}

describe("thumbs on THE HYDRA", () => {
  it("answers a press where each mark is drawn, and the handle stands there too", () => {
    const world = hung();
    for (const head of ["bite", "coil", "eye"] as const) {
      for (const [role, seat] of [
        ["p1", 1],
        ["p2", 2],
      ] as const) {
        const s = posed(world, head);
        const mark = ((head === "bite" ? 0 : head === "coil" ? 2 : 4) + seat - 1) as HydraMark;
        expect(hydraMarkKind(mark)).toBe(head);
        const target = press(world, role, seat, mark)?.command;
        expect(target).toMatchObject({ on: true, fromMilli: 0 });
        if (target?.kind !== "drag") throw new Error("no drag");
        expect(handleCircle(layout(role), world, target.target, 0)).toMatchObject(
          hydraMarkAt(layout(role), CFG, s, mark),
        );
      }
    }
  });

  it("takes no hold on a mark whose kind of head is not lit, nor on the maws", () => {
    const world = hung();
    posed(world, "bite");
    expect(handleCircle(layout("p1"), world, "hydraCoilLeft", 0)).toBeNull();
    posed(world, "coil");
    expect(handleCircle(layout("p1"), world, "hydraNeckLeft", 0)).toBeNull();
    posed(world, "maw");
    expect(press(world, "p1", 1, 0)).toBeNull();
    expect(press(world, "p2", 2, 3)).toBeNull();
  });

  it("cuts a neck swiped across the way it points, and glances off one let go short", () => {
    const world = hung();
    const s = posed(world, "bite");
    expect(swipe(world, 1, CFG.hydraCutMilli + 200)).toContain("hydraCut");
    expect(s.goneMask).not.toBe(0);
    expect(swipe(world, 2, CFG.hydraCutMilli / 2)).toContain("hydraGlance");
  });

  it("turns a coil off round the way it unwinds, and not round the other", () => {
    const world = hung();
    const s = posed(world, "coil");
    const laps = s.steps[s.cursor]?.laps ?? 1;
    expect(turn(world, 2, laps + 0.25, -1)).not.toContain("hydraUncoil");
    expect(s.unwoundMilli[1]).toBe(0);
    expect(turn(world, 1, laps + 0.25, -1)).toContain("hydraUncoil");
    posed(world, "coil");
    expect(turn(world, 2, laps + 0.25, 1)).toContain("hydraUncoil");
  });

  it("puts out an open eye tapped, and refuses a tap on a shut one", () => {
    const world = hung();
    posed(world, "eye", "heads", (s) => {
      s.lidOpen = [true, false];
      s.blinkBeat = [world.beat + 3, world.beat + 3];
    });
    expect(send(world, 1, press(world, "p1", 1, 4)?.command)).toContain("hydraPoke");
    expect(send(world, 2, press(world, "p2", 2, 5)?.command)).toContain("hydraMiss");
  });

  it("presses the partner's mark through, for the simulation to say no, and the verdicts say so", () => {
    const world = hung();
    const v = new HydraVerdicts();
    listening.push(v);
    v.note(posed(world, "bite"));
    expect(send(world, 1, press(world, "p1", 1, 1)?.command)).toContain("hydraWrong");
    expect(v.verdicts.at(1)?.good).toBe(false);
    swipe(world, 2, CFG.hydraCutMilli + 200);
    expect(v.verdicts.at(1)?.good).toBe(true);
    v.note(posed(world, "coil"));
    expect(send(world, 2, press(world, "p2", 2, 2)?.command)).toContain("hydraWrong");
    expect(v.verdicts.at(2)?.good).toBe(false);
    v.note(posed(world, "eye"));
    send(world, 1, press(world, "p1", 1, 4)?.command);
    expect(v.verdicts.at(4)?.good).toBe(false);
    listening.length = 0;
  });
});
