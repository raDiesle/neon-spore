import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  hiveBoss,
  hiveNext,
  hiveOpenCount,
  sinewBoss,
  startWave,
  step,
  tasterBoss,
} from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { hiveBox, hiveSite } from "../src/hive-shape.js";
import { computeLayout } from "../src/layout.js";
import { sinewCollarBox } from "../src/sinew-band.js";
import { tasterFanBox, tasterRidge } from "../src/taster-draw.js";
import { tasterTallyAt } from "../src/taster-read.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A BOSS'S OWN FIXTURE POINTS.
 *
 * `SceneAnchor` named nothing that was a boss's, so THE SINEW's three pages
 * about the collar and THE TASTER's about the fan and the counts stood on
 * the hull with a leader line saying nothing (`docs/queue.md`, 17 September
 * 2026). `{ at: "boss" }` is answered per kind off the boss's own draw file
 * (`caption-anchor-boss.ts`), and these prove the ring lands where the
 * fixture is drawn — and, THE CHOIR's rule, that a part a screen does not
 * draw is no ring at all (`choir-anchor.test.ts`).
 */

const CFG = DEFAULT_CONFIG;
const PILOT = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");

beforeAll(installCanvasGlobals);

/** A world with the tendon installed, a beat in. */
function withSinew() {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], { kind: "sinew" });
  for (let t = 0; t < 60; t++) step(world, []);
  if (sinewBoss(world) === null) throw new Error("no tendon was installed");
  return world;
}

/** A world with the crest installed, a beat in. */
function withTaster() {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], { kind: "taster" });
  for (let t = 0; t < 60; t++) step(world, []);
  if (tasterBoss(world) === null) throw new Error("no crest was installed");
  return world;
}

describe("a caption pointed at THE SINEW's collar", () => {
  it("rings the collar where the band draws it, on both screens", () => {
    const world = withSinew();
    const s = sinewBoss(world);
    if (s === null) throw new Error("no tendon");
    for (const l of [PILOT, NAVIGATOR]) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const collar = sinewCollarBox(l, CFG, s, world.beat, 0);
      expect(at).not.toBeNull();
      expect(at?.x).toBe(collar.x);
      expect(at?.y).toBe(collar.y);
      // Above the hull, which is where the page stood before.
      expect(at?.y ?? 0).toBeLessThan(l.hullY - l.tile);
    }
  });
});

describe("a caption pointed at THE TASTER", () => {
  it("rings the whole fan, on both screens, when no part is named", () => {
    const world = withTaster();
    const t = tasterBoss(world);
    if (t === null) throw new Error("no crest");
    for (const l of [PILOT, NAVIGATOR]) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const fan = tasterFanBox(l, t);
      expect(at?.x).toBe(fan.x);
      expect(at?.y).toBe(fan.y);
      expect(at?.rx ?? 0).toBeGreaterThan(l.tile);
    }
  });

  it("rings the two counts on the ridge, on the navigator's screen", () => {
    const world = withTaster();
    const t = tasterBoss(world);
    if (t === null) throw new Error("no crest");
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "tally" }, 0);
    const { y, thick } = tasterRidge(NAVIGATOR, t, CFG, 0);
    const tally = tasterTallyAt(NAVIGATOR, t, y, thick);
    expect(at?.x).toBe(tally.x);
    expect(at?.y).toBe(tally.y);
  });

  it("is nothing for the counts on the pilot's screen, which draws none", () => {
    expect(anchorPoint(PILOT, withTaster(), SET, { at: "boss", part: "tally" }, 0)).toBeNull();
  });
});

/** A world with the mass installed, `ticks` in — 120 is inside the swell
 * before the first opening, 320 is after it. Seed 6 is the film's. */
function withHive(ticks: number) {
  const world = createWorld(CFG, 6, []);
  startWave(world, 9, [], [], { kind: "hive" });
  for (let t = 0; t < ticks; t++) step(world, []);
  if (hiveBoss(world) === null) throw new Error("no mass was installed");
  return world;
}

describe("a caption pointed at THE HIVE", () => {
  it("rings the mass itself, on both screens, when no part is named", () => {
    const world = withHive(120);
    for (const l of [PILOT, NAVIGATOR]) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const b = hiveBox(l, CFG);
      expect(at?.x).toBe((b.left + b.right) * 0.5);
      expect(at?.y).toBe((b.top + b.bottom) * 0.5);
    }
  });

  it("rings the swelling site on the navigator's screen, which is shown it", () => {
    const world = withHive(120);
    const s = hiveBoss(world);
    if (s === null) throw new Error("no mass");
    const next = hiveNext(s);
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "swell" }, 0);
    expect(at?.x).toBe(hiveSite(NAVIGATOR, s, next).x);
  });

  it("falls back to the mass for the navigator before anything swells", () => {
    // A page opens on its first frame, and the swell is a beat off it — with
    // no ring there would be no caption at all (`caption-anchor-boss.ts`).
    const at = anchorPoint(NAVIGATOR, withHive(0), SET, { at: "boss", part: "swell" }, 0);
    const b = hiveBox(NAVIGATOR, CFG);
    expect(at?.x).toBe((b.left + b.right) * 0.5);
  });

  it("is nothing for the swell on the pilot's screen, which draws none", () => {
    expect(anchorPoint(PILOT, withHive(120), SET, { at: "boss", part: "swell" }, 0)).toBeNull();
  });

  it("rings the open breach, on both screens", () => {
    // Beat 4, when the first site is open and nothing has sealed it.
    const world = withHive(320);
    const s = hiveBoss(world);
    if (s === null) throw new Error("no mass");
    expect(hiveOpenCount(s)).toBe(1);
    for (const l of [PILOT, NAVIGATOR]) {
      const at = anchorPoint(l, world, SET, { at: "boss", part: "breach" }, 0);
      expect(at?.x).toBe(hiveSite(l, s, 0).x);
      expect(at?.y).toBe(hiveSite(l, s, 0).y);
    }
  });

  it("falls back to the mass for a breach while none is open", () => {
    const at = anchorPoint(PILOT, withHive(120), SET, { at: "boss", part: "breach" }, 0);
    const b = hiveBox(PILOT, CFG);
    expect(at?.x).toBe((b.left + b.right) * 0.5);
  });
});

describe("a caption pointed at a boss with no boss on the field", () => {
  it("is nothing at all", () => {
    expect(anchorPoint(PILOT, createWorld(CFG, 1, []), SET, { at: "boss" }, 0)).toBeNull();
  });
});
