/**
 * `--hold` on the command line: the one thing this tool could not photograph.
 *
 * Four mechanics are a thumb that is down — THE LID's cord, THE WARDEN's rope,
 * THE MAZE's wheel and THE LANCE's lobe — and released they show nothing of
 * what they are. Each is named here by the `Command` it actually sends, so
 * what a capture presses is the same thing a finger presses:
 *
 *   --hold prime                    THE LANCE, thumb down, lobe filling
 *   --hold wardenTether=900         THE WARDEN's rope, 0.9 of a tile out
 *   --hold wardenTether=0,y=7000    the same rope, carried straight down
 *   --hold mazeString=1400          THE MAZE's wheel, most of a turn
 *   --hold lidString=800,id=3       THE LID: which cord, and how far
 *
 * The distance is in **thousandths of a tile**, which is what a `drag` carries
 * on the wire — two phones of different widths share no pixel and do share a
 * tile. Omitted it is one whole tile, which is a hand that has plainly pulled.
 * `id` names which body a cord hangs off, and only `lidString` has one: a wave
 * may send three lids down at once, where a boss's rope is the only one of its
 * kind on the field.
 *
 * **`y` is the other half of the pull, and the warden's rope needs it.** The
 * field is eleven columns wide and a boss stands in the middle of it, so a
 * sideways pull is cut short by the edge long before it is taut
 * (`clampPull` keeps a handle on the field); down, there is always room. It is
 * the direction `frame-budget.test.ts` holds that rope in for the same reason.
 *
 * **A drag is two commands, not one.** The first `drag` a handle hears is the
 * *grab* — it takes the origin the distance will be measured from and moves
 * nothing (`sim/warden-rope.ts`) — so one command carrying a distance opened
 * the warden's hatch by exactly nothing, and every warden capture ever taken
 * with this flag was a picture of a shut eye with a number beside it saying
 * otherwise. So a grab at zero goes in first and the pull follows it. THE LID
 * reads its distance straight off the wire and does not need the grab, and a
 * leading zero costs it nothing.
 *
 * Player 1 always, and not a flag: every handle on this field is the pilot's
 * (`maze-string.ts`), and `prime` is the pilot's too. A seat argument here
 * would be a way to send a press the round would refuse.
 */
export function parseHold(value: string): { player: 1 | 2; command: Record<string, unknown> }[] {
  const parts = value.split(",");
  const [name = "", ...rest] = parts;
  const [target = "", milliText] = name.split("=");

  let id: number | undefined;
  let yMilli: number | undefined;
  for (const extra of rest) {
    const [key, raw] = extra.split("=");
    if (key === "y") {
      yMilli = Number(raw);
      if (!Number.isFinite(yMilli)) {
        throw new Error(`--hold ${value}: y is thousandths of a tile, as a number`);
      }
      continue;
    }
    if (key !== "id") throw new Error(`--hold ${value}: unknown part "${extra}" — only id=N, y=N`);
    id = Number(raw);
    if (!Number.isInteger(id)) throw new Error(`--hold ${value}: id must be a whole number`);
  }

  if (target === "prime") {
    if (milliText !== undefined || id !== undefined || yMilli !== undefined) {
      throw new Error("--hold prime: a thumb on the lance takes no distance and no id");
    }
    return [{ player: 1, command: { kind: "prime", on: true } }];
  }

  const DRAGS = ["mazeString", "wardenTether", "lidString"];
  if (!DRAGS.includes(target)) {
    throw new Error(`--hold ${value}: unknown control. One of prime, ${DRAGS.join(", ")}`);
  }
  const fromMilli = milliText === undefined ? 1000 : Number(milliText);
  if (!Number.isFinite(fromMilli)) {
    throw new Error(`--hold ${value}: the distance is thousandths of a tile, as a number`);
  }
  if (target === "lidString" && id === undefined) {
    throw new Error(
      "--hold lidString: say which cord with id=N — a wave may have three lids on it at once",
    );
  }
  if (target !== "lidString" && id !== undefined) {
    throw new Error(`--hold ${value}: only lidString takes an id; there is one of every other`);
  }
  const grab: Record<string, unknown> = { kind: "drag", target, on: true, fromMilli: 0 };
  const command: Record<string, unknown> = { kind: "drag", target, on: true, fromMilli };
  if (yMilli !== undefined) {
    grab.fromYMilli = 0;
    command.fromYMilli = yMilli;
  }
  if (id !== undefined) {
    grab.id = id;
    command.id = id;
  }
  return [
    { player: 1, command: grab },
    { player: 1, command },
  ];
}
