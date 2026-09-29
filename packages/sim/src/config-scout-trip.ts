/**
 * **THE SCOUT's trip**: how the little ship is put out, how much it may carry,
 * how the mother ship takes it back, and when the pilot is shown the arena
 * (`scout-open.ts`, `scout-arena.ts`, `scout-reveal.ts`).
 *
 * The owner's pass of 29 September 2026, each field one sentence of it: *the
 * ship should go out immediately … one tile above cannon*; *snap each 45
 * degree and not so fast*; *one must be collected after another and sucked
 * each*; *suck range is around 2 tiles around the suck cannon position*; and
 * *every 5 seconds player 1 sees for a brief moment all obstacles and
 * powerups, and after 1 beat on game start*.
 *
 * Its own file because `config-scout.ts` was at 189 lines and these are one
 * pass, read together; `ScoutConfig` extends it, so every call site still
 * reads `cfg.scoutCarryMax`.
 */
export interface ScoutTripConfig {
  /**
   * How far above the middle of home the ship is let go, in thousandths of a
   * tile. 1000: one tile over the cannon's socket, so the ship is out where
   * both seats are already looking on the first tick of the round.
   */
  scoutLaunchMilli: number;
  /**
   * Ticks between two 45° steps of the nose while a turn is held.
   *
   * A press steps once at once; a thumb left down steps again every 30 ticks,
   * a quarter of a second — the cannon's own feel, a step a press and a slow
   * walk when held, rather than a dial spun past where it was wanted.
   */
  scoutTurnRepeatTicks: number;
  /**
   * How many motes the ship holds at once. 1: a mote is fetched, brought home
   * and sucked in before the next can be taken, and a ship already carrying
   * one flies straight through the others.
   */
  scoutCarryMax: number;
  /**
   * How near home a carrying ship has to be for an open mouth to take it, in
   * thousandths of a tile. 2000, two tiles round the cannon: the pilot brings
   * it *close* and the mouth does the last of it.
   */
  scoutSuckRadiusMilli: number;
  /**
   * How fast the mouth draws the ship in once it has it, in thousandths of a
   * tile a beat. The pilot's hands are dead while it runs, and it runs to home.
   */
  scoutSuckMilli: number;
  /** Ticks after the ship is let go before the pilot is first shown the arena. 75: one beat. */
  scoutRevealFirstTicks: number;
  /** Ticks from one showing to the next. 600: five seconds at 120 ticks a second. */
  scoutRevealEveryTicks: number;
  /** Ticks each showing lasts, the tear in and out included. 120: one second. */
  scoutRevealTicks: number;
}

export const SCOUT_TRIP_DEFAULTS: ScoutTripConfig = {
  scoutLaunchMilli: 1_000,
  scoutTurnRepeatTicks: 30,
  scoutCarryMax: 1,
  scoutSuckRadiusMilli: 2_000,
  scoutSuckMilli: 4_000,
  scoutRevealFirstTicks: 75,
  scoutRevealEveryTicks: 600,
  scoutRevealTicks: 120,
};
