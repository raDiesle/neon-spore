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
 *   bun run relay:check               # in another
 *   bun run relay:check ws://127.0.0.1:8787 6 --split
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

const relay = process.argv[2]?.startsWith("ws") ? process.argv[2] : "ws://127.0.0.1:8787";
const seconds = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 10);
const split = process.argv.includes("--split");
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
a.link.join(ROOM);
setTimeout(() => b.link.join(ROOM), 300);

let elapsed = 0;
await new Promise<void>((done) => {
  const timer = setInterval(() => {
    elapsed += FRAME_MS;
    for (const d of [a, b]) {
      d.link.frame(FRAME_MS);
      for (let i = 0; i < TICKS_PER_FRAME && d.link.mayTick(); i++) {
        step(d.world, d.link.drain());
        d.link.checkpoint();
      }
    }
    if (split && elapsed === (seconds * 1000) / 2) b.world.score += 1;
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
// Two open sockets keep the event loop alive for good, so the report ends in an
// explicit exit rather than in a process that looks like it hung.
a.link.leave();
b.link.leave();
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
if (!agreed || sa.state !== "live" || sb.state !== "live" || a.world.tick < 300) {
  console.error("the two worlds did not stay in step");
  process.exit(1);
}
console.log("in step");
process.exit(0);
