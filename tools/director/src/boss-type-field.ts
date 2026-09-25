import type { BossType, Wave } from "@neon-spore/content";

/**
 * The BOSS TYPE row `rail.ts` shows under the wave's prose: which of the two
 * kinds this wave's boss is, and a sentence saying what the pick means.
 *
 * The owner asked for it on 18 September 2026 — *I would like to see the type
 * of boss for every boss wave in the wave description details* — with two
 * values and no more, and both of them named in his own words below.
 *
 * **It is drawn only on a wave that has a boss.** A wave with none carries no
 * `bossType` at all (`waves.test.ts` holds both directions), and a picker
 * greyed out on the eighty-nine waves that have no boss would read as a
 * question everybody had declined to answer — `fault-config.ts` makes the same
 * argument about a colour row on a shield.
 *
 * Its own file rather than a slab in `rail.ts` for that file's reason: it is
 * at its line limit, and build-a-select-read-it-back is a whole small thing on
 * its own, which is the cut `fault-notes.ts` made.
 */

export interface BossTypeField {
  /** Repopulate the row for the wave now on the stage, or hide it. */
  render(wave: Wave | undefined): void;
  /** Called with the wave's new type whenever the author picks one. */
  onChange(handler: (type: BossType) => void): void;
}

/**
 * The two, in the owner's words: *special is one which has a unique game
 * control set or a unique gameplay style, different than a predefined sequence
 * of actions and special mechanics like THE MAZE or THE MIRROR.*
 *
 * The note under the picker is the part that keeps the next author from
 * guessing off the panel, because the panel is exactly what it is not about:
 * THE MAZE and THE MIRROR are special on `standard5` and THE INSTAR is normal
 * on a panel of its own.
 */
const CHOICES = [
  ["normal", "NORMAL — a boss of this game, however it is controlled"],
  ["special", "SPECIAL — a round with rules of its own, like THE MAZE"],
] as const;

const NOTE =
  "The shape of play, not the panel. A predefined sequence of actions is normal " +
  "however it is controlled — THE INSTAR has a panel to itself and is normal — " +
  "and special is kept for a round with rules of its own.";

export function bindBossTypeField(host: HTMLElement | null): BossTypeField {
  const handlers: ((type: BossType) => void)[] = [];
  if (!host) return { render: () => {}, onChange: () => {} };

  const tag = document.createElement("label");
  tag.className = "field";
  tag.htmlFor = "fBossType";
  tag.textContent = "BOSS TYPE";
  const field = document.createElement("select");
  field.id = "fBossType";
  for (const [value, text] of CHOICES) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    field.appendChild(opt);
  }
  const note = document.createElement("p");
  note.className = "note";
  note.textContent = NOTE;
  host.replaceChildren(tag, field, note);

  field.addEventListener("change", () => {
    for (const h of handlers) h(field.value as BossType);
  });

  return {
    render: (wave) => {
      // A wave with a boss and no type is one somebody wrote by hand; the
      // picker shows what saving it would write rather than an empty row.
      host.hidden = !wave?.boss;
      field.value = wave?.bossType ?? "normal";
    },
    onChange: (handler) => {
      handlers.push(handler);
    },
  };
}
