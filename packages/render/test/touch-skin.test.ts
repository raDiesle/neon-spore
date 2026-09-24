import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { type Creature, createWorld, DEFAULT_CONFIG, hullRow } from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { flatCenter, flatRadius } from "../src/creature-place.js";
import { creatureAt } from "../src/creature-under.js";
import { landingY } from "../src/landing.js";
import { computeLayout } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { runFrames } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A body on its landing beat is drawn resting in the plating, and the plating
 * has lobes: the field pass rests it by the skin the frame drew
 * (`landing.ts`). The touch layer used to rest it by a flat membrane at
 * `l.hullY`, because a `Field` could not see the hull — so under a raised
 * lobe the thumb laid on the body as drawn answered a point the body was not
 * at. The skin now travels with the field (`Field.skinY`), and it is the one
 * the renderer last drew on (`Canvas2DRenderer.skinY`).
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const HULL = hullRow(CFG);
const GLIDE = 1;

beforeAll(installCanvasGlobals);

const slick = { id: 7, kind: "slick", col: 3, row: HULL, fromRow: HULL - 1, color: "red" };
const body = slick as unknown as Creature;

/** A lobe standing a whole tile proud of the membrane, over every column. */
const lobe = () => L.hullY - L.tile;

function field(skinY: Field["skinY"]): Field {
  return {
    creatures: [body],
    cannonCol: 0,
    shieldCol: 0,
    beatPhase: GLIDE,
    skinY,
    beat: 0,
    waveBeat: 0,
    tick: 0,
    seat: 1,
    cfg: CFG,
    boss: null,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a body landing under a raised lobe", () => {
  const { x, y: flatY } = flatCenter(L, body, GLIDE);
  const drawnY = landingY(L, CFG, body, x, flatY, GLIDE, lobe);
  const reach = flatRadius(L, CFG, body, GLIDE) * 1.6;

  it("is drawn further from the flat guess than a thumb reaches", () => {
    const flatGuess = landingY(L, CFG, body, x, flatY, GLIDE, () => L.hullY);
    expect(flatGuess - drawnY).toBeGreaterThan(reach);
  });

  it("is found where it was drawn, on the skin the field carries", () => {
    expect(creatureAt(L, field(lobe), x, drawnY)).toBe(body);
    expect(creatureAt(L, field(null), x, drawnY)).toBeNull();
  });

  it("is taken hold of through `touchDown`, which reads `Field.skinY`", () => {
    expect(touchDown(L, x, drawnY, field(lobe))?.command).toEqual({ kind: "grip", id: slick.id });
    expect(touchDown(L, x, drawnY, field(null))?.command).not.toEqual({
      kind: "grip",
      id: slick.id,
    });
  });
});

describe("the renderer's skin", () => {
  it("is the plating its last frame drew, and nothing before a frame", () => {
    const { canvas } = stubCanvas();
    expect(new Canvas2DRenderer(canvas).skinY).toBeNull();
    const { renderer } = runFrames(createWorld(CFG, 3, []), "test", 4, { every: 4 });
    const skin = renderer.skinY;
    if (!skin) throw new Error("a drawn frame left no skin behind");
    for (const at of [0.1, 0.5, 0.9]) expect(Number.isFinite(skin(at * 900))).toBe(true);
  });
});
