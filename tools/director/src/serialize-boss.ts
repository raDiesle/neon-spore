import type { BossEntry } from "@neon-spore/sim";

/**
 * **A wave's boss, written back out**, and the nine shapes it can take.
 *
 * Cut out of `serialize.ts` when the wave's `malfunction` field took that file
 * past its 250-line limit, along a seam the simulation already uses: next door
 * is what a *wave* is written as — its prose, its arrivals, its pods, its
 * panel — and this is the one field of it whose answer is nine different
 * answers, exactly the split `boss-entries.ts` makes in `packages/sim`. That
 * file grows by a line when a wave gains a field; this one grows by a
 * paragraph and a branch every time a boss is built, and there are rounds
 * still to come.
 *
 * Every branch is here for the same reason: a boss whose content is *authored
 * as a picture* — THE MAZE's tangles, SNAKE's maps, PINBALL's boards — is
 * written back out as the name of the list it lives in, never as the numbers
 * inside it. Round-tripping the numbers would be correct and unreadable, and a
 * board nobody can read again is a board nobody will edit again.
 */
export function serializeBoss(boss: BossEntry): string {
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
  // THE FLEET is the one boss whose whole content is a placement, so it is the
  // one the editor has to be able to write back. One ship per line, in the
  // order they were authored, because a chart is read down the page and a
  // fleet on one line is a diff nobody can review.
  if (boss.kind === "fleet") {
    const ships = boss.ships.map(
      (s) => `        { col: ${s.col}, row: ${s.row}, len: ${s.len}, dir: "${s.dir}" },`,
    );
    const lines = ["{", '      kind: "fleet",', "      ships: [", ...ships, "      ],", "    }"];
    return lines.join("\n");
  }
  // SNAKE's three numbers a round are authored in
  // `packages/content/src/snake-rounds.ts`, for the reason THE MAZE's wheels
  // are: the wave names the list and the list is where it can be read.
  if (boss.kind === "snake") return '{ kind: "snake", rounds: SNAKE_ROUNDS }';
  // PINBALL the same, and more so: its boards are drawn as pictures in
  // `packages/content/src/pinball-rounds.ts`, and a picture written back out
  // as a list of coordinates would be a board nobody could read again.
  if (boss.kind === "pinball") return '{ kind: "pinball", rounds: PINBALL_ROUNDS }';
  // THE PULSE the same, and most of all: a chart is bars of text and a bar
  // read back out as a list of `{ step, lane }` is a rhythm nobody could see
  // (`packages/content/src/pulse-stages.ts`).
  if (boss.kind === "pulse") return '{ kind: "pulse", stages: PULSE_STAGES }';
  // The rounds go one per line: a sequence is read down the page, and putting
  // several on one line is how a diff of a boss stops being reviewable.
  const rounds = boss.rounds.map((r) => `        [${r.map((s) => `"${s}"`).join(", ")}],`);
  const lines = ["{", '      kind: "mirror",', "      rounds: [", ...rounds, "      ],", "    }"];
  return lines.join("\n");
}
