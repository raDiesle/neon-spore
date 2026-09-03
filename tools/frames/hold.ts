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
 * Player 1 always, and not a flag: every handle on this field is the pilot's
 * (`maze-string.ts`), and `prime` is the pilot's too. A seat argument here
 * would be a way to send a press the round would refuse.
 */
export function parseHold(value: string): { player: 1 | 2; command: Record<string, unknown> } {
  const parts = value.split(",");
  const [name = "", ...rest] = parts;
  const [target = "", milliText] = name.split("=");

  let id: number | undefined;
  for (const extra of rest) {
    const [key, raw] = extra.split("=");
    if (key !== "id") throw new Error(`--hold ${value}: unknown part "${extra}" — only id=N`);
    id = Number(raw);
    if (!Number.isInteger(id)) throw new Error(`--hold ${value}: id must be a whole number`);
  }

  if (target === "prime") {
    if (milliText !== undefined || id !== undefined) {
      throw new Error("--hold prime: a thumb on the lance takes no distance and no id");
    }
    return { player: 1, command: { kind: "prime", on: true } };
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
  const command: Record<string, unknown> = { kind: "drag", target, on: true, fromMilli };
  if (id !== undefined) command.id = id;
  return { player: 1, command };
}
