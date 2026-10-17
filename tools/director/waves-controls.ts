#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { beatSeconds, DEFAULT_CONFIG } from "@neon-spore/sim";
import { spanOf } from "./src/compose-check.js";
import { composeControlGroup, composeControlWave } from "./src/compose-control.js";
import { nameWaves } from "./src/compose-names.js";
import { controlWaveId } from "./src/control-brushes.js";
import { BLISTER_GESTURES, type BlisterGesture } from "./src/entry-fields-blister.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:controls [gesture…] [--after <wave id>] [--seed N] [--write]`
 *
 * One wave per on-screen control, composed (`src/compose-control.ts`): the
 * blisters in it all want that one gesture, and half of what falls is slicks
 * and bulbs. Without `--write` it prints them; with it they go in after
 * `--after` (FIVE BLISTERS unless named), in gesture order, through the
 * director's own save. A gesture that already has its wave is left alone.
 *
 * `--groups` makes each control's wave the head of a group of its own and
 * composes its three waves after it (`composeControlGroup`), on the first
 * of six seeds from `--seed` that fills all three; a control whose group is
 * already there is left alone.
 */

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? undefined : args[at + 1];
};
const named = args.filter(
  (a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"),
) as BlisterGesture[];
const unknown = named.find((g) => !BLISTER_GESTURES.includes(g));
if (unknown) {
  console.error(`no gesture ${unknown}: one of ${BLISTER_GESTURES.join(", ")}`);
  process.exit(2);
}
if (args.includes("--groups")) await groups();

/** `--groups`: every control's wave a head, with its three after it. */
async function groups(): Promise<never> {
  let list: Wave[] = [...WAVES];
  const made = new Set<string>();
  for (const gesture of BLISTER_GESTURES) {
    const id = controlWaveId(gesture);
    const head = list.findIndex((w) => w.id === id);
    if (head === -1 || list.some((w) => w.id === `${id}Again`)) continue;
    const { variant: _v, ...wave } = list[head] as Wave;
    list[head] = wave;
    // The first seed that fills all three, from `--seed` on, as `waves:order` tries.
    const first = Number(flag("seed") ?? 0);
    const tries = [0, 4, 8, 12, 16, 20].map((s) =>
      composeControlGroup(list, gesture, head + 1, first + s),
    );
    const whole = (g: (typeof tries)[number]) => typeof g !== "string" && g.every((c) => c.wave);
    const got = tries.find(whole) ?? (tries[0] as (typeof tries)[number]);
    const out = typeof got === "string" ? [] : got.flatMap((c) => (c.wave ? [c.wave] : []));
    if (typeof got === "string" || out.length !== got.length) {
      const why = typeof got === "string" ? got : got.flatMap((c) => c.faults).join("; ");
      console.error(`${id}: ${why}`);
      process.exit(1);
    }
    console.log(`${id.padEnd(16)}${got.map((c) => `${c.pressure}/${c.talk}`).join(" ")}`);
    for (const w of out) made.add(w.id);
    list = [...list.slice(0, head + 1), ...out, ...list.slice(head + 1)];
  }
  if (made.size === 0) console.log("nothing to compose: every control has its group");
  if (!args.includes("--write") || made.size === 0) process.exit(0);
  const { complaint, rels } = await writeWaves(nameWaves(list, made));
  if (complaint) {
    console.error(complaint);
    process.exit(1);
  }
  console.log(`wrote ${made.size} waves into ${rels.length} files`);
  console.log("then: bun run waves:soften, waves:measure, briefings:renumber, baseline:blank");
  process.exit(0);
}

const after = flag("after") ?? "fiveBlisters";
const at = WAVES.findIndex((w) => w.id === after);
if (at === -1) {
  console.error(`no wave with the id ${after}`);
  process.exit(1);
}
const seed = Number(flag("seed") ?? 0);
const taken = new Set(WAVES.map((w) => w.id));
const gestures = (named.length > 0 ? named : BLISTER_GESTURES).filter(
  (g) => !taken.has(controlWaveId(g)),
);
const seconds = (beats: number) => (beats * beatSeconds(DEFAULT_CONFIG)).toFixed(0);

let list: Wave[] = [...WAVES];
const made: Wave[] = [];
let failed = false;
console.log("id                 span  arrivals  blisters  pressure  AUTO clears");
for (const gesture of gestures) {
  const insertAt = at + 1 + made.length;
  const got = composeControlWave(list, gesture, insertAt, seed);
  if (typeof got === "string") {
    console.log(`${controlWaveId(gesture).padEnd(19)}— ${got}`);
    failed = true;
    continue;
  }
  const { wave } = got;
  const blisters = wave.entries.filter((e) => e.kind === "blister").length;
  console.log(
    `${wave.id.padEnd(19)}${String(spanOf(wave)).padEnd(6)}${String(wave.entries.length).padEnd(10)}` +
      `${String(blisters).padEnd(10)}${got.pressure.toFixed(1).padEnd(10)}` +
      `${got.cleared} beats, ${seconds(got.cleared)} s`,
  );
  list = [...list.slice(0, insertAt), wave, ...list.slice(insertAt)];
  made.push(wave);
}
if (gestures.length === 0) console.log("nothing to compose: every control has its wave");
if (!args.includes("--write")) process.exit(failed ? 1 : 0);
if (made.length === 0) process.exit(failed ? 1 : 0);
const { complaint, rels } = await writeWaves(nameWaves(list, new Set(made.map((w) => w.id))));
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${made.length} waves into ${rels.join(", ")}`);
console.log("then: bun run briefings:renumber");
