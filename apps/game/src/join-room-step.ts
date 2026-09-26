import type { LinkStatus, PlayerId } from "@neon-spore/net";
import { DEFAULT_CONFIG, DEFAULT_DIFFICULTY, type Difficulty, isDifficulty } from "@neon-spore/sim";
import { goFullscreen } from "./fullscreen.js";
import { circleLook, holdFraction, mayHold, mayShape } from "./join-room.js";
import { seatWord } from "./join-words.js";
import { quitBy } from "./quit.js";
import { askForMotion } from "./shake.js";

/** What step 4 can ask of the link — the room-shaping half of `JoinBindings`. */
export interface RoomStepBindings {
  /** This seat is ready. The room starts once the other one says so too. */
  ready: () => void;
  /** The host wants this seat; the room swaps both and says so (`link.ts`). */
  pickSeat: (seat: PlayerId) => void;
  /** The tempo the pair will play at, and the one they are set to. */
  setLevel: (level: Difficulty) => void;
  level: () => Difficulty;
}

/**
 * THE ROOM, painted: two seat pills the host can press, three tempi the host
 * can press, and two READY circles of which this phone can hold one.
 *
 * The rules — who may press, what a circle is doing — are `join-room.ts`; this
 * is the DOM under them. The hold is the guides' (`briefing.ts`): a thumb goes
 * down, the arc fills over `readyHoldMs`, and lifting early empties it. It is
 * a wall-clock hold rather than a ticked one because there is no world yet on
 * this screen to tick it; the length is the same number so it feels the same.
 *
 * The same two holds start a run again that is over — parted, or quit on a
 * lost wave (`mayHold`). Whether a QUIT stands is read off `quit.ts` here, the
 * way the menu reads it, because the link does not carry it.
 *
 * Split from `join.ts` for the reason `join-steps.ts` was: that file is the
 * sheet, at its line ceiling, and this is one step of it.
 */
export function bindRoomStep(b: RoomStepBindings): { paint: (status: LinkStatus) => void } {
  const seatsEl = document.getElementById("joinSeats");
  const tempoEl = document.getElementById("joinTempo");
  const seatEls: [1 | 2, HTMLButtonElement | null][] = [
    [1, document.getElementById("joinSeat1") as HTMLButtonElement | null],
    [2, document.getElementById("joinSeat2") as HTMLButtonElement | null],
  ];
  const circleEls: [1 | 2, HTMLElement | null][] = [
    [1, document.getElementById("joinReady1")],
    [2, document.getElementById("joinReady2")],
  ];
  const tempoEls = [...(tempoEl?.querySelectorAll<HTMLButtonElement>("button") ?? [])];

  let last: LinkStatus | null = null;
  /** When the thumb went down on the own circle, or null. */
  let downAt: number | null = null;
  /** The hold filled and `ready` went out; the circle stays full until the
   * room says so back, rather than emptying for the round trip. */
  let sent = false;

  const arc = (node: HTMLElement, fill: number): void => {
    const ring = node.querySelector<SVGCircleElement>(".arc");
    if (ring) ring.style.strokeDashoffset = `${100 * (1 - fill)}`;
  };

  const over = (): boolean => quitBy() !== 0;

  const paintCircles = (status: LinkStatus): void => {
    for (const [seat, node] of circleEls) {
      if (!node) continue;
      const look = circleLook(status, seat, over());
      const mine = status.player === seat;
      const held = mine && downAt !== null;
      const full = look.done || (mine && sent);
      node.classList.toggle("mine", mine);
      node.classList.toggle("done", full);
      node.classList.toggle("held", held && !full);
      node.classList.toggle("calling", look.calling && !held && !sent);
      node.classList.toggle("off", status.state === "solo" || status.peers < 2);
      const word = node.querySelector(".word");
      if (word) word.textContent = full && !look.done ? "READY" : look.word;
      const name = node.querySelector(".name");
      if (name) name.textContent = seatWord(status, seat);
      if (!held) arc(node, full ? 1 : 0);
    }
  };

  const paint = (status: LinkStatus): void => {
    // The room has answered, or the run is somewhere else: the local full
    // circle has nothing left to bridge.
    if (status.readyHere || !mayHold(status, over())) sent = false;
    last = status;
    const shaping = mayShape(status);
    seatsEl?.classList.toggle("pick", shaping);
    tempoEl?.classList.toggle("pick", shaping);
    for (const [seat, node] of seatEls) {
      if (!node) continue;
      const who = node.querySelector(".who");
      if (who) who.textContent = seatWord(status, seat);
      node.classList.toggle("mine", status.player === seat);
      node.classList.toggle(
        "empty",
        seatWord(status, seat) === "WAITING…" || status.state === "solo",
      );
      node.disabled = !shaping || status.player === seat;
    }
    const level = status.state === "solo" ? DEFAULT_DIFFICULTY : (status.level ?? b.level());
    for (const node of tempoEls) {
      node.classList.toggle("on", node.dataset.level === level);
      node.disabled = !shaping;
    }
    paintCircles(status);
  };

  for (const [seat, node] of seatEls) {
    node?.addEventListener("click", () => {
      if (last && mayShape(last) && last.player !== seat) b.pickSeat(seat);
    });
  }
  for (const node of tempoEls) {
    node.addEventListener("click", () => {
      const level = node.dataset.level;
      if (last && mayShape(last) && isDifficulty(level)) b.setLevel(level);
    });
  }

  // The hold. One circle per phone can be held — its own, once the clocks
  // agree — and the whole gesture is on that node; lifting anywhere ends it.
  const tick = (): void => {
    if (downAt === null || !last) return;
    const fill = holdFraction(downAt, performance.now(), DEFAULT_CONFIG.readyHoldMs);
    const own = circleEls.find(([seat]) => seat === last?.player)?.[1];
    if (own) arc(own, fill);
    if (fill >= 1) {
      downAt = null;
      sent = true;
      b.ready();
      paintCircles(last);
      return;
    }
    requestAnimationFrame(tick);
  };
  for (const [seat, node] of circleEls) {
    node?.addEventListener("pointerdown", (e) => {
      if (!last || !circleLook(last, seat, over()).holdable || sent) return;
      e.preventDefault();
      // **The last press this device makes on its own way onto the field**, and
      // so the one the screen is asked for from: `requestFullscreen` is refused
      // outside a user gesture, and the hold finishing is a frame callback with
      // no activation behind it. Refused, unwanted or unsupported, it does
      // nothing and says nothing (`fullscreen.ts`).
      goFullscreen();
      downAt = performance.now();
      paintCircles(last);
      requestAnimationFrame(tick);
    });
    // And the pilot's phone asks for its sensor as the thumb comes off, the
    // first moment a touch carries the activation iOS wants (`shake.ts`).
    node?.addEventListener("pointerup", () => {
      if (last?.player === 1) askForMotion();
    });
  }
  const lift = (): void => {
    if (downAt === null) return;
    downAt = null;
    if (last) paintCircles(last);
  };
  window.addEventListener("pointerup", lift);
  window.addEventListener("pointercancel", lift);

  return { paint };
}
