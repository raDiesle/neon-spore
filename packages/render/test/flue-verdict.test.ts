import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { flueBoss, flueTapAsks, type SimEvent, type World } from "@neon-spore/sim";
import { FLUE_CORE_MARK, FLUE_TAP_MARK, FlueVerdicts } from "../src/flue-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { DAMPER, FIRE, posed, rested, stood, VENT } from "./flue-harness.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FLUE's marks answer a touch the way every mark does**
 * (`flue-verdicts.ts`, `.claude/skills/new-boss` §5): once the rester has
 * steadied a vent's ember, the ember wears the halo on the tapper's screen
 * and the partner's ring and clock on the rester's; keeping still is never a
 * mark's to ask, so the tapper's screen waits on nothing; the bared core on a
 * fire step is either seat's, and halos on both screens with nobody's clock;
 * each of the flue's words lands on the mark it names; and the verdict
 * reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      w.events.length = 0;
      if (tick === 2) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

const rest = (w: World) => void posed(w, null);
const steady = (w: World) => void posed(w, VENT, 0, rested(2));
const drifting = (w: World) => void posed(w, VENT);
const bare = (w: World) =>
  void posed(w, FIRE, 0, (s) => {
    s.bared = true;
  });

describe("THE FLUE's marks asking", () => {
  it("asks the tap of the vent's tapper only, and only once the ember is steady", () => {
    const world = stood();
    const s = flueBoss(world);
    if (s === null) throw new Error("no flue");
    const asks = () => [flueTapAsks(world, s, 0), flueTapAsks(world, s, 1)];
    posed(world, VENT);
    expect(asks()).toEqual([false, false]);
    posed(world, VENT, 0, rested(2));
    expect(asks()).toEqual([true, false]);
    posed(world, DAMPER, 0, rested(1));
    expect(asks()).toEqual([false, false]);
  });

  it("haloes the ember on the tapper's screen and waits on it on the rester's", () => {
    expect(halos("p1", steady)).toBeGreaterThan(halos("p1", rest));
    expect(clocks("p1", steady)).toBe(clocks("p1", rest));
    expect(clocks("p2", steady)).toBeGreaterThan(clocks("p2", rest));
    expect(halos("test", steady)).toBeGreaterThan(halos("p2", steady));
    expect(clocks("test", steady)).toBe(clocks("test", rest));
  });

  it("asks nothing of a vent whose ember still drifts", () => {
    expect(halos("p1", drifting)).toBe(halos("p1", rest));
    expect(clocks("p2", drifting)).toBe(clocks("p2", rest));
  });

  it.each(ROLES)("haloes the core on %s once it is bare, and waits on nobody", (role) => {
    expect(halos(role, bare)).toBeGreaterThan(halos(role, (w) => void posed(w, FIRE)));
    expect(clocks(role, bare)).toBe(clocks(role, rest));
  });
});

describe("THE FLUE's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new FlueVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(FLUE_TAP_MARK), at(FLUE_CORE_MARK)];
  };
  const col = 5;
  const n = null;

  it("lands each of the flue's words on the mark it names", () => {
    expect(on([{ type: "flueTick", side: 0, taps: 1, col }])).toEqual([true, n]);
    expect(on([{ type: "flueVent", vents: 1, col }])).toEqual([true, n]);
    expect(on([{ type: "flueHit", hits: 1, col }])).toEqual([n, true]);
    expect(on([{ type: "flueSkid", side: 0, col }])).toEqual([false, n]);
    expect(on([{ type: "flueLapse", side: 1, taps: 2, col }])).toEqual([false, n]);
    expect(on([{ type: "flueChoke", col }])).toEqual([false, n]);
    expect(on([{ type: "flueMiss", col }])).toEqual([n, false]);
    expect(on([{ type: "flueStir", side: 1, col }])).toEqual([n, n]);
    expect(on([{ type: "flueHeld", col }])).toEqual([n, n]);
    expect(on([{ type: "flueShut", col }])).toEqual([n, n]);
  });

  it("forgets on reset", () => {
    const v = new FlueVerdicts();
    v.ingest([{ type: "flueMiss", col }]);
    v.clear();
    expect(v.verdicts.at(FLUE_CORE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const missed: SimEvent[] = [{ type: "flueChoke", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
