import type { PlayerId } from "@neon-spore/net";

/**
 * The two presses that stand between a full room and beat zero.
 *
 * Beat zero used to be stamped the moment the second phone landed, three
 * seconds ahead, on the ground that two people need a moment to look up from
 * the code they were reading out and say "go". They do — but a timer cannot
 * know whether they have, and a pair dropped onto a field mid-sentence has
 * lost the wave before it started. Only the two people can say they are ready.
 * So the room stamps nothing until both seats have pressed, and this holds
 * which of them have.
 *
 * It is deliberately not a count. A seat that presses twice is one ready seat,
 * and a seat that leaves takes its press with it — neither is expressible with
 * a number, and both are how the gate is actually exercised: a thumb lands
 * twice on a phone, and a partner walks off while the other is still deciding.
 *
 * Nothing here is stored. A room that hibernates has no sockets, so it has no
 * seats, so there is nothing for a press to be half of; the pair presses again
 * when they are both back, which is the same thing they would have done.
 */
export class StartGate {
  private readonly pressed = new Set<PlayerId>();

  /**
   * Record a press. Answers whether the pair is now complete — both seats
   * pressed **and** both seats still here, because a press from a seat whose
   * partner has gone is a press with nobody to start with.
   */
  press(player: PlayerId, seatCount: number): boolean {
    this.pressed.add(player);
    return this.pressed.size >= 2 && seatCount >= 2;
  }

  /** Whether this seat has already pressed, so a second thumb changes nothing. */
  has(player: PlayerId): boolean {
    return this.pressed.has(player);
  }

  /** A seat left. Its press goes with it. */
  drop(player: PlayerId): void {
    this.pressed.delete(player);
  }

  /** The presses belong to the run they started; the next one needs its own. */
  clear(): void {
    this.pressed.clear();
  }

  /** Who has pressed, in seat order — the whole set, for the wire. */
  players(): PlayerId[] {
    return [...this.pressed].sort();
  }
}

/**
 * Whether a seat leaving has ended the run, so beat zero must be thrown away.
 *
 * A lockstep that waits for nobody waits for ever, which is what the client
 * already calls `lost` — so a room below two seats holds no run, whatever its
 * stamp says. Keeping the stamp is what breaks a rejoin: the phone that comes
 * back is handed the old beat zero, starts from tick 0 against a partner six
 * hundred ticks in, and the two of them stall at each other for ever. That is
 * what `relay:check --rejoin` reported before this existed.
 *
 * The pair presses again when they are both back, which is the same thing the
 * gate asks of them the first time.
 */
export function emptiedRoom(seatCount: number, startMs: number): boolean {
  return seatCount < 2 && startMs !== 0;
}
