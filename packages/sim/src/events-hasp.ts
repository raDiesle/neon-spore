/**
 * What THE HASP says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The row stands down the middle of the field, so nearly all of them
 * are heard in the middle; the bolt is heard where it falls.
 *
 * **The burn and the seize are two different words for one moment**, and
 * both are kept, because they happen on two different screens: he is burned
 * off a latch he can see and she is seized on a wheel she can see, and
 * neither is ever shown the other's. A single event panned to the middle
 * would be the boss telling both of them the same thing, which is the one
 * thing this fight may not do.
 */

interface HaspColEvent {
  /** The column it happened over. */
  col: number;
}

export type HaspEvent =
  /** The row swings in over the field, three hasps sealed and the wheels dark. */
  | ({ type: "haspEnter" } & HaspColEvent)
  /** A latch lights on the pilot's screen; `hasps` is what the row still has. */
  | ({ type: "haspLit"; hasps: number } & HaspColEvent)
  /** The pilot took the latch, and somewhere he cannot see a wheel went free. */
  | ({ type: "haspGrip" } & HaspColEvent)
  /** He let go with the latch still cool — the wheel seizes, and nothing is spent. */
  | ({ type: "haspLet" } & HaspColEvent)
  /** He held it past its fuse: the latch burns his hand off and stays hot. */
  | ({ type: "haspBurn" } & HaspColEvent)
  /** The latch has cooled and may be taken again. */
  | ({ type: "haspCool" } & HaspColEvent)
  /** Her wheel seized under her hand, for a reason her screen never shows. */
  | ({ type: "haspSeize" } & HaspColEvent)
  /** Her wheel came free again, mid-wind or at the start of one. */
  | ({ type: "haspFree" } & HaspColEvent)
  /** A hasp is wound open; `hasps` is what is left sealed. */
  | ({ type: "haspOpen"; hasps: number } & HaspColEvent)
  /** The second hasp's spring throws a bolt loose — the fight's one hazard. */
  | ({ type: "haspBolt" } & HaspColEvent)
  /** The bolt was shot out, in either colour. */
  | ({ type: "haspBoltOut" } & HaspColEvent)
  /** Nobody shot it: the bolt reached the hull, which is the wave. */
  | ({ type: "haspBoltHit" } & HaspColEvent)
  /** All three: the row swings clear together and the passage behind it lights. */
  | ({ type: "haspClear" } & HaspColEvent)
  /** The row has hung open `haspClearBeats`; the wave may end. */
  | ({ type: "haspOut" } & HaspColEvent);
