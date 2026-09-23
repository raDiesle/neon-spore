import { CARRIES, DRAGS, ID_CHOICES, NEEDS_ID, SEAT, TARGET } from "./hold-targets.js";
import type { HoldSpec } from "./spec.js";

/**
 * `--hold` on the command line: the one thing this tool could not photograph.
 *
 * Four mechanics are a thumb that is down — THE LID's cord, THE WARDEN's rope,
 * THE MAZE's wheel and THE LANCE's lobe — and released they show nothing of
 * what they are. Each is named here by the `Command` it actually sends, so
 * what a capture presses is the same thing a finger presses:
 *
 *   --hold prime=red                THE LANCE: a thumb on red, lobe filling
 *   --hold prime=cyan               the same on cyan
 *   --hold wardenTether=900         THE WARDEN's rope, 0.9 of a tile out
 *   --hold wardenTether=0,y=7000    the same rope, carried straight down
 *   --hold mazeString=1400          THE MAZE's wheel, most of a turn
 *   --hold lidString=800,id=3       THE LID: which cord, and how far
 *   --hold choirLeft=-2000          THE CHOIR: the left arrow carried outward
 *   --hold balloonLeft=-1600,id=1   THE BALLOON: the pilot's hand on body 1
 *   --hold balloonRight=1600,id=1   and the navigator's on the same one
 *   --hold sinewLeft=0,y=900        THE SINEW: the pilot's hand, pulled 0.9 down
 *   --hold sinewRight=0,y=500       and the navigator's, half a tile
 *   --hold surgeBulb=0              THE SURGE: the pilot's thumb on the bulb
 *   --hold surgeBulb2=0             and the navigator's, on the same bulb
 *   --hold antiphonOrgan=0          THE ANTIPHON: the pilot's thumb on the organ
 *   --hold antiphonRail=0,y=500,id=0  the navigator's, pulling candidate 0 off the rail
 *   --hold instarMark=0,y=750,id=0  THE INSTAR: the pilot's thumb on mark 0, half a jaw down
 *   --hold instarMark2=0,y=-750,id=1  and the navigator's on mark 1, pulled up
 *   --hold wardenEye=0              THE WARDEN under NARROW: the navigator's thumb on the eye
 *   --hold wardenHatch=0            and under GLARE: the pilot's thumb on the hatch, not yet swiped
 *   --hold queenMark=0,id=0         BULB QUEEN: the pilot's thumb on her left mark
 *   --hold filament=1000            THE FILAMENT: the pilot drawing one tile on
 *   --hold filament2=0,y=1000       and the navigator following one tile down
 *   --hold stareLid=0,y=900         THE STARE: the pilot's thumb pulling the lid shut
 *   --hold stareLid2=0,y=900        and the navigator's, on the same lid
 *   --hold mazeHeart=0,y=900        THE MAZE: the navigator's thumb pulling the heart
 *   --hold throatRing=0             THE THROAT: the navigator's thumb cinching a slack ring
 *   --hold throatTube=-1500         and the pilot carrying the tube a column left
 *   --hold scuttlePart=1000,id=10   THE SCUTTLE: the pilot carrying part 10 a column right
 *
 * THE CHOIR's two are the only handles here whose **sign** is the whole of the
 * gesture rather than a direction the picture happens to take: the left arrow
 * counts only when it is carried left, so a negative distance is the correct
 * one and a positive one makes the thing sing (`sim/choir-gesture.ts`).
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
 * **Six of these are on a boss that is in the wrong phase by default**, and a
 * hold the round cannot hear is dropped in the silence this flag exists to
 * end — so each is written with the `--boss` that opens its window, and the
 * pair is what a recipe is: `--boss phase=looking,watching=2` for the pilot's
 * lid and `watching=1` for the navigator's (`stareLidFree`), `--boss
 * phase=trace` for either filament, `--boss phase=grip` for the heart, and
 * `--boss phase=quick,slack=2` for the cinch or `phase=open,slack=4` for the
 * carry. BULB QUEEN's marks are her body's: `--creature petals=6`.
 *
 * **And one is in the right phase and on the wrong socket**, which is a
 * seventh shape of the same problem. THE SCUTTLE hangs a part off a socket
 * the seeded `Rng` picked (`scuttle-step.ts`, `pickLive`), and `scuttleHeard`
 * drops a press on any socket not in `s.loose` without a sound — so an `id`
 * written by hand is a thumb on the frame's own silence four times in five.
 * The loose list is written rather than guessed, and that is one more flag:
 *
 *   bun run frames . --wave "THE SCUTTLE" --seat p1 \
 *     --boss-json '{"loose":[10],"live":10,"swung":-1,"swungCol":-1}' \
 *     --hold scuttlePart=1000,id=10
 *
 * `swung` at -1 is the other half of it: `scuttleSwingable` is false once a
 * part has been carried this cycle, so a state carried over from an earlier
 * beat photographs a frame with no rings on it and a press nothing heard.
 *
 * **And one handle is let go of rather than held**, which is the second shape
 * this flag builds. THE THROAT's haul is spent on the *lift*: `tubeHeard`
 * refuses a command with `on` set, so the grab-and-pull above would have sent
 * the gesture's shape and never the gesture. A carry sends the grab, then the
 * travel with `on` false — three things a finger does, two commands on the
 * wire (`hold-targets.ts`, `CARRIES`).
 *
 * The pilot for every handle on this field (`maze-string.ts`), player 2 for
 * `prime`, which is a thumb resting on one of the two colours (`sim/lance.ts`),
 * and `SEAT` next door for the rest. None of it is a flag: a seat argument
 * here would be a way to send a press the round would refuse.
 */
export function parseHold(value: string): HoldSpec[] {
  const parts = value.split(",");
  const [name = "", ...rest] = parts;
  const [name0 = "", milliText] = name.split("=");

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

  if (name0 === "prime") {
    if (id !== undefined || yMilli !== undefined) {
      throw new Error("--hold prime: a thumb on a colour takes no distance and no id");
    }
    // Which lobe. It is the whole of what a hold on a colour says, and the
    // lance leaves in it (`sim/lance.ts`), so there is no sensible default and
    // an omitted one is red rather than a guess dressed up as a choice.
    const color = milliText ?? "red";
    if (color !== "red" && color !== "cyan") {
      throw new Error("--hold prime: a thumb is on red or on cyan");
    }
    return [{ player: 2, command: { kind: "prime", on: true, color } }];
  }

  // THE BALLOON's two are the first here that are **not both the pilot's**:
  // the left handle is player 1's and the right is player 2's, which is the
  // whole of that creature's coupling (`sim/balloon-pull.ts`). So a hold
  // carries the seat as well as the target, and a capture can stand a frame
  // with one hand on a body or with both. Every handle's seat, its name on the
  // wire and what it needs are `hold-targets.ts`.
  if (!DRAGS.includes(name0)) {
    throw new Error(`--hold ${value}: unknown control. One of prime=red|cyan, ${DRAGS.join(", ")}`);
  }
  const target = TARGET[name0] ?? name0;
  const fromMilli = milliText === undefined ? 1000 : Number(milliText);
  if (!Number.isFinite(fromMilli)) {
    throw new Error(`--hold ${value}: the distance is thousandths of a tile, as a number`);
  }
  if (NEEDS_ID.includes(name0) && id === undefined) {
    throw new Error(
      `--hold ${name0}: say which one with id=N — a wave may have three on it at once`,
    );
  }
  if (!NEEDS_ID.includes(name0) && id !== undefined) {
    throw new Error(`--hold ${value}: only a handle that hangs off a body takes an id`);
  }
  const choices = ID_CHOICES[target];
  if (choices && id !== undefined && !choices.includes(id)) {
    throw new Error(`--hold ${value}: id is one of ${choices.join(" or ")}, and nothing else does`);
  }
  // A carry is spent on the lift, so its second command is the thumb coming
  // off rather than a thumb that stayed down (`CARRIES`).
  const held = !CARRIES.includes(name0);
  const grab: HoldSpec["command"] = { kind: "drag", target, on: true, fromMilli: 0 };
  const command: HoldSpec["command"] = { kind: "drag", target, on: held, fromMilli };
  if (yMilli !== undefined) {
    grab.fromYMilli = 0;
    command.fromYMilli = yMilli;
  }
  if (id !== undefined) {
    grab.id = id;
    command.id = id;
  }
  const player = SEAT[name0] ?? 1;
  return [
    { player, command: grab },
    { player, command },
  ];
}

/**
 * One `--hold` value, and **when** the thumb goes on.
 *
 * `--hold` used to mean one thing only: after the wave's own ticks, with
 * `holdTicks` of its own to show in. That is right for a picture *of* a hold
 * and wrong for every gesture that is two verbs in order — answering THE MAZE
 * is the pilot turning the wheel until a way in clicks onto a column and only
 * *then* the navigator firing at it, and with the hold pinned to the end of
 * the run a shot could only ever be fired at a wheel that had not turned.
 *
 * So a hold may name a tick with `@`, and one that does joins the same sorted
 * tick line `--press` walks (`press-plan.ts`) instead of getting a second one:
 *
 *   --hold mazeString=1400@240 --press 300:2:fire=cyan
 *
 * **The bare form waits for the end of the run, `--until` included**: it is
 * not in the wait, and after a `--ticks` past the wave's failure it lands on a
 * world that is over. Both read as a flag that did nothing — THE SURGE's two
 * bulb thumbs did (`docs/queue.md`, 21 September 2026) — so both now say so
 * (`missedNote`, `pressNote`). To have what a hold causes, write it with `@`:
 * `--hold surgeBulb=0@1 --hold surgeBulb2=0@1 --until surgeGrip`.
 *
 * The bare form keeps its old meaning exactly, because it is the right one for
 * the four handles this flag was written for and every existing caller writes
 * it. The `@` is read off the end of the whole value rather than off the
 * target, so it sits after the parts a handle takes: `wardenTether=0,y=7000@60`.
 */
export function parseHoldFlag(value: string): { tick?: number; commands: HoldSpec[] } {
  const at = value.lastIndexOf("@");
  if (at === -1) return { commands: parseHold(value) };
  const tick = Number(value.slice(at + 1));
  if (!Number.isInteger(tick) || tick < 0) {
    throw new Error(`--hold ${value}: the tick after @ is a whole number of ticks, from 0`);
  }
  return { tick, commands: parseHold(value.slice(0, at)) };
}
