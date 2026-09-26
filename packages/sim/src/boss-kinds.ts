import type { BossEntry } from "./boss-entries.js";

/**
 * **The two questions asked about the union of bosses**, cut out of
 * `boss-entries.ts` on 14 September 2026 when that file stood one boss under
 * its limit — and these two are the half that does not grow a dozen lines per
 * round. A new boss is one interface next door and one name at the end of
 * `BOSS_KINDS` here.
 */

/**
 * Whether this boss *is* the wave, or only bends what the wave sends.
 *
 * All but one are the whole encounter and a creature placed beside one is
 * a wave nobody designed — THE GAUGE most of all, which does not draw a field
 * for a creature to stand on. THE VANE is the opposite — it spawns nothing at all,
 * and a wave without arrivals for it to throw is a mechanism turning over an
 * empty field. So the director's guard against a creature brush on a boss wave
 * asks this rather than `wave.boss !== undefined`, and there is one place the
 * answer lives.
 *
 * THE WELL is the second of those and the plainest: it is a projection, so it
 * spawns nothing, and a well with no arrivals is the field redrawn with nothing
 * standing in it (`well.ts`).
 *
 * THE REPRISE is the third and the one the question was invented for: every
 * body it puts on the field is a body the wave's own author wrote, sent a
 * second time, so a reprise over an empty wave is a mechanism sending nothing
 * again (`reprise.ts`).
 */
export function bossFillsWave(kind: BossEntry["kind"]): boolean {
  // THE STARE is the fourth of them and the plainest: nothing to shoot,
  // nothing to place, and no clock of its own that ends anything. What it does
  // is make the wave its author wrote cost more to play (`stare.ts`), so a
  // stare wave with no arrivals is an eye watching an empty field.
  // THE BATON is the fifth: an arm hanging in one column that falls nothing
  // but its own dead segments, whose whole behaviour is whose turn it is
  // (`baton.ts`). The arrivals around it are the wave's own.
  // THE THROAT is the sixth, and the one where it is the *point* rather than
  // the shape: what the boss eats is the wave's own arrivals, and every
  // creature it swallows re-tightens a slack ring (`throat-step.ts`). A throat
  // that spawned its own dinner would be a boss healing off bodies its author
  // never wrote, which is to say a boss whose difficulty nobody set.
  // THE UNDERTOW is the seventh, and the one that is underneath the field
  // rather than above it: a fixture in the hull that pushes up through the
  // floor and falls nothing at all (`undertow.ts`). What comes down over it
  // is the wave's own.
  // THE GORGE is the eighth, and the one that sends bodies *because* of the
  // wave's own: a sack that swallows every shot nobody aimed at a creature,
  // and falls only what the pair overfed it with — a vented torch, a spat
  // bead (`gorge-step.ts`). The arrivals the pair must not shoot at are
  // authored, or there is nothing for the restraint to be against.
  // THE TASTER is the ninth, and the reason is the fight itself: what its fan
  // tastes is the colours the pair spend *answering the wave*, so a taster
  // that sent its own bodies would be a boss feeding the ledger it then reads
  // (`taster.ts`). The design's step 7 — a blade sweeping down and throwing a
  // rock — is dropped for exactly that, and this page's own ruling says so:
  // *a boss on this page is fed by its wave, not by itself*
  // (`docs/spec/bosses-choreographed.md`).
  // THE SINEW is the tenth, and the one whose hands-off beat is the point: a
  // tendon the cannon cannot touch, that falls only what the pair's own
  // snap-backs shake out of it (`sinew-step.ts`). The arrivals under it are
  // authored, so that letting go of the handles to shoot is a decision.
  // THE LEDGER is the eleventh, and its wave is the bill: from the third hit
  // the cord charges the pair for **every** shot the cannon takes, so what
  // falls has to be the wave's own or the boss would be posting itself the
  // bills it then makes them ward (`ledger.ts`). The arrivals are authored for
  // the one decision the design asks for — *choose what to shoot at all*.
  // THE SURGE is the twelfth, for the same reason turned round: a bulb the
  // cannon cannot touch, that throws nothing but what its own bursts throw
  // (`surge-seam.ts`) — and from its second notch the wave's arrivals are
  // its food, so shooting them is the other thing the hands are for.
  // THE LEAD is the thirteenth: a body pacing over the top of the field with
  // nothing of itself on the grid, that falls only what its run drops behind
  // and ahead of itself (`lead-step.ts`). The arrivals under it are authored,
  // so that a shot put ahead of the body is a shot not put into the wave.
  // THE SCUTTLE is the fourteenth, and the one that goes the other way: it is
  // **not** on the list, because it fills its wave — every body that falls in
  // it is a part of the frame thrown down as a meteor, a slick, a bulb or a
  // pod (`scuttle-step.ts`), and which socket goes next is the frame's own
  // clock, not an author's. The ruling on the choreographed page that *a boss
  // on this page is fed by its wave* is about a boss that reads the wave, and
  // this one reads nothing.
  // THE ANTIPHON is the fifteenth and reads nothing either: what falls in it
  // is what the pair got wrong — a candidate a pit rejected, an organ left
  // to sink — and the design says *nothing else arrives* (`antiphon-step.ts`).
  // THE HIVE is the sixteenth and THE SCUTTLE's case again: not on the list,
  // because everything that falls in its wave is a rock an open breach
  // spilled (`hive-step.ts`), and a wave authored beside it would be a
  // spill nobody could seal.
  return (
    kind !== "vane" &&
    kind !== "well" &&
    kind !== "reprise" &&
    kind !== "stare" &&
    kind !== "baton" &&
    kind !== "throat" &&
    kind !== "undertow" &&
    kind !== "gorge" &&
    kind !== "taster" &&
    kind !== "sinew" &&
    kind !== "ledger" &&
    kind !== "surge" &&
    kind !== "lead"
  );
}

/**
 * **Whether a boss still installed holds its wave open.**
 *
 * `beat.ts` ends a wave when the script is spent and the field is empty, and
 * it asks this about whatever is still standing. Every boss but one answers
 * yes, and for two different reasons that come to the same thing: a fight the
 * pair has not finished is a wave that is not over, and a round that *has*
 * finished stays installed on purpose so its picture holds until the next wave
 * replaces it — that one ends its wave through `roundSpent` instead
 * (`wave-end.ts`).
 *
 * **THE WELL is the exception, and it is the only boss that could be one.** It
 * has no body, no health, no step and no state: `well.ts` says in as many
 * words that it is the first boss in this game that changes nothing but the
 * picture. There is nothing about it for the pair to finish, so a wave under
 * it ends exactly when the wave its author wrote ends — which is the claim
 * `well.test.ts` already makes about everything else in that world.
 *
 * Until 16 September 2026 there was no question here and `beat.ts` asked for
 * `world.boss === null`, so wave 70 of the shipped campaign could not be
 * passed at all: the pair cleared the field and the wave stood there with a
 * projection holding it. **It is deliberately not `!bossFillsWave(kind)`**,
 * which would answer the same for THE VANE — and a vane is nulled by its last
 * pin coming out (`vane.ts`), so making it stop holding its wave would let a
 * vane wave be passed without the mechanism ever being beaten. The two
 * questions look alike and are about different halves of a boss: one is what
 * it *sends*, this is what it still *asks*.
 */
export function bossHoldsWave(kind: BossEntry["kind"]): boolean {
  return kind !== "well";
}

/**
 * The bosses that exist, as data. `tools/director` reads this to say which of
 * the twelve names in `docs/spec/bosses.md` are actually in the game — the
 * same question `CREATURES` answers for the bestiary, and one a tool must
 * never answer from a list of its own.
 */
export const BOSS_KINDS: readonly BossEntry["kind"][] = [
  "queen",
  "mirror",
  "warden",
  "vane",
  "maze",
  "gauge",
  "fleet",
  "snake",
  "pinball",
  "pulse",
  // **Appended, never inserted.** This list is what `bossHashParts` tags a boss
  // with, so its order is a wire value exactly as `CREATURE_KINDS`' is: a name
  // slipped into the middle would renumber every boss after it, and a replay
  // recorded on yesterday's build would fingerprint as a different world.
  "cairn",
  "well",
  "splice",
  "scout",
  "reprise",
  "stare",
  "baton",
  "throat",
  "undertow",
  "gorge",
  "curtain",
  "taster",
  "sinew",
  "ledger",
  "surge",
  "lead",
  "scuttle",
  "antiphon",
  "hive",
  "instar",
  "filament",
  "gimbal",
  "spool",
  "hasp",
  "ratchet",
  "nettle",
  "mantle",
  "keel",
  "valve",
  "seam",
];
