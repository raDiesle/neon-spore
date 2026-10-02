import { describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  bossFromWave,
  controlSetForWave,
  podsFromWave,
  queueFromWave,
  WAVES,
} from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { deskDown, markSeat } from "../src/desk-grab.js";
import { pointerSeats } from "../src/desk-seat.js";
import { computeLayout } from "../src/layout.js";
import { type Field, type Touch, touchDown } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

/**
 * **Every boss's handles can be reached from TEST's one mouse.**
 *
 * The owner, 2 October 2026: *on THE CYST, at the beginning, under TEST the
 * tap does not work, but under PLAYER 2 it does — I expect it to work for all
 * bosses.* The navigator's freeze mark stands inside the pilot's pinch zone,
 * and a press with no seat key is tried for player 1 first (`desk-grab.ts`), so
 * the pilot's pinch answered every point of the mark and the tap was never
 * asked for. Nothing pinned it, because each boss's grip test asks its own
 * seats one at a time, and a seated screen never has two to choose between.
 *
 * So this asks the question once for every boss: over the first beats of its
 * wave, on a grid over the field, **whatever either seat could take alone
 * somewhere, the test screen takes somewhere too**, signed with that seat. A
 * handle that fails is one more `markSeat` entry, the way the sixteen before
 * it were.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
const BOTH = pointerSeats("test", undefined);
const TPB = ticksPerBeat(CFG);
/** The opening beats each boss is sampled on, every other one. */
const BEATS = 16;
/** Grid pitch, as a share of a tile — fine enough for a freeze mark. */
const PITCH = 0.4;

/** What a press takes hold of, by seat, so two presses on one handle compare equal. */
function handle(t: Touch): string {
  const hold = t.hold as { kind: string; target?: string } | null;
  const command = t.command as { kind: string; target?: string } | null;
  return `p${t.player} ${hold?.kind ?? "-"}:${hold?.target ?? ""} ${command?.kind ?? "-"}:${command?.target ?? ""}`;
}

function fieldOf(world: World, wave: number, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    // The stage's own: the hull's lobes do not answer the mouse (`stage-field.ts`).
    ship: false,
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
    slow: world,
    controls: controlSetForWave(wave),
    faults: [],
    well: false,
  };
}

/** The handles a seat could take alone that the test screen's mouse never takes. */
function unreached(world: World, wave: number): string[] {
  const field = (seat: 1 | 2) => fieldOf(world, wave, seat);
  const seated = new Set<string>();
  const desk = new Set<string>();
  const pitch = L.tile * PITCH;
  // The field only: the band is signed by the half a press lands on, whoever asks.
  for (let y = 0; y < L.bandTop; y += pitch) {
    for (let x = L.gridLeft; x <= L.gridLeft + L.gridWidth; x += pitch) {
      // A mark that answers either seat and names one: the other's press
      // there is the simulation's to refuse, and not a handle of theirs.
      const named = markSeat(L, x, y, field(1));
      for (const seat of BOTH) {
        if (named !== undefined && named !== seat) continue;
        const t = touchDown(L, x, y, field(seat));
        if (t !== null && t.player === seat) seated.add(handle(t));
      }
      const t = deskDown(L, x, y, BOTH, field);
      if (t !== null) desk.add(handle(t));
    }
  }
  return [...seated].filter((h) => !desk.has(h));
}

/**
 * The bosses the check found short on the day it was written, each fixed in
 * its own commit and struck off here. A name still on the list is asserted
 * still short, so the fix that lands it is told to take it off.
 */
const PENDING = new Set([
  "BULB QUEEN",
  "THE VANE",
  "THE PULSE",
  "THE UNDERTOW",
  "THE CURTAIN",
  "THE LEAD",
  "THE ANTIPHON",
  "THE CAIRN",
  "THE FILAMENT",
  "THE KEEL",
  "THE HALTER",
  "THE CAPSTAN",
  "THE FLUE",
  "THE GOVERNOR",
  "THE LAMPREY",
]);

const BOSSES = WAVES.flatMap((w, index) => (w.boss ? [{ wave: w, index }] : []));

describe("TEST's one mouse", () => {
  it.each(BOSSES.map((b) => [b.wave.name, b] as const))(
    "reaches every handle either seat could on %s",
    (_, { wave, index }) => {
      const world = createWorld(CFG, index);
      startWave(
        world,
        index,
        queueFromWave(wave, CFG.cols),
        podsFromWave(wave, CFG.cols),
        bossFromWave(wave, CFG.cols),
      );
      const missed = new Set<string>();
      for (let beat = 0; beat < BEATS && !world.over; beat += 2) {
        for (const h of unreached(world, index)) missed.add(`beat ${beat}: ${h}`);
        for (let i = 0; i < 2 * TPB && !world.over; i++) step(world, []);
      }
      if (PENDING.has(wave.name)) expect(missed.size).toBeGreaterThan(0);
      else expect([...missed]).toEqual([]);
    },
  );
});
