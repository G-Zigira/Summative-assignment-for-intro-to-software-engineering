# Pilot plan

This turns the SMART hypothesis in the SRS into something you can run. **Check the numbers below
against the final text of your SRS hypothesis**; if they differ, the SRS is the authority.

## Hypothesis (summary)

Playing Sankofa Trails raises interest in, and perception of, African history, compared with the
starting point and with reading the same content as text. Evaluated over an **8-week pilot**.

## Timeline

| Weeks | What happens |
|---|---|
| 1-2 | Recruit participants. Collect the **pre-game survey**. |
| 3-6 | Play period. Participants play Trail 1 at their own pace. |
| 7-8 | **Post-game survey**, analysis, short results report. |

Work backwards from the date you want results: the game must be deployed and stable **before week 1**.

## Success targets (all four must be met)

| Measure | Target | Data source |
|---|---|---|
| Participation | At least 50 players aged 10+ start Trail 1; at least 30 complete both surveys | Survey responses; completion code (below) |
| Completion | At least 60% of those who start Trail 1 reach its final scene | Completion code entered in the post-game survey |
| Before and after | Average interest and average perception score (both 5-point scales) each rise by at least 0.5; at least 70% of respondents score the same or higher | Pre vs post survey |
| Comparison | A group of at least 20 who read a text version of the same content: the game group's average interest gain is at least 0.3 points higher than this group's | Same two surveys |

## Data collection without accounts (NFR 1)

The game stores nothing about the player and sends nothing anywhere. So the pilot depends on:

- **Surveys** (Google Forms or similar), anonymous. Each participant picks a nickname or number to link their pre and post answers.
- A **completion code** shown on the trail-complete screen. The participant types it into the
  post-game survey. Counting valid codes gives the completion rate.
  - **Not built yet.** Simplest design: show a fixed code per trail (for example `TRAIL1-DONE`)
    plus a few random characters generated on the spot. Without a server you cannot check
    codes, so treat it as an honour-system measure and say so in the report.
- **Starts** cannot be counted by the game. Count participants who confirm they opened the game in the pre-survey follow-up, or use a privacy-friendly page-view counter that needs no cookies, and describe it in the report. Do not add tracking without updating NFR 1.

## Survey templates (draft; adapt wording for ages 10+)

Use the same questions before and after so the change can be compared.

**Interest (1 = not at all, 5 = very)**
1. How interested are you in learning about African history and culture?

**Perception scale (1 = strongly disagree, 5 = strongly agree)**
1. African history is interesting to me.
2. I can name some examples of African history or culture.
3. African history is relevant to my life today.
4. I know where I could learn more about African history.
5. Learning history through games is enjoyable.

**Post-game only**
- Enter your completion code (leave blank if you did not finish).
- The controls were easy to use (1-5).
- What was the best part? What was confusing? (short answers)
- Which device did you play on? (phone / tablet / laptop or desktop)

**Comparison group:** gives the same pre and post surveys, reads a short text version of Trail 1's content (use the `text` of the trail's dialogue and context panels), with the same time to read.

## Analysis

- Per person: gain = post − pre. Report the average gain for interest and for the perception score (average of the 5 items), for the game group and the comparison group.
- Completion rate = valid completion codes / participants who started.
- Report what you found even if a target was missed. The SRS says results then feed the next Agile iteration and the hypothesis is reported as not (fully) supported.
- With small groups, say plainly that the sample is small and that differences may be due to chance.

## Ethics and consent

- Participants aged 10-17 need guardian or school permission. Check your university's requirements for research with minors before recruiting.
- Say what is collected, that it is anonymous, that taking part is voluntary, and that they can stop at any time.
- Do not collect names, emails or device identifiers in the surveys.

## Pilot checklist

- [ ] Trail 1 content reviewed (`review.status: "reviewed"`) and `npm run validate:content:release` passes
- [ ] Completion code built and tested
- [ ] Deployed to a stable URL; load time and frame rate measured (M1, M2 in [TESTING.md](TESTING.md))
- [ ] Usability test done and problems fixed (M3)
- [ ] Surveys written and tested on 2-3 people
- [ ] Consent wording and (if needed) permission process agreed
- [ ] Recruitment plan: who, where, how many, by when
- [ ] Comparison text version prepared
