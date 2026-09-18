import type { Color } from "./types.js";

/**
 * Everything the Bulb Queen encounter remembers between beats. It lives in
 * its own file rather than in `types.ts` because it is not a shared shape:
 * `boss.ts` and `queen-mark.ts` own every field here between them, and
 * nothing else may write one.
 */

export interface QueenState {
  kind: "queen";
  /** The id of the queen in `world.creatures`. */
  creatureId: number;
  /** 0-based phase index. */
  phase: number;
  /** The world beat the current phase started on. */
  phaseBeat: number;
  /** The column the announced bloom will open in, -1 when nothing is announced. */
  tellCol: number;
  /** The colour that bloom is vulnerable to. */
  tellColor: Color | null;
  /**
   * Which of the two marks — one tile either side of her own column — is
   * real this bloom. The other looks identical the whole time it is open
   * and never takes a hit (`queen-mark.ts`).
   */
  weakSide: -1 | 1;
  /**
   * The beat `tellColor` and `weakSide` were last chosen on. render/ runs the
   * mark's morph from one creature into the other off this, so the animation
   * needs no state of its own that a restart could carry over.
   */
  pickBeat: number;
  /**
   * The mark that stayed shut on the bloom that just closed — the one render/
   * balls up and then grows back into the next creature. 0 until the first
   * bloom has closed, which is what keeps a wave from opening on a mark
   * already halfway through shrinking.
   */
  spentSide: -1 | 0 | 1;
  /** The beat the announced bloom opens on, -1 for none. */
  openBeat: number;
  /** The first beat it is closed again, -1 for none. */
  closeBeat: number;
  /**
   * The beat player 1's thumb pried the real mark open, -1 while none has —
   * the one moment of a `pry` bloom the picture cannot read off `openBeat`,
   * because under that gesture the opening is his and not the clock's
   * (`queen-hand.ts`). Forgotten with the rest of the timing.
   */
  pryBeat: number;
  /**
   * The mark player 1's thumb is resting on: -1 left, 1 right, 0 none. Only
   * `hold` reads it — a thumb on the real mark is what keeps a SCREAM bloom
   * open past its one beat (`holdBloom`) — and it is stored rather than
   * derived for THE WARDEN's reason below: a finger held still sends nothing.
   */
  holdSide: -1 | 0 | 1;
  /** Petals she started the fight with, so a drop in petals can be measured. */
  startPetals: number;
  /** The side her next scripted rock will emerge from: -1 left, 1 right, 0 none pending. */
  dropSide: -1 | 0 | 1;
  /** The beat her last torch broke off her, -1 before the first one has. */
  releaseBeat: number;
  /** Which side it broke off: -1 left, 1 right, 0 none yet. */
  releaseSide: -1 | 0 | 1;
  /** Integers owned by `boss.ts`. Nothing outside it reads them. */
  scratch: number[];
}

/**
 * Everything the Warden encounter remembers between beats — which is
 * deliberately little. Its cycle number, the rim's colour and the phase are all
 * *derived* from `world.waveBeat` and the plates (`warden-cycle.ts`), because a
 * fight with nothing random in it should have nothing to disagree about either.
 *
 * What is left is what cannot be derived: which line is live, where the pupil
 * has drifted to, and where the pulling hand is. The last of those is stored
 * rather than derived for a reason a phone makes plain — a finger held perfectly
 * still sends no messages at all, so tension that was recomputed from the last
 * command would go slack every time somebody stopped moving.
 */
export interface WardenState {
  kind: "warden";
  /** The id of the ring in `world.creatures`. */
  creatureId: number;
  /** The id of the live tether, or `0` while nothing is hanging. */
  tetherId: number;
  /** The column the pupil is in. It drifts; the body never moves. */
  pupilCol: number;
  /** Which way the pupil is drifting: 1 right, -1 left. */
  pupilDir: -1 | 1;
  /** Plates left on the rim. The silhouette is the health bar. */
  plates: number;
  /**
   * Whether this line's opening has already taken its one hit. It is also what
   * `stepWardenTether` reads to snap the rope back, so it is cleared at the
   * attach that replaces the line and nowhere else.
   */
  eyeSpent: boolean;
  /** Whether a hand is on the handle at all. */
  pulling: boolean;
  /**
   * Where that hand was when it grabbed, in thousandths of a tile of its own
   * device's displacement. The origin never crosses the wire (`Command` in
   * `types.ts`); this is the sim's copy of the one the pulling device resolved.
   */
  pullOriginMilli: number;
  /** The same, down the screen. Absent from the wire before the pull became a
   * circle, so it is nought on every replay recorded until then. */
  pullOriginYMilli: number;
  /**
   * How far the handle has been carried across the field, in thousandths of a
   * tile — the x of a pull that may now go any way at all.
   */
  pullMilli: number;
  /**
   * And how far down. The pair of them is the pull, and its **length** is the
   * tension — `pullIsTaut` compares the two squares rather than taking a root,
   * so the rule has no rounding in it at all (`handle-pull.ts`).
   *
   * Both are the picture as well as the rule: the rope is drawn running to
   * wherever the hand carried it, and one thing player 2 can see about their
   * partner's hand has to be the thing it is actually doing.
   */
  pullYMilli: number;
  /**
   * Where the handle was when the hand took it, in thousandths of a tile, held
   * there until the hand lets go. The handle is this plus the pull, so it stays
   * exactly under the finger — one hung off the rope's rest *today* slid out
   * from under a still thumb as the pupil drifted (`wardenHandleMilli`).
   */
  pullAnchorX: number;
  pullAnchorY: number;
  /**
   * Whether player 2's thumb is resting on the eye. Under NARROW the lids
   * behind the hatch only part while it is (`warden-open.ts`), and the pupil
   * stands still under it. Cleared with the line, the way `pulling` is: a
   * fresh line asks for a fresh thumb (`warden-hand.ts`).
   */
  eyeHeld: boolean;
  /**
   * The beat player 1 threw the hatch on under GLARE, or -1 while it is shut.
   * Open until `wardenThrowBeats` have passed, then slammed by `stepWarden`.
   * There is no line under GLARE, so this is the only way the eye shows.
   */
  throwBeat: number;
}

/**
 * Everything THE VANE remembers between beats, which is four integers.
 *
 * Where the arm is standing, how far it reaches, whether the bearing is split
 * and which side of it, what colour that side carries — all of it is derived
 * from the wave's beat and the pins (`vane-cycle.ts`). What cannot be derived
 * is how many pins are left, which opening has already spent its one shot, and
 * the last thing the arm threw, which is render/'s to draw and nobody else's.
 */
export interface VaneState {
  kind: "vane";
  /** Pins left in the bearing. Each one gone lets the arm slip further out. */
  pins: number;
  /**
   * The opening whose one shot has been spent, -1 for none yet. An index and
   * not a flag: openings are numbered from the start of the wave, so "already
   * spent" is one integer against another and nothing has to remember to clear
   * itself when the housing shuts.
   */
  spentOpening: number;
  /** The beat the arm last threw an arrival, -1 before the first. render/ only. */
  throwBeat: number;
  /** The column that arrival was thrown into, -1 before the first. render/ only. */
  throwCol: number;
}

export type { FleetState } from "./fleet-state.js";
