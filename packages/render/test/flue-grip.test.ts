import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  type FlueState,
  flueEmberCol,
  flueSteady,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { flueTapCircle, flueTapUnder } from "../src/flue-grip.js";
import { flueCentre, flueSlotHalf } from "../src/flue-shape.js";
import { handleCircle } from "../src/handles.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLUE's tap as a control (`flue-grip.ts`): the flue's row, pressed
 * while a vent is lit, sends `flueTap` with the column under the thumb as
 * its `id`, from either seat, on a turned field too. The rule is the
 * simulation's (`sim/test/flue*.test.ts`); this file proves the picture hands
 * it a thumb — and, last, that three thumbs on the glass spend a vent.
 */

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);
const TPB = ticksPerBeat(CFG);

/** THE FLUE's wave, stepped to its first vent: player 2 keeps still, player 1 taps. */
function toLit(): { world: World; s: FlueState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("flue");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = world.boss;
  if (s === null || s.kind !== "flue") throw new Error("the flue's wave installed no flue");
  let guard = 0;
  while (s.phase !== "lit" && guard++ < 60 * TPB) step(world, []);
  return { world, s };
}

/** The same, stepped on with nothing sent until the ember is steady. */
function toSteady(): { world: World; s: FlueState } {
  const lit = toLit();
  let guard = 0;
  while (!flueSteady(lit.world, lit.s) && guard++ < 20 * TPB) step(lit.world, []);
  return lit;
}

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

function ember(role: ViewRole, s: FlueState) {
  const l = layout(role);
  const at = flueTapCircle(l, CFG, s);
  if (at === null) throw new Error("no ember circle while a vent is lit");
  return { l, at };
}

describe("the flue's row", () => {
  it.each(["p1", "p2"] as const)(
    "sends the ember's column as the tap's id on the %s screen",
    (role) => {
      const { world, s } = toSteady();
      const { l, at } = ember(role, s);
      const touch = touchDown(l, at.x, at.y, fieldOf(world, 1));
      expect(touch?.player).toBe(1);
      expect(touch?.command).toEqual({
        kind: "drag",
        target: "flueTap",
        on: true,
        fromMilli: 0,
        id: flueEmberCol(CFG, s),
      });
    },
  );

  it("sends the column under the thumb, not the ember's, a column wide of it", () => {
    const { world, s } = toSteady();
    const { l, at } = ember("p1", s);
    const col = flueEmberCol(CFG, s);
    const touch = flueTapUnder(l, at.x + l.tile, at.y, fieldOf(world, 1));
    expect(touch?.command).toMatchObject({ target: "flueTap", id: col + 1 });
  });

  it("is sent from the rester's seat too, and the simulation decides what it costs", () => {
    const { world, s } = toSteady();
    const { l, at } = ember("p2", s);
    expect(flueTapUnder(l, at.x, at.y, fieldOf(world, 2))?.player).toBe(2);
  });

  it("answers along the row and nowhere off it", () => {
    const { world } = toLit();
    const l = layout("p1");
    const c = flueCentre(l, CFG);
    const field = fieldOf(world, 1);
    expect(flueTapUnder(l, c.x - flueSlotHalf(l), c.y, field)).not.toBeNull();
    expect(flueTapUnder(l, c.x, c.y + 2 * l.tile, field)).toBeNull();
    expect(flueTapUnder(l, c.x, c.y, { ...field, boss: null })).toBeNull();
  });

  it("is nothing before a vent is lit", () => {
    const world = createWorld(CFG, 5);
    const index = waveWith("flue");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    const l = layout("p1");
    const c = flueCentre(l, CFG);
    expect(flueTapUnder(l, c.x, c.y, fieldOf(world, 1))).toBeNull();
    expect(handleCircle(l, world, "flueTap", 0)).toBeNull();
  });

  it("lets go on the lift, the column carried, so a resting thumb can tap again", () => {
    const { world, s } = toSteady();
    const { l, at } = ember("p1", s);
    const hold = touchDown(l, at.x, at.y, fieldOf(world, 1))?.hold as Hold;
    expect(touchUp(l, hold, at)?.command).toMatchObject({
      target: "flueTap",
      on: false,
      id: flueEmberCol(CFG, s),
    });
  });

  it("stands where the ember is, for the director's hand", () => {
    const { world, s } = toSteady();
    const l = layout("p1");
    expect(handleCircle(l, world, "flueTap", 0)).toEqual(flueTapCircle(l, CFG, s));
  });
});

describe("thumbs on the glass", () => {
  it("spend a vent: the navigator keeps still, the pilot taps the stopped ember three times", () => {
    const { world, s } = toSteady();
    const send = (command: Command) => step(world, [{ tick: world.tick, player: 1, command }]);
    for (let i = 0; i < 3; i++) {
      const { l, at } = ember("p1", s);
      const down = touchDown(l, at.x, at.y, fieldOf(world, 1));
      send(down?.command as Command);
      send(touchUp(l, down?.hold as Hold, at)?.command as Command);
    }
    expect(s.vents).toBe(1);
  });
});
