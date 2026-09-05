import type { BossEntry, PodEntry } from "@neon-spore/sim";
import type { ControlSetId } from "./control-sets.js";
import type { SceneId } from "./scenes.js";
import type { WaveEntry } from "./wave-entry.js";

/**
 * What a wave is made of.
 *
 * Its own file, and not the head of `waves.ts`, because that file is a *list*
 * and the list is the thing that grows — every wave anybody adds costs it a
 * dozen lines, and it went over 250 the day two lanes added one each. The
 * shapes here were the first thing scrolled past and the last thing to change,
 * which makes them the right half to move. The director rebuilds only the
 * array and keeps everything above it byte for byte (`serialize.ts`), so what
 * stands above the array is free to be short.
 *
 * Waves are data, never code. Columns are authored against a 7-column field
 * and remapped by `buildQueue`; `beat` is the offset from the start of the wave.
 *
 * Every wave must pass the one-sentence test (docs/spec/wave-design.md):
 * if `sentence` cannot be written, the wave is padding and gets cut.
 *
 * **What one arrival is** — `WaveEntry` — is `wave-entry.ts` next door, cut
 * out when THE CRAWLER's two fields took this file over its limit: that is the
 * half that gains a field per creature, and this one has not changed in a long
 * time. Re-exported below, so nothing that reached for it here had to move.
 */
export type { WaveEntry } from "./wave-entry.js";

/**
 * The help a wave carries: a concrete instruction about a control or a concept
 * the pair is about to meet for the first time.
 *
 * **An object with named parts, and that is the whole point of it being one.**
 * The owner has said plainly that a guide may one day be more than words — a
 * guidance animation, a picture, a scene stepped through — and that it will be
 * built one piece at a time. So a guide is never three loose fields on `Wave`
 * and never a bare string: motion arrives here as *another key beside these
 * three*, and no wave file has to move to make room for it. Anything added is
 * optional, so the sixteen waves that carry words today keep carrying only
 * words.
 *
 * **Every guide is split, and the split is the point.** Three lines: one both
 * screens carry, and one each. A guide that put all of it on both screens
 * would teach the pair, in the first ten seconds of the game, that they do not
 * need to talk to each other — which is the one thing this game cannot survive
 * (`docs/spec/roles.md`). So neither half is ever a restatement of the other,
 * and neither is optional: `both` says what the thing *is*, and the two halves
 * say what each player does about it. Read alone, a guide is half an
 * instruction.
 *
 * Keep the lines short. They are read on a phone, under a beat, by someone who
 * is about to have to say them out loud. The heading is the wave's own `name`,
 * so a guide never carries a title of its own.
 */
export interface WaveGuide {
  /** The line both screens carry. Never the whole of it. */
  both: string;
  /** Player 1's half: the cannon, the shield's trigger, the maw. */
  p1: string;
  /** Player 2's half: the shield itself, and the two colours. */
  p2: string;
  /**
   * The rehearsal this guide shows above its words, by name, or nothing.
   *
   * **The key this interface was built to take** — the paragraph above has
   * been promising it since the guide stopped being a bare string. It is a
   * *name* rather than the choreography itself, for `Wave.controls`' reason:
   * a named scene is something a person can be shown and told to change, it
   * is one line for the director to write back out
   * (`tools/director/src/serialize.ts`), and a hundred lines of timing in the
   * middle of a list of arrivals is not a wave file anybody can read.
   * `packages/content/src/scenes.ts` holds them.
   *
   * A guide with no scene is the sixteen guides that shipped before this one:
   * the three lines, the ready gate, and nothing that moves.
   */
  scene?: SceneId;
}

export interface Wave {
  /**
   * The wave's name in code, which never changes.
   *
   * `name` is what a person reads, and the director can rewrite it from its
   * own screen — so anything that *points at* a wave has to point at something
   * else. It has already gone wrong once: ON THE BEAT became THE THROB and
   * HOLD IT OPEN became THE LID, and four places naming a wave by string
   * stayed where they were, which landed `main` red on a save the owner made
   * from a page that never mentioned them.
   *
   * So this is the handle, and the one field the director's rail never edits.
   * It is fixed at the moment a wave is written and outlives every rename;
   * `test/waves.test.ts` holds that they are unique, and `serialize.ts` writes
   * it back out first so a save carries it forward.
   */
  id: string;
  /** What a person reads, on the HUD and in the wave list. Renameable. */
  name: string;
  /** The one-sentence test. Not flavour text — the reason the wave exists. */
  sentence: string;
  /**
   * The help this wave opens on, after its introduction, or nothing.
   *
   * Written directly under `sentence` because that is where it is read: a
   * wave's three lines of prose are its name, why it exists, and what the pair
   * has to be told before it starts. A wave that introduces nothing new writes
   * no guide at all, and padding one with a guide is the same failure as
   * padding it with entries.
   *
   * The first wave to carry a creature, a pod kind, a boss or a mechanic must
   * have one — `packages/content/test/waves.test.ts` is the invariant, and
   * `.claude/skills/new-creature` is where the next session is told so.
   */
  guide?: WaveGuide;
  entries: WaveEntry[];
  /**
   * Pods left hanging in the field. Their own list, because a pod is not an
   * enemy: it is never cleared and it never blocks the end of the wave. Columns
   * are authored against the same 7-column field as `entries`; the row is
   * absolute, and a pod never hangs on the hull row.
   */
  pods?: PodEntry[];
  /**
   * Which boss the wave carries, if any. Three of the four are the whole
   * encounter and their waves are otherwise empty; THE VANE only bends what
   * the wave sends, so its wave is the one that has to have entries in it too
   * (`bossFillsWave`).
   */
  boss?: BossEntry;
  /**
   * Which panel the pair plays this wave on, if not the ordinary one.
   *
   * A **whole** panel, both players at once, and never a combination — that is
   * the entire content of `control-sets.ts` and the reason this is one name
   * rather than a list of buttons. A wave that says nothing is played on
   * `DEFAULT_CONTROL_SET_ID`, so the field stays the field unless a wave has a
   * reason to be something else.
   *
   * Beside `boss` on purpose. Both fields say the same kind of thing — this
   * wave is not the ordinary thing — and both are read before the wave starts,
   * identically on both devices, so neither costs the tick or the hash
   * anything.
   */
  controls?: ControlSetId;
}

/**
 * An id no wave in `taken` is using.
 *
 * The director makes waves — a new one, or a copy — and every one of them
 * needs a handle before anything can point at it. Opaque on purpose: an id
 * derived from the name would be a second copy of the name, and the whole
 * reason this field exists is that the name moves. What a person reads is
 * `name`; this is only ever compared.
 */
export function freshWaveId(taken: Iterable<string>): string {
  const used = new Set(taken);
  for (let n = 1; ; n++) {
    const id = `wave${n}`;
    if (!used.has(id)) return id;
  }
}
