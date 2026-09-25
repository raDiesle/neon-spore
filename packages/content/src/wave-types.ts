import type { BossEntry, PodEntry } from "@neon-spore/sim";
import type { ControlSetId } from "./control-sets.js";
import type { SceneId } from "./scenes.js";
import type { WaveEntry } from "./wave-entry.js";
import type { WaveFault } from "./wave-faults.js";

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
 * if the sentence cannot be said, the wave is padding and gets cut. It is
 * said, not stored: the owner took `sentence` off every wave on 25 September
 * 2026 — *name of wave and number is good enough* — so the test is the
 * author's, at the moment a wave is written, and no screen carries it.
 *
 * **What one arrival is** — `WaveEntry` — is `wave-entry.ts` next door, cut
 * out when THE CRAWLER's two fields took this file over its limit: that is the
 * half that gains a field per creature, and this one has not changed in a long
 * time. Re-exported below, so nothing that reached for it here had to move.
 */
export type { WaveEntry } from "./wave-entry.js";

/**
 * The two kinds a boss is, and there are two on purpose: the owner asked for
 * *only distinguish between special and normal* (18 September 2026). See
 * `Wave.bossType` for which is which and who decides.
 */
export type BossType = "special" | "normal";

/**
 * The help a wave carries: a concrete instruction about a control or a concept
 * the pair is about to meet for the first time.
 *
 * **A film or words, never both.** The owner, 25 September 2026: *we have
 * either just a simple wave with no guide/tutorial which shows wave name, or we
 * have guide/tutorial which explains in game step by step. not both.* So a
 * guide is one of two shapes, and the type will not hold the other half:
 *
 * - `FilmedGuide` names a rehearsal (`scene`) and nothing else. The film is
 *   the screen, its pages are its steps and then the gate, and its captions
 *   are the only words the pair reads.
 * - `WordedGuide` is the three lines and the gate, and nothing that moves. It
 *   is what a guide was before the films, and every one left is a film owed
 *   — `packages/content/test/scenes-prose.test.ts` names them, and
 *   `docs/queue.md` has an entry for each.
 *
 * Until that day a filmed guide kept its three lines as well, as the
 * director's reference (the owner, 17 September 2026). No player ever read
 * them, and the owner took them off.
 *
 * **Words are split, and the split is the point.** One line both screens
 * carry, and one each. A guide that put all of it on both screens would teach
 * the pair, in the first ten seconds of the game, that they do not need to
 * talk to each other — which is the one thing this game cannot survive
 * (`docs/spec/roles.md`). So neither half is a restatement of the other, and
 * neither is optional: `both` says what the thing *is*, and the two halves say
 * what each player does about it. The heading is the wave's own `name`, so a
 * guide never carries a title of its own.
 */
export type WaveGuide = FilmedGuide | WordedGuide;

export interface FilmedGuide {
  /**
   * The rehearsal this guide plays, by name. A *name* rather than the
   * choreography itself, for `Wave.controls`' reason: a named scene is
   * something a person can be shown and told to change, it is one line for
   * the director to write back out (`tools/director/src/serialize.ts`), and a
   * hundred lines of timing in the middle of a list of arrivals is not a wave
   * file anybody can read. `packages/content/src/scenes.ts` holds them.
   */
  scene: SceneId;
  both?: never;
  p1?: never;
  p2?: never;
}

export interface WordedGuide {
  scene?: never;
  /** The line both screens carry. Never the whole of it. */
  both: string;
  /** Player 1's half: the cannon, the shield's trigger, the maw. */
  p1: string;
  /** Player 2's half: the shield itself, and the two colours. */
  p2: string;
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
  /**
   * The help this wave opens on, after its introduction, or nothing.
   *
   * A wave that introduces nothing new writes no guide at all, and padding
   * one with a guide is the same failure as padding it with entries.
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
   * Which of the two kinds of boss this is, on a wave that carries one.
   *
   * The owner asked for it on 18 September 2026 — *I would like to see the
   * type of boss for every boss wave* — with two values and no more: *special
   * is one which has a unique game control set or a unique gameplay style,
   * different than a predefined sequence of actions and special mechanics like
   * THE MAZE or THE MIRROR.*
   *
   * **It is the shape of play and not the panel**, which is the part the owner
   * settled the same day when he was asked about the three the rule pulled
   * both ways: THE INSTAR has a panel of its own and is **normal**, because a
   * predefined sequence of actions is the ordinary kind of boss in this game
   * however it is controlled; THE STARE is normal although one seat may not
   * act, and THE REPRISE is normal although the field is hidden. *Special* is
   * kept for a round with rules of its own — THE MAZE and THE MIRROR are the
   * two he named, and both are played on `standard5`.
   *
   * **Authored, never derived.** The panel would get it wrong in both
   * directions, so there is no rule to read it off and a judgement is written
   * down instead. `waves.test.ts` holds that every wave with a boss carries
   * one and no wave without a boss does; which of the two it is, is the
   * owner's, and `docs/spec/bosses.md` carries the table.
   *
   * Beside `boss` for the reason `controls` and `faults` are: it is read once
   * before the first tick, identically on both devices, and costs the tick and
   * the hash nothing.
   */
  bossType?: BossType;
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
  /**
   * The faults placed on this wave's map, each with the beat row it enters on
   * and the number of rows it holds — controls that act by themselves, and the
   * seat each belongs to left with nothing at all in its place
   * (`packages/sim/src/malfunction.ts`, `wave-faults.ts`).
   *
   * **A list, and on rows, since 15 September 2026.** It was one fault for the
   * whole wave, and the owner asked for a pencil to be placed on the map
   * instead: *so I can define when it enters the wave (what beat row) and when
   * it ends.* A wave may carry several, the same kind twice with quiet in
   * between, and a fault that does not start until the pair is halfway
   * through.
   *
   * **Beside `controls` and not part of it.** A set is a whole panel and sets
   * do not compose, which is the rule that makes a panel a thing a person can
   * be shown and argued with — and a malfunction does not break it, because it
   * changes no button on any panel. The lobes a wave's set names are the lobes
   * it has, in the places that set puts them; what has changed is what pressing
   * one *does*, and how a control behaves is a fact about the wave. So a
   * cannon fault can be played on the standard panel, on a rung of the ladder
   * or on THE CLAW's without any of those becoming a second panel.
   *
   * Beside `boss` for the same reason `controls` is: all three say *this wave
   * is not the ordinary thing*, all three are read once before the first tick,
   * identically on both devices, and none of them costs the tick anything.
   */
  faults?: WaveFault[];
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
