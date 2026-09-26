import type { WaveFault } from "@neon-spore/content";
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
  // THE CAIRN authors one number and no column: the pile stands dead centre
  // wherever the field's edges are (`installCairn`).
  if (boss.kind === "cairn") {
    const units = boss.units === undefined ? "" : `, units: ${boss.units}`;
    return `{ kind: "cairn"${units} }`;
  }
  if (boss.kind === "vane") {
    const pins = boss.pins === undefined ? "" : `, pins: ${boss.pins}`;
    return `{ kind: "vane"${pins} }`;
  }
  // THE REPRISE authors one number and no column either: the mechanism hangs
  // at the top middle, and the number is how long a stretch of the wave runs
  // before it is sent back unseen (`RepriseEntry`).
  if (boss.kind === "reprise") {
    const beat = boss.beat === undefined ? "" : `, beat: ${boss.beat}`;
    return `{ kind: "reprise"${beat} }`;
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
  // THE WELL the same, and for less: it authors nothing because it *is*
  // nothing but a projection (`sim/well.ts`).
  if (boss.kind === "well") return '{ kind: "well" }';
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
  // THE SCOUT's arenas are named rather than written out, for SNAKE's reason
  // and more so: an arena is a dozen places in thousandths of a tile, and a
  // list of those read back into the wave file is a picture nobody could see
  // again (`packages/content/src/scout-arenas.ts`).
  if (boss.kind === "scout") return '{ kind: "scout", arenas: SCOUT_ARENAS }';
  // THE STARE has nothing to write out at all — the shortest of the fourteen,
  // with THE WELL's and for the same reason: the entry is the name.
  if (boss.kind === "stare") return '{ kind: "stare" }';
  // And THE BATON, the third: no column, no health and no cadence, because
  // the arm's length and every beat it keeps are tuning (`sim/config-baton.ts`).
  if (boss.kind === "baton") return '{ kind: "baton" }';
  // And THE THROAT, the fourth of the same length, and for the reason its own
  // entry gives: the clocks are the boss (`sim/config-throat.ts`).
  if (boss.kind === "throat") return '{ kind: "throat" }';
  // And THE UNDERTOW, the fifth of that length: no column, because it draws its own; no
  // health, because the pushes are counted (`sim/config-undertow.ts`).
  if (boss.kind === "undertow") return '{ kind: "undertow" }';
  // And THE GORGE, the sixth: no column, the sack is centred and as wide as
  // the field allows; no health, it runs backwards (`sim/config-gorge.ts`).
  if (boss.kind === "gorge") return '{ kind: "gorge" }';
  // And THE CURTAIN, the seventh: no column, the sheet is centred and its core
  // rolled behind it; no health, the hem's lobes are it (`sim/config-curtain.ts`).
  if (boss.kind === "curtain") return '{ kind: "curtain" }';
  // And THE TASTER, the eighth: no column, the crest is centred and as wide as
  // the field allows; no health, the fan is eleven blades and every one of
  // their colours is read off what the pair has spent (`sim/config-taster.ts`).
  if (boss.kind === "taster") return '{ kind: "taster" }';
  // And THE SINEW, the ninth: no column, the mass hangs over the middle; no
  // health, the fibres are it (`sim/config-sinew.ts`).
  if (boss.kind === "sinew") return '{ kind: "sinew" }';
  // And THE LEDGER, the tenth: no column, the body stands over the middle and
  // the cord's socket walks from under it; no health, the seam is it
  // (`sim/config-ledger.ts`).
  if (boss.kind === "ledger") return '{ kind: "ledger" }';
  // And THE SURGE, the eleventh: no column, the bulb hangs over the middle; no
  // health, the notches are it (`sim/config-surge.ts`).
  if (boss.kind === "surge") return '{ kind: "surge" }';
  // And THE LEAD, the twelfth: no column, the body comes in over the middle
  // and walks; no health, the stalk is it (`sim/config-lead.ts`).
  if (boss.kind === "lead") return '{ kind: "lead" }';
  // And THE SCUTTLE, the thirteenth: no column, the frame hangs over the
  // middle; no health, the parts are it (`sim/config-scuttle.ts`).
  if (boss.kind === "scuttle") return '{ kind: "scuttle" }';
  // And THE ANTIPHON, the fourteenth: no column, the body rises over the
  // middle; no health, the pits are it (`sim/config-antiphon.ts`).
  if (boss.kind === "antiphon") return '{ kind: "antiphon" }';
  // And THE HIVE, the fifteenth: no column, the sites are sown by the seed;
  // no health, the unsealed sites are it (`sim/config-hive.ts`).
  if (boss.kind === "hive") return '{ kind: "hive" }';
  // THE INSTAR's script is named rather than written out, for THE PULSE's
  // reason: a beat list of poses, marks and clocks is authored to be read
  // down a page (`packages/content/src/instar-script.ts`).
  if (boss.kind === "instar") return '{ kind: "instar", steps: INSTAR_SCRIPT }';
  // THE NETTLE's the same way (`packages/content/src/nettle-script.ts`).
  if (boss.kind === "nettle") return '{ kind: "nettle", steps: NETTLE_SCRIPT }';
  // THE FILAMENT's paths are words a hand walks (`sim/filament.ts`), named
  // for the same reason (`packages/content/src/filament-script.ts`).
  if (boss.kind === "filament") return '{ kind: "filament", filaments: FILAMENT_SCRIPT }';
  // THE SPOOL authors nothing at all: four ribs are its silhouette,
  // every window is tuning, and the rate each leg asks for is rolled off the
  // seed so a pair cannot learn a wave by heart (`sim/spool.ts`).
  if (boss.kind === "spool") return '{ kind: "spool" }';
  // THE HASP authors nothing either: the three clasps are its silhouette and
  // every fuse and winding in it is tuning (`sim/boss-entries-clocks.ts`).
  if (boss.kind === "hasp") return '{ kind: "hasp" }';
  // THE RATCHET the same: seven teeth is its silhouette (`sim/ratchet.ts`).
  if (boss.kind === "ratchet") return '{ kind: "ratchet" }';
  // THE GIMBAL's alignments are three bearings apiece and named for the same
  // reason (`packages/content/src/gimbal-script.ts`).
  if (boss.kind === "gimbal") return '{ kind: "gimbal", marks: GIMBAL_SCRIPT }';
  // THE MANTLE's thresholds are named for the same reason
  // (`packages/content/src/mantle-script.ts`).
  if (boss.kind === "mantle") return '{ kind: "mantle", thresholds: MANTLE_SCRIPT }';
  // THE KEEL's two fields are short enough to read on one line, SPLICE's
  // reason: a colour and three segment indices.
  if (boss.kind === "keel") {
    return `{ kind: "keel", socket: "${boss.socket}", reprise: [${boss.reprise.join(", ")}] }`;
  }
  // THE VALVE's marks are three bearings, the same reason.
  if (boss.kind === "valve") return `{ kind: "valve", marks: [${boss.marks.join(", ")}] }`;
  // THE SEAM's script, a step to a line's worth each.
  if (boss.kind === "seam") {
    const steps = boss.steps.map(
      (s) => `{ ask: "${s.ask}", color: "${s.color}", offset: ${s.offset}, seals: ${s.seals} }`,
    );
    return `{ kind: "seam", steps: [${steps.join(", ")}] }`;
  }
  // THE OCULUS's the same.
  if (boss.kind === "oculus") {
    const steps = boss.steps.map(
      (s) => `{ ask: "${s.ask}", color: "${s.color}", beats: ${s.beats} }`,
    );
    return `{ kind: "oculus", steps: [${steps.join(", ")}] }`;
  }
  // THE VISE's the same.
  if (boss.kind === "vise") {
    const steps = boss.steps.map(
      (s) => `{ ask: "${s.ask}", color: "${s.color}", beats: ${s.beats} }`,
    );
    return `{ kind: "vise", steps: [${steps.join(", ")}] }`;
  }
  // THE RIME's the same.
  if (boss.kind === "rime") {
    const steps = boss.steps.map(
      (s) => `{ ask: "${s.ask}", color: "${s.color}", beats: ${s.beats} }`,
    );
    return `{ kind: "rime", steps: [${steps.join(", ")}] }`;
  }
  // THE TRIVET's the same, and each step says how many pads its chord is.
  if (boss.kind === "trivet") {
    const steps = boss.steps.map(
      (s) => `{ ask: "${s.ask}", pads: ${s.pads}, color: "${s.color}", beats: ${s.beats} }`,
    );
    return `{ kind: "trivet", steps: [${steps.join(", ")}] }`;
  }
  // THE SPLICE authors one number a round and the tangle is laid from the rng,
  // so a round is short enough to read on one line — and the list of them is
  // the whole fight, which is why it is written out here rather than named
  // like SNAKE's.
  if (boss.kind === "splice") {
    const rounds = boss.rounds.map((r) => `{ beats: ${r.beats} }`).join(", ");
    return `{ kind: "splice", rounds: [${rounds}] }`;
  }
  // The rounds go one per line: a sequence is read down the page, and putting
  // several on one line is how a diff of a boss stops being reviewable.
  const rounds = boss.rounds.map((r) => `        [${r.map((s) => `"${s}"`).join(", ")}],`);
  const lines = ["{", '      kind: "mirror",', "      rounds: [", ...rounds, "      ],", "    }"];
  return lines.join("\n");
}

/**
 * **A `Malfunction` as its own source, arm by arm**, and every field of the arm
 * is written: one this misses is one the editor deletes the first time somebody
 * saves the wave that carried it.
 *
 * Here beside the boss's own line for the same reason that one is here — both
 * are a *wave's* one-line fact written back out, and `serialize.ts` is the file
 * that fills up (`sim/malfunction.ts`).
 */
export function faultLine(m: WaveFault): string {
  const parts = [`kind: "${m.kind}"`];
  if (m.kind === "cannon" && m.color !== undefined) parts.push(`color: "${m.color}"`);
  // THE FLIP's seat, on the same terms as the colour above: it is the only
  // thing this fault says, and a save that dropped it would turn every
  // navigator's flip into a pilot's on the way through the editor
  // (`content/wave-faults.ts`, `sim/flip.ts`).
  if (m.kind === "flip" && m.seat !== undefined) parts.push(`seat: ${m.seat}`);
  // The rows it is placed on, and both are optional on purpose: a fault that
  // names neither enters on the wave's first beat and holds to the end, which
  // is every fault the game had before they were placed at all
  // (`content/wave-faults.ts`).
  if (m.at !== undefined) parts.push(`at: ${m.at}`);
  if (m.beats !== undefined) parts.push(`beats: ${m.beats}`);
  return `{ ${parts.join(", ")} }`;
}
