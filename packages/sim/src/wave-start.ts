import { NO_BEARING } from "./bearing.js";
import { openWave } from "./briefing.js";
import { midCol } from "./config.js";
import type { PlacedFault } from "./fault-placed.js";
import { clearGrips } from "./grip.js";
import { endPrime } from "./lance.js";
import { clearSlow } from "./slow.js";
import { clearSpend } from "./spend.js";
import { installWaveBoss } from "./wave-boss.js";
import { NOT_FAILED } from "./wave-fail.js";
import type { BossEntry, PodEntry, SpawnEntry, World } from "./world.js";

/**
 * Begin playing a wave. The queue is built by the app from `content/` and
 * passed in, so the sim never needs to know about waves, act structure or
 * authored entries — it only knows a sequence of spawns. Direction stays
 * `content -> sim`.
 *
 * Only wave-local state is reset. Hull, scars, score and the guard balance
 * carry across waves, exactly as in the prototype: damage is permanent and the
 * balance is the record of the whole run.
 *
 * `hasGuide` is whether content wrote a `guide` on this wave. It is a boolean
 * and not the guide itself on purpose: the sim decides *whether* the field is
 * held and for how many states, and it never reads a word of what is on the
 * screen. A caller that leaves it out gets an introduction and then the wave.
 *
 * `faults` are the wave's malfunctions, each with the beat it enters on and
 * the number of beats it holds, and they arrive here beside the boss for the
 * reason the boss does: read once, before the first tick, identically on both
 * devices. A wave that places none is played straight, which is most of them.
 * It was one whole-wave fault until 15 September 2026 (`fault-placed.ts`).
 *
 * `hasLance` is the last of them and the only one that is the **panel's**:
 * whether holding a colour fills the cannon lobe at all. It is handed in for
 * the same reason — the sim may not read content, and the caller has the set
 * already (`content/src/control-sets.ts` `setLance`). Left out, the panel has
 * the gesture, which is STANDARD and every generated wave.
 */
export function startWave(
  world: World,
  waveIndex: number,
  queue: SpawnEntry[],
  podQueue: PodEntry[] = [],
  boss: BossEntry | null = null,
  hasGuide = false,
  guideSteps = 0,
  faults: PlacedFault[] = [],
  hasLance = true,
): void {
  const mid = midCol(world.cfg);
  world.wave = waveIndex;
  world.waveBeat = 0;
  world.spawned = 0;
  world.restBeat = 0;
  // Which try this is. A wave opened while a hit still holds the field is the
  // same wave gone again (`wave-fail.ts`), and that is the retry — counted
  // here, where it is taken, and not on the hit that asked for it; any other
  // opening — the next wave, a jump, a replay — is a first try. Read off
  // `failTick` rather than told, so two devices cannot be told differently.
  if (world.failTick === NOT_FAILED) {
    world.waveTries = 1;
  } else {
    world.waveTries += 1;
    world.retries += 1;
  }
  world.runTries += 1;
  world.failTick = NOT_FAILED;
  world.heldTick = NOT_FAILED;
  world.queue = queue;
  world.podQueue = podQueue;
  world.podSpawned = 0;
  world.creatures = [];
  world.bullets = [];
  clearGrips(world);
  // Nothing held, nothing charged and no column still burning — all three are
  // fields now (`shot-charge.ts`, `lance.ts`).
  endPrime(world);
  world.charge = null;
  world.beam = null;
  world.pods = [];
  world.guardTick = -1_000_000;
  world.intakeTick = -1_000_000;
  world.wardUntilTick = -1_000_000;
  world.lastFireTick = -1_000_000;
  // The fault, and the brake the seat holding it starts with unspent. Both are
  // wave-local: a scar, a pause and a rest are all measured from a tick, and a
  // wave that inherited one would open with a window already half run.
  world.faults = faults;
  // And the panel's hold, read through `lanceLeaks` everywhere (`lance.ts`).
  world.hasLance = hasLance;
  // And nothing standing still yet: a count carried across a wave would open
  // the next one already half-way to a round lost (`harpoon.ts`).
  world.leechStillTicks = 0;
  world.limpetStillTicks = 0;
  world.leechHarpoonId = 0;
  world.limpetHarpoonId = 0;
  // The arm home and empty. A wave that inherited one halfway up a column
  // would open with a hand reaching for something the last wave had.
  world.reachDir = 0;
  // And nobody's hand on the crank: a bearing kept across a wave would wind
  // the first sample of the next one against a finger that has gone
  // (`crank.ts`).
  world.crankAtMilli = NO_BEARING;
  world.reachCol = mid;
  world.reachMilli = 0;
  world.reachHeld = 0;
  world.cannonCol = mid;
  world.shieldCol = mid;
  world.shieldSinceTick = world.tick;
  world.boss = null;
  // And nothing slowed. A window inherited across a wave would open the next
  // one at a third of wall-clock rate with nothing dramatic happening in it
  // (`slow.ts`).
  clearSlow(world);
  // And nothing spent yet. The ledger is what the pair has spent **in this
  // fight**, so a taster that opened on the last wave's colours would grow its
  // first blade against a conversation they had already finished (`spend.ts`).
  clearSpend(world);

  // Which boss, and what it leaves on the field: one branch a boss, next door
  // (`wave-boss.ts`).
  installWaveBoss(world, boss);

  // Last: the wave's name and sentence stand on the field, then its guide if
  // it has one, and the field holds still behind both of them.
  openWave(world, hasGuide, guideSteps);

  world.events.push({ type: "waveStart", wave: waveIndex });
}
