import { describe, expect, it } from "bun:test";
import {
  CONTROL_SETS,
  type ControlSet,
  controlPress,
  controlSet,
  MAZE_ROUNDS,
  setControls,
} from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  installMaze,
  type MazeState,
  NO_GRIP,
  step,
} from "@neon-spore/sim";
import { creatureCenter } from "../src/creature-place.js";
import { bandLobes, computeLayout, hitCircle, type ViewRole } from "../src/layout.js";
import { mazeStringCircle } from "../src/maze-string.js";
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";

/**
 * The control scheme, which has two callers now — the game and the director's
 * stage — and therefore has to be worth trusting on its own. It is a pure
 * mapping from a point to a command, so it can be asked directly rather than
 * through a canvas and a pointer.
 */

const CFG = DEFAULT_CONFIG;
const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

const STANDARD = controlSet("default");
const CLAW = controlSet("claw");
const ROLES: ViewRole[] = ["p1", "p2", "test"];

function field(seat: 1 | 2 = 1, controls: ControlSet = STANDARD): Field {
  // A rock, because a rock is the one body **either** seat may take hold of: a
  // hand on anything living is an aim, and only the pilot has one
  // (`sim/hand.ts`). Half these presses are signed player 2.
  const world = createWorld({ ...CFG, rows: 200 }, 2, [
    { beat: 0, col: 4, kind: "meteor", color: null },
  ]);
  for (let i = 0; i < 200; i++) step(world, []);
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.5,
    seat,
    cfg: CFG,
    maze: null,
    warden: null,
    controls,
    malfunction: null,
  };
}

/**
 * The same field with THE MAZE up and its wheel turnable. `installMaze` rather
 * than a literal, so the state under test is the one the round actually builds.
 */
function mazeField(seat: 1 | 2 = 1): Field & { maze: MazeState } {
  const world = createWorld(CFG, 2, []);
  const maze = installMaze(world, [...MAZE_ROUNDS]);
  maze.phase = "read";
  return { ...field(seat), maze };
}

/** Whether a role's screen carries a seat's half at all. */
const shows = (role: ViewRole, player: 1 | 2): boolean => role === "test" || role === `p${player}`;

/** Where the band draws one control on a panel, or null if it is not on it. */
function drawnAt(role: ViewRole, set: ControlSet, id: string): { x: number; y: number } | null {
  for (const player of [1, 2] as const) {
    const found = bandLobes(layout(role), set, player).find((b) => b.control.id === id);
    if (found) return found.circle;
  }
  return null;
}

describe("a press on the band", () => {
  const l = layout("test");

  it("puts the cannon and the shield in different hands", () => {
    const cannon = touchDown(l, l.width * 0.5, l.cannonStrip.y, field());
    const shield = touchDown(l, l.width * 0.5, l.shieldStrip.y, field());
    expect(cannon).toMatchObject({ player: 1, hold: { kind: "cannon" } });
    expect(cannon?.command?.kind).toBe("cannonCol");
    expect(shield).toMatchObject({ player: 2, hold: { kind: "shield" } });
    expect(shield?.command?.kind).toBe("shieldCol");
  });

  it("gives the trigger to player 1 and the colours to player 2", () => {
    const guard = drawnAt("test", STANDARD, "guard");
    if (!guard) throw new Error("the standard panel has no trigger");
    expect(touchDown(l, guard.x, guard.y, field())).toEqual({
      player: 1,
      command: { kind: "guard" },
      hold: null,
    });
    const red = drawnAt("test", STANDARD, "fireRed");
    if (!red) throw new Error("the standard panel has no red");
    // A colour is *held*: the press says only that a thumb is there, and the
    // lift is the shot (`sim/lance.ts`).
    expect(touchDown(l, red.x, red.y, field())).toEqual({
      player: 2,
      command: { kind: "prime", on: true, color: "red" },
      hold: { kind: "held", control: "fireRed", player: 2 },
    });
  });

  it("makes both colours held rather than tapped, and sends the lift", () => {
    for (const [id, color] of [
      ["fireRed", "red"],
      ["fireCyan", "cyan"],
    ] as const) {
      const at = drawnAt("test", STANDARD, id);
      if (!at) throw new Error(`the standard panel has no ${id}`);
      expect(touchDown(l, at.x, at.y, field(2))).toEqual({
        player: 2,
        command: { kind: "prime", on: true, color },
        hold: { kind: "held", control: id, player: 2 },
      });
      // The lift is the other half: nothing in the simulation empties a lobe
      // on its own, so a thumb coming off has to be sent — and it is what
      // fires the ordinary shot.
      expect(touchUp(l, { kind: "held", control: id, player: 2 }, field(2))).toEqual({
        player: 2,
        command: { kind: "prime", on: false, color },
        hold: null,
      });
    }
  });

  /**
   * The one the owner caught. When the lance came off the ordinary panel the
   * button stopped being drawn and went on being *pressable*: the layout still
   * handed out a fixed circle for it and this file still answered that circle,
   * so every wave in the game had a lance under an empty patch of band. The
   * lance has no button at all now; THE CLAW's arm stands in the same place
   * and asks the same question.
   */
  it("answers nothing where a control this wave did not ask for would be", () => {
    for (const role of ["p1", "test"] as const) {
      const arm = drawnAt(role, CLAW, "reach");
      if (!arm) throw new Error("the claw panel has no arm");
      const answered = touchDown(layout(role), arm.x, arm.y, field(1, STANDARD));
      expect(answered?.command?.kind).not.toBe("reach");
    }
  });

  it("keeps every set's buttons out of each other's rings", () => {
    // `hitCircle` answers a ring 30% wider than the circle drawn, so buttons
    // that merely do not overlap on screen can still both claim a touch.
    for (const set of CONTROL_SETS) {
      for (const role of ROLES) {
        const l = layout(role);
        const circles = ([1, 2] as const)
          .filter((p) => shows(role, p))
          .flatMap((p) => bandLobes(l, set, p).map((b) => b.circle));
        for (const a of circles) {
          expect(circles.filter((c) => hitCircle(c, a.x, a.y))).toHaveLength(1);
        }
      }
    }
  });

  it("centres a seat's buttons on the middle of its share of the band", () => {
    // Two buttons where there used to be three sit either side of the same
    // middle, not in the first two of three slots with a hole after them.
    for (const role of ["p1", "test"] as const) {
      const mid = (set: ControlSet): number => {
        const xs = bandLobes(layout(role), set, 1).map((b) => b.circle.x);
        return (xs[0]! + xs[xs.length - 1]!) / 2;
      };
      expect(mid(STANDARD)).toBeCloseTo(mid(CLAW), 6);
    }
  });

  it("answers nothing where the other player's half would be", () => {
    const p1 = layout("p1");
    // p1's screen has no shield strip and no colours at all.
    expect(touchDown(p1, p1.width * 0.5, p1.shieldStrip.y, field())?.player).not.toBe(2);
    expect(drawnAt("p2", STANDARD, "guard")).toBeNull();
  });
});

/**
 * The drawing and the hit regions are the same list, for **every** registered
 * set rather than the two that happen to exist today — both come from
 * `bandLobes` with the wave's own set, so a set added later is covered the day
 * it is added and a set nobody drew for cannot appear.
 */
describe("what is drawn and what is touchable", () => {
  it("are the same buttons, in the same order, for every set and role", () => {
    for (const set of CONTROL_SETS) {
      for (const role of ROLES) {
        const l = layout(role);
        const answered: string[] = [];
        for (const player of [1, 2] as const) {
          // The other seat's half is not on this screen, so it has no circles
          // at all — not circles standing on top of this seat's.
          if (!shows(role, player)) expect(bandLobes(l, set, player)).toEqual([]);
          for (const lobe of bandLobes(l, set, player)) {
            const t = touchDown(l, lobe.circle.x, lobe.circle.y, field(1, set));
            expect(t).not.toBeNull();
            expect(t?.player).toBe(player);
            answered.push(lobe.control.id);
          }
        }
        const drawn = ([1, 2] as const)
          .filter((p) => shows(role, p))
          .flatMap((p) => setControls(set, p))
          .filter((c) => c.form === "lobe")
          .map((c) => c.id);
        expect(answered).toEqual(drawn);
      }
    }
  });

  it("leaves no control of another set answering on this one", () => {
    for (const set of CONTROL_SETS) {
      for (const other of CONTROL_SETS) {
        if (other.id === set.id) continue;
        const missing = [...setControls(other, 1), ...setControls(other, 2)].filter(
          (c) => c.form === "lobe" && !set.controls.includes(c.id),
        );
        for (const c of missing) {
          const at = drawnAt("test", other, c.id);
          if (!at) throw new Error(`${c.id} is drawn nowhere on ${other.id}`);
          const t = touchDown(layout("test"), at.x, at.y, field(1, set));
          // Whatever else is at that point, it is never the absent control's
          // own command — a colour's is `prime`, the maw's is `intake`.
          const says = controlPress(c.id).down.kind;
          if (says === "prime") continue;
          expect(t?.command?.kind).not.toBe(says);
        }
      }
    }
  });
});

describe("a press on the field", () => {
  const l = layout("test");

  it("takes hold of what it is pointing at, signed with this seat", () => {
    const f = field(2);
    const c = f.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(l, c, f.beatPhase);
    expect(touchDown(l, at.x, at.y, f)).toEqual({
      player: 2,
      command: { kind: "grip", id: c.id },
      // And where it landed and what it landed on, which is what a hand
      // carried sideways from here needs (`grip-push.ts`).
      hold: { kind: "grip", id: c.id, player: 2, originX: at.x },
    });
  });

  /**
   * And the body only one seat can do anything with. A press the hit test
   * answers and `setGrip` then refuses is a control that looks live on one
   * screen and does nothing at all, so the navigator's thumb has to find
   * nothing over a slick rather than find it and be turned away later.
   */
  it("offers a living body to the pilot and to nobody else", () => {
    const living = createWorld(CFG, 2, [{ beat: 0, col: 4, kind: "slick", color: "red" }]);
    for (let i = 0; i < 200; i++) step(living, []);
    const c = living.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(l, c, 0.5);
    for (const seat of [1, 2] as const) {
      const f = { ...field(seat), creatures: living.creatures };
      const t = touchDown(l, at.x, at.y, f);
      expect(t?.command).toEqual(seat === 1 ? { kind: "grip", id: c.id } : undefined);
    }
  });

  it("answers nothing in empty sky", () => {
    const f = field();
    expect(touchDown(l, l.gridLeft + l.tile / 2, l.gridTop + l.tile / 2, f)).toBeNull();
  });

  it("lets go when the finger lifts, and only then", () => {
    expect(touchUp(l, { kind: "grip", id: 1, player: 2, originX: 0 }, field(2))).toEqual({
      player: 2,
      command: { kind: "grip", id: NO_GRIP },
      hold: null,
    });
    expect(touchUp(l, { kind: "cannon" }, field())).toBeNull();
    expect(touchUp(l, { kind: "shield" }, field())).toBeNull();
  });
});

describe("a finger that moves", () => {
  const l = layout("test");

  it("drags the strip it started on, and nothing else", () => {
    const mid = l.gridLeft + l.tile / 2;
    expect(touchMove(l, { kind: "cannon" }, mid, 0)).toMatchObject({ player: 1 });
    expect(touchMove(l, { kind: "shield" }, mid, 0)).toMatchObject({ player: 2 });
    // A grip reports where it went, as a displacement in thousandths of a
    // tile: the body under it steps a column for every tile the hand carries
    // it (`sim/grip-push.ts`).
    const grip = { kind: "grip", id: 4, player: 2, originX: 0 } as const;
    expect(touchMove(l, grip, l.tile * 2, 0)).toEqual({
      player: 2,
      command: { kind: "drag", target: "gripBody", on: true, fromMilli: 2000, id: 4 },
      hold: grip,
    });
  });
});

/**
 * The second gesture. Everything here is about the press deciding what a move
 * will mean, because that is the whole of the decision: a hold is a value, and
 * a draggable one carries the origin nothing else can recover afterwards.
 */
describe("a hand on THE MAZE's string", () => {
  const l = layout("test");
  const handle = () => mazeStringCircle(l, CFG);

  const grab = (f: Field) => {
    const c = handle();
    return touchDown(l, c.x, c.y, f);
  };

  it("grabs the handle, and the grab is its own origin", () => {
    const t = grab(mazeField(1));
    expect(t).toEqual({
      player: 1,
      command: { kind: "drag", target: "mazeString", on: true, fromMilli: 0, fromYMilli: 0 },
      hold: {
        kind: "drag",
        target: "mazeString",
        player: 1,
        originX: handle().x,
        originY: handle().y,
      },
    });
  });

  /**
   * The point of the whole lane. A move reports how far the hand has come from
   * where it grabbed, in thousandths of a tile — not where it is on the screen,
   * which is what the two strips answer and what a wheel cannot use.
   */
  it("reports the distance from the grab, in thousandths of a tile", () => {
    const hold = grab(mazeField(1))?.hold;
    if (hold?.kind !== "drag") throw new Error("the handle was not grabbed");
    expect(touchMove(l, hold, hold.originX + l.tile * 2, hold.originY)?.command).toEqual({
      kind: "drag",
      target: "mazeString",
      on: true,
      fromMilli: 2000,
      fromYMilli: 0,
    });
    expect(touchMove(l, hold, hold.originX - l.tile / 2, hold.originY)?.command).toEqual({
      kind: "drag",
      target: "mazeString",
      on: true,
      fromMilli: -500,
      fromYMilli: 0,
    });
    // Both axes: a hand may carry a handle any way at all now, so a move down
    // the screen is a move and not a rounding of one across it.
    expect(touchMove(l, hold, hold.originX, hold.originY + l.tile * 1.5)?.command).toMatchObject({
      fromMilli: 0,
      fromYMilli: 1500,
    });
    // Back where it started is zero again, however it got there: the origin is
    // fixed at the press, so a move can never accumulate.
    expect(touchMove(l, hold, hold.originX, hold.originY)?.command).toMatchObject({
      fromMilli: 0,
      fromYMilli: 0,
    });
  });

  it("is an integer at every position across the field", () => {
    const hold: Hold = {
      kind: "drag",
      target: "mazeString",
      player: 1,
      originX: 0,
      originY: 0,
    };
    for (let x = 0; x <= l.width; x += 1) {
      const c = touchMove(l, hold, x, x)?.command;
      if (c?.kind !== "drag") throw new Error("a drag answered something else");
      expect(Number.isInteger(c.fromMilli)).toBe(true);
      expect(Number.isInteger(c.fromYMilli)).toBe(true);
    }
  });

  it("lets go, and says so", () => {
    const hold = grab(mazeField(1))?.hold;
    if (!hold) throw new Error("the handle was not grabbed");
    expect(touchUp(l, hold, mazeField(1))).toEqual({
      player: 1,
      command: { kind: "drag", target: "mazeString", on: false, fromMilli: 0, fromYMilli: 0 },
      hold: null,
    });
  });

  /** Only the pilot turns the wheel, so only the pilot's seat may grab it. */
  it("answers nothing from the navigator's seat", () => {
    expect(grab(mazeField(2))?.command?.kind).not.toBe("drag");
  });

  it("answers nothing on a wave with no wheel, and none while a shot walks", () => {
    expect(grab(field(1))?.command?.kind).not.toBe("drag");
    const travelling = mazeField(1);
    travelling.maze.phase = "travel";
    expect(grab(travelling)?.command?.kind).not.toBe("drag");
  });

  /**
   * The handle hangs over the field, so it has to be asked before the
   * creatures behind it — and it must not eat a grab anywhere else.
   */
  it("does not swallow a grip that was aimed at a creature", () => {
    const f = mazeField(1);
    const c = f.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(l, c, f.beatPhase);
    expect(hitCircle(handle(), at.x, at.y)).toBe(false);
    expect(touchDown(l, at.x, at.y, f)?.command).toEqual({ kind: "grip", id: c.id });
  });

  /** The handle has to be reachable: above the band, below the drum's rim. */
  it("hangs where a thumb can get at it", () => {
    const c = handle();
    expect(c.y).toBeLessThan(l.bandTop);
    expect(c.y).toBeLessThan(l.hullY);
    expect(c.y).toBeGreaterThan(l.gridTop);
    expect(c.r * 2).toBeGreaterThan(20);
  });
});
