/**
 * A wave's name pressed in DOCUMENTATION › WAVES › EVERY WAVE opens it on the
 * director's own screen and plays it, with a press above to come back — the
 * owner, 15 October 2026: *click on a wave and it opens directly the
 * director home screen and plays the wave (with some button above to go
 * back and scroll where i left on the big wave table).*
 *
 * The sheet is shut and opened again by its own two buttons, so the place in
 * the URL follows as it does for a hand on them (`session.ts`). The wave is
 * named by id: the open list may be a draft in another order than the files
 * the table was drawn from.
 */

const BACK_ID = "wavesTableBack";

export function playFromTable(id: string, play: (id: string) => void): void {
  const body = document.getElementById("statesBody");
  const scroll = body?.scrollTop ?? 0;
  document.getElementById("statesClose")?.click();
  play(id);
  showBack(scroll);
}

function showBack(scroll: number): void {
  let back = document.getElementById(BACK_ID) as HTMLButtonElement | null;
  if (!back) {
    back = document.createElement("button");
    back.id = BACK_ID;
    back.type = "button";
    back.textContent = "← EVERY WAVE";
    document.body.append(back);
    // Opening the sheet any other way leaves nothing to come back to.
    document.getElementById("statesOpen")?.addEventListener("click", () => {
      back?.remove();
    });
  }
  back.onclick = () => {
    back?.remove();
    document.getElementById("statesOpen")?.click();
    document.querySelector<HTMLButtonElement>('#statesTabs button[data-tab="waves"]')?.click();
    requestAnimationFrame(() => {
      const body = document.getElementById("statesBody");
      if (body) body.scrollTop = scroll;
    });
  };
}
