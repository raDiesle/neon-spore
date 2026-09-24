import { describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, step } from "@neon-spore/sim";
import { drawnCol, drawnRow, glidePhase } from "../src/depth.js";
import { computeLayout, type Layout } from "../src/layout.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import {
  wellCannonGrab,
  wellCol,
  wellColsFrom,
  wellShieldGrab,
  wellSucksOnLift,
} from "../src/touch-well.js";
import { wellAngle, wellAt, wellCenter, wellHub, wellPlace, wellSectorAngle } from "../src/well.js";

/**
 * THE WELL's screen as a control. The field draws the hull as a ring and the
 * bodies round it, so the answers to a finger have to come from that picture
 * — a press where the cannon is drawn takes the cannon, a drag round the ring
 * carries it hour by hour, and the seam at twelve is a wall, not a shortcut
 * from eleven to one.
 */

const CFG = DEFAULT_CONFIG;
const L: Layout = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");

/** A rock in column four, well up the field, on the well's screen. */
function wellField(seat: 1 | 2 = 1, cannonCol = 5): Field {
  const world = createWorld({ ...CFG, rows: 200 }, 2, [
    { beat: 0, col: 4, kind: "meteor", color: null },
  ]);
  for (let i = 0; i < 200; i++) step(world, []);
  return {
    creatures: world.creatures,
    cannonCol,
    shieldCol: 2,
    beatPhase: 0.5,
    skinY: null,
    beat: 0,
    waveBeat: 0,
    tick: 0,
    seat,
    cfg: CFG,
    boss: null,
    controls: controlSet("default"),
    faults: [],
    well: true,
  };
}

/** A point on the hull ring at an hour, where the cannon rides. */
const onRing = (col: number) => wellAt(L, wellAngle(L, col), wellHub(L));

describe("the column under a finger on the well", () => {
  it("is the hour under it, at any radius", () => {
    for (let col = 0; col < CFG.cols; col++) {
      const a = wellAngle(L, col);
      expect(wellCol(L, wellAt(L, a, wellHub(L)).x, wellAt(L, a, wellHub(L)).y)).toBe(col);
      const far = wellAt(L, a, wellHub(L) * 2.5);
      expect(wellCol(L, far.x, far.y)).toBe(col);
    }
  });

  it("is nothing in the seam and nothing at the middle", () => {
    const seam = wellAt(L, 0, wellHub(L));
    expect(wellCol(L, seam.x, seam.y)).toBeNull();
    const c = wellCenter(L);
    expect(wellCol(L, c.x + 1, c.y)).toBeNull();
  });

  it("does not make eleven and one neighbours", () => {
    const last = wellAngle(L, CFG.cols - 1);
    const first = wellAngle(L, 0);
    const across = wellColsFrom(
      L,
      last,
      wellAt(L, first, wellHub(L)).x,
      wellAt(L, first, wellHub(L)).y,
    );
    // The short way round is two sectors through the seam — a jump, not a step.
    expect(Math.abs(across)).toBe(2000);
    const one = wellAt(L, wellAngle(L, 5), wellHub(L));
    expect(wellColsFrom(L, wellAngle(L, 4), one.x, one.y)).toBe(1000);
  });
});

describe("a press on the well's ship", () => {
  it("takes the cannon where it is drawn and names its hour", () => {
    const grab = wellCannonGrab(L, 5);
    const t = touchDown(L, grab.x, grab.y, wellField(1, 5));
    expect(t).toMatchObject({ player: 1, command: { kind: "cannonCol", col: 5 } });
    expect(t?.hold).toMatchObject({ kind: "cannon", well: true });
  });

  it("carries the cannon round the ring, hour by hour", () => {
    const grab = wellCannonGrab(L, 5);
    const down = touchDown(L, grab.x, grab.y, wellField(1, 5));
    if (!down?.hold) throw new Error("no hold on the cannon");
    for (const col of [6, 7, 3]) {
      const at = onRing(col);
      const moved = touchMove(L, down.hold, at.x, at.y);
      expect(moved?.command).toEqual({ kind: "cannonCol", col });
    }
  });

  it("sends nothing while the finger is in the seam", () => {
    const grab = wellCannonGrab(L, 5);
    const down = touchDown(L, grab.x, grab.y, wellField(1, 5));
    if (!down?.hold) throw new Error("no hold on the cannon");
    const seam = wellAt(L, 0, wellHub(L));
    expect(touchMove(L, down.hold, seam.x, seam.y)).toBeNull();
  });

  it("answers a press beside the seam with the cannon's own hour", () => {
    // The cannon at column 0 is drawn at one o'clock; a thumb on it half
    // a sector towards twelve is over the seam, and still holds the cannon.
    const a = wellAngle(L, 0) - wellSectorAngle(L) * 0.45;
    const at = wellAt(L, a, wellHub(L));
    const t = touchDown(L, at.x, at.y, wellField(1, 0));
    expect(t?.command).toEqual({ kind: "cannonCol", col: 0 });
  });

  it("does not hand the pilot the dome", () => {
    const dome = wellShieldGrab(L, 2);
    const t = touchDown(L, dome.x, dome.y, wellField(1, 5));
    expect(t?.command?.kind).not.toBe("shieldCol");
  });

  it("swallows the tap that did not move, in the same hour", () => {
    const grab = wellCannonGrab(L, 5);
    expect(wellSucksOnLift(L, grab, { x: grab.x + 1, y: grab.y + 1 })).toBe(true);
    const away = onRing(6);
    expect(wellSucksOnLift(L, grab, away)).toBe(false);
    expect(wellSucksOnLift(L, grab, undefined)).toBe(false);
  });
});

describe("a press on a body on the well", () => {
  it("takes hold of it where the well draws it, and drags it round the ring", () => {
    const f = wellField(1);
    const rock = f.creatures.find((c) => c.kind === "meteor");
    if (!rock) throw new Error("no rock on the field");
    const glide = glidePhase(f.cfg, f.beat, rock, f.beatPhase);
    const at = wellPlace(L, drawnCol(rock, glide), drawnRow(rock, glide));
    const down = touchDown(L, at.x, at.y, f);
    expect(down?.command).toEqual({ kind: "grip", id: rock.id });
    const hold = down?.hold;
    if (hold?.kind !== "grip") throw new Error("no grip hold");
    expect(hold.well).toBeDefined();
    // One sector on round the ring is one column of drag, whatever the radius.
    const next = wellAt(L, wellAngle(L, rock.col + 1), wellHub(L) * 1.7);
    const moved = touchMove(L, hold, next.x, next.y);
    expect(moved?.command).toMatchObject({ kind: "drag", target: "gripBody", fromMilli: 1000 });
    expect(touchUp(L, hold)?.command).toMatchObject({ kind: "grip" });
  });

  it("answers nothing where the flat field would have drawn the body", () => {
    const f = wellField(1);
    const rock = f.creatures.find((c) => c.kind === "meteor");
    if (!rock) throw new Error("no rock on the field");
    // Column four on the flat field is a strip down the left half; on the
    // well that strip runs through the middle and the eight o'clock lane.
    const flatX = L.gridLeft + (rock.col + 0.5) * L.tile;
    const flatY = L.gridTop + L.tile * 2.5;
    expect(touchDown(L, flatX, flatY, f)?.command?.kind).not.toBe("grip");
  });
});

describe("the flat field", () => {
  it("is unchanged when the well is not up", () => {
    const f = { ...wellField(1), well: false };
    const t = touchDown(L, L.width * 0.5, L.cannonStrip.y, f);
    expect(t).toMatchObject({ player: 1, command: { kind: "cannonCol" } });
    expect((t?.hold as { well?: true } | null)?.well).toBeUndefined();
  });
});
