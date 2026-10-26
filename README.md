# breakout-exp

English | [中文](README.zh.md)

The same Breakout game, built 5 ways by AI coding setups. Live site: https://qingyuna.github.io/breakout-exp/

Inspired by a [Reddit post](https://www.reddit.com/r/ClaudeAI/comments/1xfgyl1/same_game_built_twice_opus_alone_vs_opus_planning/) that built one game twice: Opus alone vs Opus planning + a cheaper model coding. Here the game is Breakout (spec: `experiment/requirement.md`), graded by a hidden 25-item checklist (`experiment/checklist.zh.md`).

## Results

| Group | Planner → Coder | Time | Cost (USD) | Opus out tokens | Coder out tokens | Lines | Checklist | Visual / Feel / Overall |
|---|---|---|---|---|---|---|---|---|
| A Opus 5.5 alone | Opus 5.5 medium → same | 6:17 | $1.82 | 37.6k | — | 1481 | 25/25 | 6 / 7 / 7 |
| B Opus spec + DeepSeek | Opus 5.5 medium → deepseek-flash | 27:56 | $1.13–1.30 | 12.3k | 194.5k | 2758 | 25/25 | 8 / 8 / **8** |
| C Opus 5.5 high alone | Opus 5.5 high → same | 11:25 | $2.46 | 55.3k | — | 1250 | 25/25 | 8 / 8 / **8** |
| D Opus spec + Kimi | Opus 5.5 medium → Kimi k3.1-pro | 15:57 | $1.78 | 12.3k (reused B's spec) | 31.7k | 1426 | 25/25 | 7 / 7 / 7 |
| E Kimi alone | Kimi k3.1-pro → same | 31:43 | $1.96 | 0 | 43.1k | 1282 | 24/25 | 9 / 7 / 7 |

Blind-graded in one round: the five builds were renamed P–T at random and scored by one fresh agent with one shared headless-Chrome harness and one subjective scale. E lost item 23: the ball can pass straight through the moving boss. B and D share level data because they were built from the same spec. Updated 2026-10-26. The source of truth is `data/results.json`; the site reads it directly.

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
