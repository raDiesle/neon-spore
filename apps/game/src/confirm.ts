/**
 * A button that hangs up on somebody else, and asks once before it does.
 *
 * LEAVE ROOM drops the other player's game. It sat behind a single tap on two
 * screens — the room sheet and the menu — so one mis-tap ended a run for two
 * people. What is in front of it now is the smallest thing that cannot be
 * tapped through: the control asks in place, and the answer is a *different*
 * button from the one just pressed.
 *
 * Not a dialog. A dialog is an overlay to dismiss, it steals the back gesture,
 * and it arrives under a thumb that is already travelling — which is the mis-
 * tap it was supposed to prevent, wearing a hat. This asks where the question
 * came from, puts "SURE?" under the thumb where the button was, and puts the
 * two answers beside it. It also puts itself away: a question nobody answers
 * is a question that was not meant, so after `CONFIRM_MS` the row goes back to
 * being a button.
 *
 * The deciding is separated from the DOM because this repo's test runner has
 * no DOM at all. `twoStep` is the whole of the rule and takes its clock; the
 * half below it only builds elements.
 */

/** How long an unanswered question stands. Long enough to read, short enough
 * that a pocket cannot answer it later. */
export const CONFIRM_MS = 4000;

/** `setTimeout` and `clearTimeout`, so a test can run the clock itself. */
export interface ConfirmClock {
  after: (ms: number, run: () => void) => number;
  cancel: (id: number) => void;
}

export interface TwoStep {
  /** Whether the question is standing. */
  armed: () => boolean;
  /** Ask it. Asking again while it stands restarts the clock rather than acting. */
  arm: () => void;
  /** Yes — the one call that reaches the action, and only from the armed state. */
  confirm: () => void;
  /** No, or the clock ran out, or the page moved on. Always safe to call. */
  cancel: () => void;
}

/** The real one. Kept here so no caller has to name `window` twice. */
export const wallClock: ConfirmClock = {
  after: (ms, run) => setTimeout(run, ms) as unknown as number,
  cancel: (id) => clearTimeout(id),
};

/**
 * `act` runs on `confirm()` and on nothing else — not on `arm`, not on the
 * clock, not on a second `arm`. `onChange` is how the picture is repainted;
 * it is called only when the state actually turns over.
 */
export function twoStep(
  act: () => void,
  onChange: (armed: boolean) => void,
  clock: ConfirmClock = wallClock,
  ms: number = CONFIRM_MS,
): TwoStep {
  let timer: number | null = null;

  const stop = (): void => {
    if (timer !== null) clock.cancel(timer);
    timer = null;
  };

  const cancel = (): void => {
    if (timer === null) return;
    stop();
    onChange(false);
  };

  return {
    armed: () => timer !== null,
    arm: () => {
      const wasArmed = timer !== null;
      stop();
      timer = clock.after(ms, () => {
        timer = null;
        onChange(false);
      });
      if (!wasArmed) onChange(true);
    },
    confirm: () => {
      if (timer === null) return;
      stop();
      onChange(false);
      act();
    },
    cancel,
  };
}

/**
 * The DOM half: `button` keeps its place and its label until it is pressed,
 * and a row saying `SURE? · <word> / CANCEL` takes that place while the
 * question stands. The row is a sibling rather than the button's children,
 * because a button inside a button is not a thing.
 */
export function bindTwoStep(
  button: HTMLElement,
  word: string,
  act: () => void,
  clock: ConfirmClock = wallClock,
): TwoStep {
  const row = document.createElement("div");
  row.className = "twostep";
  row.hidden = true;

  const asked = document.createElement("span");
  asked.textContent = "SURE?";

  const yes = document.createElement("button");
  yes.type = "button";
  yes.className = "yes";
  yes.textContent = word;

  const no = document.createElement("button");
  no.type = "button";
  no.className = "no";
  no.textContent = "CANCEL";

  row.append(asked, yes, no);
  button.insertAdjacentElement("afterend", row);

  const step = twoStep(
    act,
    (armed) => {
      row.hidden = !armed;
      button.hidden = armed;
    },
    clock,
  );

  button.addEventListener("click", (event) => {
    event.preventDefault();
    step.arm();
  });
  yes.addEventListener("click", () => step.confirm());
  no.addEventListener("click", () => step.cancel());
  return step;
}
