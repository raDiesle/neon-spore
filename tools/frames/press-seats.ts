import { CONTROLS, controlPress, controlSetForWave } from "@neon-spore/content";

/**
 * **Whose thumb a `--press` claims to be, checked against the panel being
 * photographed.**
 *
 * Split out of `press.ts` when THE SCOUT's four verbs took that file past its
 * 250-line limit, along the seam it already had: next door is the *command
 * line* — the shape a press is written in and the order a run of them is sent
 * in — and this is the one question asked about each of them before it is
 * sent, *is this seat the seat that has this button?*
 *
 * It matters because the failure it catches is silent. `sim/commands.ts`
 * seat-checks nothing, so a press attributed to the wrong seat is a command
 * nobody sent: the round hears it, drops it, and the frame comes back with
 * nothing in it and no error anywhere. A lane spends a capture finding that
 * out, and the second capture is spent wondering whether the tick was wrong.
 */

/**
 * The presses **no panel carries a button for**, and the only ones whose seat
 * is decided here.
 *
 * Everything else is a control on somebody's panel and is asked of the wave
 * being captured (`seatsOnPanel`). These seven are not:
 *
 * - `fire` is the shot itself. The panel's own colour buttons send `prime`,
 *   and the shot is what *lifting* one says (`content/src/control-command.ts`),
 *   so there is no control whose press is a `fire` — but a rig wants to write
 *   one without spelling out a hold. It is the navigator's, with the cannon
 *   the pilot's, which is the split the whole game is built on.
 * - `grip` is a thumb on a **body**, not on a button: either seat may put one
 *   there, and the field is not a panel.
 * - `tap` is THE BEATBOX's, on the box itself rather than on the band.
 * - `shake` is THE CHOIR's, and is not a thumb at all — the *device* moved
 *   (`sim/choir-gesture.ts`). The pilot's, for the reason every handle on this
 *   field is: the navigator carries both colours and fires.
 * - `snakeJaws` and `snakeTail` are SNAKE's **hands on the body** — the head
 *   prised open, the tail lifted clear (`render/snake-grip.ts`) — and the
 *   round refuses each from the other seat (`sim/snake-controls.ts`): the
 *   jaws are the pilot's, the tail the navigator's.
 *
 * SNAKE's two buttons are **not** here — `snakeFire` and `snakeMaw` are buttons on the
 * pilot's panel and `seatsOnPanel` finds them — but they were missing from the
 * list of accepted presses until 20 September 2026, which meant the spit and
 * the open mouth were two pictures the tool could not take at all. Neither is
 * reachable any other way: `--boss` can set `mawTick` and `shotBeat` to a
 * number, and a beat chosen from outside the page against a clock that is
 * still running is a frame of a shot that has already faded. THE SCOUT's four
 * are not here either, and for the same reason.
 */
const OFF_PANEL_SEAT: Record<string, 1 | 2 | "either"> = {
  fire: 2,
  grip: "either",
  tap: 2,
  shake: 1,
  snakeJaws: 1,
  snakeTail: 2,
};

/**
 * The command a press sends where its own name is the button's rather than the
 * command's. `mawTake` is the ship's own `intake` under another thumb, `crank`
 * is a `drag` on the drum, and THE SCOUT's two arrows are one `scoutTurn`
 * apiece with the direction baked in (`content/src/control-command.ts`).
 */
const COMMAND_OF: Record<string, string> = {
  mawTake: "intake",
  crank: "drag",
  scoutTurnLeft: "scoutTurn",
  scoutTurnRight: "scoutTurn",
};

/**
 * Which seats this wave's own panel gives this press, or `null` where no
 * control on it sends the command at all.
 *
 * `null` is not "refused": a press can be perfectly good on a panel that has
 * no button for it — every `--hold` and every frame test sends commands no
 * thumb could reach — and the seven in `OFF_PANEL_SEAT` are exactly that case.
 * What this answers is the narrower question an older table here got wrong:
 * *when a button for this does exist on the panel being photographed, whose is
 * it?* That table had `intake` down as player 1's — true while the maw was
 * only ever the cannon lobe, and false from the day THE CLAW's panel moved it
 * to the other seat — so a picture of this tool's own boss had to be taken
 * with the press attributed to a seat that never sent it. Which seat has a
 * button is a fact about the **panel**, written down once in `CONTROLS` and
 * `controlSetForWave`, and this reads it there.
 */
function seatsOnPanel(kind: string, wave: number): (1 | 2)[] | null {
  const want = COMMAND_OF[kind] ?? kind;
  const seats = new Set<1 | 2>();
  for (const id of controlSetForWave(wave).controls) {
    if (controlPress(id).down.kind !== want) continue;
    const def = CONTROLS.find((c) => c.id === id);
    if (def) seats.add(def.player);
  }
  return seats.size === 0 ? null : [...seats];
}

/** The fixed seat of an off-panel press, as the one-entry list the check
 * wants, or `null` for one either seat may send. */
function whoseSeat(kind: string): (1 | 2)[] | null {
  const seat = OFF_PANEL_SEAT[kind];
  return seat === undefined || seat === "either" ? null : [seat];
}

/** Refuses a press written on a seat this wave's panel does not give it, and
 * says nothing at all about one it does. */
export function refuseWrongSeat(
  kind: string,
  player: 1 | 2,
  wave: number,
  one: string,
  whole: string,
): void {
  const seats = seatsOnPanel(kind, wave) ?? whoseSeat(kind);
  if (seats === null || seats.includes(player)) return;
  throw new Error(
    `--press ${whole}: "${one}" — on this wave's panel ${kind} is player ${seats.join(" or ")}'s, ` +
      "and a press from the other seat is one nobody sent, so the frame would come back with " +
      "nothing in it and no error anywhere",
  );
}
