import type {
  BatonEntry,
  BossEntry,
  CandleEntry,
  CurtainEntry,
  DiastoleEntry,
  GaugeEntry,
  GorgeEntry,
  OrreryEntry,
  ScoutEntry,
  SinewEntry,
  StareEntry,
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
 * - **THE DIASTOLE** asks for nothing for three reasons rather than one: the
 *   twin lobe is a fixture dead centre so there is no column, the two chambers
 *   are the health so there is no number, and **the two cadences are the boss**
 *   — three against five is a coincidence every fifteen beats, and a wave that
 *   authored its own pair would be a boss nobody could ever have learned to
 *   count (`sim/config-diastole.ts`).
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
 *
 * - **THE TASTER** asks for nothing, and it is the one where the *absence* is
 *   the boss: the crest is centred so there is no column, the fan is the
 *   health so there is no number, and the colour of every blade in it is read
 *   off what the pair has already spent — so a wave that authored one would be
 *   setting the only thing about this fight that is meant to be the pair's own
 *   doing (`sim/config-taster.ts`).
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
  | DiastoleEntry
  | BatonEntry
  | ThroatEntry
  | UndertowEntry
  | OrreryEntry
  | CandleEntry
  | GorgeEntry
  | CurtainEntry
  | TasterEntry
  | SinewEntry {
  // A guard rather than a boolean over the kind, so the caller's chain still
  // narrows: next door the four have to be *out* of the union before the
  // queen's own form reads a column off what is left.
  const { kind } = boss;
  return (
    kind === "gauge" ||
    kind === "well" ||
    kind === "scout" ||
    kind === "stare" ||
    kind === "diastole" ||
    kind === "baton" ||
    kind === "throat" ||
    kind === "undertow" ||
    kind === "orrery" ||
    kind === "candle" ||
    kind === "gorge" ||
    kind === "curtain" ||
    kind === "taster" ||
    kind === "sinew"
  );
}
