/**
 * Regenerates one act's wave array — `WAVES_ACT_1` and the rest, in
 * `packages/content/src/waves/act-*.ts` — while preserving that file's own
 * header and doc comment byte-for-byte. The browser cannot
 * write files directly, so the editor produces diffs you can review and
 * commit.
 *
 * The list used to be one flat array in `waves.ts` itself, regenerated under
 * a single fixed marker. It is split by act now because that file could not
 * grow forever, so the marker names which act's array it is rewriting —
 * `waves.ts` is only the barrel that concatenates the acts in order and is
 * never itself a save target.
 *
 * What a wave *is* is written here; one arrival and one pod are
 * `serialize-entry.ts`, and the boss is `serialize-boss.ts` — the two lines
 * that grow by a field and by a branch, cut out so this file does not.
 */
import type { Wave, WaveGuide } from "@neon-spore/content";
import { faultLine, serializeBoss } from "./serialize-boss.js";
import { serializeEntry, serializePod } from "./serialize-entry.js";

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
function textField(name: string, value: string): string[] {
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
function serializeGuide(guide: WaveGuide): string[] {
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

function serializeWave(wave: Wave): string {
  const lines: string[] = [];
  lines.push("  {");
  // First, and before the name: it is the handle everything else points at,
  // and a save must carry it forward untouched — see `Wave.id`.
  lines.push(...textField("id", wave.id));
  lines.push(...textField("name", wave.name));
  // Directly under `name`: a wave's prose is its name and what the pair has
  // to be told before it starts.
  if (wave.guide) lines.push(...serializeGuide(wave.guide));

  if (wave.entries.length === 0) {
    lines.push("    entries: [],");
  } else if (wave.entries.length === 1) {
    lines.push(`    entries: [${serializeEntry(wave.entries[0]!)}],`);
  } else {
    lines.push("    entries: [");
    for (const entry of wave.entries) {
      lines.push(`      ${serializeEntry(entry)},`);
    }
    lines.push("    ],");
  }

  if (wave.pods && wave.pods.length > 0) {
    if (wave.pods.length === 1) {
      lines.push(`    pods: [${serializePod(wave.pods[0]!)}],`);
    } else {
      lines.push("    pods: [");
      for (const pod of wave.pods) {
        lines.push(`      ${serializePod(pod)},`);
      }
      lines.push("    ],");
    }
  }

  if (wave.boss) {
    lines.push(`    boss: ${serializeBoss(wave.boss)},`);
  }

  // Directly under the boss, because it is about the boss and about nothing
  // else: which of the two kinds it is (`Wave.bossType`). A wave with no boss
  // never carries one — `waves.test.ts` holds both directions — so this line
  // is written exactly where the field is authored and nowhere else.
  if (wave.bossType) {
    lines.push(`    bossType: "${wave.bossType}",`);
  }

  // Last, and only when the wave asks for a panel that is not the ordinary
  // one. A wave that names nothing is played on `DEFAULT_CONTROL_SET_ID`, so
  // writing the default out would put a line in the file that means nothing —
  // and the round trip would then disagree with a `waves.ts` nobody edited.
  if (wave.controls) {
    lines.push(`    controls: "${wave.controls}",`);
  }

  // And after it, on the same terms: a wave that places no fault writes no
  // line, so every wave in the game but a handful round trips exactly as it
  // did. One line rather than a block, because a placed fault is a word and at
  // most three numbers — a kind, the row it enters on, and how many rows it
  // holds (`sim/fault-placed.ts`). **Every field of every placement is
  // written**, and that is the whole job: a field this misses is a field the
  // editor deletes the first time somebody saves a wave.
  if (wave.faults?.length) {
    lines.push(`    faults: [${wave.faults.map(faultLine).join(", ")}],`);
  }

  lines.push("  },");
  return lines.join("\n");
}

/**
 * `exportName` is one act's array — `WAVES_ACT_1`, `WAVES_ACT_2`, `WAVES_ACT_3`
 * — never `WAVES` itself, which names a spread in `waves.ts` rather than a
 * literal array and would find nothing to regenerate correctly.
 */
/**
 * How many waves one act's array holds, read off the source.
 *
 * A save needs each act's *current* length to know where to cut the flat list
 * it was handed, and it used to get that by importing the act file with a
 * cache-busting query — one fresh ES module record per act per save, kept for
 * the life of a server that stays up all afternoon. The source is already read
 * a line later to serialize into, so the number is there for the counting.
 *
 * A wave is the only thing in one of these files that begins at two spaces of
 * indentation: a guide sits at four and an entry at six, and `serializeWave`
 * writes every one of them. So the count is the count of those openings after
 * the array's own marker.
 */
export function countWaveArray(source: string, exportName: string): number {
  const marker = `export const ${exportName}: Wave[] = [`;
  const idx = source.indexOf(marker);
  if (idx === -1) {
    throw new Error(`Could not find ${exportName} array in source`);
  }
  return (source.slice(idx).match(/^ {2}\{$/gm) ?? []).length;
}

/**
 * Every comment in `source`, from `//` or `/* *\/`, in the order it appears —
 * a string or template literal's own body is skipped rather than scanned, so
 * a hint that happens to contain `//` is never read as one. The same three
 * literal patterns `stripNonCode` blanks out (`source-scan.ts`), kept apart
 * here because that file cannot import from `tools/` and this one is small
 * enough not to ask it to.
 */
function commentSpans(source: string): string[] {
  const tokens =
    /`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*[\s\S]*?\*\/|(?:^|[^:])\/\/[^\n]*/gm;
  const found: string[] = [];
  for (const [text] of source.matchAll(tokens)) {
    if (text.startsWith("/*")) {
      found.push(text.trim());
      continue;
    }
    const slash = text.indexOf("//");
    if (slash !== -1) found.push(text.slice(slash).trim());
  }
  return found;
}

/**
 * The comments `serializeWaveArray` is about to drop — every one written
 * inside `exportName`'s own array in `before` that `after` does not carry,
 * in the order they were written.
 *
 * `serializeWave` writes exactly the fields `Wave` carries and nothing
 * beside them, so a comment beside an entry — the reason a guide half says
 * what it says — is gone the moment anybody saves from the editor, with
 * nothing at the point of loss to say so. This is that something: called
 * from the one round trip that would otherwise show it as an unreadable
 * diff of two 97-wave files (`wave-save.test.ts`).
 */
export function droppedComments(before: string, after: string, exportName: string): string[] {
  const marker = `export const ${exportName}: Wave[] = [`;
  const at = (source: string) => {
    const idx = source.indexOf(marker);
    return idx === -1 ? "" : source.slice(idx);
  };
  const gone = commentSpans(at(after));
  return commentSpans(at(before)).filter((comment) => !gone.includes(comment));
}

export function serializeWaveArray(source: string, waves: Wave[], exportName: string): string {
  const marker = `export const ${exportName}: Wave[] = [`;
  const idx = source.indexOf(marker);
  if (idx === -1) {
    throw new Error(`Could not find ${exportName} array in source`);
  }

  const prefix = source.slice(0, idx + marker.length);
  const serialized = waves.map((w) => serializeWave(w)).join("\n");

  return `${prefix}\n${serialized}\n];\n`;
}
