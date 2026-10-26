"""Token and cost stats for the two experiment groups.

Opus: sums usage from a Claude Code session transcript, deduplicated by message id.
DeepSeek: sums per-step usage events from the dsh NDJSON stream.
"""
import json
import sys
from pathlib import Path

TRANSCRIPTS = Path.home() / ".claude/projects/-Users-mac-cyq-Code----opus-ex"
# group -> (transcript id, first transcript line of the real task; C had a warm-up turn before it)
GROUPS = {
    "A (Opus alone)": ("3f509c75-30c3-4dea-a0de-ac93121482a8", 0),
    "B (Opus spec + DeepSeek)": ("fb774274-01f9-4247-bfff-e203599028d5", 0),
    "C (Opus high alone)": ("219e0f38-6759-4ea0-bb37-f4d6e0bb3da2", 40),
}
ROOT = Path(__file__).parent

# USD per 1M tokens. Opus 5.5 from the claude-api skill (cached 2026-10-06);
# cache writes use the standard 1.25x (5m) / 2x (1h) input multipliers.
OPUS = {"input": 4.00, "output": 20.00, "cache_read": 0.20, "write_5m": 5.00, "write_1h": 8.00}
# deepseek-flash, Oct 2026 (off-peak; peak is 2x).
DS_OFFPEAK = {"miss": 0.15, "hit": 0.003, "output": 0.60}


def opus_usage(session_id, first_line=0):
    seen = {}
    for i, line in enumerate((TRANSCRIPTS / f"{session_id}.jsonl").open()):
        if i < first_line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        msg = rec.get("message") or {}
        usage = msg.get("usage")
        if rec.get("type") != "assistant" or not usage or not msg.get("id"):
            continue
        seen[msg["id"]] = usage  # later records of one message carry the final usage
    total = {"input": 0, "output": 0, "cache_read": 0, "write_5m": 0, "write_1h": 0, "requests": len(seen)}
    for u in seen.values():
        total["input"] += u.get("input_tokens", 0)
        total["output"] += u.get("output_tokens", 0)
        total["cache_read"] += u.get("cache_read_input_tokens", 0)
        cc = u.get("cache_creation") or {}
        w5, w1 = cc.get("ephemeral_5m_input_tokens", 0), cc.get("ephemeral_1h_input_tokens", 0)
        if not cc:
            w5 = u.get("cache_creation_input_tokens", 0)
        total["write_5m"] += w5
        total["write_1h"] += w1
    total["cost"] = sum(total[k] * OPUS[k] for k in OPUS) / 1e6
    return total


def deepseek_usage(path):
    total = {"miss": 0, "hit": 0, "output": 0, "steps": 0}
    for line in path.open():
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        u = ev.get("usage")
        if ev.get("phase") != "step_end" or not u:
            continue
        total["miss"] += u["inputTokens"]
        total["hit"] += u["cacheReadTokens"]
        total["output"] += u["outputTokens"]
        total["steps"] += 1
    off = sum(total[k] * DS_OFFPEAK[k] for k in DS_OFFPEAK) / 1e6
    total["cost_offpeak"], total["cost_peak"] = off, off * 2
    return total


def seconds(folder):
    d = ROOT / folder
    return int((d / "end.txt").read_text()) - int((d / "start.txt").read_text())


def main():
    out = {}
    for name, (sid, first_line) in GROUPS.items():
        out[name] = {"opus": opus_usage(sid, first_line)}
    out["A (Opus alone)"]["seconds"] = seconds("a-opus")
    out["C (Opus high alone)"]["seconds"] = seconds("c-opus-high")
    b = out["B (Opus spec + DeepSeek)"]
    b["seconds"] = seconds("b-fusion")
    b["deepseek"] = deepseek_usage(ROOT / "b-fusion/dsh.ndjson")
    for f in ("a-opus/index.html", "b-fusion/index.html", "c-opus-high/index.html"):
        text = (ROOT / f).read_text()
        out[f] = {"bytes": len(text.encode()), "lines": text.count("\n") + 1}
    json.dump(out, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
