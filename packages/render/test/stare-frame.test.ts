import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Command,
  createWorld,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bandLobes } from "../src/band-lobes.js";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE STARE's eye — turned away, turning, looking, turning back — on all
 * three screens.
 *
 * The phases are **set** rather than played to, `hive-frame.test.ts`'s
 * arrangement: `sim/test/stare.test.ts` proves the cycle, the roll and the
 * catch, and what this file asks is whether every angle of the picture is
 * one a canvas accepts, and the three things nothing else in the suite could
 * catch: that the seat's **name** is on the other seat's screen and not the
 * watched one's, that the **gaze** is on the watched seat's and not the
 * other's, and that the flash of a catch is a transient the next run does
 * not inherit.
 *
 * **The lid** (`stare-lid.ts`) is the same arrangement: the flap is on every
 * screen, the ring on the one seat whose thumb the simulation hears, and the
 * two events it leaves behind are transients of `Effects`.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** A world with the eye in, stepped past beat zero so a `phaseBeat` set in the past is a beat it saw. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function eye(world: World): StareState {
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  return s;
}

/** Looking elsewhere, nobody chosen. */
function away(world: World): StareState {
  const s = eye(world);
  s.phase = "away";
  s.phaseBeat = world.beat - 1;
  s.watching = 0;
  return s;
}

/** Three beats into the turn towards `who`. */
function turning(world: World, who: 1 | 2 = 1): StareState {
  const s = away(world);
  s.phase = "turning";
  s.phaseBeat = world.beat - 3;
  s.watching = who;
  return s;
}

/** The look on `who`, a beat in. */
function looking(world: World, who: 1 | 2 = 1): StareState {
  const s = away(world);
  s.phase = "looking";
  s.phaseBeat = world.beat - 1;
  s.watching = who;
  s.lookBeats = CFG.stareLookBeats;
  return s;
}

/** The look on `who`, with the lid half down under `lidSeat`'s thumb — or nobody's. */
function lidded(world: World, who: 1 | 2, lidSeat: 0 | 1 | 2): StareState {
  const s = looking(world, who);
  s.lidSeat = lidSeat;
  s.lidMilli = lidSeat === 0 ? 0 : CFG.stareLidPullMilli / 2;
  return s;
}

/** The lid shut by `who`'s partner, a beat in, or on its way up again. */
function lidPhase(world: World, phase: "shut" | "opening", who: 1 | 2): StareState {
  const s = looking(world, who);
  s.phase = phase;
  s.lidSeat = who === 1 ? 2 : 1;
  s.lidMilli = phase === "shut" ? CFG.stareLidPullMilli : 0;
  return s;
}

/** Turning away again, a beat in. */
function back(world: World): StareState {
  const s = away(world);
  s.phase = "back";
  s.phaseBeat = world.beat - 1;
  return s;
}

interface Drawn {
  calls: number;
  text: string;
  /** Every word `fillText` was given, in order. */
  words: string[];
}

function drawn(world: World, role: ViewRole, ticks: number): Drawn {
  const log: string[] = [];
  const boxes: TextBox[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
      c.texts = boxes;
    },
  });
  return { calls: ctx.calls, text: log.join("|"), words: boxes.map((b) => b.text) };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the eye set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): Drawn {
  const world = hung();
  away(world);
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE STARE's eye", () => {
  it.each(ROLES)("draws the cowled eye at every angle on %s", (role) => {
    const still = frame(role, away);
    expect(still.calls).toBeGreaterThan(100);
    expect(still.text).toContain(PALETTE.rockDark);
    // Turning is another picture than away, looking another than turning,
    // and back another than looking: four angles, none of them the same.
    const turn = frame(role, (w) => turning(w));
    const look = frame(role, (w) => looking(w));
    const off = frame(role, back);
    expect(turn.text).not.toBe(still.text);
    expect(look.text).not.toBe(turn.text);
    expect(off.text).not.toBe(look.text);
  });

  it.each(ROLES)("counts the tell down under the eye on %s", (role) => {
    // Three beats in is another picture than one beat in: a pip has gone out.
    const early = frame(role, (w) => {
      turning(w).phaseBeat = w.beat - 1;
    });
    const late = frame(role, (w) => turning(w));
    expect(late.text).not.toBe(early.text);
  });

  it("names the chosen seat on the other seat's screen and not its own", () => {
    // The word is text; a screen that draws it draws one more fillText than
    // the same eye with nobody chosen.
    const named = (role: ViewRole, who: 1 | 2) =>
      count(frame(role, (w) => turning(w, who)).text, "fillText");
    const bare = (role: ViewRole) => count(frame(role, away).text, "fillText");
    expect(named("p2", 1)).toBeGreaterThan(bare("p2"));
    expect(named("p1", 1)).toBe(bare("p1"));
    expect(named("p1", 2)).toBeGreaterThan(bare("p1"));
    expect(named("p2", 2)).toBe(bare("p2"));
    expect(named("test", 1)).toBeGreaterThan(bare("test"));
    expect(named("test", 2)).toBeGreaterThan(bare("test"));
    // And it says which. The two names are one width since they became P1
    // and P2, so it is the word that is asked, not the picture.
    expect(frame("test", (w) => turning(w, 1)).words).toContain("P1");
    expect(frame("test", (w) => turning(w, 2)).words).toContain("P2");
    expect(frame("test", (w) => turning(w, 2)).words).not.toContain("P1");
  });

  it("lays the gaze on the watched seat's field and not the other's", () => {
    // The gaze is a gradient down the field; the screen it falls on draws
    // one, and the screen it does not is the same picture as a look at the
    // other seat but for the word.
    const gaze = (role: ViewRole, who: 1 | 2) =>
      count(frame(role, (w) => looking(w, who)).text, "createLinearGradient");
    expect(gaze("p1", 1)).toBeGreaterThan(gaze("p1", 2));
    expect(gaze("p2", 2)).toBeGreaterThan(gaze("p2", 1));
    expect(gaze("test", 1)).toBe(gaze("test", 2));
    expect(gaze("test", 1)).toBeGreaterThan(gaze("p1", 2));
  });

  it.each(ROLES)("brings the lid down over the eye on %s, wherever the thumb is", (role) => {
    // The flap is one more fill of the cowl's rock, and it is on every
    // screen: a watched seat has to see the lid come down to know it is free.
    const open = frame(role, (w) => lidded(w, 1, 0));
    const half = frame(role, (w) => lidded(w, 1, 2));
    expect(count(half.text, PALETTE.rockDark)).toBeGreaterThan(count(open.text, PALETTE.rockDark));
    // Shut is another picture than half down, and opening another than shut.
    const shut = frame(role, (w) => lidPhase(w, "shut", 1));
    const rising = frame(role, (w) => lidPhase(w, "opening", 1));
    expect(shut.text).not.toBe(half.text);
    expect(rising.text).not.toBe(shut.text);
  });

  it("draws the lid's handle on the seat the eye is not on, and never the watched one", () => {
    // A lid half down fills its channel green behind the knob (`pull-track.ts`)
    // — the one green in the picture — so the screens that draw the handle
    // are the screens that draw that green.
    const gauge = (role: ViewRole, arrange: (w: World) => void) =>
      count(frame(role, arrange).text, PALETTE.good);
    expect(gauge("p2", (w) => lidded(w, 1, 2))).toBeGreaterThan(0);
    expect(gauge("p1", (w) => lidded(w, 1, 2))).toBe(0);
    expect(gauge("p1", (w) => lidded(w, 2, 1))).toBeGreaterThan(0);
    expect(gauge("p2", (w) => lidded(w, 2, 1))).toBe(0);
    // Both seats on one screen is both: a ring for either look.
    expect(gauge("test", (w) => lidded(w, 1, 2))).toBeGreaterThan(0);
    expect(gauge("test", (w) => lidded(w, 2, 1))).toBeGreaterThan(0);
    // While the eye is forcing the lid up there is no ring for anyone: the
    // eye has it, not a thumb.
    expect(gauge("p2", (w) => lidPhase(w, "opening", 1))).toBe(0);
    expect(gauge("test", (w) => lidPhase(w, "opening", 1))).toBe(0);
  });

  it("keeps the lid's landing and the eye's strain as transients the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "stareShut", player: 2 }], L, 0, () => 0, CFG);
    // A puff of rock, and no flash: nothing was caught.
    expect(fx.boss.stare.flash).toBe(0);
    expect(fx).not.toEqual(new Effects());
    fx.ingest([{ type: "stareOpen", player: 2, forced: true }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    // The strain is a lesser flash with no seat under it, so no panel lights.
    expect(fx.boss.stare.flash).toBeGreaterThan(0);
    expect(fx.boss.stare.flash).toBeLessThan(0.6);
    expect(fx.boss.stare.caught).toBe(0);
    fx.reset();
    expect(fx).toEqual(new Effects());
  });

  it("keeps the flash of a catch as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [{ type: "stareCaught", player: 1, command: { kind: "cannonCol", col: 3 } }],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx.boss.stare.flash).toBeGreaterThan(0);
    expect(fx.boss.stare.caught).toBe(1);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });

  it("washes the caught seat's panel for a press with no button, and not the other's", () => {
    // The same frames with and without the catch, and the press is the cannon
    // strip — a verb no circle on the band sends, so the fallback is what is
    // drawn: on the caught seat's screen the panel is one more red rectangle,
    // and on the other's nothing moved.
    const run = (role: ViewRole, caught: boolean) => {
      const world = hung();
      looking(world, 1);
      const log: string[] = [];
      runFrames(world, role, 6, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          step(w, []);
          if (caught && tick === 1) {
            w.events.push({
              type: "stareCaught",
              player: 1,
              command: { kind: "cannonCol", col: 3 },
            });
          }
        },
      });
      return log.join("|");
    };
    // The wash is one rectangle from the band's top to the bottom of the
    // screen; the burst out of the eye is on both screens by design, so the
    // count is of a rectangle starting at the band's top and not of every
    // `fillRect`. (The width is the renderer's own, which is not the layout
    // this file computes, so the top is what identifies it.)
    const wash = (role: ViewRole, caught: boolean) =>
      count(run(role, caught), `fillRect(0, ${computeLayout(VIEWPORT, CFG, role).bandTop}, `);
    expect(wash("p1", true)).toBeGreaterThan(0);
    expect(wash("p1", false)).toBe(0);
    expect(wash("p2", true)).toBe(0);
    expect(count(run("p2", true), PALETTE.red)).toBeGreaterThan(
      count(run("p2", false), PALETTE.red),
    );
  });

  it("puts the flash on the button the caught press came through", () => {
    // The design is *flash on the button somebody pressed anyway*, and until
    // 21 September 2026 every catch washed the whole panel because nothing in
    // `render/` could turn a command back into a circle. `controlSays` does,
    // so this asks the same `bandLobes` the band draws from where the circle
    // is and then looks for a flash on it.
    const set = controlSet("default");
    const drawn = (command: Command) => {
      const fx = new Effects();
      fx.ingest([{ type: "stareCaught", player: 1, command }], L, 0, () => 0, CFG);
      const { ctx } = stubCanvas();
      const log: string[] = [];
      ctx.log = log;
      fx.boss.stare.drawCaught(ctx as unknown as CanvasRenderingContext2D, L, "p1", set);
      return log.join("|");
    };
    const shown = (n: number) => Math.round(n * 1000) / 1000;
    const guard = bandLobes(L, set, 1).find((b) => b.control.id === "guard");
    if (guard === undefined) throw new Error("the standard panel has no trigger for player 1");
    // A press that came through a button: the circle lights and the panel is
    // left alone.
    const pressed = drawn({ kind: "guard" });
    expect(pressed).toContain(`arc(${shown(guard.circle.x)}, ${shown(guard.circle.y)}, `);
    expect(pressed).not.toContain("fillRect(");
    // And a press with no button — the strip a thumb slid, which is a column
    // and not a circle — still washes the panel it came from.
    const slid = drawn({ kind: "cannonCol", col: 3 });
    expect(slid).toContain(`fillRect(0, ${shown(L.bandTop)}, `);
    expect(slid).not.toContain("arc(");
  });

  it("tells the two colours apart, which a command kind alone cannot", () => {
    // Both trigger lobes send `prime`, so the colour is the only thing that
    // says which circle the thumb was on — and it is why the event carries the
    // whole command rather than `command.kind` (`sim/events-stare.ts`).
    const set = controlSet("default");
    const fx = new Effects();
    fx.ingest(
      [{ type: "stareCaught", player: 2, command: { kind: "prime", on: true, color: "cyan" } }],
      L,
      0,
      () => 0,
      CFG,
    );
    const { ctx } = stubCanvas();
    const log: string[] = [];
    ctx.log = log;
    fx.boss.stare.drawCaught(ctx as unknown as CanvasRenderingContext2D, L, "p2", set);
    const shown = (n: number) => Math.round(n * 1000) / 1000;
    const lobe = (id: string) => bandLobes(L, set, 2).find((b) => b.control.id === id);
    const cyan = lobe("fireCyan");
    const red = lobe("fireRed");
    if (cyan === undefined || red === undefined)
      throw new Error("the standard panel lost a colour");
    expect(log.join("|")).toContain(`arc(${shown(cyan.circle.x)}, ${shown(cyan.circle.y)}, `);
    expect(log.join("|")).not.toContain(`arc(${shown(red.circle.x)}, ${shown(red.circle.y)}, `);
  });
});
