#!/usr/bin/env bun

/**
 * `bun run room-shot <out-prefix> [--size 390x844] [--scale 2] [--names "ADA,BEN"] [--via partners]`
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
 * What it prints is the walk: the code the creator was given, the heading each
 * phone is under at each stop, and whether the creator's page turned when the
 * joiner arrived. What it writes is a PNG per phone at the end.
 */

import { closeBrowser, launchBrowser } from "./browser.js";
import { root } from "./exec.js";
import { menuDevice } from "./menu-device.js";
import { startRelay } from "./relay-up.js";
import { looking, openPhone, type PhoneShape, walk } from "./room-phones.js";
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

if (import.meta.main) {
  const args = process.argv.slice(2);
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const out = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  if (!out) {
    console.error(
      'usage: bun run room-shot <out-prefix> [--size 390x844] [--names "ADA,BEN"] [--via partners]',
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
  } finally {
    await closeBrowser(browser);
    await preview.stop();
    await relay.stop();
  }
}
