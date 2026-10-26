# breakout-exp

English | [中文](README.zh.md)

The same Breakout game, built 5 ways by AI coding setups. Live site: https://qingyuna.github.io/breakout-exp/

Inspired by a [Reddit post](https://www.reddit.com/r/ClaudeAI/comments/1xfgyl1/same_game_built_twice_opus_alone_vs_opus_planning/) that built one game twice: Opus alone vs Opus planning + a cheaper model coding. Here the game is Breakout (spec: `experiment/requirement.md`), graded by a hidden 25-item checklist (`experiment/checklist.zh.md`).

## Results (current data)

| Group | Planner → Coder | Time | Cost (USD) | Opus out tokens | Coder out tokens | Lines | Checklist | Visual / Feel / Overall |
|---|---|---|---|---|---|---|---|---|
| A Opus 5.5 alone | Opus 5.5 medium → same | 6:17 | $1.82 | 37.6k | — | 1481 | 25/25 | 7 / 7 / 7.5 |
| B Opus spec + DeepSeek | Opus 5.5 medium → deepseek-flash | 27:56 | $1.13–1.30 | 12.3k | 194.5k | 2758 | 25/25 | 9 / 8 / 8.5 |
| C Opus 5.5 high alone | Opus 5.5 high → same | 11:25 | $2.46 | 55.3k | — | 1250 | — | — |
| D Opus spec + Kimi | Opus 5.5 medium → Kimi k3.1-pro | running | — | 12.3k | — | — | — | — |
| E Kimi alone | Kimi k3.1-pro → same | running | — | 0 | — | — | — | — |

D and E are still running. C is built but not graded yet. Updated 2026-10-26. The source of truth is `data/results.json`; the site reads it directly.

## Play locally

Each game is one self-contained file. Open `play/<id>/index.html` in a browser, for example `play/a-opus/index.html`. Or play online at the site above.

## Method and caveats

- All groups got the same requirement text, in fresh isolated sessions.
- The checklist was frozen before grading; grading was blind (files renamed).
- Single run per group. Results are noisy and not a model ranking.
- Costs are API list-price equivalents computed from transcripts by `experiment/stats.py`, not actual subscription bills.
- Group B's DeepSeek iterated internally for 76 steps in one run.
- Claude Code desktop carried about 150k tokens of fixed context per request, which inflates the Opus planner cost.

## Layout

- `index.html`, `data/results.json`: the site
- `play/`: the games
- `experiment/`: requirement, checklist, spec, prompts, transcripts, stats script
- `assets/screens/`: screenshots

MIT License.
