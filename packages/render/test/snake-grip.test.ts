import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SnakeState,
  startWave,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { snakeJawsCircle, snakeTailCircle } from "../src/snake-grip.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on SNAKE's own body.**
 *
 * Both rules shipped on 18 September 2026 with nothing on either screen to
 * take hold of, and neither is one handle among many: past `snakeGorgeTiles`
 * the MAW press is a dead button, so prising the jaws is the only way a point
 * is swallowed from there to the end of the round.
 *
 * What this file asks is the half a simulation cannot. **The body moves
 * between beats** — it steps a whole tile on a tick and the picture carries it
 * the whole way there — so the load-bearing case is that both rings are
 * answered where the body has *slid* to and not on the tiles the round is
 * storing. That is the whole reason `Field` carries a tick. The rest is the
 * gates said in touches rather than in commands: a seat that owns neither, a
 * body too short for either, a mouth still resting, a body folded up.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/**
 * A round in play with a body of `tiles` laid out in one straight column,
 * head at the top and going up. The length is the whole of what decides which
 * of the two hands is on offer (`snakeGrip`), so it is what the cases below
 * set.
 */
function playing(tiles: number): { world: World; snake: SnakeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("snake");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "snake") throw new Error("SNAKE's wave installed no round");
  const snake = world.boss;
  snake.phase = "play";
  snake.dirCol = 0;
  snake.dirRow = -1;
  snake.body = Array.from({ length: tiles }, (_, i) => ({ col: 4, row: 3 + i }));
  // On the tiles exactly, so a case that does not ask about the slide is not
  // quietly asking about it.
  snake.stepTick = world.tick;
  // Nothing resting: the mouth's rest is its own case below.
  snake.mawTick = world.tick - CFG.snakeMawRestTicks;
  return { world, snake };
}

function field(world: World, seat: 1 | 2, boss = world.boss): Field {
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
    boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

/** The ring where the picture has it this instant, which is the only place a
 * press may be answered (`snake-grip.ts`). */
function jaws(l: Layout, f: Field, s: SnakeState) {
  const at = snakeJawsCircle(l, CFG, s, f.tick);
  if (at === null) throw new Error("a body with no neck to take hold of");
  return at;
}

function tail(l: Layout, f: Field, s: SnakeState) {
  const at = snakeTailCircle(l, CFG, s, f.tick);
  if (at === null) throw new Error("a body with no tail to take hold of");
  return at;
}

describe("the pilot's pull on SNAKE's jaws", () => {
  it("takes hold of the neck once the jaws have stuck", () => {
    const l = layout("p1");
    const { world, snake } = playing(7);
    const f = field(world, 1);
    const at = jaws(l, f, snake);
    const touch = touchDown(l, at.x, at.y, f);
    expect(target(touch)).toBe("snakeJaws");
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "snakeJaws",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
  });

  it("is answered where the body has slid to and not on the tile it left", () => {
    // The whole reason `Field` carries a tick. The body steps on `stepTicks`
    // and the picture carries it the whole way there, so a hit test worked out
    // from the beat would answer the neck up to a tile behind itself — and on
    // a round whose body is nine tiles wide, a tile is the whole target.
    const l = layout("p1");
    const { world, snake } = playing(7);
    const round = snake.rounds[snake.round];
    if (round === undefined) throw new Error("a round with no rounds to play");
    const still = field(world, 1);
    const stored = jaws(l, still, snake);
    // Half a step in, which is as far from both tiles as the body ever gets.
    const moved: Field = { ...still, tick: world.tick + Math.round(round.stepTicks / 2) };
    snake.stepTick = world.tick;
    const slid = jaws(l, moved, snake);
    expect(slid.y).not.toBeCloseTo(stored.y, 1);
    expect(target(touchDown(l, slid.x, slid.y, moved))).toBe("snakeJaws");
    // And the tile it is leaving is no longer a handle at all.
    expect(target(touchDown(l, stored.x, stored.y, moved))).not.toBe("snakeJaws");
  });

  it("is nothing while the body still crawls and the press still works", () => {
    const l = layout("p1");
    const { world, snake } = playing(4);
    const f = field(world, 1);
    const at = jaws(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("snakeJaws");
  });

  it("is nothing while the mouth is still resting from its last opening", () => {
    const l = layout("p1");
    const { world, snake } = playing(7);
    snake.mawTick = world.tick;
    const f = field(world, 1);
    const at = jaws(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("snakeJaws");
  });

  it("is nothing once the body is folded up against what stopped it", () => {
    const l = layout("p1");
    const { world, snake } = playing(7);
    snake.crashTick = world.tick;
    const f = field(world, 1);
    const at = jaws(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("snakeJaws");
  });

  it("is the pilot's alone", () => {
    const l = layout("p2");
    const { world, snake } = playing(7);
    const f = field(world, 2);
    const at = jaws(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("snakeJaws");
  });

  it("never covers the head it is taken behind", () => {
    // `drawHandleRing` fills opaquely and the head is the muzzle, the mouth
    // and the heading at once. The ring is a tile back, so the two circles do
    // not overlap however the crawl swings the neck.
    const l = layout("p1");
    const { world, snake } = playing(7);
    const f = field(world, 1);
    const at = jaws(l, f, snake);
    // Where the head itself is: a one-tile body's last joint is its first, so
    // the head's own place comes out of the same function the ring does rather
    // than out of a second copy of `snakeJoints`' arithmetic.
    const head = snakeTailCircle(l, CFG, { ...snake, body: snake.body.slice(0, 1) }, f.tick);
    if (head === null) throw new Error("a body with no head");
    expect(Math.hypot(at.x - head.x, at.y - head.y)).toBeGreaterThan(at.r * 1.3);
  });
});

describe("the driver's thumb on SNAKE's tail", () => {
  it("takes hold of the tail once it drags", () => {
    const l = layout("p2");
    const { world, snake } = playing(9);
    const f = field(world, 2);
    const at = tail(l, f, snake);
    const touch = touchDown(l, at.x, at.y, f);
    expect(target(touch)).toBe("snakeTail");
    expect(touch?.player).toBe(2);
  });

  it("is nothing while the body is only gorged", () => {
    const l = layout("p2");
    const { world, snake } = playing(7);
    const f = field(world, 2);
    const at = tail(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("snakeTail");
  });

  it("stays on offer while her thumb is already down", () => {
    // The hold *is* the control and letting go is how it ends, so nothing
    // about `tailHeld` closes the handle (`dragHeard`).
    const l = layout("p2");
    const { world, snake } = playing(9);
    snake.tailHeld = true;
    const f = field(world, 2);
    const at = tail(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).toBe("snakeTail");
  });

  it("is the driver's alone", () => {
    const l = layout("p1");
    const { world, snake } = playing(9);
    const f = field(world, 1);
    const at = tail(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("snakeTail");
  });

  it("is nothing before the body is out of the ship", () => {
    const l = layout("p2");
    const { world, snake } = playing(9);
    snake.phase = "morph";
    const f = field(world, 2);
    const at = tail(l, f, snake);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("snakeTail");
  });
});

describe("a field with no round on it", () => {
  it("answers neither handle where they would have stood", () => {
    const l = layout("p1");
    const { world, snake } = playing(9);
    const f = field(world, 1);
    const at = jaws(l, f, snake);
    const none: Field = { ...f, boss: null };
    expect(target(touchDown(l, at.x, at.y, none))).not.toBe("snakeJaws");
    expect(target(touchDown(l, at.x, at.y, { ...none, seat: 2 }))).not.toBe("snakeTail");
  });
});
