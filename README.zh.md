# breakout-exp

[English](README.md) | 中文

同一个打砖块游戏，用 5 种 AI 编程组合各做一遍。在线页面：https://qingyuna.github.io/breakout-exp/

灵感来自一篇 [Reddit 帖子](https://www.reddit.com/r/ClaudeAI/comments/1xfgyl1/same_game_built_twice_opus_alone_vs_opus_planning/)：同一个游戏做两次，Opus 单干 vs Opus 规划 + 便宜模型写码。这里做的是打砖块（需求见 `experiment/requirement.md`），用一份隐藏的 25 项检查清单（`experiment/checklist.zh.md`）评分。

## 结果（当前数据）

| 组别 | 规划 → 写码 | 耗时 | 成本（美元） | Opus 输出 | 写码输出 | 行数 | 检查清单 | 画面 / 手感 / 总评 |
|---|---|---|---|---|---|---|---|---|
| A Opus 5.5 单干 | Opus 5.5 medium → 同 | 6:17 | $1.82 | 37.6k | — | 1481 | 25/25 | 7 / 7 / 7.5 |
| B Opus 写 spec + DeepSeek | Opus 5.5 medium → deepseek-flash | 27:56 | $1.13–1.30 | 12.3k | 194.5k | 2758 | 25/25 | 9 / 8 / 8.5 |
| C Opus 5.5 high 单干 | Opus 5.5 high → 同 | 11:25 | $2.46 | 55.3k | — | 1250 | — | — |
| D Opus 写 spec + Kimi | Opus 5.5 medium → Kimi k3.1-pro | 进行中 | — | 12.3k | — | — | — | — |
| E Kimi 单干 | Kimi k3.1-pro → 同 | 进行中 | — | 0 | — | — | — | — |

D、E 还在跑。C 已做完但尚未评分。更新于 2026-10-26。数据以 `data/results.json` 为准，网页直接读取它。

## 本地试玩

每个游戏是一个独立的单文件。浏览器打开 `play/<id>/index.html` 即可，例如 `play/a-opus/index.html`。也可以直接去上面的在线页面玩。

## 方法与局限

- 所有组拿到相同的需求文本，在全新隔离的会话里运行。
- 检查清单在评分前冻结；盲评（文件改名）。
- 每组只跑一次，结果有噪声，不是模型排名。
- 成本是由 `experiment/stats.py` 从会话记录算出的 API 标价等价金额，不是真实订阅账单。
- B 组的 DeepSeek 在一次运行中内部迭代了 76 步。
- Claude Code 桌面版每次请求带着约 150k token 的固定上下文，会抬高 Opus 规划方的成本。

## 目录

- `index.html`、`data/results.json`：网站
- `play/`：游戏
- `experiment/`：需求、清单、spec、提示词、会话记录、统计脚本
- `assets/screens/`：截图

MIT 许可证。
