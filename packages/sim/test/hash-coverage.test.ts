import { describe, expect, it } from "bun:test";
import { CREATURE_KINDS } from "../src/creature-kinds.js";
import { FLEET_DIRS } from "../src/fleet-board.js";
import { GAUGE_PHASES } from "../src/gauge.js";
import { hashWorld } from "../src/hash.js";
import { MAZE_PHASES } from "../src/maze.js";
import { MIRROR_PHASES, MIRROR_STEPS } from "../src/simon.js";
import { SNAKE_PHASES } from "../src/snake.js";
import { POD_KINDS } from "../src/types.js";
import type { World } from "../src/world.js";
import { FIXTURE_BOSSES, populatedWorld } from "./hash-fixture.js";

/**
 * The rule from docs/decisions.md #23, as a test rather than as a promise:
 * **every field of the world is in the fingerprint unless it is a named
 * exception.** `hash.test.ts` next door asserts ten fields by hand, which is
 * how eight came to be missing — a hand-written list can only cover what
 * somebody remembered.
 *
 * So this one does not name fields at all. It walks the world the fixture
 * built, changes one leaf at a time, and requires `hashWorld` to notice.
 * A field added to `World`, to a creature, to a bullet or to a boss and left
 * out of the fingerprint fails here, by its own path, with no test to write.
 *
 * **When it fails, there are exactly two right answers**, and the burden is on
 * the second: push the field in `hash.ts` or `hash-boss.ts`, or add it to
 * `EXCEPTIONS` below with the reason it cannot desync two devices. A field is
 * an exception when it is an *input* agreed before beat zero, or a fact about
 * the picture rather than about the world, or derived from something already
 * in here.
 */

/**
 * Paths outside the fingerprint, with the reason each one is out. Array
 * indices are written `*`. A prefix covers its whole subtree.
 */
const EXCEPTIONS: Record<string, string> = {
  cfg: "agreed before beat zero and never mutated mid-run; hashing it restates the handshake",
  queue: "the wave's script, handed in from content and read by index — `spawned` is how far",
  podQueue: "the same, with `podSpawned`",
  events: "cleared every tick and derived from the step that just ran",
  "creatures.*.fromRow": "where a body came from is a fact about the picture, not about the world",
  "creatures.*.fromCol": "the same, sideways",
  "scars.*.kind": "derived from the creature that made it, whose kind is hashed",
  "scars.*.span": "derived through `spanOf` from that same creature",
  "boss.scars.*.kind": "as above, for a boss that keeps its own damage",
  "boss.scars.*.span": "as above",
  "boss.kind": "pushed first as a tag by `bossHashParts`; a boss cannot change kind mid-run",
};

/** Whether this path, or a parent of it, is a named exception. */
function excepted(path: string): boolean {
  const parts = path.split(".");
  for (let i = parts.length; i > 0; i--) {
    if (parts.slice(0, i).join(".") in EXCEPTIONS) return true;
  }
  return false;
}

/**
 * A different member of whichever closed set this value belongs to.
 *
 * Value-driven rather than path-driven on purpose: a new string field whose
 * values are one of the sets the simulation already has is covered the day it
 * is added, and one whose values are a set nobody declared fails loudly, which
 * is the right outcome — an undeclared string union is a thing two devices can
 * disagree about in more ways than anybody counted.
 */
const FAMILIES: readonly (readonly string[])[] = [
  ["red", "cyan"],
  CREATURE_KINDS,
  POD_KINDS,
  MIRROR_STEPS,
  MAZE_PHASES,
  MIRROR_PHASES,
  GAUGE_PHASES,
  FLEET_DIRS,
  SNAKE_PHASES,
];

function otherValue(value: string): string | null {
  for (const family of FAMILIES) {
    if (!family.includes(value)) continue;
    const other = family.find((v) => v !== value);
    if (other !== undefined) return other;
  }
  return null;
}

interface Leaf {
  path: string;
  /** What to make of the value there, so the failure message can say it. */
  change: (holder: Record<string, unknown>, key: string) => string | null;
}

/** Every mutable leaf of the world, and every array whose length is a fact. */
function leaves(node: unknown, path: string, out: Leaf[]): void {
  if (Array.isArray(node)) {
    if (!excepted(path) && node.length > 0) {
      out.push({
        path: `${path}.length`,
        change: (holder, key) => {
          const list = holder[key] as unknown[];
          list.push(structuredClone(list[list.length - 1]));
          return "one longer";
        },
      });
    }
    // Element zero only. Every element of a list has the same shape, and the
    // walk writes to index zero — a second pass would name paths it cannot
    // reach and report them as missing fields.
    if (node.length > 0) leaves(node[0], `${path}.*`, out);
    return;
  }
  if (node !== null && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      leaves(child, path === "" ? key : `${path}.${key}`, out);
    }
    return;
  }
  if (excepted(path)) return;
  if (typeof node === "number") {
    out.push({
      path,
      change: (holder, key) => {
        holder[key] = (holder[key] as number) + 1;
        return "one higher";
      },
    });
    return;
  }
  if (typeof node === "boolean") {
    out.push({
      path,
      change: (holder, key) => {
        holder[key] = !(holder[key] as boolean);
        return "flipped";
      },
    });
    return;
  }
  if (typeof node === "string") {
    out.push({
      path,
      change: (holder, key) => {
        const other = otherValue(holder[key] as string);
        if (other === null) return null;
        holder[key] = other;
        return `set to ${other}`;
      },
    });
    return;
  }
  // Null or undefined: the fixture left it empty, so the walk cannot say
  // whether the field is covered. That is a fixture bug, reported as one.
  out.push({ path, change: () => null });
}

/**
 * The thing a path points into, and the key to write there.
 *
 * A `*` step is always index 0: the fixture puts one of everything in each
 * list, so there is never a second element to disambiguate — and a `*` in the
 * *last* position is an element of an array rather than a field of an object,
 * which is the one case worth spelling out. Writing `list["*"]` instead of
 * `list[0]` sets a property nothing reads, and the mutation then proves
 * nothing while looking exactly like a missing field.
 */
function holderOf(root: World, path: string): { holder: Record<string, unknown>; key: string } {
  const parts = path.split(".");
  const last = parts.pop() ?? "";
  let node: unknown = root;
  for (const part of parts) {
    node = part === "*" ? (node as unknown[])[0] : (node as Record<string, unknown>)[part];
  }
  return { holder: node as Record<string, unknown>, key: last === "*" ? "0" : last };
}

describe("the fingerprint covers the world", () => {
  for (const bossKind of FIXTURE_BOSSES) {
    describe(`with THE ${bossKind.toUpperCase()} installed`, () => {
      const found: Leaf[] = [];
      leaves(populatedWorld(bossKind), "", found);

      it("walks a world with something in it", () => {
        expect(found.length).toBeGreaterThan(40);
      });

      for (const leaf of found) {
        it(`notices ${leaf.path}`, () => {
          const before = populatedWorld(bossKind);
          const after = populatedWorld(bossKind);
          expect(hashWorld(after)).toBe(hashWorld(before));

          // `length` is written by pushing onto the array itself, so the
          // holder is the array's own parent and the key is its name.
          const isLength = leaf.path.endsWith(".length");
          const target = isLength ? leaf.path.slice(0, -".length".length) : leaf.path;
          const { holder, key } = holderOf(after, target);
          const what = leaf.change(holder, key);
          expect(
            what,
            `${leaf.path} could not be changed — give it a value in hash-fixture.ts, or a family in FAMILIES`,
          ).not.toBeNull();

          expect(
            hashWorld(after),
            `${leaf.path} (${what}) is outside hashWorld — push it in hash.ts/hash-boss.ts, or name it in EXCEPTIONS with the reason it cannot desync two devices`,
          ).not.toBe(hashWorld(before));
        });
      }
    });
  }

  /**
   * The top level, written down. The walk above can only see a field that
   * exists on the fixture; this fails when one is *added* to `World`, which is
   * the moment somebody has to decide whether it is hashed or excepted.
   */
  it("knows every field of World", () => {
    const keys = Object.keys(populatedWorld("queen")).sort();
    expect(keys).toEqual(
      [
        "balance",
        "beat",
        "boss",
        "brief",
        "bullets",
        "cannonCol",
        "cfg",
        "charge",
        "creatures",
        "events",
        "guard",
        "guardTick",
        "gripP1",
        "gripP2",
        "hullMilli",
        "intakeTick",
        "lastFireTick",
        "nextId",
        "over",
        "podQueue",
        "podSpawned",
        "pods",
        "primeTick",
        "queue",
        "restBeat",
        "rng",
        "scars",
        "score",
        "shieldCol",
        "spawned",
        "tick",
        "wardUntilTick",
        "wave",
        "waveBeat",
      ].sort(),
    );
  });

  /** Two different bosses are two different worlds, tag alone. */
  it("tells one boss from another", () => {
    const seen = new Set(FIXTURE_BOSSES.map((k) => hashWorld(populatedWorld(k))));
    expect(seen.size).toBe(FIXTURE_BOSSES.length);
  });

  /** Every exception names something that is actually there. */
  it("carries no stale exception", () => {
    const paths = new Set<string>();
    const walk = (node: unknown, path: string): void => {
      if (path !== "") paths.add(path);
      if (Array.isArray(node)) {
        for (const child of node) walk(child, `${path}.*`);
        return;
      }
      if (node !== null && typeof node === "object") {
        for (const [key, child] of Object.entries(node)) {
          walk(child, path === "" ? key : `${path}.${key}`);
        }
      }
    };
    for (const kind of FIXTURE_BOSSES) walk(populatedWorld(kind), "");
    for (const path of Object.keys(EXCEPTIONS)) {
      expect(paths.has(path), `EXCEPTIONS names ${path}, which no longer exists`).toBe(true);
    }
  });
});
