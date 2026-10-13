import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, type SpawnEntry, step, type World } from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { choirRubCircle, choirRubUnder } from "../src/choir-rub.js";
import { handleCircle } from "../src/handles.js";
import { computeLayout } from "../src/layout.js";
import type { Field } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT THE CHOIR'S RUB POINTS, AND WHO CAN RUB IT.
 *
 * `SceneAnchor` has taken a `DragTarget` since THE LID's cord, and THE CHOIR's
 * rub is a `DragTarget` — so a film could name it and `handleCircle` would
 * fall through its boss branches into the **lid** lookup and answer about a
 * body that was never there.
 *
 * The rub is the one handle that is *placed* rather than found: the answer is
 * the same circle the drawing and the hit test use, behind the same gate, in
 * the middle of the field, on **both** screens — the owner, 13 October 2026:
 * *related player ( or both) needs to use it at the same time*.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");

beforeAll(installCanvasGlobals);

/** A world with a membrane on the field, stepped until it has arrived. */
function withChoir() {
  const queue: SpawnEntry[] = [{ beat: 0, col: 2, kind: "choir", color: "red" }];
  const world = createWorld(CFG, 1, queue);
  for (let t = 0; t < 120 && world.creatures.length === 0; t++) step(world, []);
  if (world.creatures.length === 0) throw new Error("no membrane ever arrived");
  return world;
}

/** The field a press from this seat is read against. */
function fieldOf(world: World, seat: 1 | 2): Field {
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
    controls: SET,
    faults: [],
    well: false,
  };
}

describe("THE CHOIR's rub", () => {
  it("is answered where the drawing and the finger both put it", () => {
    const at = handleCircle(L, withChoir(), "choirRub", 0);
    expect(at).not.toBeNull();
    expect(at?.x).toBe(choirRubCircle(L).x);
    expect(at?.y).toBe(choirRubCircle(L).y);
  });

  it("stands in the middle of the field across", () => {
    expect(choirRubCircle(L).x).toBe(L.width / 2);
    expect(choirRubCircle(L).y).toBeLessThan(L.bandTop);
  });

  it("is nothing at all with no membrane on the field", () => {
    const empty = createWorld(CFG, 1, []);
    expect(handleCircle(L, empty, "choirRub", 0)).toBeNull();
  });

  it("is on the navigator's screen too, and a press there is the navigator's", () => {
    const world = withChoir();
    expect(handleCircle(NAVIGATOR, world, "choirRub", 0)).not.toBeNull();
    for (const [l, seat] of [
      [L, 1],
      [NAVIGATOR, 2],
    ] as const) {
      const { x, y } = choirRubCircle(l);
      const touch = choirRubUnder(l, x, y, fieldOf(world, seat));
      expect(touch?.player).toBe(seat);
      expect(touch?.command).toBeNull();
      expect(touch?.hold).toMatchObject({ kind: "drag", target: "choirRub", rub: true });
    }
  });

  it("reaches a page's caption through the anchor a film would write", () => {
    const at = anchorPoint(L, withChoir(), SET, { at: "handle", target: "choirRub" }, 0);
    expect(at?.x).toBe(choirRubCircle(L).x);
  });
});
