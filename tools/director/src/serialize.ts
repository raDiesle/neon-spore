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
 */
import type { Wave, WaveEntry, WaveGuide } from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";
import { serializeBoss } from "./serialize-boss.js";

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

/**
 * One arrival. The field order is the order `WaveEntry` declares them in, so a
 * hand-written wave and a saved one look the same.
 *
 * Every optional field is written only when it is there — a lure that takes the
 * body its colour names, or a rock at its ordinary width, says nothing — so
 * every wave written before any of them existed round-trips byte for byte.
 * Dropping one is the failure this shape exists to prevent: the editor reads a
 * `wears` in and writes it back out as nothing, which quietly re-authors the
 * wave. It has happened twice — `wears` and then `gaps` — so a new field on
 * `WaveEntry` needs a line here in the same commit, and `serialize.test.ts`
 * only proves the fields it knows about.
 */
function serializeEntry(entry: WaveEntry): string {
  const parts: string[] = [];
  parts.push(`beat: ${entry.beat}`);
  parts.push(`col: ${entry.col}`);
  if (entry.kind !== undefined) {
    parts.push(`kind: "${entry.kind}"`);
  }
  parts.push(`color: ${entry.color === null ? "null" : `"${entry.color}"`}`);
  if (entry.wears !== undefined) parts.push(`wears: "${entry.wears}"`);
  if (entry.size !== undefined) parts.push(`size: ${entry.size}`);
  if (entry.path !== undefined) parts.push(`path: "${entry.path}"`);
  if (entry.beads !== undefined) parts.push(`beads: ${entry.beads}`);
  // How many beats a box asks for — dropped, a wave's own count would silently
  // become `cfg.beatboxBeats` on the first save.
  if (entry.beats !== undefined) parts.push(`beats: ${entry.beats}`);
  if (entry.segments !== undefined) parts.push(`segments: ${entry.segments}`);
  if (entry.side !== undefined) parts.push(`side: "${entry.side}"`);
  // **THE FENCE's gaps, and an empty list is not nothing.** Absent means *the
  // column this was painted in* (`queueFromWave`) and `[]` means a wall with no
  // way through at all, which is a decision an author makes and the only wall
  // the cannon can cut — so the two must not collapse into each other here.
  // This row was missing until the day somebody hand-authored a solid fence and
  // found `bun test` had quietly taken it out again: the GAPS panel
  // (`cell-config-gaps.ts`) has written `entry.gaps` since THE FENCE shipped,
  // and every save dropped it. That is `wears`'s own failure said twice, which
  // is what the note above this function is for.
  if (entry.gaps !== undefined) parts.push(`gaps: [${entry.gaps.join(", ")}]`);
  // And where it is cracked, one list per ammunition colour. Absent is the only
  // "nothing" these two have — a wall with no cracks and no gaps is given one
  // by `queueFromWave` — so unlike `gaps` there is no empty list to preserve,
  // and `cycleFenceCrack` never writes one.
  if (entry.cracksRed !== undefined) parts.push(`cracksRed: [${entry.cracksRed.join(", ")}]`);
  if (entry.cracksCyan !== undefined) parts.push(`cracksCyan: [${entry.cracksCyan.join(", ")}]`);
  // Which way a rock crosses the field, and the row it crosses along. Written
  // only when the author set them, so every rock that falls comes back out of
  // the editor as the three fields it went in with — the rule the paragraph
  // above this function is about, and the one `wears` and `gaps` were each
  // lost to once.
  if (entry.cross !== undefined) parts.push(`cross: ${entry.cross}`);
  if (entry.row !== undefined) parts.push(`row: ${entry.row}`);
  return `{ ${parts.join(", ")} }`;
}

function serializePod(pod: PodEntry): string {
  const parts = [`beat: ${pod.beat}`, `col: ${pod.col}`, `row: ${pod.row}`];
  if (pod.kind !== undefined) parts.push(`kind: "${pod.kind}"`);
  // Every one of these is written only when the author set it, and that is the
  // whole of why a pod that hangs where it was left comes back out of the
  // editor as the same three fields it went in with — a saved `cross: 0` or
  // `cross: 0` would be a wave file that changed the day somebody opened it.
  if (pod.cross !== undefined) parts.push(`cross: ${pod.cross}`);
  if (pod.speed !== undefined) parts.push(`speed: ${pod.speed}`);
  return `{ ${parts.join(", ")} }`;
}

function serializeWave(wave: Wave): string {
  const lines: string[] = [];
  lines.push("  {");
  // First, and before the name: it is the handle everything else points at,
  // and a save must carry it forward untouched — see `Wave.id`.
  lines.push(...textField("id", wave.id));
  lines.push(...textField("name", wave.name));
  lines.push(...textField("sentence", wave.sentence));
  // Directly under `sentence`, which is where the owner asked for it and where
  // it is read: a wave's prose is its name, why it exists, and what the pair
  // has to be told before it starts.
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

  // Last, and only when the wave asks for a panel that is not the ordinary
  // one. A wave that names nothing is played on `DEFAULT_CONTROL_SET_ID`, so
  // writing the default out would put a line in the file that means nothing —
  // and the round trip would then disagree with a `waves.ts` nobody edited.
  if (wave.controls) {
    lines.push(`    controls: "${wave.controls}",`);
  }

  // And after it, on the same terms: a wave with no fault writes no line, so
  // every wave in the game but three round trips exactly as it did. One line
  // rather than a block, because a `Malfunction` is one word or two — the
  // shield arm carries nothing at all, and only the cannon arm has ammunition
  // to name (`sim/malfunction.ts`).
  if (wave.malfunction) {
    const m = wave.malfunction;
    const colour = m.kind === "cannon" ? `, color: "${m.color}"` : "";
    lines.push(`    malfunction: { kind: "${m.kind}"${colour} },`);
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
