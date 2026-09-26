/**
 * The handles `--hold` did not know until 23 September 2026: every name on
 * the wire's own list (`DRAG_TARGETS`, `packages/net/src/command-fields.ts`)
 * that `hold-targets.ts` had no row for — fifty-three of them, from the crank
 * to THE VISE's right lobe.
 *
 * A table rather than four more lists, because the four lists next door were
 * written one row at a time and a row here is a handle's whole story on one
 * line. `hold-targets.ts` folds it into `DRAGS`, `SEAT`, `TARGET`, `NEEDS_ID`
 * and `CARRIES`, and `test/hold-targets.test.ts` holds the union to the wire's
 * list both ways, so a target added to the simulation without a row here is
 * red rather than a usage line six lanes later.
 *
 * **Every row is read off the simulation's hand file**, named in the comment
 * beside it, for the reason `hold-targets.ts` gives: a seat wrong by one is a
 * press the round drops without a sound. The fields:
 *
 * - `seat` — 2 where the hand file refuses player 1. Absent is the pilot's.
 * - `as` — the wire name, where this row is a second seat's thumb on a target
 *   both seats send and so needs a name of its own (`gorgeLobe2`).
 * - `id` — the hand file reads `command.id`: a body, a column, a socket or a
 *   lobe, and which one is the hand file's.
 * - `lift` — the gesture is spent on the lift: the hand file returns on
 *   `command.on` and reads the distance off the command that lets go.
 * - `swipe` — the carry is read while the thumb is down and counted when it
 *   comes off, so a hold is three commands: the grab, the carry, the lift.
 */
export interface Row {
  seat?: 2;
  as?: string;
  id?: true;
  lift?: true;
  swipe?: true;
}

export const ROWS: Record<string, Row> = {
  // `grip-push.ts`: either seat's hand on the body its own grip already holds.
  gripBody: { id: true },
  gripBody2: { seat: 2, as: "gripBody", id: true },
  // `crank.ts`: a bearing, the pilot's.
  crank: {},
  // `gorge-hand.ts`: the pilot pinches an intake, anyone else pries the mouth.
  gorgeLobe: { id: true },
  gorgeLobe2: { seat: 2, as: "gorgeLobe", id: true },
  // `gauge-hand.ts`: his bearing on the needle, her thumb on the band.
  gaugeNeedle: {},
  gaugeBand: { seat: 2 },
  // `fleet-hand.ts`.
  fleetBreach: { seat: 2 },
  fleetRake: {},
  fleetWreck: { seat: 2 },
  // `vane-hand.ts`: the pin is held, the haul is read on the lift.
  vaneArm: {},
  vaneHousing: { seat: 2, lift: true },
  // `snake-controls.ts`: the jaws are prised and let go, the tail is held.
  snakeJaws: { lift: true },
  snakeTail: { seat: 2 },
  // `pinball-hand.ts`: the wind and the nudge are both spent on the lift.
  pinPlunger: { lift: true },
  pinTable: { seat: 2, lift: true },
  // `scout-hand.ts`.
  scoutLine: { seat: 2 },
  scoutPrime: { lift: true },
  // `pulse-hand.ts`: a brace each, on the one meter.
  pulseMeter: {},
  pulseMeter2: { seat: 2, as: "pulseMeter" },
  // `baton-hand.ts`: a thumb each, and `id` is the socket.
  batonSocket: { id: true },
  batonSocket2: { seat: 2, as: "batonSocket", id: true },
  // `undertow-hand.ts`: both hers; the pin's `id` is the lobe's column.
  undertowPin: { seat: 2, id: true },
  undertowFree: { seat: 2 },
  // `curtain-hand.ts`.
  curtainHem: {},
  // `taster-hand.ts`: the blade's and the gap's `id` are columns.
  tasterBlade: { id: true },
  tasterGap: { seat: 2, id: true },
  tasterLock: {},
  // `ledger-hand.ts`.
  ledgerFoot: { seat: 2 },
  ledgerSocket: { seat: 2 },
  ledgerBead: {},
  ledgerCord: {},
  // `lead-hand.ts`, `well-hand.ts`.
  leadStalk: { seat: 2 },
  wellSeam: {},
  // `hive-hand.ts`: his haul on the mass, her pinch on a lobe by `id`.
  hiveLobe: {},
  hiveLobe2: { seat: 2, as: "hiveLobe", id: true },
  // `gimbal-hand.ts`: a ring each.
  gimbalOuter: {},
  gimbalInner: { seat: 2 },
  // `spool-hand.ts`, `hasp-hand.ts`, `ratchet-hand.ts`.
  spoolBrake: {},
  haspLatch: {},
  haspWheel: { seat: 2 },
  ratchetCatch: { seat: 2 },
  ratchetPawl: {},
  // `mantle-hand.ts`: a handle each, and the bared core's tap either seat may
  // send — geometry decides whose pull counts, the finale's own alternation
  // decides whose tap does.
  mantleLeft: {},
  mantleRight: { seat: 2 },
  mantleCore: {},
  // `keel-hand.ts`: a press either seat may send; where the joint sits
  // decides whose counts.
  keelJoint: {},
  // `valve-hand.ts`: the wheel is the pilot's bearing; the pin is the
  // navigator's tap and then either seat's draw.
  valveWheel: {},
  valvePin: { seat: 2 },
  // `oculus-hand.ts`: a leaf each, held down; the pilot's is the left.
  oculusLeafLeft: {},
  oculusLeafRight: { seat: 2 },
  // `vise-hand.ts`: a lobe each, pinched shut; the pilot's is the left.
  viseLobeLeft: {},
  viseLobeRight: { seat: 2 },
  // `instar-hand.ts`: a swipe arms on the carry and counts on the lift. The
  // same wire name as `instarMark`, which holds rather than lets go.
  instarSwipe: { as: "instarMark", id: true, swipe: true },
  instarSwipe2: { seat: 2, as: "instarMark", id: true, swipe: true },
};
