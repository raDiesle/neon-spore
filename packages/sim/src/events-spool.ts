/**
 * What THE SPOOL says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The casing hangs across the middle of the field, so everything the
 * spool itself does is heard in the middle (`spoolCol`) and the one thing it
 * throws is heard down the column it was thrown at.
 *
 * **Nothing here ever carries a rate, a depth or a zone.** Those are the two
 * halves the pair has to say to each other (`SplitGauge`), and a sound that
 * carried either would be handing a seat the other's half through the
 * speaker — which on this boss is the whole fight given away.
 */

interface SpoolColEvent {
  /** The column it happened over. */
  col: number;
}

export type SpoolEvent =
  /** The spool swings in sideways across the top, line taut, four ribs whole. */
  | ({ type: "spoolEnter" } & SpoolColEvent)
  /** A movement opens: a zone on the navigator's screen, `ribs` still on the casing. */
  | ({ type: "spoolZone"; ribs: number } & SpoolColEvent)
  /** The zone has moved mid-movement: `leg` is which correction this is, nought-based. */
  | ({ type: "spoolLeg"; leg: number } & SpoolColEvent)
  /** The pilot took hold of the brake. */
  | ({ type: "spoolGrip" } & SpoolColEvent)
  /** The pilot came off the brake, and the line runs at its fastest again. */
  | ({ type: "spoolLet" } & SpoolColEvent)
  /** A press on the brake from the navigator, whose it is not: refused, and nothing moved. */
  | ({ type: "spoolRefuse"; player: 1 | 2 } & SpoolColEvent)
  /** The line left the zone: the movement resets and runs from its head again. */
  | ({ type: "spoolSlip" } & SpoolColEvent)
  /** The slack threw a rock down the pilot's column — the fight's one hazard. */
  | ({ type: "spoolRock" } & SpoolColEvent)
  /** A whole movement held inside the zone: a rib eases, and `ribs` is what is left. */
  | ({ type: "spoolRib"; ribs: number } & SpoolColEvent)
  /** The snag (§21 S1): the line caught on the casing and stopped dead, the spool shuddering. */
  | ({ type: "spoolSnag" } & SpoolColEvent)
  /** Let right off and gripped again: the snag slips free and the line runs. */
  | ({ type: "spoolFree" } & SpoolColEvent)
  /** The snag run out: the snagged line snaps taut against the hull, and snags again. */
  | ({ type: "spoolSnap" } & SpoolColEvent)
  /** The whip (§21 S2): the freed line thrown in a loop across the field. */
  | ({ type: "spoolWhip" } & SpoolColEvent)
  /** Held full deep long enough: the loop damps flat. */
  | ({ type: "spoolDamp" } & SpoolColEvent)
  /** The whip run out: the loop lashes the hull, and is thrown again. */
  | ({ type: "spoolLash" } & SpoolColEvent)
  /** The fray (§21 S3): the line frays, fibres standing off it. */
  | ({ type: "spoolFray" } & SpoolColEvent)
  /** Held featherlight long enough: the fray holds, and the last rib can ease. */
  | ({ type: "spoolFeather" } & SpoolColEvent)
  /** The fray run out: a strand snaps and whips the hull, and the line frays again. */
  | ({ type: "spoolStrand" } & SpoolColEvent)
  /** The fourth rib: every tension gone and the line loose, under THE SLOW. */
  | ({ type: "spoolSlack" } & SpoolColEvent)
  /** The unspooled casing drifting off the top of the field, line trailing. */
  | ({ type: "spoolDrift" } & SpoolColEvent)
  /** It has drifted `spoolSlackBeats`; the wave may end. */
  | ({ type: "spoolOut" } & SpoolColEvent);
