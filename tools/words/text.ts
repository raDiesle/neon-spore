/**
 * Every string in `packages/content` that a player reads, collected once.
 *
 * The inventory is the half of this tool that has to be complete, and it is
 * the half nothing else in the repository holds: guide prose is authored in
 * twenty-odd wave files, a mechanic's sentence in nine mechanics tables, and
 * a wave's own name beside its entries. Each of the three is
 * drawn on a different screen and none of them knew about the others, which
 * is how the game came to show a forty-nine-word paragraph on a menu button.
 *
 * **One entry per line, not per field.** A guide's half is often a numbered
 * list in one string (`"1. …\n2. …"`), and those steps are read one at a time
 * under a beat; measuring the string whole would fail a good guide for being
 * long and pass a bad one for having no full stops. So `\n` ends an entry the
 * same way the screen does.
 *
 * **Captions are deliberately absent.** `GuideScene.steps[].text` is already
 * held to 28 characters and to the present tense by
 * `packages/content/test/scenes.test.ts`, and a second copy of that limit here
 * would be a rule re-derived rather than called.
 *
 * **The six sentences `apps/game` draws outside a wave are here too**: the
 * three bad-line cards and the three screen cards. `apps/game` pulls in the
 * DOM and this tool may not import it, so the sentences live in
 * `packages/content/src/screen-words.ts` and the game reads them from there.
 */

import { LINK_WORDS, MECHANIC_IDS, MECHANICS, SCREEN_WORDS, WAVES } from "@neon-spore/content";

/**
 * Which screen a string is read on, which is the only thing that decides its
 * budget. A line one player reads to the other under a beat is not the same
 * object as the sentence under a menu button, and one number for both would
 * be too loose for the first and too tight for the second.
 */
export type TextKind = "both" | "half" | "what" | "name";

export interface TextEntry {
  /** Where to go and change it: the wave or mechanic, then the field. */
  id: string;
  kind: TextKind;
  text: string;
}

/** `\n` ends a line, because the screen does. Blank lines are not entries. */
function lines(id: string, kind: TextKind, text: string): TextEntry[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, i) => ({ id: `${id} · ${kind}${i > 0 ? ` ${i + 1}` : ""}`, kind, text: line }));
}

/** Every player-facing string in `packages/content`, in reading order. */
export function playerText(): TextEntry[] {
  const out: TextEntry[] = [];
  for (const wave of WAVES) {
    out.push({ id: `${wave.name} · name`, kind: "name", text: wave.name });
    if (!wave.guide) continue;
    out.push(...lines(wave.name, "both", wave.guide.both));
    out.push(...lines(`${wave.name} · P1`, "half", wave.guide.p1));
    out.push(...lines(`${wave.name} · P2`, "half", wave.guide.p2));
  }
  for (const id of MECHANIC_IDS) {
    out.push(...lines(id, "what", MECHANICS[id].what));
  }
  for (const [key, card] of Object.entries(LINK_WORDS)) {
    out.push(...lines(`LINE CARD · ${key}`, "what", card.what));
  }
  for (const [key, card] of Object.entries(SCREEN_WORDS)) {
    out.push({ id: `SCREEN CARD · ${key} · name`, kind: "name", text: card.name });
    out.push(...lines(`SCREEN CARD · ${key}`, "what", card.what));
  }
  return out;
}
