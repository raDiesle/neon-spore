import { colFromX, computeLayout, computeStage } from "@neon-spore/render";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { labShell } from "./lab-shell.js";
import { SHIELD_LAB } from "./place.js";
import { PHONE } from "./pose-frame.js";
import { initialLab } from "./session.js";
import { markButton, markStrip } from "./shield-lab-button.js";
import { SHIELD_LOOKS, shieldLook } from "./shield-lab-looks.js";
import { GAP, SCENE_H, SCENE_W, SEATS, type Seat, ShieldScene } from "./shield-lab-scene.js";

/**
 * **THE SHIELD LAB** — every look offered for *the shield is wanted here*,
 * on a real field: the owner, 14 October 2026, *when it is required to use
 * shield, it is not clear … create some new lab … a unique visualizer … give
 * me variants*. It stands at the head of CONTROLS › HELPERS › THE SHIELD
 * (`helpers-shield.ts`), and `?shieldlab=<look>` opens it over everything.
 *
 * Both phones at once, P1's on the left and P2's on the right, because the
 * shield is one job on two screens (`shield-lab-scene.ts`). LOOK picks the
 * mark on the field (`shield-lab-looks.ts`); MOMENT says whether *now* is
 * shown for every rock or only the first of each kind, as the owner asked;
 * BUTTON puts the marks on SHIELD and on the strip (`shield-lab-button.ts`).
 * AUTO plays both hands; off, a click on P2's field slides the dome there, a
 * click on P1's presses SHIELD — or ← → and the space bar.
 *
 * In the director only: nothing here is drawn in the game until the owner
 * picks one.
 */

type Moment = "first" | "every" | "never";

export function openShieldLab(first = "tether", opts: { host?: HTMLElement } = {}): void {
  const shell = labShell(opts.host);
  let look = shieldLook(first);
  let moment: Moment = "first";
  let button = true;
  let auto = true;
  let speed = 1;
  const scene = new ShieldScene(
    () => auto,
    () => speed,
  );

  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "pull-lab-canvas";
  canvas.tabIndex = 0;
  room.appendChild(canvas);
  const like = text("p", "", "pull-lab-like");
  const readout = text("span", "", "try-readout");
  const show = (): void => {
    shell.place({ shape: SHIELD_LAB + look.key, sheet: false });
    like.textContent = `${look.name} — ${look.sentence}.`;
  };

  const autoButton = text("button", "");
  const setAuto = (on: boolean): void => {
    auto = on;
    autoButton.textContent = on ? "◉ AUTO" : "○ AUTO";
    autoButton.classList.toggle("on", on);
  };
  autoButton.addEventListener("click", () => setAuto(!auto));
  const retry = text("button", "↻ RETRY");
  retry.addEventListener("click", () => scene.run.restart());
  const close = text("button", "✕", "lab-close");
  close.addEventListener("click", shell.shut);
  const bar = document.createElement("div");
  bar.className = "pic-zoom-bar";
  bar.append(
    text("b", "SHIELD LAB · WHEN THE SHIELD IS WANTED, ON BOTH SCREENS"),
    close,
    choice(
      SHIELD_LOOKS.map((l) => [l.name, l.key] as [string, string]),
      look.key,
      (k) => {
        look = shieldLook(k);
        show();
      },
      "LOOK",
    ),
    choice(
      [
        ["FIRST OF A KIND", "first"],
        ["EVERY ROCK", "every"],
        ["NEVER", "never"],
      ] as [string, Moment][],
      moment,
      (v) => {
        moment = v;
      },
      "MOMENT",
    ),
    choice(
      [
        ["ON", true],
        ["OFF", false],
      ] as [string, boolean][],
      button,
      (v) => {
        button = v;
      },
      "BUTTON",
    ),
    choice(
      [
        ["1×", 1],
        ["½×", 0.5],
        ["¼×", 0.25],
        ["‖", 0],
      ],
      speed,
      (v) => {
        speed = v;
      },
      "SPEED",
    ),
    grouped("PLAY", autoButton, retry),
    readout,
  );
  setAuto(true);

  // A hand from the lab: P1's half presses SHIELD, P2's half slides the dome under the click.
  const hand = (e: PointerEvent): void => {
    setAuto(false);
    const box = canvas.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * SCENE_W;
    if (x < PHONE.width) {
      scene.run.send({ kind: "guard" });
      return;
    }
    const stage = computeStage(PHONE);
    const l = computeLayout({ ...stage, dpr: 1 }, scene.run.world.cfg, "p2");
    const col = colFromX(l, x - PHONE.width - GAP - stage.left);
    scene.run.send({ kind: "shieldCol", col });
  };
  canvas.addEventListener("pointerdown", hand, { signal: shell.signal });
  canvas.addEventListener(
    "keydown",
    (e) => {
      const w = scene.run.world;
      if (e.key === " ") scene.run.send({ kind: "guard" });
      else if (e.key === "ArrowLeft")
        scene.run.send({ kind: "shieldCol", col: Math.max(0, w.shieldCol - 1) });
      else if (e.key === "ArrowRight")
        scene.run.send({ kind: "shieldCol", col: Math.min(w.cfg.cols - 1, w.shieldCol + 1) });
      else return;
      e.preventDefault();
      setAuto(false);
    },
    { signal: shell.signal },
  );

  const fit = (): void => {
    const box = room.getBoundingClientRect();
    const s = Math.min((box.width - 28) / SCENE_W, (box.height - 14) / SCENE_H);
    canvas.style.width = `${SCENE_W * s}px`;
    canvas.style.height = `${SCENE_H * s}px`;
    const dpr = Math.min(2, window.devicePixelRatio || 1) * s;
    canvas.width = Math.round(SCENE_W * dpr);
    canvas.height = Math.round(SCENE_H * dpr);
  };

  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const time = scene.run.world.tick / scene.run.world.cfg.tickHz;
    let said = "nothing on its way";
    for (const seat of SEATS) {
      scene.paint(ctx, seat, dt, (c, f) => {
        const a = scene.ask(f.l);
        if (!a) return;
        const shown = moment === "every" || (moment === "first" && a.first);
        if (seat === "p2") look.column(c, f, a, time);
        if (seat === "p1" && shown) look.moment(c, f, a, time);
        if (button && seat === "p1") markButton(c, f, a, shown, time);
        if (button && seat === "p2") markStrip(c, f, a, time);
        said =
          `${a.body.kind.toUpperCase()} · column ${a.col + 1} · ${a.beatsLeft.toFixed(1)} beats · ` +
          `${a.under ? "dome under it" : "dome elsewhere"} · moment ${shown ? "shown" : "not shown"}` +
          `${a.first ? " (first of its kind)" : ""}`;
      });
    }
    scene.painted();
    seatNames(ctx);
    readout.textContent = said;
  };

  shell.mount({ bar, like, room, fit, frame, dispose: () => scene.dispose() });
  show();
}

const SEAT_NAME: Record<Seat, string> = {
  p1: "P1 · PRESSES SHIELD",
  p2: "P2 · SLIDES THE SHIELD",
};

/** Whose phone each is, over its top. */
function seatNames(ctx: CanvasRenderingContext2D): void {
  const k = ctx.canvas.width / SCENE_W;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(242,233,220,0.85)";
  for (const seat of SEATS) {
    const x = (seat === "p1" ? 0 : PHONE.width + GAP) + PHONE.width / 2;
    ctx.fillText(SEAT_NAME[seat], x, 4);
  }
}

/** `?shieldlab=<look>` reopens it over everything, so `bun run shot` photographs it with no clicks. */
export function bindShieldLab(): void {
  const asked = initialLab();
  if (asked?.shape.startsWith(SHIELD_LAB)) openShieldLab(asked.shape.slice(SHIELD_LAB.length));
}
