import { describe, expect, it } from "bun:test";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";

/**
 * Rules 1 and 2 of CLAUDE.md are enforced here, not in prose. Determinism is
 * the one thing a reviewer cannot see by looking: a single `Math.random` in
 * `sim` desynchronises two devices a minute later, in a way that reads like a
 * network bug. So the rule is a failing test — it runs in `bun test`, in CI,
 * and in the PostToolUse hook after every edit inside `packages/sim`.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GUARDED = ["packages/sim/src", "packages/content/src"];

interface Ban {
  /** Matched against source with comments and string literals removed. */
  pattern: RegExp;
  why: string;
}

const BANS: Ban[] = [
  {
    pattern: /\bMath\s*\.\s*random\b|\bMath\s*\[\s*["'`]random/,
    why: "Non-deterministic. Use the seeded Rng from @neon-spore/sim.",
  },
  {
    pattern: /\bDate\s*\.\s*now\b|\bnew\s+Date\b|\bperformance\s*\.\s*now\b/,
    why: "Non-deterministic. Time comes from the tick counter.",
  },
  {
    pattern: /(?<![.\w$])(window|document|navigator|localStorage|requestAnimationFrame)(?![\w$])/,
    why: "sim and content are headless. No DOM — the host drives ticks.",
  },
  {
    pattern: /\bfrom\s*["'][^"']*render[^"']*["']|\brequire\s*\(\s*["'][^"']*render/,
    why: "sim must not import render. State flows one way: sim -> render.",
  },
];

/**
 * Comments and string literals are not code. Stripping them keeps the bans
 * honest: this very file names `Math.random` and must not fail itself, and a
 * message that explains the rule may quote it.
 */
function stripNonCode(source: string): string {
  return (
    source
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
      .replace(/`(?:[^`\]|[\s\S])*`/g, '""')
      // A quoted string's own body is anything but its closing quote or a
      // literal backslash, or a backslash-escaped pair — never "any letter
      // except n": `[^"\\n]` used to exclude the letter n itself, so a hint
      // string with an ordinary word like "navigator" in it was never
      // stripped and read as real code. `bosses.md` 11.0's own hint text is
      // what caught it.
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, '""')
  );
}

function sourceFiles(dir: string): string[] {
  const glob = new Glob("**/*.ts");
  return [...glob.scanSync(join(ROOT, dir))].map((f) => join(ROOT, dir, f));
}

describe("determinism", () => {
  const files = GUARDED.flatMap(sourceFiles);

  it("guards a non-empty set of files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const name = relative(ROOT, file).replaceAll("\\", "/");
    it(`${name} uses no wall clock, no randomness, no DOM, no render`, async () => {
      const code = stripNonCode(await Bun.file(file).text());
      const broken = BANS.filter((ban) => ban.pattern.test(code));
      expect(broken.map((ban) => ban.why)).toEqual([]);
    });
  }
});

interface Copy {
  /** What to call instead. */
  call: string;
  /** The one file allowed to contain the arithmetic — it is the definition. */
  owner: string;
  /** The shape of the rule written out by hand. */
  pattern: RegExp;
  /** Whether to strip comments and strings before testing. Defaults to true. */
  strip?: boolean;
  /**
   * Other files the pattern is allowed in, because they own a neighbouring
   * rule written out of the same pieces. One entry, today: the pose clock and
   * the contour clock are both spread by `bodyPhase`, and the file that owns
   * the second one cannot be written without naming the first.
   *
   * Never a way to quiet a row. A file here is a file that *defines*
   * something, and the reviewer's question about a new entry is which rule it
   * owns — if the answer is "none", the row is right and the file is wrong.
   */
  also?: string[];
}

/**
 * Each row is a rule the simulation owns. The row exists because someone has
 * already re-derived that rule rather than importing it. Adding a row is how a
 * defect that got through review once is stopped from getting through twice.
 */
const COPIES: Copy[] = [
  {
    // The mouth's offset was a constant, and `cannon-maw.ts` copied the number
    // under a comment saying it was `drawMuzzle`'s — true when written, false
    // the moment the swallow was reshaped and the offset began easing to zero.
    // Two things draw into this opening now; a wind-up gathering its bolt
    // where the mouth used to be is what a second copy buys.
    //
    // Two spellings, because the offset moved from a module constant onto
    // `MOUTH_LOOK` and either name is a copy worth catching. `MUZZLE_DROP` no
    // longer exists, so nothing can match it by accident — but a file that
    // declares its own and multiplies it out is the same defect under the old
    // name, and dropping the alternative would have narrowed this rule by
    // exactly that case for no gain.
    call: "muzzleCenterY",
    owner: "packages/render/src/muzzle.ts",
    pattern: /(MUZZLE_DROP|MOUTH_LOOK\.drop)\s*\*\s*\(\s*1\s*-\s*intake\s*\)/,
    strip: false,
  },
  {
    // Which panel a wave is played on. The rule is that a wave naming nothing
    // is played on the default set, and it is one `??` — which is exactly the
    // size of thing a second reader writes out again rather than importing.
    // Two copies of it is how a director page and the band come to disagree
    // about which buttons a wave has.
    call: "controlSetForWave",
    owner: "packages/content/src/control-sets.ts",
    pattern: /\bcontrols\s*\?\?/,
    strip: false,
  },
  {
    call: "mapCol",
    owner: "packages/content/src/queue.ts",
    pattern: /\bAUTHORED_COLS\s*-\s*1\b/,
  },
  {
    // Turning a wave's authored `color` back into the kind it spawns is
    // `queueFromWave`'s job, and asking a *wave* what it contains is the
    // question `mechanics.ts` had to answer without becoming a second copy of
    // it. The ternary is the whole of the translation, so it is the shape to
    // watch: written out again, it is a place where a wave and the field it
    // produces can start disagreeing about what is in it.
    call: "queueFromWave",
    owner: "packages/content/src/queue.ts",
    pattern: /\bcolor\s*\?\s*kindForColor\s*\(/,
    strip: false,
  },
  {
    call: "livingKindForColor",
    owner: "packages/sim/src/kinds.ts",
    pattern: /"red"[\s\S]{0,30}"slick"|"slick"[\s\S]{0,30}"red"/,
    strip: false,
  },
  {
    call: "isMeteorKind",
    owner: "packages/sim/src/kinds.ts",
    pattern: /\bkind\s*===\s*"meteor"/,
    strip: false,
  },
  {
    call: "radarOwner",
    owner: "packages/content/src/creatures.ts",
    pattern: /controls\s*\.\s*includes\s*\(\s*"guard"\s*\)\s*\?\s*"p1"\s*:\s*"p2"/,
    strip: false,
  },
  {
    call: "categoryOf",
    owner: "packages/content/src/creatures.ts",
    pattern: /kind\s*===\s*"queen"\s*\?\s*"mixed"/,
    strip: false,
  },
  {
    call: "mirrorListenBeats",
    owner: "packages/sim/src/simon.ts",
    pattern: /MIRROR_LISTEN_PER_STEP\s*\+\s*MIRROR_LISTEN_SLACK/,
    strip: false,
  },
  {
    call: "mirrorHoldsControls",
    owner: "packages/sim/src/mirror.ts",
    pattern: /phase\s*===\s*"lead"\s*\|\|[\s\S]{0,20}phase\s*===\s*"show"/,
    strip: false,
  },
  {
    call: "occupiesCol",
    owner: "packages/sim/src/kinds.ts",
    pattern: /c\s*\.\s*col\s*===\s*col\b/,
    strip: false,
  },
  {
    // The disguise, and the one rule in this table whose second copy is not a
    // drift but a *tell*. A lure is a full-size slick or bulb in every pixel
    // player 1 owns; every appearance derived from a kind — contour,
    // own-motion, the bulb's interior — has to be derived from `wornKind`
    // instead. One site left asking `c.kind` and player 1 can pick the lure
    // out before it goes, which is the whole wave.
    call: "wornKind",
    owner: "packages/sim/src/creature-rules.ts",
    pattern: /kind\s*===\s*"lure"\s*\?/,
    strip: false,
  },
  {
    call: "livingSilhouette",
    owner: "packages/content/src/silhouettes.ts",
    pattern: /\?\s*BULB\s*:\s*SLICK|\?\s*SLICK\s*:\s*BULB/,
    strip: false,
  },
  {
    // The sway's own frequencies. They read as odd numbers because they are
    // the seconds-era 1.9 and 1.35 divided by 1.6: the pose clock moved off
    // `performance.now()` and onto `world.beat`, so that two phones stop
    // drawing the same creature at different points in its cycle.
    call: "livingMotion",
    owner: "packages/content/src/motions.ts",
    pattern: /\bt\s*\*\s*1\.1875\b|\bt\s*\*\s*0\.84375\b/,
    strip: false,
  },
  {
    // Where a body sits in the cycle is `poseClock(id, beat)`, and the reason
    // it is a rule rather than two lines at the draw site is that it used to
    // be two lines at the draw site: `(id % 7) * 0.9`, seven phases on an
    // eleven-column field. A second copy is how one screen's wave ends up in
    // step while the other's is not.
    call: "poseClock",
    owner: "packages/content/src/own-motion.ts",
    pattern: /\bbodyPhase\s*\([^)]*\)\s*\*/,
    strip: false,
    also: ["packages/render/src/creature-place.ts"],
  },
  {
    // The contour clock, which is `poseClock`'s twin and was three copies of
    // itself when this row was written: `time + bodyPhase(id) * 5.4` stood in
    // `creatures.ts` and in `shell-draw.ts`, and was about to stand in
    // `dart-path.ts` — where the outline of the tile a dart is about to land
    // in has to wobble at exactly the moment the body does, or the body
    // visibly does not fit the hole drawn for it.
    //
    // The pattern is the *call*, not the arithmetic, which is what the row
    // above could not be: a hand-rolled clock evades `bodyPhase(...) *` by
    // putting the spread in a local first, and that is exactly how two of the
    // three copies were written.
    call: "contourClock",
    owner: "packages/render/src/creature-place.ts",
    pattern: /\bbodyPhase\s*\(/,
    strip: false,
    also: ["packages/content/src/own-motion.ts"],
  },
  {
    call: "touchDown",
    owner: "packages/render/src/touch.ts",
    pattern: /cannonStrip\s*\.\s*height\s*\*\s*0\.75/,
    strip: false,
  },
  {
    call: "gripsCreature",
    owner: "packages/sim/src/grip.ts",
    pattern: /world\s*\.\s*gripP[12]\s*===/,
    strip: false,
  },
  {
    call: "colSpan",
    owner: "packages/sim/src/kinds.ts",
    pattern: /kind\s*===\s*"torch"\s*\?\s*2\s*:\s*1/,
    strip: false,
  },
  {
    call: "isGrippable",
    owner: "packages/sim/src/kinds.ts",
    pattern: /kind\s*===\s*"queen"\s*\|\|[\s\S]{0,30}"warden"/,
    strip: false,
  },
  {
    // Which piece of THE SHELL a shot in a column meets. It is one
    // subtraction, which is exactly the size of thing a second reader writes
    // out again — and the second reader here is render/, drawing the gap where
    // a piece used to be. A shot that breaks piece 0 and a picture that opens
    // the contour at piece 1 is a creature the pair cannot talk about at all.
    call: "shellPieceAt",
    owner: "packages/sim/src/shell.ts",
    pattern: /\bcol\s*-\s*c\s*\.\s*col\b/,
    strip: false,
  },
  {
    // Whether the core is exposed. The rule is that *every* piece has to be
    // gone, and a hand-written `shell === 0` beside a mask that grew a third
    // bit is how "one piece off is enough" arrives without anyone deciding it.
    call: "shellIsBare",
    owner: "packages/sim/src/shell.ts",
    pattern: /\bshell\s*===\s*0\b/,
    strip: false,
  },
  {
    // Where a way into THE MAZE's wheel stands, across the field. Both screens
    // draw the lit mouth and the simulation decides which column the shot goes
    // up, so a second copy of this is a picture lighting a column the shot does
    // not take — and neither picture would show it, which is exactly the class
    // of defect this table exists for. It replaced `mazeWayOut` and
    // `mazeMouthCol` when the lattice became a wheel; both are gone.
    call: "mazeEntranceX",
    owner: "packages/sim/src/maze.ts",
    pattern: /mazeRadiusMilli\s*\(\s*cfg\s*\)\s*\*\s*mazeSinMilli/,
    strip: false,
  },
  {
    // How wide the wheel stands. It is derived from the width of the field, so
    // a hand-written copy would be right on an eleven-column field and quietly
    // wrong on any other — including the seven the waves are authored against.
    call: "mazeRadiusMilli",
    owner: "packages/sim/src/maze.ts",
    pattern: /cfg\s*\.\s*cols\s*\*\s*cfg\s*\.\s*mazeSpanMilli/,
    strip: false,
  },
  {
    call: "fallTilesPerBeat",
    owner: "packages/sim/src/kinds.ts",
    pattern: /kind\s*===\s*"torch"\s*\)\s*return\s*fallTilesPerBeat\s*\(\s*"meteorFastest"\s*\)/,
    strip: false,
  },
];

function allSourceFiles(): string[] {
  const patterns = ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts", "tools/**/*.ts"];
  const all: string[] = [];
  for (const pattern of patterns) {
    const glob = new Glob(pattern);
    for (const f of glob.scanSync(ROOT)) {
      // Tested against the path *inside* the repository, never the absolute
      // one: a git worktree lives under `.claude/worktrees/`, so an absolute
      // test threw away every file in the tree and the whole guard passed
      // vacuously wherever it mattered most — in the copy work is done in.
      const rel = f.replaceAll("\\", "/");
      if (!rel.includes("node_modules") && !rel.includes("dist") && !rel.includes(".claude")) {
        all.push(join(ROOT, f));
      }
    }
  }
  return all;
}

describe("no re-derived rules", () => {
  const files = allSourceFiles();

  it("guards a non-empty set of files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const copy of COPIES) {
    const ownerPath = join(ROOT, copy.owner);

    it(`${copy.owner} contains its own pattern`, async () => {
      const text = await Bun.file(ownerPath).text();
      const code = copy.strip === false ? text : stripNonCode(text);
      expect(copy.pattern.test(code)).toBe(true);
    });

    const allowed = new Set([ownerPath, ...(copy.also ?? []).map((f) => join(ROOT, f))]);

    for (const file of files) {
      if (allowed.has(file)) continue;

      const name = relative(ROOT, file).replaceAll("\\", "/");
      it(`${name} calls ${copy.call} instead of re-deriving it`, async () => {
        const text = await Bun.file(file).text();
        const code = copy.strip === false ? text : stripNonCode(text);
        if (copy.pattern.test(code)) {
          throw new Error(`Call ${copy.call} from ${copy.owner}`);
        }
      });
    }
  }
});
