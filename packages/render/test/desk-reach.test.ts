import { describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  bossFromWave,
  controlSetForWave,
  podsFromWave,
  queueFromWave,
  WAVES,
} from "@neon-spore/content";
import {
  capstanLitStep,
  createWorld,
  pulseBarAsks,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { deskDown, markSeat } from "../src/desk-grab.js";
import { onlySeat, pointerSeats } from "../src/desk-seat.js";
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
/**
 * The beats each boss is sampled on, every other one, with nobody playing —
 * long enough for a fight with no hands on it to come round to every phase
 * it reaches on its own. THE STARE's lid first answers at beat 18.
 */
const BEATS = 96;
/** Grid pitch, as a share of a tile — fine enough for a freeze mark. */
const PITCH = 0.4;

/**
 * **Handles either seat takes to the same end**, so the test screen's mouse
 * taking player 1's has taken it: compared without the seat, under one name —
 * always, or only while `when` holds. Everything else is that seat's own, and
 * a desk that cannot reach it is short.
 */
const EITHER: Record<string, { as: string; when?: (w: World) => boolean }> = {
  // A hand on a body is a brake or a pull from either seat, an aim only the
  // pilot's (`sim/hand.ts`), and player 1 is tried first.
  grip: { as: "grip" },
  // Either thumb turns the organ (`sim/antiphon-hand.ts`).
  antiphonOrgan: { as: "antiphonOrgan" },
  // Either seat pulls the lid, and the first thumb on it keeps it (`sim/stare-hand.ts`).
  stareLid: { as: "stareLid" },
  // Either seat taps a tall lobe (`sim/undertow-press.ts`).
  undertowTap: { as: "undertowTap" },
  // The works are one zone for both chords, and either brakes outside a tap;
  // inside one only the governing seat's answers at all (`governor-grip.ts`).
  governorChordLeft: { as: "governorChord" },
  governorChordRight: { as: "governorChord" },
  // The bar asking both thumbs at once, or neither: one mouse is not two
  // thumbs, and `3` is the key that braces both (`desk-seat.ts`).
  pulseMeter: { as: "pulseMeter", when: (w) => pulseAsksOne(w) === undefined },
  // No step lit, so nobody steers and nobody wears (`sim/capstan.ts`).
  capstanRub: { as: "capstanRub", when: (w) => capstanUnlit(w) },
  capstanSteer: { as: "capstanSteer", when: (w) => capstanUnlit(w) },
};

function pulseAsksOne(w: World): 1 | 2 | undefined {
  const b = w.boss;
  return b?.kind === "pulse" ? onlySeat((seat) => pulseBarAsks(w.cfg, b, seat)) : undefined;
}

function capstanUnlit(w: World): boolean {
  return w.boss?.kind === "capstan" && capstanLitStep(w.boss) === null;
}

/** What a press takes hold of, by seat, so two presses on one handle compare equal. */
function handle(t: Touch, world: World): string {
  const hold = t.hold as { kind: string; target?: string } | null;
  const command = t.command as { kind: string; target?: string } | null;
  const name = hold ? (hold.target ?? hold.kind) : (command?.target ?? command?.kind ?? "-");
  const either = EITHER[name];
  if (either === undefined || (either.when && !either.when(world))) return `p${t.player} ${name}`;
  return `either ${either.as}`;
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
        if (t !== null && t.player === seat) seated.add(handle(t, world));
      }
      const t = deskDown(L, x, y, BOTH, field);
      if (t !== null) desk.add(handle(t, world));
    }
  }
  return [...seated].filter((h) => !desk.has(h));
}

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
      expect([...missed]).toEqual([]);
    },
  );
});
