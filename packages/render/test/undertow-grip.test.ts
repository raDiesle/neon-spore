import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type UndertowState,
  undertowBoss,
  undertowUnseated,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import { undertowFreeCircle, undertowPinCircle } from "../src/undertow-grip-place.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE UNDERTOW.**
 *
 * Both rules shipped with nothing on either screen to take hold of. What this
 * file asks is the half a simulation cannot: that a press on the ring the
 * picture draws is the press `undertow-hand.ts` would accept, that each is
 * the navigator's alone, and that a thumb landing where a ring is *not* falls
 * straight through to whatever is behind it.
 *
 * **Nothing here is posed by hand.** The floor is stepped until it offers the
 * handle — a lobe standing, a pilot unseated — the way `undertow-hands.test.ts`
 * does, because the states these two are gated on are the boss's own clock and
 * a state written into a breach here would be a picture of a boss this fight
 * never reaches.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "p2"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function fighting(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("undertow");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "undertow") throw new Error("the undertow's wave installed no floor");
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("no floor installed");
  return u;
}

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.4,
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

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

function heldId(touch: ReturnType<typeof touchDown>): number | null {
  return touch?.hold?.kind === "drag" ? (touch.hold.id ?? null) : null;
}

/** Step until a lobe stands somewhere, and say which column. */
function untilLobe(world: World, cap = 40): number {
  for (let i = 0; i < cap * TPB; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing");
    if (b) return b.col;
    step(world, []);
  }
  throw new Error("no lobe ever stood");
}

/** Step until the floor is bowing somewhere and no lobe stands yet. */
function untilBow(world: World, cap = 40): number {
  for (let i = 0; i < cap * TPB; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "bowing");
    if (b) return b.col;
    step(world, []);
  }
  throw new Error("the floor never bowed");
}

/** Every lobe taken as it stands, until the phase the caller is waiting for. */
function takeAll(world: World, until: UndertowState["phase"]): void {
  for (let i = 0; i < 400 * TPB && floor(world).phase !== until; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing" && !x.tall);
    if (b) {
      step(world, [
        { tick: world.tick, player: 1, command: { kind: "cannonCol", col: b.col } },
        { tick: world.tick, player: 1, command: { kind: "intake" } },
      ]);
    } else step(world, []);
  }
}

/** Step to the beat the floor unseats a pilot who never slid off his column. */
function untilUnseated(world: World): void {
  takeAll(world, "seat");
  for (let i = 0; i < 40 * TPB; i++) {
    if (undertowUnseated(floor(world), world.beat)) return;
    step(world, []);
  }
  throw new Error("the floor never unseated anyone");
}

describe("the navigator's pin on a standing lobe", () => {
  it("takes hold over the lobe, where the ring is drawn, and carries its column", () => {
    const l = layout();
    const world = fighting();
    const col = untilLobe(world);
    const f = field(world, 2);
    const at = undertowPinCircle(l, CFG, col);
    const touch = touchDown(l, at.x, at.y, f);
    expect(target(touch)).toBe("undertowPin");
    // The column is the whole of what `pin` reads off the command, and the
    // lift has to carry it too or letting go unpins whichever lobe the boss
    // has by then (`sim/undertow-hand.ts`).
    expect(heldId(touch)).toBe(col);
  });

  it("is the navigator's and nothing at all from the pilot", () => {
    const l = layout("p1");
    const world = fighting();
    const col = untilLobe(world);
    const f = field(world, 1);
    const at = undertowPinCircle(l, CFG, col);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("undertowPin");
  });

  it("offers nothing over a plate that is only bowing: there is no hole yet", () => {
    const l = layout();
    const world = fighting();
    const col = untilBow(world);
    const f = field(world, 2);
    const at = undertowPinCircle(l, CFG, col);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("undertowPin");
  });

  it("offers nothing anywhere through the last lobe", () => {
    const l = layout();
    const world = fighting();
    takeAll(world, "last");
    expect(floor(world).phase).toBe("last");
    const f = field(world, 2);
    for (const b of floor(world).breaches) {
      const at = undertowPinCircle(l, CFG, b.col);
      expect(target(touchDown(l, at.x, at.y, f)), `col ${b.col}`).not.toBe("undertowPin");
    }
  });

  it("stays offered on the lobe her thumb is already on", () => {
    const l = layout();
    const world = fighting();
    const col = untilLobe(world);
    const f = field(world, 2);
    const at = undertowPinCircle(l, CFG, col);
    // `pin` refuses a second thumb on the column it is already on, and the
    // ring is drawn `held` there rather than taken away — the one lobe on the
    // field that is doing something would otherwise lose its mark.
    floor(world).pinCol = col;
    expect(target(touchDown(l, at.x, at.y, f))).toBe("undertowPin");
  });
});

describe("the navigator's haul on the unseated pilot's column", () => {
  it("takes hold over his column once the floor has him", () => {
    const l = layout();
    const world = fighting();
    untilUnseated(world);
    const f = field(world, 2);
    const at = undertowFreeCircle(l, CFG, world.cannonCol);
    expect(target(touchDown(l, at.x, at.y, f))).toBe("undertowFree");
  });

  it("is the navigator's and nothing at all from the pilot", () => {
    const l = layout("p1");
    const world = fighting();
    untilUnseated(world);
    const f = field(world, 1);
    const at = undertowFreeCircle(l, CFG, world.cannonCol);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("undertowFree");
  });

  it("offers nothing before the floor takes him: that is a thumb on the hull", () => {
    const l = layout();
    const world = fighting();
    untilLobe(world);
    expect(undertowUnseated(floor(world), world.beat)).toBe(false);
    const f = field(world, 2);
    const at = undertowFreeCircle(l, CFG, world.cannonCol);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("undertowFree");
  });

  it("hangs clear of the pin, so a lobe in his own column is still reachable", () => {
    const l = layout();
    const free = undertowFreeCircle(l, CFG, 3);
    const pin = undertowPinCircle(l, CFG, 3);
    // Both are read off `l.hullY` in the same column, so the only thing
    // keeping two thumbs apart is the gap between them (`undertow-grip.ts`).
    expect(Math.abs(free.y - pin.y)).toBeGreaterThan(free.r + pin.r);
  });
});
