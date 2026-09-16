import type { RepriseState } from "./reprise-state.js";
import { spawnOne } from "./spawn.js";
import type { World } from "./world.js";

/**
 * **THE REPRISE's clock**: the beat that decides whether the wave the pair can
 * see is running, and the beat that sends one back at them unseen.
 *
 * It is called from `onBeat` *before* `spawnArrivals` and not from `stepBoss`,
 * which is where every other boss's beat is. The reason is that this boss has
 * no move of its own at all: what it does is put bodies on the field, so it
 * belongs beside the only other thing that does, and an echoed arrival has to
 * stand on the field for the same beat an authored one does — the queue's
 * bodies and the echo's are one row of arrivals or the pair would be shown two
 * different kinds of "just arrived".
 *
 * **Nothing here writes `world.queue`.** The echo is the script read a second
 * time: `from` and `cursor` are indices into it, `spawnOne` is the same arrival
 * every authored body goes through, and what marks the difference is one flag
 * written onto the body afterwards. So a replay of an echoed wave is a replay
 * of the wave — the entries, their order and their columns are the author's,
 * and the fingerprint carries the cursors rather than a second copy of them
 * (`reprise-state.ts`).
 */

/** One beat of the mechanism, before the wave's own arrivals are asked for. */
export function sendEcho(world: World): void {
  const boss = world.boss;
  if (boss === null || boss.kind !== "reprise") return;
  // Everything sent, everything sent again, and nothing left standing: the
  // mechanism is spent and takes itself off, which is what lets the wave end
  // at all (`beat.ts` holds a wave open for as long as a boss is installed).
  // A beat later than the last body rather than on it, so the count is not
  // taken off the screen while the thing it counted is still falling.
  if (boss.at < 0 && boss.from >= world.queue.length && world.creatures.length === 0) {
    world.boss = null;
    return;
  }
  if (boss.at < 0) openEcho(world, boss);
  if (boss.at < 0) return;
  // The wave's own clock stands still for this beat. It is the whole of
  // "the arrivals pause while the echo plays": `spawnArrivals` reads the queue
  // against `waveBeat - held`, so a held beat is a beat the script does not
  // advance through and the stretch takes up exactly where it left off.
  boss.held += 1;
  sendDue(world, boss);
  if (boss.left === 0) closeEcho(world, boss);
}

/**
 * The stretch is over: send it again. The bodies are the ones already spawned
 * since the stretch began — `from` to `world.spawned` — so a stretch is
 * whatever the wave actually put on the field in those beats rather than
 * whatever was authored for them, and an author who wrote nothing into a
 * stretch gets no echo of it instead of an empty one.
 */
function openEcho(world: World, boss: RepriseState): void {
  const seen = world.waveBeat - boss.held;
  if (seen - boss.since < boss.every) return;
  const count = world.spawned - boss.from;
  if (count === 0) {
    // A quiet stretch. Roll it forward rather than echoing nothing: the pair
    // is owed the wave it was written, not a pause of the same length.
    boss.since = seen;
    return;
  }
  boss.at = world.waveBeat;
  boss.cursor = boss.from;
  boss.left = count;
}

/**
 * Every body this beat of the echo owes, at the stretch's own spacing. The
 * offset is measured from the *first entry of the stretch* rather than from
 * the beat the stretch began on, so the echo opens on a body instead of on
 * however long the author happened to leave before the first one — and every
 * gap after that one is the gap the pair watched.
 */
function sendDue(world: World, boss: RepriseState): void {
  const base = world.queue[boss.from]?.beat ?? 0;
  const step = world.waveBeat - boss.at;
  while (boss.left > 0) {
    const entry = world.queue[boss.cursor];
    if (entry === undefined) {
      boss.left = 0;
      return;
    }
    if (entry.beat - base > step) return;
    const first = world.creatures.length;
    const said = world.events.length;
    spawnOne(world, entry);
    // **An arrival nobody can see says nothing.** `spawnArrivals` announces a
    // lure to the seat that has to answer it, and an announcement is a column
    // — which is the one thing this fight is about not being given. Dropped
    // rather than branched on inside `spawn.ts`: what a body's arrival says is
    // that file's business, and this boss's business is that none of it is
    // said.
    world.events.length = said;
    // The flag goes on the whole arrival, not on the entry's own body: three
    // kinds bring companions with them (`spawn-companions.ts`), and a rim
    // drawn around an invisible hub would be the hub drawn.
    for (let i = first; i < world.creatures.length; i++) world.creatures[i]!.unseen = true;
    boss.cursor += 1;
    boss.left -= 1;
  }
}

/**
 * The echo has sent its last body. The field is the pair's again from the next
 * beat, and the stretch that starts now runs from wherever the script had got
 * to — `world.spawned`, which has not moved since the echo opened.
 */
function closeEcho(world: World, boss: RepriseState): void {
  boss.at = -1;
  boss.cursor = 0;
  boss.since = world.waveBeat - boss.held;
  boss.from = world.spawned;
}
