/**
 * Regenerates the WAVES array in waves.ts while preserving the file header
 * and type definitions byte-for-byte. The browser cannot write files directly,
 * so the editor produces diffs you can review and commit.
 */
import type { Wave, WaveEntry } from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";

function escapeString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
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
  return `{ beat: ${pod.beat}, col: ${pod.col}, row: ${pod.row} }`;
}

function serializeWave(wave: Wave): string {
  const lines: string[] = [];
  lines.push("  {");
  lines.push(`    name: "${escapeString(wave.name)}",`);
  lines.push(`    sentence: "${escapeString(wave.sentence)}",`);
  lines.push(`    hint: "${escapeString(wave.hint)}",`);

  if (wave.entries.length === 1) {
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

  lines.push("  },");
  return lines.join("\n");
}

export function serializeWaves(source: string, waves: Wave[]): string {
  const marker = "export const WAVES: Wave[] = [";
  const idx = source.indexOf(marker);
  if (idx === -1) {
    throw new Error("Could not find WAVES array in source");
  }

  const prefix = source.slice(0, idx + marker.length);
  const serialized = waves.map((w) => serializeWave(w)).join("\n");

  return `${prefix}\n${serialized}\n];\n`;
}
