import {
  BRIEFINGS,
  bossFromWave,
  podsFromWave,
  queueFromWave,
  type Wave,
} from "@neon-spore/content";
import {
  BRIEFING_SUBJECTS,
  type BriefingId,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
} from "@neon-spore/sim";

/**
 * The connection the brief named as possibly missing: which cards *the wave
 * being edited* raises, read off the store's own live entries rather than off
 * `WAVES` on disk — an unsaved edit shows here immediately, before it is
 * saveable at all.
 *
 * `card-order.ts` already answers "which cards does wave N raise", but it asks
 * `WAVES[N]` on the shipped catalogue through its own picker, so it cannot see
 * an edit that has not been saved and it is one sheet away from the wave being
 * placed. This is the same question — `openBriefings` is still the only thing
 * that answers it — asked of the wave on the stage right now.
 *
 * A fresh pair, always: the world is built with `briefings: true` and a `met`
 * set at zero regardless of the run's own `cfg.briefings` toggle, the same
 * choice `card-waves.ts`'s `CARD_CFG` makes and for the same reason — this is
 * "what would a pair who has met nothing see", not "what the stage happens to
 * be configured to show right now".
 */
const FRESH_PAIR_CFG = { ...DEFAULT_CONFIG, briefings: true, hullInvulnerable: true };

export interface WaveBriefingCard {
  id: BriefingId;
  title: string;
}

export function waveBriefingCards(
  wave: Wave | undefined,
  waveIndex: number,
  cols: number,
): WaveBriefingCard[] {
  if (!wave) return [];
  const world = createWorld(FRESH_PAIR_CFG, waveIndex);
  startWave(
    world,
    waveIndex,
    queueFromWave(wave, cols),
    podsFromWave(wave, cols),
    bossFromWave(wave, cols),
  );
  return world.brief.due.map((i) => {
    const id = BRIEFING_SUBJECTS[i] as BriefingId;
    return { id, title: BRIEFINGS[id].title };
  });
}

/** Painted into `#waveBriefing` in the WAVE tab, beside the fields it is about. */
export function renderWaveBriefing(wave: Wave | undefined, waveIndex: number, cols: number): void {
  const mount = document.getElementById("waveBriefing");
  if (!mount) return;
  const cards = waveBriefingCards(wave, waveIndex, cols);
  mount.textContent =
    cards.length === 0
      ? "A fresh pair meets nothing new here — no card opens this wave."
      : `A fresh pair opens on ${cards.length} card${cards.length === 1 ? "" : "s"}: ${cards
          .map((c) => c.title)
          .join(" → ")}. Full pictures of each are in ◇ NOT BUILT YET → CARDS.`;
}
