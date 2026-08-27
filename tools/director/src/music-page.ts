/**
 * MUSIC: six pieces nobody has decided to use.
 *
 * The rest of the SOUND sheet is a catalogue — things the game plays, or could
 * claim tomorrow. This tab is not that. `docs/spec/systems.md` 5.3 says the
 * game has no soundtrack, and it says so for a real reason: talking is the
 * control scheme, and a bed of music under a conversation is a bed under the
 * control scheme. But that was decided with nothing to listen to.
 *
 * So these are candidates, and this page is the deciding. Press one, let it
 * run under the thought of two people talking over it, and then either take
 * one into the game or delete the file. The number that matters on each row is
 * the last one — what a minute of it costs the conversation — and every one of
 * them currently reads zero, which is the only reason the question is open.
 */

import {
  CELLS,
  type Engine,
  MusicPlayer,
  planTheme,
  THEMES,
  type Theme,
  themeBandSeconds,
} from "@neon-spore/audio";
import { plotTheme } from "./music-plot.js";

const PAGE = "sound-music";

function line(cls: string, text: string): HTMLParagraphElement {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = text;
  return p;
}

/** One theme's row. The plot is full width — half a minute does not fit in 190px. */
function row(t: Theme, play: (t: Theme) => void, buttons: Map<string, HTMLButtonElement>): Element {
  const el = document.createElement("div");
  el.className = "theme";

  const head = document.createElement("div");
  head.className = "head";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "playbtn";
  button.textContent = "▶";
  button.title = "play";
  button.addEventListener("click", () => play(t));
  buttons.set(t.id, button);
  head.appendChild(button);

  const title = document.createElement("span");
  title.className = "name";
  title.textContent = t.title;
  head.appendChild(title);

  const id = document.createElement("span");
  id.className = "id";
  id.textContent = t.id;
  head.appendChild(id);

  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = "UNSPENT";
  head.appendChild(stamp);
  el.appendChild(head);

  el.appendChild(line("note", t.blurb));
  el.appendChild(line("use", t.use));

  const plan = planTheme(t);
  const cost = themeBandSeconds(plan);
  el.appendChild(
    line(
      "kind",
      `${plan.duration.toFixed(1)}s · ${t.beats} beats at ${t.bpm} BPM · ` +
        `${plan.plans.length} notes, ${plan.voices} voices · ` +
        `costs the conversation ${cost.toFixed(2)}s per minute`,
    ),
  );
  el.appendChild(plotTheme(plan, t.bpm));
  return el;
}

/** The instruments, so a piece can be taken apart by ear as well as read. */
function palette(engine: Engine): Element {
  const box = document.createElement("div");
  box.className = "cells";
  const heading = document.createElement("h2");
  heading.textContent = "THE INSTRUMENTS — one note each";
  box.appendChild(heading);

  const list = document.createElement("div");
  list.className = "cellrow";
  for (const cell of CELLS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cellbtn";
    button.textContent = cell.id.replace("music.", "");
    button.title = cell.blurb;
    button.addEventListener("click", () => {
      engine.unlock();
      engine.play(cell);
    });
    list.appendChild(button);
  }
  box.appendChild(list);
  return box;
}

/**
 * Built on the shared engine rather than one of its own: two `AudioContext`s
 * on one page is two limiters, and a bell pressed in another tab while a theme
 * runs should be mixed against it, not beside it. Returns the way to stop
 * whatever is playing, which the sheet needs when it closes.
 */
export function bindMusicPage(engine: Engine): () => void {
  const page = document.getElementById(PAGE);
  if (!page) return () => {};
  page.replaceChildren();

  const player = new MusicPlayer(engine);
  const buttons = new Map<string, HTMLButtonElement>();
  let looping = true;

  const refresh = (): void => {
    for (const [id, button] of buttons) {
      const on = player.playing === id;
      button.textContent = on ? "■" : "▶";
      button.classList.toggle("on", on);
    }
  };

  const play = (t: Theme): void => {
    if (player.playing === t.id) player.stop();
    else player.play(t, { loop: looping, gain: 0.9, onEnd: refresh });
    refresh();
  };

  page.appendChild(
    line(
      "note",
      `${THEMES.length} pieces of music, none of them in the game. The spec rules out a ` +
        "soundtrack because talking is the control scheme — these are what would have to be " +
        "better than silence for that to be worth reopening. Press one and imagine the other " +
        "player mid-sentence.",
    ),
  );
  page.appendChild(
    line(
      "note",
      "Each roll reads like the sound plots: time across, frequency up, the red stripe is the " +
        "speech band. A piece with anything in the stripe is one the pair hears instead of " +
        "each other. The dashed gold line is where it loops.",
    ),
  );

  const bar = document.createElement("div");
  bar.className = "soundbar";
  const loop = document.createElement("button");
  loop.type = "button";
  loop.textContent = "LOOP";
  loop.className = "on";
  loop.addEventListener("click", () => {
    looping = !looping;
    loop.classList.toggle("on", looping);
  });
  bar.appendChild(loop);
  const stop = document.createElement("button");
  stop.type = "button";
  stop.textContent = "■ STOP";
  stop.addEventListener("click", () => {
    player.stop();
    refresh();
  });
  bar.appendChild(stop);
  page.appendChild(bar);

  for (const t of THEMES) page.appendChild(row(t, play, buttons));
  page.appendChild(palette(engine));

  // The caller closes the sheet; a piece still running behind a closed sheet
  // is a director humming to itself with nothing on screen to stop it.
  return () => {
    player.stop();
    refresh();
  };
}
