/**
 * **The tail of `boss-entries-clocks.ts`**, cut off it on 22 September 2026
 * when THE BELLOWS took that page two lines over its 250-line limit.
 *
 * The seam is the one every overflowing page in the repository uses: the
 * page at the limit hands its **last** boss across, never the boss being
 * worked on, so a paragraph never parts from the boss it argues. THE HIVE
 * was the last, and it came alone rather than with company — a page that
 * gave away more than it owed would be making room for work nobody has
 * started. THE BELLOWS's followed the same day, when THE HASP's paragraph
 * took next door over again, by the same rule and for the same reason.
 *
 * THE ANTIPHON's came across on the same rule when THE HASP's own paragraph
 * took the page to 250 again with nothing left to give.
 *
 * THE SPOOL's landed here on its own the same day, by neither route: the
 * page next door was full when its lane got there, so the newest boss went
 * where there was room rather than pushing a third paragraph across.
 *
 * Every name here is re-exported from `boss-entries.ts` and from `entries.ts`
 * after it, exactly as next door's are, so nothing that already reached for
 * one through either had to move.
 */

/**
 * What a wave authors when it wants THE HIVE: nothing, the sixteenth. The
 * body comes in over the field with every site shut; which column opens
 * next and in what colour is the seed's, and how many sites there are and
 * the clock they open on is tuning (`hive.ts`, `config-hive.ts`).
 */
export interface HiveEntry {
  kind: "hive";
}

/**
 * What a wave authors when it wants THE BELLOWS: nothing, the eighteenth.
 *
 * No seams, though they are the health: four gaps down a waist is the
 * *silhouette*, and a lung hung with five would be a different lung
 * (`bellows.ts`, `BELLOWS_SEAMS`). No tempo, because every one of them is a
 * beat count the pair has to feel — how long a jam holds, how long the one
 * shared window is — and a wave that authored its own would be several
 * different bosses wearing one name, `DiastoleEntry`'s reason next door.
 *
 * And nothing about which handle is whose, because that is not a figure at
 * all: his chamber hangs off the left of the waist and hers off the right,
 * geometry rather than data (`bellowsChamberCol`).
 */
export interface BellowsEntry {
  kind: "bellows";
}

/**
 * What a wave authors when it wants THE SPOOL: nothing, the nineteenth.
 *
 * No ribs, though they are the health: four ribs round a casing is the
 * *silhouette*, and a spool hung with five would be a different spool
 * (`spool.ts`, `SPOOL_RIBS`). No legs either — one call, then two, then
 * three, then one again is the beat list of §21 and the shape of the fight
 * rather than a figure in it (`SPOOL_LEGS`). And no rates: every zone the
 * navigator is shown is rolled off the seed inside the brake's own reach,
 * because a pair that had learned four authored rates by heart would stop
 * saying them to each other, and the sentence is the fight
 * (`spool-step.ts`, `config-spool.ts`).
 */
export interface SpoolEntry {
  kind: "spool";
}

/**
 * What a wave authors when it wants THE ANTIPHON: nothing, the fifteenth.
 * The body rises smooth over the middle columns; which shape stands where,
 * in which colour, beside which decoys, is the seed's, and how many organs
 * it has and how long each stands is tuning (`antiphon.ts`,
 * `config-antiphon.ts`).
 */
export interface AntiphonEntry {
  kind: "antiphon";
}
