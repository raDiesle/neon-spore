import type { WaveGuide } from "@neon-spore/content";

/**
 * **A wave's strings, written the way biome would leave them**: one text
 * field, wrapped only when that gets it under the width, and the guide, which
 * is always expanded. Cut out of `serialize.ts` when a director-only field
 * (`Wave.setPiece`) took it to four lines under its ceiling; these are the
 * rules that answer to the formatter rather than to the wave.
 */

function escapeString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Biome's line width. The serializer has to match the formatter exactly or the
 * round trip fails on a file nobody edited — `serialize.test.ts` compares the
 * output against the real `waves.ts`, which is formatted.
 */
const LINE_WIDTH = 100;

/**
 * `name: "value",` at four spaces of indent, wrapped the way Biome wraps it:
 * the string goes to its own line only when that actually gets the line under
 * the limit. A sentence longer than the width either way stays where it is,
 * because breaking it would buy nothing — which is the rule the formatter
 * follows and therefore the only rule this may follow.
 */
export function textField(name: string, value: string): string[] {
  const one = `    ${name}: "${escapeString(value)}",`;
  if (one.length <= LINE_WIDTH) return [one];
  const wrapped = `      "${escapeString(value)}",`;
  if (wrapped.length > LINE_WIDTH) return [one];
  return [`    ${name}:`, wrapped];
}

/**
 * The wave's guide, always over several lines even when three short strings
 * would fit on one. Biome keeps an object literal expanded once its author put
 * a newline after the brace, so "always expanded" is the only shape that round
 * trips — and the first key past the three has arrived: `scene`, the rehearsal
 * the guide plays. Written last and only when it is there, so the sixteen
 * guides of words alone round trip as before; one line, because it is a *name*
 * and not the choreography behind it.
 */
export function serializeGuide(guide: WaveGuide): string[] {
  const keys: (keyof WaveGuide)[] = ["both", "p1", "p2", "scene"];
  const lines = keys.flatMap((k) => (guide[k] === undefined ? [] : guideLine(k, guide[k])));
  return ["    guide: {", ...lines, "    },"];
}

/**
 * One line of a guide, and it is always exactly one line however long it is —
 * which is *not* the rule `textField` follows a level up. Biome breaks after
 * `sentence:` when that gets the string under the width, and leaves the same
 * string alone one level deeper inside `guide: {`. The formatter is the only
 * authority on this and `serialize.test.ts` proves the two agree, so it is the
 * two separate rules it turned out to be rather than one rule with an indent
 * parameter that quietly disagreed at 103 characters.
 */
function guideLine(name: string, value: string): string[] {
  return [`      ${name}: "${escapeString(value)}",`];
}
