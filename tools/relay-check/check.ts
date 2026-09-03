/**
 * Two devices against a real relay, headless.
 *
 * `packages/net` is unit-tested against a wire the test controls, which proves
 * the scheduler and proves nothing about the Durable Object, the seat handout
 * or the order a socket actually delivers in. This runs the game's own
 * `createLink` twice — the code the phone runs, not a copy of it — and asks the
 * only question worth asking: after a few thousand ticks, do the two worlds
 * still have the same fingerprint?
 *
 * It found the first bug it was pointed at, which no unit test could have: the
 * scheduler was built before beat zero and kept promises about a tick count
 * that was then thrown away.
 *
 *   bun run --cwd apps/server dev     # in one terminal
 *   bun run relay:check               # in another — same port, derived the same way
 *   bun run relay:check ws://127.0.0.1:8800 6 --split
 *
 * `--split` reaches into one of the two worlds on purpose, to prove the desync
 * detector is watching and not merely present.
 */
import { buildPods, buildQueue } from "@neon-spore/content";
import type { PlayerId } from "@neon-spore/net";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  resetClock,
  resetRun,
  startWave,
  step,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
// Relative on purpose: `apps/game` is an application, not a library, and giving
// it an entry point so one check could import it would be the wrong trade.
import { createLink, type Link } from "../../apps/game/src/link.js";
import { relayPort } from "../ports.js";

const tree = Bun.fileURLToPath(new URL("../../", import.meta.url));
const relay = process.argv[2]?.startsWith("ws")
  ? process.argv[2]
  : `ws://127.0.0.1:${relayPort(tree)}`;
const seconds = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 10);
const split = process.argv.includes("--split");
/** A third device on a room that has two. It must be told which of those it is. */
const crowd = process.argv.includes("--full");
/** One device drops out and comes back, which is what a locked phone does. */
const rejoin = process.argv.includes("--rejoin");
const ROOM = "TUVW";
const FRAME_MS = 16;
/** Ticks per frame. Two is roughly 120 Hz at 60 fps, which is what a phone does. */
const TICKS_PER_FRAME = 2;

const cfg = { ...DEFAULT_CONFIG };

// `apps/game/src/relay.ts` reads exactly one browser global that Bun does not
// have. `WebSocket` it does have.
Object.defineProperty(globalThis, "location", {
  configurable: true,
  value: { href: `http://headless/?relay=${relay}`, protocol: "http:", host: "headless" },
});

interface Device {
  name: string;
  world: World;
  link: Link;
  press: (player: PlayerId, command: Command) => void;
}

function device(name: string): Device {
  const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
  const pending: { player: PlayerId; command: Command }[] = [];
  const link = createLink({
    cfg,
    world,
    buffer: {
      drain: (tick: number): TimedCommand[] =>
        pending.splice(0, pending.length).map((p) => ({ tick, ...p })),
    },
    onStart: () => {
      resetClock(world, 0);
      resetRun(world);
      startWave(world, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
    },
    onStatus: () => {},
  });
  return {
    name,
    world,
    link,
    press: (player, command) => pending.push({ player, command }),
  };
}

const health = await fetch(`${relay.replace(/^ws/, "http")}/net/health`)
  .then((r) => r.json() as Promise<{ app?: string }>)
  .catch(() => null);
if (health?.app !== "neon-spore-relay") {
  console.error(`No relay at ${relay}. Start one: bun run --cwd apps/server dev`);
  process.exit(1);
}

const a = device("A");
const b = device("B");
/**
 * The gatecrasher. Built only when it is wanted, because a third device
 * existing at all is what the room is being asked about.
 */
const c = crowd ? device("C") : null;
a.link.join(ROOM);
setTimeout(() => b.link.join(ROOM), 300);

let elapsed = 0;
let hasSplit = false;
let hasCrowded = false;
let hasLeft = false;
let hasReturned = false;
await new Promise<void>((done) => {
  const timer = setInterval(() => {
    elapsed += FRAME_MS;
    const half = (seconds * 1000) / 2;
    for (const d of c ? [a, b, c] : [a, b]) {
      d.link.frame(FRAME_MS);
      for (let i = 0; i < TICKS_PER_FRAME && d.link.mayTick(); i++) {
        step(d.world, d.link.drain());
        d.link.checkpoint();
      }
    }
    if (split && !hasSplit && elapsed >= half) {
      hasSplit = true;
      b.world.score += 1;
    }
    if (c && !hasCrowded && elapsed >= half) {
      hasCrowded = true;
      c.link.join(ROOM);
    }
    // Out at the half, back a second later — the shape of a screen locking in
    // a pocket. The room stamps a fresh beat zero when it fills again, and
    // both devices have to throw the old run away rather than resume on a
    // tick count only one of them kept counting.
    if (rejoin && !hasLeft && elapsed >= half) {
      hasLeft = true;
      b.link.leave();
    }
    if (rejoin && hasLeft && !hasReturned && elapsed >= half + 1000) {
      hasReturned = true;
      b.link.join(ROOM);
    }
    if (a.link.status().state === "live" && elapsed % 320 === 0) {
      a.press(1, { kind: "cannonCol", col: (elapsed / 320) % cfg.cols });
      b.press(2, { kind: "fire", color: "red" });
    }
    if (elapsed >= seconds * 1000) {
      clearInterval(timer);
      done();
    }
  }, FRAME_MS);
});

const sa = a.link.status();
const sb = b.link.status();
const sc = c?.link.status();
// Open sockets keep the event loop alive for good, so the report ends in an
// explicit exit rather than in a process that looks like it hung.
a.link.leave();
b.link.leave();
c?.link.leave();
const hashA = hashWorld(a.world);
const hashB = hashWorld(b.world);
console.log(`A  seat ${sa.player}  ${sa.state}  rtt ${sa.rttMs}ms  tick ${a.world.tick}  ${hashA}`);
console.log(`B  seat ${sb.player}  ${sb.state}  rtt ${sb.rttMs}ms  tick ${b.world.tick}  ${hashB}`);

const agreed = a.world.tick === b.world.tick && hashA === hashB;
if (split) {
  const caught = sa.desyncTick !== null && sb.desyncTick !== null;
  console.log(caught ? `split caught at tick ${sa.desyncTick}` : "SPLIT WENT UNNOTICED");
  process.exit(caught ? 0 : 1);
}
if (sc) {
  console.log(`C  seat ${sc.player}  ${sc.state}`);
  // "full" and not "lost": a third phone is being turned away by a room that
  // is busy, and telling that player their connection died sends them to
  // check a signal that is fine. The two who were already playing must not
  // have noticed at all.
  const turnedAway = sc.state === "full";
  const undisturbed = sa.state === "live" && sb.state === "live" && agreed;
  console.log(turnedAway ? "third device told the room is full" : "THIRD DEVICE MISREAD THE ROOM");
  if (!undisturbed) console.error("the two already playing were disturbed by it");
  process.exit(turnedAway && undisturbed ? 0 : 1);
}
// A run that never desynced but also never happened proves nothing. After a
// rejoin the bar is lower on purpose: the room stamps a fresh beat zero, both
// worlds go back to tick 0, and what is left of the run is whatever the three
// second countdown did not eat.
const enoughTicks = rejoin ? 100 : 300;
if (!agreed || sa.state !== "live" || sb.state !== "live" || a.world.tick < enoughTicks) {
  console.error(
    rejoin ? "the two worlds did not come back in step" : "the two worlds did not stay in step",
  );
  process.exit(1);
}
console.log(rejoin ? "left, came back, in step" : "in step");
process.exit(0);
