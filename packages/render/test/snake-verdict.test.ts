import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  type SnakeState,
  startWave,
  type World,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { rgba } from "../src/hex.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { snakeGripSeat, snakeJawsCircle } from "../src/snake-grip.js";
import { drawSnakeAsked, drawSnakeVerdicts, SnakeMarks } from "../src/snake-marks.js";
import { type Field, touchDown } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **SNAKE's jaws answer a touch the way THE INSTAR's marks do**
 * (`snake-marks.ts`, `.claude/skills/new-boss` §5): on the pilot's screen they
 * wear the halo until the prise, on the driver's his turning ring and a clock;
 * the prise washes them green, her press red; a desk press is signed with the
 * pilot's seat; and the verdict reaches the round's screen through the
 * takeover.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

const GORGE = CFG.snakeGorgeTiles + 1;

/** A round in its play with a straight body `tiles` long, and the mouth rested. */
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
  snake.stepTick = world.tick;
  snake.mawTick = world.tick - CFG.snakeMawRestTicks;
  return { world, snake };
}

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, layout(role));
  return log.join("|");
}

function asked(role: ViewRole, tiles: number, edit: (s: SnakeState, w: World) => void = () => {}) {
  const { world, snake } = playing(tiles);
  edit(snake, world);
  return drawn(role, (ctx, l) => drawSnakeAsked(ctx, l, CFG, snake, world.tick, 1.2));
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";
const THEIRS = rgba(PALETTE.text, 0.8);
const CLOCK = rgba(PALETTE.text, 0.85);

describe("SNAKE's parts asking", () => {
  it("asks nothing while the body crawls, or once it is folded up", () => {
    for (const role of ROLES) {
      expect(asked(role, CFG.snakeGorgeTiles)).toBe("");
      expect(asked(role, GORGE, (s, w) => (s.crashTick = w.tick))).toBe("");
    }
  });

  it("under gorge: the jaws halo for the pilot, and the driver waits on them", () => {
    expect(count(asked("p1", GORGE), HALO)).toBe(1);
    expect(count(asked("p1", GORGE), CLOCK)).toBe(0);
    expect(count(asked("p2", GORGE), HALO)).toBe(0);
    expect(count(asked("p2", GORGE), THEIRS)).toBe(1);
    expect(count(asked("p2", GORGE), CLOCK)).toBe(1);
  });

  it("stops asking through the mouth's rest, which is what the prise begins", () => {
    for (const role of ROLES) expect(asked(role, GORGE, (s, w) => (s.mawTick = w.tick))).toBe("");
  });

  it("asks nothing of the tail, however long the body", () => {
    const long = CFG.snakeGorgeTiles + 4;
    expect(count(asked("p1", long), HALO)).toBe(1);
    expect(count(asked("p2", long), HALO)).toBe(0);
    expect(count(asked("p2", long), CLOCK)).toBe(1);
    expect(count(asked("test", long), HALO)).toBe(1);
  });
});

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
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a press on the wrong seat's part", () => {
  it("is handed through with no hold, so the simulation can refuse it", () => {
    const { world, snake } = playing(GORGE);
    const l = layout("p2");
    const jaws = snakeJawsCircle(l, CFG, snake, world.tick);
    if (jaws === null) throw new Error("no neck");
    const touch = touchDown(l, jaws.x, jaws.y, field(world, 2));
    expect(touch?.player).toBe(2);
    expect(touch?.command).toMatchObject({ kind: "drag", target: "snakeJaws", on: true });
    expect(touch?.hold).toBeNull();
  });

  it("at a desk is signed with the pilot's seat instead", () => {
    const { world, snake } = playing(GORGE);
    const l = layout("test");
    const jaws = snakeJawsCircle(l, CFG, snake, world.tick);
    if (jaws === null) throw new Error("no body");
    expect(snakeGripSeat(l, jaws.x, jaws.y, field(world, 2))).toBe(1);
    const touch = deskDown(l, jaws.x, jaws.y, [2, 1], (seat) => field(world, seat));
    expect(touch?.player).toBe(1);
    expect(touch?.hold).not.toBeNull();
  });
});

const prised: SimEvent = { type: "snakePrise", col: 4, row: 3 };
const refused: SimEvent = { type: "snakeRefuse", col: 4, row: 3, part: "jaws", player: 2 };

describe("SNAKE's verdict on a touch", () => {
  it("keeps the jaws' verdict, fades it and forgets it on reset", () => {
    const marks = new SnakeMarks();
    marks.ingest([prised]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.ingest([refused]);
    expect(marks.verdicts.at(0)?.good).toBe(false);
    marks.update(1);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.ingest([prised]);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  function verdicts(role: ViewRole, key: number, good: boolean, folded = false): string {
    const { world, snake } = playing(GORGE);
    if (folded) snake.crashTick = world.tick;
    const v = new GripVerdicts();
    v.mark(key, good);
    return drawn(role, (ctx, l) => drawSnakeVerdicts(ctx, l, CFG, snake, world.tick, v));
  }

  it("rings the jaws on every screen, since both screens draw them", () => {
    for (const role of ROLES) {
      expect(count(verdicts(role, 0, true), PALETTE.good)).toBeGreaterThan(0);
      expect(count(verdicts(role, 0, false), PALETTE.red)).toBeGreaterThan(0);
    }
  });

  it("draws none on a body folded up", () => {
    expect(verdicts("p1", 0, true, true)).toBe("");
  });

  /** Nine ticks of the round in its play, `said` thrown on the first. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const { world } = playing(GORGE);
    const log: string[] = [];
    runFrames(world, role, 9, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        if (tick === 0) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the round's screen through the takeover, on %s", (role) => {
    expect(count(frames(role, [prised]), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
