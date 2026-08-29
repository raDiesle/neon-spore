/**
 * Regenerates one act's wave array — `WAVES_ACT_1`, `WAVES_ACT_2`, or
 * `WAVES_ACT_3` in `packages/content/src/waves/act-*.ts` — while preserving
 * that file's own header and doc comment byte-for-byte. The browser cannot
 * write files directly, so the editor produces diffs you can review and
 * commit.
 *
 * The list used to be one flat array in `waves.ts` itself, regenerated under
 * a single fixed marker. It is split by act now because that file could not
 * grow forever, so the marker names which act's array it is rewriting —
 * `waves.ts` is only the barrel that concatenates the three and is never
 * itself a save target.
 */
import type { Wave, WaveEntry } from "@neon-spore/content";
import type { BossEntry, PodEntry } from "@neon-spore/sim";

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

function serializeEntry(entry: WaveEntry): string {
  const parts: string[] = [];
  parts.push(`beat: ${entry.beat}`);
  parts.push(`col: ${entry.col}`);
  if (entry.kind !== undefined) {
    parts.push(`kind: "${entry.kind}"`);
  }
  parts.push(`color: ${entry.color === null ? "null" : `"${entry.color}"`}`);
  return `{ ${parts.join(", ")} }`;
}

function serializePod(pod: PodEntry): string {
  const parts = [`beat: ${pod.beat}`, `col: ${pod.col}`, `row: ${pod.row}`];
  if (pod.kind !== undefined) parts.push(`kind: "${pod.kind}"`);
  return `{ ${parts.join(", ")} }`;
}

function serializeBoss(boss: BossEntry): string {
  if (boss.kind === "queen") {
    return `{ kind: "queen", col: ${boss.col}, petals: ${boss.petals} }`;
  }
  if (boss.kind === "warden") {
    const plates = boss.plates === undefined ? "" : `, plates: ${boss.plates}`;
    return `{ kind: "warden"${plates} }`;
  }
  if (boss.kind === "vane") {
    const pins = boss.pins === undefined ? "" : `, pins: ${boss.pins}`;
    return `{ kind: "vane"${pins} }`;
  }
  if (boss.kind === "maze") {
    // The tangles are authored in `packages/content/src/maze-rounds.ts`, where
    // a node is written as two arms and the fused one. Emitting them here as
    // raw bitmasks would round-trip correctly and be unreadable, so the wave
    // keeps naming the list and the director leaves the lattice alone.
    return '{ kind: "maze", rounds: MAZE_ROUNDS }';
  }
  // THE GAUGE authors nothing at all — the wave names it and everything else
  // about it is tuning (`config-gauge.ts`).
  if (boss.kind === "gauge") return '{ kind: "gauge" }';
  // The rounds go one per line: a sequence is read down the page, and putting
  // several on one line is how a diff of a boss stops being reviewable.
  const rounds = boss.rounds.map((r) => `        [${r.map((s) => `"${s}"`).join(", ")}],`);
  const lines = ["{", '      kind: "mirror",', "      rounds: [", ...rounds, "      ],", "    }"];
  return lines.join("\n");
}

function serializeWave(wave: Wave): string {
  const lines: string[] = [];
  lines.push("  {");
  lines.push(...textField("name", wave.name));
  lines.push(...textField("sentence", wave.sentence));
  lines.push(...textField("hint", wave.hint));

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

  lines.push("  },");
  return lines.join("\n");
}

/**
 * `exportName` is one act's array — `WAVES_ACT_1`, `WAVES_ACT_2`, `WAVES_ACT_3`
 * — never `WAVES` itself, which names a spread in `waves.ts` rather than a
 * literal array and would find nothing to regenerate correctly.
 */
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
