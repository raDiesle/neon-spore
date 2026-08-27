import { describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG, NO_GRIP, step } from "@neon-spore/sim";
import { creatureCenter } from "../src/creature-place.js";
import { computeLayout, hitCircle, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";

/**
 * The control scheme, which has two callers now — the game and the director's
 * stage — and therefore has to be worth trusting on its own. It is a pure
 * mapping from a point to a command, so it can be asked directly rather than
 * through a canvas and a pointer.
 */

const CFG = DEFAULT_CONFIG;
const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function field(seat: 1 | 2 = 1): Field {
  const world = createWorld(CFG, 2, [{ beat: 0, col: 4, kind: "slick", color: "red" }]);
  for (let i = 0; i < 200; i++) step(world, []);
  return { creatures: world.creatures, beatPhase: 0.5, seat, wardenRow: CFG.wardenRow };
}

describe("a press on the band", () => {
  const l = layout("test");

  it("puts the cannon and the shield in different hands", () => {
    const cannon = touchDown(l, l.width * 0.5, l.cannonStrip.y, field());
    const shield = touchDown(l, l.width * 0.5, l.shieldStrip.y, field());
    expect(cannon).toMatchObject({ player: 1, hold: "cannon" });
    expect(cannon?.command.kind).toBe("cannonCol");
    expect(shield).toMatchObject({ player: 2, hold: "shield" });
    expect(shield?.command.kind).toBe("shieldCol");
  });

  it("gives the trigger to player 1 and the colours to player 2", () => {
    const guard = touchDown(l, l.guardButton.x, l.guardButton.y, field());
    expect(guard).toEqual({ player: 1, command: { kind: "guard" }, hold: null });
    const red = l.fireButtons[0];
    if (!red) throw new Error("no fire buttons");
    expect(touchDown(l, red.circle.x, red.circle.y, field())).toEqual({
      player: 2,
      command: { kind: "fire", color: red.color },
      hold: null,
    });
  });

  it("gives player 1 a third button that is held rather than tapped", () => {
    const down = touchDown(l, l.lanceButton.x, l.lanceButton.y, field());
    expect(down).toEqual({ player: 1, command: { kind: "prime", on: true }, hold: "lance" });
    // The lift is the other half: nothing in the simulation empties a lobe on
    // its own, so a thumb coming off has to be sent.
    expect(touchUp("lance", field())).toEqual({
      player: 1,
      command: { kind: "prime", on: false },
      hold: null,
    });
  });

  it("keeps player 1's five buttons out of each other's rings", () => {
    // `hitCircle` answers a ring 30% wider than the circle drawn, so buttons
    // that merely do not overlap on screen can still both claim a touch.
    const circles = [
      l.guardButton,
      l.intakeButton,
      l.lanceButton,
      ...l.fireButtons.map((b) => b.circle),
    ];
    for (const a of circles) {
      const claimed = circles.filter((c) => hitCircle(c, a.x, a.y));
      expect(claimed).toHaveLength(1);
    }
  });

  it("answers nothing where the other player's half would be", () => {
    const p1 = layout("p1");
    // p1's screen has no shield strip and no colours at all.
    expect(touchDown(p1, p1.width * 0.5, p1.shieldStrip.y, field())?.player).not.toBe(2);
    const p2 = layout("p2");
    expect(touchDown(p2, p2.guardButton.x, p2.guardButton.y, field())).toBeNull();
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
      hold: "grip",
    });
  });

  it("answers nothing in empty sky", () => {
    const f = field();
    expect(touchDown(l, l.gridLeft + l.tile / 2, l.gridTop + l.tile / 2, f)).toBeNull();
  });

  it("lets go when the finger lifts, and only then", () => {
    expect(touchUp("grip", field(2))).toEqual({
      player: 2,
      command: { kind: "grip", id: NO_GRIP },
      hold: null,
    });
    expect(touchUp("cannon", field())).toBeNull();
    expect(touchUp("shield", field())).toBeNull();
  });
});

describe("a finger that moves", () => {
  const l = layout("test");

  it("drags the strip it started on, and nothing else", () => {
    expect(touchMove(l, "cannon", l.gridLeft + l.tile / 2)).toMatchObject({ player: 1 });
    expect(touchMove(l, "shield", l.gridLeft + l.tile / 2)).toMatchObject({ player: 2 });
    // A grip stays on its creature: the finger is not steering anything.
    expect(touchMove(l, "grip", l.width * 0.9)).toBeNull();
  });
});
