import type { Difficulty } from "@neon-spore/sim";
import type { LevelSteps } from "./menu-steps.js";
import type { MenuDom } from "./menu-view.js";
import { setPartnerLevel } from "./pairing.js";
import type { Partner } from "./partners.js";

/**
 * **WHOSE TEMPO THE LEVEL PAGE IS STANDING FOR**, and what a press on it
 * reaches.
 *
 * One page of three rows and two things it can set. The owner put the
 * difficulty on a partner's row on 14 September 2026 — a tempo is something
 * two people settle between themselves — and a pair choosing one should not
 * read a different screen from a person choosing one, so the gear opens the
 * same three words. What differs is where the answer goes: a partner's record,
 * or this device's run.
 *
 * Lifted out of `menu.ts` the day it arrived, because that file was at its
 * limit before the gear existed. It holds the one piece of state the menu's own
 * closure would otherwise have to carry beside five other concerns.
 */

/** A partner as the PLAY page knows them: the record, and the room they share. */
export type Paired = Partner & { room: string };

export interface TempoNeeds {
  dom: MenuDom;
  /** The people this device can carry on with, most recent first (`menu.ts`). */
  pairs: () => readonly Paired[];
  /** The page repainted: the three rows mark whichever tempo the page is about. */
  repaint: () => void;
  /** This device's own tempo, and the way to change it (`menu-bindings.ts`). */
  level: () => Difficulty;
  setLevel: (level: Difficulty) => void;
}

export interface Tempo {
  /** The partner the page is standing for, or undefined for this device. */
  pair: () => Paired | undefined;
  /** Open it for the `i`th partner — the gear at the end of their row. */
  openFor: (i: number) => void;
  /** Leave it standing for this device again: every other door onto the page. */
  forSelf: () => void;
  /** What the three rows are bound to (`menu-steps.ts`). */
  steps: LevelSteps;
}

export function menuTempo(n: TempoNeeds): Tempo {
  /** The index of a partner on the PLAY page's list, or null for this device. */
  let levelling: number | null = null;

  const pair = (): Paired | undefined => (levelling === null ? undefined : n.pairs()[levelling]);

  /**
   * A tempo was chosen, and the two things that can mean.
   *
   * For a pair it is written against their record and reaches no run: nothing
   * is playing, the wave the two of them got to is theirs and is not lost, and
   * the room is told the next time either of them goes in (`menu.ts`'s
   * `rejoinWith`, `link.ts`'s `join`). For this device it is what it has always
   * been — the tempo of the next run, and the run started over, which is what
   * the question in front of the row asks about.
   */
  const choose = (level: Difficulty): void => {
    const one = pair();
    if (one) {
      setPartnerLevel(one.name, level);
      levelling = null;
      n.repaint();
    } else if (level !== n.level()) {
      n.setLevel(level);
    }
    n.dom.show("play");
  };

  return {
    pair,
    openFor: (i) => {
      const one = n.pairs()[i];
      if (!one) return;
      levelling = i;
      n.dom.setLevelFor(one.name);
      // The mark on the three rows is the pair's tempo now rather than this
      // device's, which is the other half of saying which page this is.
      n.repaint();
      n.dom.show("level");
    },
    forSelf: () => {
      levelling = null;
      n.dom.setLevelFor("");
      n.repaint();
    },
    steps: {
      choose,
      // Read when the question is put rather than when the row was drawn: a
      // pair's tempo starts nothing again, so `START AGAIN` would be a lie.
      word: () => (pair() ? "SET" : "START AGAIN"),
    },
  };
}
