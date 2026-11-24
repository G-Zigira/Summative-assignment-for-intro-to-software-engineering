# Content schema

Story content lives in `src/data/`:

```
src/data/codex.json            all Codex entries
src/data/trails/trail1.json    one file per trail
src/data/trails/trail2.json
```

Run `npm run validate:content` after every change. It checks everything on this page.

## Adding a trail

1. Copy `trail1.json` to `trailN.json` and edit it (keep the `order` unique).
2. Add its Codex entries to `codex.json` (with `"trailId"`).
3. Import it in `src/content/index.js` and add it to the `TRAILS` array.
4. `npm run validate:content` and `npm test`.
5. Get the facts reviewed ([CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md)), then set `review.status` to `"reviewed"`.

Trails unlock in `order` (FR 3.3): finishing trail 1 unlocks trail 2, and so on.

## Trail

```jsonc
{
  "id": "trail1",                 // unique; also used in save data
  "order": 1,                     // unlock order, integer, unique
  "title": "The Bird Looks Back",
  "summary": "One line for the trail list",
  "review": { "status": "sample", "reviewer": null, "date": null },
  "startScene": "t1-s1",
  "scenes": [ /* see below */ ]
}
```

`review.status` is `"sample"` until the content has been fact-checked. Then set it to
`"reviewed"` with a `reviewer` and `date`. `npm run validate:content:release` fails while any
trail is not reviewed.

## Scene

A scene is one room with one NPC. The player walks to the NPC to start its dialogue.

```jsonc
{
  "id": "t1-s1",
  "title": "The Carved Bird",
  "area": "courtyard",                    // used for the floor colour; also saved as areaId
  "nextScene": "t1-s2",                   // required, except on the final scene
  "final": true,                          // exactly ONE scene per trail has this; it has no nextScene
  "playerStart": { "x": 320, "y": 420 },  // where the player appears (game pixels, 960x540)
  "npc": { "name": "Elder", "x": 700, "y": 300, "sprite": "elder" },   // sprite optional: elder | guide | player
  "props": [{ "key": "baobab", "x": 700, "y": 190 }],   // optional decoration; x,y = base of the picture (see docs/ART.md)
  "obstacles": [{ "x": 420, "y": 270, "w": 120, "h": 80, "prop": "stall" }],   // optional solid blocks
  "travel": true,   // optional; false = no runner minigame after this scene (it plays when the next scene is in a different area)
  "startNode": "t1-s1-n1",
  "nodes": [ /* see below */ ]
}
```

**Touch zones.** On phones the D-pad covers the bottom-left (x < 280, y > 270) and the Talk
button the bottom-right (x > 780, y > 430). Keep `playerStart` and `npc` out of those areas.
The validator warns if you do not.

## Nodes

All node ids must be **unique across the whole trail**, because save data stores decision ids.
Convention: `<scene>-n<number>` for lines, `-d<number>` for decisions, `-c<number>` for context.

### `line`: someone speaks (FR 3.1)

```json
{ "id": "t1-s1-n2", "type": "line", "speaker": "Elder",
  "text": "Welcome, traveller.", "next": "t1-s1-d1" }
```

`next: null` ends the scene. A line may also have `"unlocksCodex": ["codex-id"]`.

### `decision`: the player chooses (FR 3.4)

```json
{ "id": "t1-s1-d1", "type": "decision", "prompt": "Why does the bird look back?",
  "options": [
    { "id": "a", "text": "It is checking for danger.",
      "outcome": "A fair guess. But the carving tells a different story.",
      "next": "t1-s1-c1" },
    { "id": "b", "text": "To remember what it left behind.",
      "outcome": "Yes. That is the idea behind this symbol.",
      "unlocksCodex": ["codex-adinkra"],
      "next": "t1-s1-c1" }
  ] }
```

Rules (all enforced by the validator):

- 2 to 4 options, each with a unique `id` inside the decision, `text` and `outcome`.
- **Choices never block progress.** After any option the game shows the `outcome` text, then
  the `next` node, which must be a `context` node. Every path continues to the same final scene.
- A choice may change the outcome text and may unlock an optional Codex entry
  (`unlocksCodex` on the option).
- The chosen option is saved as `{decisionId, optionId}`.

### `context`: a historical context panel (FR 4.1)

```json
{ "id": "t1-s1-c1", "type": "context", "title": "Sankofa",
  "text": "Sankofa is a word from the Akan language of Ghana. ...",
  "unlocksCodex": ["codex-sankofa"], "next": "t1-s1-n3" }
```

`text` is **80 words or fewer**. Name the real person, place or event and its time period.
Put one after every key historical event and after every decision.

## Codex entry (FR 4.2)

```json
{ "id": "codex-sankofa", "category": "Terms", "title": "Sankofa",
  "trailId": "trail1", "text": "A word from the Akan language of Ghana, ..." }
```

- `category`: `Figures`, `Places` or `Terms`.
- `text`: **100 words or fewer**.
- An entry unlocks the first time its node is viewed or its option is chosen. Unlocking again does nothing.
- Locked entries show as `???` in the Codex.

## What the validator checks

| Check | SRS |
|---|---|
| Unique scene and node ids; `startScene`, `startNode`, `next`, `nextScene` all exist | FR 3.1 |
| Exactly one `final` scene; the scene chain reaches it | FR 3.3 |
| No dead ends and no loops inside a scene; unreachable nodes are warned about | FR 3.1 |
| 2-4 options; each has an outcome; each leads to a `context` node | FR 3.4 |
| Playing "always first option" and "always last option" both finish the trail | FR 3.4 |
| Context text 80 words or fewer; Codex text 100 words or fewer | FR 4.1, FR 4.2.2 |
| Every `unlocksCodex` id exists; every Codex `trailId` is a real trail | FR 4.2.1 |
| NPC inside the play area; start/NPC not under touch controls (warning) | FR 2.2 |
| Review status is `reviewed` with reviewer and date (warning until then) | Business rules |

## Finale minigame (0.5.0)
The final scene may set `"finale": "horse"` or `"finale": "basket"`: a minigame plays after the last dialogue, then the trail completes. See MINIGAMES.md.

## Story pieces (`items`) and the tutorial flag (0.4.0)
A scene may have up to 4 `items`: `{ "id": "t2-i1", "prop": "kora", "x": 300, "y": 300, "title": "...", "text": "... (max 45 words)", "unlocksCodex": ["codex-id"] }`. `id` is unique within the trail, `prop` must be a known prop, `y` should be 190 or more (below the back wall). The player touches the item (E / tap / click) to read it; collected ids are saved in `fragments`. A trail may set `"tutorial": true` (shown as "Tutorial" in trail select). Validate with `npm run validate:content`.
