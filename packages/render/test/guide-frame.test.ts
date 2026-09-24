import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { WAVES, waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, type World } from "@neon-spore/sim";
import { drawWaveOpening } from "../src/briefing.js";
import { GUIDE_LOOK } from "../src/guide-look.js";
import { GuideStage } from "../src/guide-scene.js";
import { drawGuideWelcome } from "../src/guide-welcome.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OpeningFx } from "../src/opening-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas, type TextBox } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A tutorial says it is one — drawn, so the canvas can object.
 *
 * Three things were added on 14 September 2026 so a page of film is plainly
 * not the live game: the plate became a band across the whole screen with a
 * rim in the seat's colour round the picture (`guide-switch.ts`); a press on
 * the picture is answered by the bar flashing (`guide-nav.ts`, `NUDGE_S`);
 * and a device's first guide is opened with a page explaining the stepper
 * (`guide-welcome.ts`). Each is drawn here at the moment it is loudest — the
 * frame the seat arrives, the frame after the press, the first second of the
 * welcome — and at rest, on a phone and on the sizes nobody designed for.
 */

const CFG = { ...DEFAULT_CONFIG, briefings: true };
const ROLES: ViewRole[] = ["p1", "p2"];
const SIZES = [
  { width: 390, height: 844, dpr: 2 },
  { width: 320, height: 568, dpr: 1 },
  { width: 240, height: 480, dpr: 1 },
  { width: 900, height: 1600, dpr: 2 },
];
/** The first wave whose guide plays a film, whichever that is this week. */
const FILM = WAVES.findIndex((w) => w.guide?.scene);

beforeAll(installCanvasGlobals);

function guided(): World {
  const world = createWorld(CFG, 3);
  startWave(world, FILM, [], [], null, true, waveGuideSteps(FILM));
  return world;
}

/** A film's first page for this viewer, `seconds` in, pressed or not. */
function filmPage(role: ViewRole, seconds: number, size = SIZES[0]!, nudged = false) {
  const { ctx } = stubCanvas();
  const l = computeLayout(size, CFG, role);
  const world = guided();
  const stage = new GuideStage();
  const frames = Math.max(1, Math.round(seconds * 60));
  for (let f = 0; f < frames; f++) stage.update(world, 1 / 60, role);
  if (nudged) stage.nudge();
  ctx.texts = [];
  ctx.calls = 0;
  drawWaveOpening(ctx as unknown as CanvasRenderingContext2D, l, world, {
    role,
    scene: stage,
    time: seconds,
    fx: new OpeningFx(),
  });
  return { ctx, l, texts: ctx.texts as TextBox[] };
}

describe("a page of film", () => {
  it("is reached at all", () => {
    expect(FILM, "no wave plays a film").toBeGreaterThanOrEqual(0);
  });

  for (const role of ROLES) {
    it(`draws the band and the rim for ${role} on the frame the seat arrives`, () => {
      // Frame one: the flare at full, the rim at its widest.
      const { ctx, texts } = filmPage(role, 1 / 60);
      expect(ctx.calls).toBeGreaterThan(100);
      expect(texts.some((t) => t.text === "TUTORIAL")).toBe(true);
    });

    it(`draws them for ${role} at rest, and after the picture was pressed`, () => {
      expect(filmPage(role, 2).ctx.calls).toBeGreaterThan(100);
      expect(filmPage(role, 2, SIZES[0], true).ctx.calls).toBeGreaterThan(100);
    });
  }

  it("keeps the band's words on one row across every size", () => {
    for (const size of SIZES) {
      const { texts, l } = filmPage("p1", 2, size);
      const tag = texts.find((t) => t.text === "TUTORIAL");
      expect(tag, `${size.width}: no TUTORIAL`).toBeDefined();
      // Inside the band, whatever the band is: `bandFoot` is the record's own
      // statement of where it ends, and the HUD's top rows drop under it.
      expect(tag!.y).toBeGreaterThanOrEqual(0);
      expect(tag!.y + tag!.h).toBeLessThanOrEqual(GUIDE_LOOK.bandFoot);
      expect(tag!.x).toBeGreaterThanOrEqual(0);
      expect(tag!.x + tag!.w).toBeLessThanOrEqual(l.width);
    }
  });
});

describe("the welcome before a device's first tutorial", () => {
  function welcome(size: { width: number; height: number; dpr: number }, age: number) {
    const { ctx } = stubCanvas();
    const l = computeLayout(size, CFG, "p1");
    ctx.texts = [];
    drawGuideWelcome(ctx as unknown as CanvasRenderingContext2D, l, age);
    return { ctx, l, texts: ctx.texts as TextBox[] };
  }

  it("draws on the first frame and a breath later without the canvas refusing a value", () => {
    for (const size of SIZES) {
      expect(welcome(size, 0).ctx.calls).toBeGreaterThan(20);
      expect(welcome(size, 1.3).ctx.calls).toBeGreaterThan(20);
    }
  });

  it("names the three buttons beside the buttons they name, clear of the bar", () => {
    for (const size of SIZES) {
      const { texts, l } = welcome(size, 0.5);
      const b = GUIDE_LOOK.buttons(l);
      const over = [
        ["BACK", b.back],
        ["PLAY AGAIN", b.replay],
        ["NEXT", b.next],
      ] as const;
      for (const [word, btn] of over) {
        const t = texts.find((x) => x.text === word);
        expect(t, `${size.width}: no ${word}`).toBeDefined();
        // Its box is on the screen and clear of the bar; its middle is nearer
        // its own button than either neighbour's. Which *side* of its button it
        // is on is the chrome's business — TIDE keeps two of the three up in
        // the bezel, and a label under one of those is still its label.
        expect(t!.x).toBeGreaterThanOrEqual(0);
        expect(t!.x + t!.w).toBeLessThanOrEqual(l.width);
        expect(t!.y + t!.h).toBeLessThan(l.height - GUIDE_LOOK.navHeight);
        const mid = t!.x + t!.w / 2;
        const own = Math.abs(mid - (btn.x + btn.w / 2));
        for (const other of [b.back, b.replay, b.next]) {
          if (other === btn) continue;
          expect(own, `${size.width}: ${word}`).toBeLessThan(
            Math.abs(mid - (other.x + other.w / 2)),
          );
        }
      }
    }
  });

  it("writes the three labels clear of one another", () => {
    // The two icon-only buttons are narrower than the words that name them
    // (`guide-tide-bar.ts`), so laid on one row PLAY AGAIN's ground covers
    // BACK's. A label that will not fit beside the one before it steps a row
    // further from the bar (`guide-welcome.ts`), and this is what that is for.
    for (const size of SIZES) {
      const { texts } = welcome(size, 0.5);
      const rows = ["BACK", "PLAY AGAIN", "NEXT"].map((w) => texts.find((t) => t.text === w));
      for (const [i, one] of rows.entries()) {
        expect(one, `${size.width}: no label ${i}`).toBeDefined();
        for (const two of rows.slice(i + 1)) {
          const apart =
            one!.x + one!.w <= two!.x ||
            two!.x + two!.w <= one!.x ||
            one!.y + one!.h <= two!.y ||
            two!.y + two!.h <= one!.y;
          expect(apart, `${size.width}: ${one!.text} lies over ${two!.text}`).toBe(true);
        }
      }
    }
  });

  it("keeps its title clear of the band the badge stands in", () => {
    for (const size of SIZES) {
      const { texts } = welcome(size, 0);
      const title = texts.find((t) => t.text === "WELCOME");
      expect(title).toBeDefined();
      expect(title!.y).toBeGreaterThanOrEqual(GUIDE_LOOK.bandFoot);
    }
  });
});
