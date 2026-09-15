#!/usr/bin/env bun

/**
 * `bun run room-shot <out-prefix> [--size 390x844] [--scale 2] [--names "ADA,BEN"]
 * [--via partners] [--then-wave 3]`
 * — two phones through the four-step room screen, against a real relay.
 *
 * **The one picture nothing could take.** `bun run menu-shot` drives one
 * device, and every interesting thing about the room screen needs two: a
 * creator leaves step 3 on the *other phone arriving*, both names on step 4
 * come from the room rather than from either device, and the seat each of them
 * holds is the server's answer. Three sessions in two days wrote the same
 * throwaway to see it — start a wrangler, start a preview, open two contexts,
 * walk both trails — which is the count `menu-shot.ts` was made at.
 *
 * It starts the relay and the preview and stops both, for `menu-shot`'s
 * reason: a session with no way to leave a server standing cannot use a tool
 * that assumes one is up. The two phones arrive as devices that have been here
 * before — past the intro, each with a name — because the first meeting is a
 * different screen and `menu-shot --first-visit` is what photographs it.
 *
 * **`--via partners` is the other way in.** Each phone arrives remembering the
 * other and presses that person's row on the PLAY page instead of walking NEW
 * GAME: no code is read out, because the room is derived from the two names
 * (`pairing.ts` `roomForPair`) — and whether two devices deriving it apart
 * land in *one* room is exactly the thing no single phone can ask.
 *
 * **`--then-wave <n>` carries them past the room.** Both phones hold READY,
 * beat zero lands, and the creator jumps to the wave asked for — which is the
 * other half of the thing this tool was made for: what one phone writes down
 * about the *other* seat when the two of them get somewhere. It ends on that
 * phone's PLAY page, read out of a second tab, where the partner's row now says
 * the wave. Three sessions wrote that walk as a throwaway probe before it was a
 * flag.
 *
 * What it prints is the walk: the code the creator was given, the heading each
 * phone is under at each stop, and whether the creator's page turned when the
 * joiner arrived. What it writes is a PNG per phone at the end.
 */

import type { Page } from "playwright-core";
import { partnerRow } from "../../apps/game/src/menu-link.js";
import { closeBrowser, launchBrowser } from "./browser.js";
import { root } from "./exec.js";
import { menuDevice } from "./menu-device.js";
import { shownOn } from "./menu-press.js";
import { startRelay } from "./relay-up.js";
import {
  freshTab,
  holdReady,
  jumpToWave,
  looking,
  onTheField,
  openPhone,
  type PhoneShape,
  partnersOn,
  walk,
} from "./room-phones.js";
import { startPreview } from "./serve.js";

/**
 * The two walks, as the labels on the buttons each phone presses.
 *
 * The creator stops on the code — there is nothing further to press, and the
 * page turns when the other phone arrives. The joiner's last press is the one
 * that commits the code, and the room is what answers it (`join-steps.ts`).
 */
export const CREATOR_TRAIL = ["PLAY", "NEW GAME", "CREATE"] as const;
export const JOINER_TRAIL = ["PLAY", "NEW GAME", "JOIN"] as const;
/** The button under the code field. Named here so a rename fails loudly. */
export const JOINER_COMMIT = "ENTER THE ROOM";
/** A partner's row on the PLAY page, as `menu-link.ts` `partnerRow` spells it
 * for somebody met and not yet played with. */
export const partnerTrail = (other: string): string[] => [
  "PLAY",
  `CONTINUE GAME WITH ${other.toUpperCase()}`,
];

/**
 * `--then-wave <n>` as a number of waves, or null for a run that stops at the
 * room.
 *
 * **`n` is the wave a person reads**, counted from 1, which is what the row on
 * the PLAY page says and what `--partners "David:7"` already means
 * (`menu-stamps.ts`). The world counts from 0 and `intoWave` subtracts.
 */
export function thenWave(args: readonly string[]): number | null {
  const at = args.indexOf("--then-wave");
  if (at < 0) return null;
  const wave = Number(args[at + 1]);
  if (!Number.isFinite(wave) || wave < 1) {
    throw new Error(`--then-wave ${JSON.stringify(args[at + 1] ?? "")}: a wave is 1 or more`);
  }
  return Math.floor(wave);
}

/**
 * Both phones into a wave, and what the creator then has written down about
 * the person in the other seat.
 *
 * The check is the record rather than the pixels: `reachedWith` is what a wave
 * reached writes against a partner (`apps/game/src/waves.ts`), and the row is
 * that record read back by the page a person would look at.
 */
async function intoWave(
  creator: Page,
  joiner: Page,
  other: string,
  wave: number,
  url: string,
): Promise<void> {
  for (const phone of [creator, joiner]) await holdReady(phone);
  await onTheField(creator);
  await onTheField(joiner);
  await jumpToWave(creator, wave - 1);
  await creator.waitForTimeout(500);

  const kept = (await partnersOn(creator)).find(
    (one) => one.name.toLowerCase() === other.toLowerCase(),
  );
  if (!kept || kept.furthest !== wave - 1) {
    throw new Error(
      `the creator has ${other} at ${kept ? `wave ${kept.furthest + 1}` : "no wave at all"}, not ${wave}`,
    );
  }
  // A second tab and not a reload: the storage the camera arrived with is put
  // back by a navigation on the page it was seeded on (`freshTab`).
  const again = await freshTab(creator, url);
  await walk(again, ["PLAY"]);
  const rows = await shownOn(again);
  const wanted = partnerRow(kept);
  if (!rows.includes(wanted)) {
    throw new Error(`the creator's PLAY page reads ${rows.join(" / ")}, with no "${wanted}"`);
  }
  console.log(`creator's PLAY page: "${wanted}"`);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const out = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  if (!out) {
    console.error(
      'usage: bun run room-shot <out-prefix> [--size 390x844] [--names "ADA,BEN"] [--via partners] [--then-wave 3]',
    );
    process.exit(1);
  }
  const [creatorName = "ADA", joinerName = "BEN"] = (flag("names") ?? "ADA,BEN").split(",");
  const [vw, vh] = (flag("size") ?? "390x844").split("x").map(Number);
  const shape: PhoneShape = {
    width: vw ?? 390,
    height: vh ?? 844,
    scale: Number(flag("scale") ?? 2),
    device: menuDevice(args),
  };
  const viaPartners = flag("via") === "partners";
  const wave = thenWave(args);

  const relay = await startRelay(root);
  const preview = await startPreview(root);
  const browser = await launchBrowser();
  try {
    const url = `${preview.url}?relay=${encodeURIComponent(relay.url)}`;
    const phone = (who: string, other: string) =>
      openPhone(browser, url, who, shape, viaPartners ? [{ name: other, wave: 0 }] : []);
    const creator = await phone(creatorName, joinerName);
    const joiner = await phone(joinerName, creatorName);

    if (viaPartners) {
      // Neither phone is told a code: each derives the room from the two names
      // and walks in. The creator is only the one that arrives first.
      await walk(creator, partnerTrail(joinerName));
      await creator.waitForTimeout(1200);
      const alone = await looking(creator);
      console.log(`first:  "${alone.head}" — ${alone.state}`);
      await walk(joiner, partnerTrail(creatorName));
    } else {
      await walk(creator, CREATOR_TRAIL);
      await creator.waitForTimeout(1200);
      const held = await looking(creator);
      console.log(`creator: "${held.head}" — code ${held.code || "(none)"}`);
      if (!/^[A-Z0-9]{4}$/.test(held.code)) {
        throw new Error(`the creator never got a code: "${held.code}"`);
      }
      await walk(joiner, JOINER_TRAIL);
      console.log(`joiner:  "${(await looking(joiner)).head}"`);
      await joiner.fill("#joinInput", held.code);
      await walk(joiner, [JOINER_COMMIT]);
    }
    await joiner.waitForTimeout(2500);

    const onCreator = await looking(creator);
    const onJoiner = await looking(joiner);
    console.log(
      `creator: "${onCreator.head}" — ${onCreator.state} — ${onCreator.seats.join(" / ")}`,
    );
    console.log(`joiner:  "${onJoiner.head}" — ${onJoiner.state} — ${onJoiner.seats.join(" / ")}`);
    await creator.screenshot({ path: `${out}-creator.png` });
    await joiner.screenshot({ path: `${out}-joiner.png` });
    console.log(`${out}-creator.png  ${out}-joiner.png`);

    // The question no single-device shot can ask: both phones under THE ROOM,
    // each pill naming the *other* phone — which is the room saying so, not
    // either device (`join-steps.ts`; the own seat says YOU, `seatWord`). On
    // the NEW GAME route that is also the creator's page turning on the other
    // phone arriving; on the partner route it is two derivations of one code
    // agreeing.
    for (const [who, on, other] of [
      ["creator", onCreator, joinerName],
      ["joiner", onJoiner, creatorName],
    ] as const) {
      const seated = on.seats.map((s) => s.toUpperCase());
      if (!seated.includes("YOU") || !seated.includes(other.toUpperCase())) {
        throw new Error(`${who}'s pills say ${on.seats.join(" / ")} under "${on.head}"`);
      }
    }
    console.log(
      viaPartners
        ? "both phones derived the same room and are in it together"
        : "the creator's page turned when the joiner arrived",
    );
    if (wave !== null) await intoWave(creator, joiner, joinerName, wave, url);
  } finally {
    await closeBrowser(browser);
    await preview.stop();
    await relay.stop();
  }
}
