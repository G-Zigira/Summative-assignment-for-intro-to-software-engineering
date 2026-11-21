# Adding music and sound effects

The game already has the hooks. Every sound is an empty slot in **`src/audio/audioManifest.js`**.
Empty slots (`null`) are silent, so the game runs fine with no audio at all.

## Steps
1. **Get or make audio.** Use only audio you have the right to use (your own, or licensed such as CC0 / CC-BY — record the source in `docs/CREDITS.md`). Free sources: freesound.org, opengameart.org, incompetech.com (music), or make your own with Audacity / BeepBox / LMMS.
2. **Export two copies**: `.ogg` and `.mp3` with the same name (e.g. `title-theme.ogg`, `title-theme.mp3`). Safari needs the mp3; the ogg is smaller. Audacity: File > Export Audio.
3. **Put both files in `public/assets/audio/`.**
4. **Fill the slot** in `src/audio/audioManifest.js` with the name, no extension:
   ```js
   export const MUSIC = { title: 'title-theme', courtyard: 'courtyard-loop', ... };
   export const SFX   = { click: 'click', ... };
   ```
5. Reload (`npm run dev`). Done.

## Slots
| Slot | Plays when |
|---|---|
| `MUSIC.title` | Title screen and trail select |
| `MUSIC.<area id>` (`courtyard`, `wall-garden`, `road`, `placeholder`) | In a scene with that `"area"` in the trail JSON. A new area in your content = a new slot to add. |
| `MUSIC.runner` | The runner minigame (if empty the area music keeps playing) |
| `SFX.jump` / `SFX.crash` / `SFX.arrive` | Runner: jump / trip / reach the next area |
| `MUSIC.trailComplete` | A trail is finished (plays once; if empty the area music keeps going) |
| `SFX.click` | Any button |
| `SFX.talk` / `SFX.choose` | Starting a conversation / picking an option |
| `SFX.codexUnlock` | "New Codex entry" toast |
| `SFX.save` / `SFX.error` | "Progress saved" / "Couldn't save" |
| `SFX.footstep` | While walking (limited to every 300 ms) |

## Good to know
- **Browsers block sound until the first tap or click.** The manager waits and starts the music on the first interaction; you do not need to handle it.
- **Volume** uses the stored setting (`save.settings.volume`, 0–100, default 70). There is no volume slider in the menus yet (SRS FR 5.1) — when you build it, call `audio.refreshVolume()` after changing the value.
- **Music loops** should be 30–90 s, mono or stereo 128 kbps. Keep the total audio small: NFR 2 gives a 5 s load budget on 9 Mbps (about 5 MB for everything including pictures; currently pictures use ~1 MB).
- **Add a new slot**: add a line to `MUSIC` or `SFX`, then call `audio.playMusic('slot')` / `audio.playSfx('slot')` where you want it (`import { audio } from '../audio/audioManager.js'`).
- Audio can't be checked by the automated tests; listen for it by hand on desktop and a phone.
