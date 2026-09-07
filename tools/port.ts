#!/usr/bin/env bun

/**
 * `bun run port` — which port this checkout's servers answer on.
 *
 * The number is derived from the tree's own path and is therefore knowable
 * before anything is started, and that is the half a session in a worktree
 * kept having to work out by hand. `CLAUDE.md` says to launch by absolute path
 * and to read the port off the server's own startup line, and both are right —
 * but a session that wants to hand the owner a URL, or to write a throwaway
 * `.claude/launch.json` entry, needs the number *first*, and the incantation
 * for it was a paste of `derivePort` nobody could remember.
 *
 * It prints both candidates, because there are two and which one answers is
 * not a property of the tree. `claimPort` tries the base always — 4174 for the
 * director, 4173 for the preview — and falls back to the tree's own number
 * only when the base is already held by the same server serving a *different*
 * checkout. That correction is what `docs/working-with-claude.md` records on
 * 3 September 2026, and a session that believed the shorter rule probed the
 * derived port, got nothing, and concluded its own server had failed to start.
 *
 * So the base is probed rather than assumed, with `holderOf`, which asks the
 * same question `claimPort` asks and does not act on the answer. Nothing here
 * starts, stops or retires anything.
 */

import { relative } from "node:path";
import {
  DIRECTOR_BASE,
  derivePort,
  holderOf,
  PREVIEW_BASE,
  RELAY_BASE,
  relayPort,
} from "./ports.js";
import { SERVERS, type ServerName } from "./servers.js";

const ROOT = Bun.fileURLToPath(new URL("..", import.meta.url));

interface Answer {
  name: string;
  /** The port this tree's server will take, as far as anything can be known now. */
  port: number;
  /** The other candidate, when there is one. */
  fallback?: number;
  note: string;
}

async function settle(name: ServerName): Promise<Answer> {
  const spec = SERVERS[name];
  const derived = derivePort(spec.band, ROOT);
  const held = await holderOf({ ...spec, tree: ROOT }, spec.base);
  if (held === "other") {
    return {
      name,
      port: derived,
      fallback: spec.base,
      note: `${spec.base} is held by another checkout's ${name} — this tree steps aside`,
    };
  }
  if (held === "stranger") {
    return {
      name,
      port: derived,
      fallback: spec.base,
      note: `${spec.base} is held by something that is not the ${name} — start it and read its line`,
    };
  }
  return {
    name,
    port: spec.base,
    fallback: derived,
    note:
      held === "mine"
        ? `this tree's ${name} is already answering there`
        : `${spec.base} is free, and the base is always tried first`,
  };
}

/**
 * The relay is the one that really is derived unconditionally: wrangler answers
 * no marker, so there is nothing to settle with and no reason to probe.
 */
function relay(): Answer {
  const port = relayPort(ROOT);
  return {
    name: "relay",
    port,
    note:
      port === RELAY_BASE
        ? "wrangler's own default, and this is the main checkout"
        : "derived, always — wrangler answers no marker to settle with",
  };
}

function print(a: Answer): void {
  console.log(`${a.name.padEnd(9)} ${String(a.port).padEnd(6)} http://localhost:${a.port}`);
  console.log(`          ${a.note}`);
  if (a.fallback !== undefined) console.log(`          the other candidate is ${a.fallback}`);
}

const asked = process.argv[2];
const names: ServerName[] = ["director", "preview"];

if (asked !== undefined && asked !== "relay" && !names.includes(asked as ServerName)) {
  console.error(`unknown server ${JSON.stringify(asked)} — director | preview | relay`);
  process.exit(1);
}

const tree = relative(process.cwd(), ROOT) || ".";
console.log(`${ROOT}${tree === "." ? "" : ` (from ${process.cwd()})`}`);
console.log(
  `base ports: director ${DIRECTOR_BASE}, preview ${PREVIEW_BASE}, relay ${RELAY_BASE}\n`,
);

if (asked === "relay") print(relay());
else if (asked) print(await settle(asked as ServerName));
else {
  for (const name of names) print(await settle(name));
  print(relay());
}
