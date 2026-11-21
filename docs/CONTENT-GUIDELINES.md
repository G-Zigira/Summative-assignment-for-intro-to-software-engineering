# Content guidelines

How to research, write and check what the game teaches. The SRS's business rules require that
facts are verified before release and that content is suitable for young players. The sample
trail in this repository is **placeholder content for testing the engine**; replace it.

## Before writing

Write down, for each trail:

- **Topic** (a person, event, place, idea, period)
- **Learning goals**: 3 things the player should know or feel afterwards
- **Audience**: ages 10 and up; reading level a 10-year-old can follow
- **Sources**: at least two reliable sources for every fact (see below)

## Choosing sources

Prefer, in order: academic or museum sources, books by historians, national archives, reputable
encyclopaedias, then quality journalism. Prefer **African historians and African institutions**
for African history. Avoid unsourced blogs, social-media posts, and AI summaries as sources
(you can use them to find leads, never as the evidence).

Keep a sources sheet (one row per fact) next to the trail:

| Fact (as written in the game) | Node id | Source 1 | Source 2 | Checked by | Date |
|---|---|---|---|---|---|

## Writing rules

- **Context panels: 80 words or fewer. Codex entries: 100 words or fewer.** The validator enforces this.
- Name the real person, place or event and give its **time period** ("in the 1400s", not "long ago").
- Short sentences, plain words. Explain a hard word the first time it appears.
- Do not state a guess as a fact. If historians disagree, say so in a few words.
- Avoid stereotypes and "single story" descriptions of Africa; be specific about **which** people, place and time.
- Fictional characters (like the guide) must be clearly fictional. Do not put invented words in a real person's mouth as if they were real quotes.
- Hard topics (slavery, colonisation, war): be truthful, age-appropriate, not graphic. Always follow with a context panel that gives the facts and the human side. See the checklist.
- Dialogue should sound natural and short: aim for 1-3 sentences per line.
- Choices: every option must be a reasonable thing for a curious person to pick. No "trick" options. The outcome text should teach, not scold.
- Credit images, music and any quoted text. Only use material you may legally use.

## Review checklist (run per trail before setting `reviewed`)

**Accuracy**
- [ ] Every fact has two sources in the sources sheet
- [ ] Names, spellings, dates and places checked against the sources
- [ ] Anything uncertain is worded as uncertain, or removed
- [ ] Someone other than the writer has checked the facts

**Suitability (ages 10+)**
- [ ] No graphic violence; conflict and colonisation are followed by a context panel in age-appropriate language
- [ ] No stereotypes or demeaning language
- [ ] Reads at a level a 10-year-old can follow (read a few lines aloud to a young person)

**Game rules**
- [ ] `npm run validate:content` has no errors and no unexplained warnings
- [ ] Every key historical event is followed by a context panel
- [ ] Every decision has 2-4 options, each with an outcome

**Sign-off**
- [ ] Reviewer name and date recorded in the trail JSON:

```json
"review": { "status": "reviewed", "reviewer": "Name, role", "date": "2026-12-01" }
```

Then run `npm run validate:content:release`. It fails if any trail is not reviewed.

## Who can review

Ideally a history teacher, lecturer, librarian or someone with subject knowledge, as well as a
teammate. Ask early, because reviewers take time. Keep their feedback (an email is fine) with
the sources sheet.
