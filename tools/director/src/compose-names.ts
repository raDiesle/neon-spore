import type { Wave } from "@neon-spore/content";
import { placeable } from "./compose-block.js";
import { MOODS, type Mood, SPARE_WORDS } from "./compose-names-moods.js";
import { BLISTER_GESTURES } from "./entry-fields-blister.js";
import { regularAt } from "./list-reading.js";
import { headOf, type WaveGroups, waveGroups } from "./rail-groups.js";

/**
 * **Every regular wave's name, made up by the composer.** The owner, 16
 * October 2026: *enhance wave generator to come up with cool names for every
 * wave … exciting, mystic and maybe fun.* LURES AGAIN, LURE PEAK and LANCE AT
 * EASE said which step a wave was and nothing else; a name is now the block's
 * thing and a word for the step's mood — RED DAWN, ROCK LULLABY, LANCE
 * ECLIPSE.
 *
 * **The thing comes from the intro, never from an old name.** The intro of
 * a block keeps its name (it is the creature's or the lesson's own), so its
 * word is read off it — THE LURE is LURE — and nothing parses a regular
 * wave's name to learn what it is about. A wave's step is the end of its id
 * (`theLureBreathe`); a wave an author wrote by hand, with no step on its id,
 * takes the mood of its place among the regular waves of its group.
 *
 * **Deterministic, unique, short.** Which name of a mood's list a wave gets
 * is a hash of its id, so the same list names the same way every time; a
 * name another wave already holds is passed over, and every name fits the
 * HUD: at most 20 letters and four words (`compose-names.test.ts`).
 */

const LONGEST = 20;
const WORDS = 4;

const ORDER: readonly Mood[] = [
  "Again",
  "Spread",
  "Reach",
  "Pair",
  "Breathe",
  "Recall",
  "Bend",
  "Peak",
];
const STEP_AT_END = new RegExp(`^(review|filler)?(.+?)(${ORDER.join("|")})$`);

/** The two words the tutorial's firsts are known by: the slick is a red
 * one there, and its name is not taught until later — and the two intros
 * whose names are more than one thing. */
const THING_WORD: Readonly<Record<string, string>> = {
  firstStep: "RED",
  theWard: "HEAVY ROCK",
  catchAndAim: "AIM",
  // HOLD TOGETHER, a BOTH blister held by two thumbs: two words do not fit.
  theWeight: "TOGETHER",
};

/** A block's thing in one word, off its intro: THE LURE is LURE. */
export function thingWord(intro: Wave): string {
  return THING_WORD[intro.id] ?? intro.name.replace(/^THE /, "");
}

/** A review whose thing no wave is named for, by the id of the wave that
 * introduces it: `blisterBoth` is HOLD TOGETHER's, and its id is THE WEIGHT's. */
const REVIEW_INTRO: Readonly<Record<string, string>> = { BlisterBoth: "theWeight" };

const fits = (name: string) => name.length <= LONGEST && name.split(" ").length <= WORDS;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
  return h;
}

/** A name for a wave of `mood` about `word`, not in `taken`. `key` (the
 * wave's id) decides which of the mood's names is tried first. */
export function moodName(
  word: string,
  mood: Mood,
  key: string,
  taken: ReadonlySet<string>,
  partner?: string,
): string {
  const bank = MOODS[mood].filter((t) => partner !== undefined || !t.includes("%"));
  const start = hash(key) % bank.length;
  const tries = bank.map((_, i) => bank[(start + i) % bank.length] ?? "");
  const fill = (t: string) => t.replace("#", word).replace("%", partner ?? "");
  for (const t of tries) if (fits(fill(t)) && !taken.has(fill(t))) return fill(t);
  for (const spare of SPARE_WORDS) {
    for (const t of tries) {
      const name = `${spare} ${fill(t)}`;
      if (fits(name) && !taken.has(name)) return name;
    }
  }
  throw new Error(`no name left for ${key}: every ${mood} name of ${word} is taken`);
}

/** What a regular wave is about and which step it is, read off the list. */
interface List {
  waves: readonly Wave[];
  groups: WaveGroups;
  /** `isRegularWave` of every wave, asked once: it reads the whole list. */
  regular: readonly boolean[];
}

function themeOf(
  { waves, groups, regular }: List,
  i: number,
): { intro: Wave; word?: string; mood: Mood } {
  const wave = waves[i] as Wave;
  const byId = (id: string) => waves.find((w) => w.id === id);
  const step = STEP_AT_END.exec(wave.id);
  if (step) {
    const [, kind, rest = "", mood] = step;
    // A filler is named for the block it follows, not the boss it leads to.
    if (kind === "filler")
      return { intro: blockAbove({ waves, groups, regular }, i), mood: mood as Mood };
    const intro = kind ? (byId(`the${rest}`) ?? byId(lower(rest))) : byId(rest);
    if (intro) return { intro, mood: mood as Mood };
    const named = kind === "review" ? REVIEW_INTRO[rest] : undefined;
    const of = named === undefined ? undefined : byId(named);
    if (of) return { intro: of, mood: mood as Mood };
  }
  const said = /^(\w+)Blisters$/.exec(wave.id)?.[1];
  const gesture = BLISTER_GESTURES.find((g) => g === said);
  // The mood of its place among the regular waves of its group, and the
  // thing of the first head above it that is not regular itself: a review's
  // head is a regular wave, and so is FIVE BLISTERS.
  const own = headOf(groups, i);
  const mates = waves.flatMap((_, j) => (headOf(groups, j) === own && regular[j] ? [j] : []));
  const k = Math.max(0, mates.indexOf(i));
  const at = mates.length < 2 ? 0 : Math.round((k * (ORDER.length - 1)) / (mates.length - 1));
  return {
    intro: blockAbove({ waves, groups, regular }, i),
    word: gesture?.toUpperCase(),
    mood: ORDER[at] ?? "Again",
  };
}

/** The first head at or above a wave that is not a regular wave itself: the
 * intro or lesson of the block it belongs to, or follows. */
function blockAbove({ waves, groups, regular }: List, i: number): Wave {
  let h = headOf(groups, i);
  while (h > 0 && regular[h]) h = headOf(groups, h - 1);
  return waves[h] as Wave;
}

const lower = (id: string) => id.charAt(0).toLowerCase() + id.slice(1);

/** The word for the thing each block's Pair step pairs its own with, by
 * intro id: the block before's thing, as `readBlock` reads its `y` — read
 * here off one pass, since a block read whole costs most of a second. */
function partners(waves: readonly Wave[]): Map<string, string> {
  const out = new Map<string, string>();
  let before: Wave | undefined;
  for (const [j, wave] of waves.entries()) {
    if (placeable(waves, j) === undefined) continue;
    if (before) out.set(wave.id, thingWord(before));
    before = wave;
  }
  return out;
}

/**
 * The list with its regular waves named — every one of them, or only those
 * whose ids are in `only`, every other name then being taken.
 */
export function nameWaves(waves: readonly Wave[], only?: ReadonlySet<string>): Wave[] {
  const list: List = {
    waves,
    groups: waveGroups(waves),
    regular: waves.map((_, i) => regularAt(waves, i)),
  };
  const partnerOf = partners(waves);
  const renamed = (i: number) =>
    list.regular[i] === true && (only === undefined || only.has(waves[i]?.id ?? ""));
  const taken = new Set(waves.flatMap((w, i) => (renamed(i) ? [] : [w.name])));
  return waves.map((wave, i) => {
    if (!renamed(i)) return wave;
    const theme = themeOf(list, i);
    const word = theme.word ?? thingWord(theme.intro);
    const partner = theme.mood === "Pair" ? partnerOf.get(theme.intro.id) : undefined;
    const name = moodName(word, theme.mood, wave.id, taken, partner);
    taken.add(name);
    return { ...wave, name };
  });
}
