import type {
  AntiphonEntry,
  BatonEntry,
  BossEntry,
  CurtainEntry,
  FilamentEntry,
  GaugeEntry,
  GimbalEntry,
  GorgeEntry,
  HaspEntry,
  HiveEntry,
  InstarEntry,
  LeadEntry,
  LedgerEntry,
  NettleEntry,
  RatchetEntry,
  ScoutEntry,
  ScuttleEntry,
  SinewEntry,
  SpoolEntry,
  StareEntry,
  SurgeEntry,
  TasterEntry,
  ThroatEntry,
  UndertowEntry,
  WellEntry,
} from "@neon-spore/sim";

/**
 * **The bosses with nothing on this panel to author**, and the reason for each.
 *
 * Cut out of `boss.ts` when THE STARE took that file six lines over its
 * 250-line limit, along the seam the file had already grown twice: the chain
 * of `if (boss.kind === …) return;` was four bosses long and each one was a
 * paragraph saying *why there is no form*, which is a different question from
 * *what the form is*. Next door is every boss that asks the author for
 * something; this is the list of the ones that ask for nothing, and it is the
 * half that grows — nine more rounds are designed and most of them tune rather
 * than place.
 *
 * **The reasons are not interchangeable**, which is why they are written out
 * one at a time rather than collapsed into a comment about "the bodyless
 * ones":
 *
 * - **THE GAUGE** has no column, no health and no rounds. Its whole difficulty
 *   is `config-gauge.ts`, which is the SHIP card's, not this panel's.
 * - **THE WELL** has nothing here *and* nothing in the SHIP card behind it:
 *   the projection's figures are render's own constants, because the only
 *   thing a dial could move is how the picture reads, and that is what VERSUS
 *   is for (`render/src/well.ts`).
 * - **THE SCOUT**'s arenas are authored in
 *   `packages/content/src/scout-arenas.ts` as places in thousandths of a tile,
 *   which is a picture rather than a form — the same answer SNAKE's rounds and
 *   PINBALL's boards get, one card along.
 * - **THE STARE** asks for less than any of them: no column, no health, no
 *   rounds and no length, because the wave underneath is the wave its author
 *   wrote. Its whole rhythm is `config-stare.ts`, and the length of its
 *   warning is the boss's fairness rather than a per-wave decision
 *   (`sim/stare.ts`).
 *
 * - **THE BATON** asks for nothing for THE STARE's reason and one more: the
 *   arm hangs in `midCol` so there is no column, the sockets are the health so
 *   there is no number, and the wave underneath is the wave its author wrote.
 *   Every beat it keeps — the flight, the turn, the lock — is the pair's
 *   cadence rather than a per-wave decision (`sim/config-baton.ts`).
 * - **THE UNDERTOW** asks for nothing for the same reasons again: every
 *   column it comes up through is drawn from the rng and the last is
 *   `midCol`, the lobes it has to lose are its health, and how many of each
 *   push and how long each takes are the pair's cadence (`sim/config-undertow.ts`).
 *
 * - **THE THROAT** asks for nothing for the same three reasons said about a
 *   tube: the gullet hangs dead centre so there is no column, the five rings
 *   are the health so there is no number, and **the inhale and the mouth's
 *   stride are the two numbers the pair says out loud** — a wave that authored
 *   its own pair would be a boss nobody could learn to talk about
 *   (`sim/config-throat.ts`).
 * - **THE CURTAIN** asks for nothing for THE UNDERTOW's reasons: it unrolls
 *   dead centre and where its core hides is drawn from the rng, the lobes
 *   along its hem are the health so there is no number, and how far a shove
 *   carries it and how soon it re-rolls are the pair's cadence
 *   (`sim/config-curtain.ts`).
 * - **THE SINEW** asks for nothing for the same reasons once more: the mass
 *   hangs over `midCol` so there is no column, the six fibres are the health
 *   so there is no number, and **the band the sum must sit in is rolled from
 *   the rng** — a wave that authored the number the pair has to find would
 *   be a boss with its answer printed on it (`sim/config-sinew.ts`).
 * - **THE SURGE** asks for nothing for THE SINEW's reasons: the bulb hangs
 *   over `midCol` so there is no column, the five notches of its seam are the
 *   health so there is no number, and where every notch sits is the same
 *   gauge on every wave — the pair's whole skill is the timing, not the
 *   finding (`sim/config-surge.ts`).
 * - **THE LEAD** asks for nothing for THE THROAT's reason said about a body
 *   rather than a mouth: it comes in over `midCol` so there is no column, the
 *   five segments of its stalk are the health so there is no number, and
 *   where it is on any beat is what the pair has hit and missed — a wave
 *   that authored its path would be a boss with its sum printed on it
 *   (`sim/config-lead.ts`).
 * - **THE SCUTTLE** asks for nothing for THE LEAD's reason: the frame hangs
 *   over `midCol` so there is no column, its parts are the health so there
 *   is no number, and which socket holds a pod and which a rock is the
 *   seed's — a wave that authored the frame would be a boss with its throws
 *   printed on it (`sim/config-scuttle.ts`).
 * - **THE ANTIPHON** asks for nothing for the same reason: the body rises
 *   over `midCol` so there is no column, the pits are the health so there
 *   is no number, and which contour grows where, in which colour, beside
 *   which decoys, is the seed's — a wave that authored the rail would be a
 *   boss with its answers printed on it (`sim/config-antiphon.ts`).
 * - **THE HIVE** asks for nothing for the same reason: the sites are sown
 *   across the inner columns by the seed so there is no column, the unsealed
 *   sites are the health so there is no number, and a wave that authored
 *   which site opens next would be a boss with its swell printed on it
 *   (`sim/config-hive.ts`).
 * - **THE INSTAR**'s script is authored in
 *   `packages/content/src/instar-script.ts` as poses, marks and clocks — a
 *   beat list read by index, which is THE PULSE's answer (a step-file is
 *   already a picture) and THE SCOUT's (a mark is a place in thousandths):
 *   the panel says where it is and gets out of the way. No column, the body
 *   hangs over the middle; no number, the steps left are the health
 *   (`sim/instar.ts`). **THE NETTLE** is the same engine and the same
 *   answer, in `packages/content/src/nettle-script.ts`.
 *
 * - **THE TASTER** asks for nothing, and it is the one where the *absence* is
 *   the boss: the crest is centred so there is no column, the fan is the
 *   health so there is no number, and the colour of every blade in it is read
 *   off what the pair has already spent — so a wave that authored one would be
 *   setting the only thing about this fight that is meant to be the pair's own
 *   doing (`sim/config-taster.ts`).
 *
 * - **THE HASP** asks for nothing, as none of it is the wave's: the door hangs
 *   over `midCol` so there is no column, the three clasps are the health so
 *   there is no number, and **the fuse and the winding are the two numbers the
 *   pair says out loud** — how long his hand lasts and how far her wheel has to
 *   go is the cadence a pair learns once, and a wave that authored its own pair
 *   would be several different bosses wearing one name (`sim/config-hasp.ts`).
 *
 * - **THE RATCHET** asks for nothing for THE HASP's reason: the rack hangs
 *   over `midCol`, its seven teeth are the health, and the window each step
 *   gives is the cadence a pair learns once (`sim/config-ratchet.ts`).
 *
 * - **THE LEDGER** asks for nothing for THE TASTER's reason said about a
 *   column rather than a colour: the body stands over the middle, the seam is
 *   the health, and where the cord's socket walks to is the fight's own
 *   arithmetic — a wave that authored the column the plate has to be in would
 *   be answering the only question this boss asks
 *   (`sim/config-ledger.ts`).
 *
 * A boss added to this list and given a form next door is a form nobody can
 * reach; one left off it and given no form falls through to the queen's, which
 * is what this question exists to stop.
 */
export function bossAuthorsNothing(
  boss: BossEntry,
): boss is
  | GaugeEntry
  | WellEntry
  | ScoutEntry
  | StareEntry
  | BatonEntry
  | ThroatEntry
  | UndertowEntry
  | GorgeEntry
  | CurtainEntry
  | TasterEntry
  | SinewEntry
  | LedgerEntry
  | SurgeEntry
  | LeadEntry
  | ScuttleEntry
  | AntiphonEntry
  | HiveEntry
  | InstarEntry
  | NettleEntry
  | FilamentEntry
  | GimbalEntry
  | SpoolEntry
  | HaspEntry
  | RatchetEntry {
  // A guard rather than a boolean over the kind, so the caller's chain still
  // narrows: next door the four have to be *out* of the union before the
  // queen's own form reads a column off what is left.
  const { kind } = boss;
  return (
    kind === "gauge" ||
    kind === "well" ||
    kind === "scout" ||
    kind === "stare" ||
    kind === "baton" ||
    kind === "throat" ||
    kind === "undertow" ||
    kind === "gorge" ||
    kind === "curtain" ||
    kind === "taster" ||
    kind === "sinew" ||
    kind === "ledger" ||
    kind === "surge" ||
    kind === "lead" ||
    kind === "scuttle" ||
    kind === "antiphon" ||
    kind === "hive" ||
    kind === "instar" ||
    kind === "nettle" ||
    kind === "filament" ||
    kind === "gimbal" ||
    kind === "spool" ||
    kind === "hasp" ||
    kind === "ratchet"
  );
}
