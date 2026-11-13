#!/usr/bin/env python3
"""Isolated CTC Viterbi experiment; does not modify production assets or JSON."""
import argparse, csv, importlib.util, json, math, re, subprocess, sys
from pathlib import Path
import numpy as np
import torch, torchaudio
from huggingface_hub import snapshot_download

REPO = "freococo/myanmar_asr"
SR, N_MELS, HOP, BLANK, FRAME_SEC = 16000, 80, 160, 0, 0.04


def seconds(s):
    h, m, tail = s.replace(",", ".").split(":")
    sec, ms = tail.split(".")
    return int(h)*3600 + int(m)*60 + int(sec) + int(ms)/1000


def read_srt(path):
    blocks = re.split(r"\r?\n\s*\r?\n", path.read_text(encoding="utf-8-sig").strip())
    out = []
    for block in blocks:
        lines = [x.strip() for x in block.splitlines() if x.strip()]
        ti = next((i for i, x in enumerate(lines) if "-->" in x), None)
        if ti is None:
            continue
        m = re.match(r"(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})", lines[ti])
        if not m:
            raise ValueError(f"Bad SRT timestamp: {lines[ti]}")
        parts = []
        for line in lines[ti+1:]:
            if parts:
                a, b = parts[-1][-1], line[0]
                parts.append("" if myanmar(a) and myanmar(b) else " ")
            parts.append(line)
        text = "".join(parts).strip()
        if text:
            start, end = seconds(m.group(1)), seconds(m.group(2))
            if end <= start:
                raise ValueError(f"Bad caption duration: {lines[ti]}")
            out.append({"index": len(out)+1, "start": start, "end": end, "text": text})
    if not out:
        raise ValueError("No valid SRT captions")
    return out


def myanmar(c):
    n = ord(c)
    return ((0x1000 <= n <= 0x109F and c not in "၊။") or 0xA9E0 <= n <= 0xA9FF or 0xAA60 <= n <= 0xAA7F)


def combine(captions):
    text, spans = "", []
    for c in captions:
        s = c["text"].strip()
        if not s:
            continue
        if text:
            a, b = text[-1], s[0]
            text += ("" if b in "။၊!?.,:;" or (myanmar(a) and myanmar(b)) else " ")
        start = len(text)
        text += s
        spans.append({"caption": c["index"], "a": start, "b": len(text), "start": c["start"], "end": c["end"]})
    return text, spans


def runs(text):
    out, i = [], 0
    while i < len(text):
        if not myanmar(text[i]):
            i += 1
            continue
        pos, j = [], i
        while j < len(text):
            if myanmar(text[j]):
                pos.append(j); j += 1
            elif text[j].isspace():
                k = j
                while k < len(text) and text[k].isspace(): k += 1
                if k < len(text) and myanmar(text[k]): j = k
                else: break
            else:
                break
        if pos:
            out.append({"a": pos[0], "b": pos[-1]+1, "text": "".join(text[p] for p in pos), "positions": pos})
        i = max(j, i+1)
    return out


def trie_for(vocab):
    root = {}
    for token, tid in vocab.items():
        tid = int(tid)
        if token in ("<blank>", "<unk>") or tid == BLANK:
            continue
        node = root
        for ch in token:
            node = node.setdefault(ch, {})
        node["$id"], node["$token"] = tid, token
    return root


def tokenize(text, trie):
    n = len(text); cost = [math.inf]*(n+1); nxt = [None]*(n+1); chosen = [None]*(n+1)
    cost[n] = 0
    for i in range(n-1, -1, -1):
        node, j, best_len = trie, i, -1
        while j < n and text[j] in node:
            node = node[text[j]]; j += 1
            if "$id" in node and math.isfinite(cost[j]):
                candidate = 1 + cost[j]
                if candidate < cost[i] or (candidate == cost[i] and j-i > best_len):
                    cost[i], nxt[i], chosen[i], best_len = candidate, j, (node["$token"], node["$id"]), j-i
    if nxt[0] is None:
        return None
    out, i = [], 0
    while i < n:
        j = nxt[i]; token, tid = chosen[i]
        out.append({"text": token, "id": tid, "a": i, "b": j})
        i = j
    return out


def source_captions(a, b, spans):
    return [s["caption"] for s in spans if s["a"] < b and s["b"] > a]


def window_for(a, b, spans, duration):
    ss = [s for s in spans if s["a"] < b and s["b"] > a]
    if not ss:
        raise ValueError(f"No SRT timing for chars {a}:{b}")
    return max(0.0, min(x["start"] for x in ss)-0.35), min(duration, max(x["end"] for x in ss)+0.35)


def audio_load(path):
    try:
        wav, sr = torchaudio.load(str(path))
        if wav.shape[0] > 1: wav = wav.mean(dim=0, keepdim=True)
        if sr != SR: wav = torchaudio.functional.resample(wav, sr, SR)
        return wav.squeeze(0).numpy().astype(np.float32)
    except Exception:
        p = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-f", "f32le", "-acodec", "pcm_f32le", "-ar", str(SR), "-ac", "1", "-"], check=True, capture_output=True, timeout=120)
        return np.frombuffer(p.stdout[:len(p.stdout)//4*4], dtype=np.float32).copy()


def load_bundle(folder, vocab_size):
    sys.path.insert(0, str(folder))
    spec = importlib.util.spec_from_file_location("myanmar_asr_model", folder/"model.py")
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    model = mod.load_model(weights_path=str(folder/"model.safetensors"), vocab_size=vocab_size, device="cpu")
    cmvn = json.loads((folder/"cmvn.json").read_text(encoding="utf-8"))
    if len(cmvn["mean"]) != N_MELS or len(cmvn["std"]) != N_MELS:
        raise ValueError("CMVN must contain 80 mean and 80 std values")
    mel = torchaudio.transforms.MelSpectrogram(sample_rate=SR, n_fft=400, win_length=400, hop_length=HOP, n_mels=N_MELS, power=2.0)
    return model, cmvn, mel


def log_probs_for(model, cmvn, mel_transform, wav):
    x = mel_transform(torch.from_numpy(wav).float().unsqueeze(0)).squeeze(0)
    x = torch.log(x.clamp(min=1e-5))
    mean = torch.tensor(cmvn["mean"], dtype=x.dtype).unsqueeze(-1)
    std = torch.tensor(cmvn["std"], dtype=x.dtype).unsqueeze(-1)
    x = ((x-mean)/(std+1e-9)).transpose(0, 1).unsqueeze(0).contiguous()
    with torch.inference_mode():
        logits, lengths = model(x, torch.tensor([x.shape[1]], dtype=torch.long))
        lp = torch.log_softmax(logits[0, :int(lengths[0])], dim=-1)
    return lp.cpu().numpy()


def viterbi(lp, ids):
    tmax, vsize = lp.shape
    if not ids: raise ValueError("Empty CTC target")
    min_t = len(ids) + sum(a == b for a, b in zip(ids, ids[1:]))
    if tmax < min_t: raise ValueError(f"Too few frames ({tmax}; need at least {min_t})")
    ext = [BLANK]
    for x in ids: ext.extend((x, BLANK))
    smax = len(ext); prev = np.full(smax, -np.inf); prev[0] = lp[0, BLANK]; prev[1] = lp[0, ext[1]]
    back = np.full((tmax, smax), -1, dtype=np.int32)
    for t in range(1, tmax):
        cur = np.full(smax, -np.inf)
        for s, token in enumerate(ext):
            candidates = [(prev[s], s)]
            if s >= 1: candidates.append((prev[s-1], s-1))
            if s >= 2 and token != BLANK and token != ext[s-2]: candidates.append((prev[s-2], s-2))
            score, source = max(candidates, key=lambda z: z[0])
            if np.isfinite(score): cur[s] = score + lp[t, token]; back[t, s] = source
        prev = cur
    state = max((smax-1, smax-2), key=lambda s: prev[s])
    score = float(prev[state])
    if not np.isfinite(score): raise ValueError("No valid CTC path")
    path = np.empty(tmax, dtype=np.int32)
    for t in range(tmax-1, -1, -1):
        path[t] = state
        if t: state = int(back[t, state])
    result = []
    for i, token in enumerate(ids):
        frames = np.flatnonzero(path == 2*i+1)
        if not len(frames): raise ValueError(f"Token state {i} received no frames")
        result.append((int(frames[0]), int(frames[-1]), float(np.mean(lp[frames, token]))))
    return result, score/tmax


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("match_key")
    p.add_argument("--model-dir")
    args = p.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_-]+", args.match_key): raise ValueError("Invalid match key")
    key = args.match_key
    audio_path, srt_path = Path(f"public/assets/mp3/{key}.mp3"), Path(f"public/assets/srt/{key}.srt")
    outdir = Path("ctc-viterbi-test-output"); outdir.mkdir(exist_ok=True)
    if not audio_path.is_file() or not srt_path.is_file(): raise FileNotFoundError(f"Missing {audio_path} or {srt_path}")
    captions = read_srt(srt_path); text, spans = combine(captions); my_runs = runs(text)
    latin = [{"text":m.group(),"a":m.start(),"b":m.end()} for m in re.finditer(r"[A-Za-z][A-Za-z0-9'’.-]*", text)]
    folder = Path(args.model_dir).resolve() if args.model_dir else Path(snapshot_download(repo_id=REPO, allow_patterns=["model.py","model.safetensors","vocab.json","cmvn.json","preprocessor_config.json"]))
    vocab = json.loads((folder/"vocab.json").read_text(encoding="utf-8")); ids = [int(v) for v in vocab.values()]
    if "<blank>" not in vocab or int(vocab["<blank>"]) != BLANK or len(set(ids)) != len(ids): raise ValueError("Unexpected vocab mapping")
    model, cmvn, mel = load_bundle(folder, max(ids)+1); wav = audio_load(audio_path); duration = len(wav)/SR; trie = trie_for(vocab); id_to_token = {int(v): k for k, v in vocab.items()}
    aligned, unsupported, failed, diagnostics = [], [], [], []

    if args.alignment_mode == "global":
        token_items = []
        for ri, run in enumerate(my_runs, 1):
            toks = tokenize(run["text"], trie)
            capids = source_captions(run["a"], run["b"], spans)
            if not toks:
                unsupported.append({
                    "run": ri, "text": run["text"],
                    "reason": "no_complete_vocab_segmentation",
                    "captions": capids
                })
                continue
            for tok in toks:
                ca = run["positions"][tok["a"]]
                cb = run["positions"][tok["b"]-1] + 1
                token_items.append({
                    "text": tok["text"], "id": tok["id"],
                    "run": ri, "source_caption_indices": source_captions(ca, cb, spans)
                })

        if unsupported:
            failed.append({
                "run": "global",
                "reason": "global_alignment_blocked_unsupported_myanmar_runs",
                "unsupported_run_count": len(unsupported),
                "detail": "Global alignment was skipped because one or more Burmese runs could not be tokenized completely."
            })
            print(f"Global alignment blocked: {len(unsupported)} unsupported Burmese runs")
        elif token_items:
            lp = log_probs_for(model, cmvn, mel, wav)
            spans_out, path_score = viterbi(lp, [x["id"] for x in token_items])

            best = np.argmax(lp, axis=1).tolist()
            greedy, last = [], None
            for tid in best:
                if tid != last and tid != BLANK:
                    greedy.append(id_to_token.get(tid, f"<id:{tid}>"))
                last = tid

            diagnostics.append({
                "alignment_mode": "global",
                "greedy_token_ids": " ".join(greedy),
                "window": [0.0, round(duration, 3)]
            })

            for item, (f0, f1, mean_lp) in zip(token_items, spans_out):
                start = min(duration, f0 * FRAME_SEC)
                end = min(duration, (f1 + 1) * FRAME_SEC)
                aligned.append({
                    "text": item["text"], "token_id": item["id"],
                    "start": round(start, 3), "end": round(max(start, end), 3),
                    "mean_token_log_probability": round(mean_lp, 5),
                    "run_path_score_per_frame": round(path_score, 5),
                    "run": item["run"],
                    "source_caption_indices": item["source_caption_indices"],
                    "audio_window_start": 0.0,
                    "audio_window_end": round(duration, 3)
                })

            print(f"Global ordered alignment: {len(token_items)} tokens across {duration:.2f}s")

    else:
        for ri, run in enumerate(my_runs, 1):
            toks = tokenize(run["text"], trie)
            capids = source_captions(run["a"], run["b"], spans)
            if not toks:
                unsupported.append({
                    "run": ri, "text": run["text"],
                    "reason": "no_complete_vocab_segmentation",
                    "captions": capids
                })
                continue

            ws, we = window_for(run["a"], run["b"], spans, duration)
            crop = wav[int(ws*SR):min(len(wav), int(we*SR))]
            if len(crop) < int(.15*SR):
                failed.append({"run":ri,"text":run["text"],"reason":"audio_window_too_short"})
                continue

            try:
                lp = log_probs_for(model, cmvn, mel, crop)
                spans_out, path_score = viterbi(lp, [x["id"] for x in toks])
                greedy = []
                best = np.argmax(lp, axis=1).tolist()
                last = None
                for tid in best:
                    if tid != last and tid != BLANK:
                        greedy.append(id_to_token.get(tid, f"<id:{tid}>"))
                    last = tid
                diagnostics.append({
                    "run":ri,"srt_text":run["text"],
                    "greedy_token_ids":" ".join(greedy),
                    "window":[round(ws,3),round(we,3)]
                })
                for tok, (f0,f1,mean_lp) in zip(toks, spans_out):
                    start = min(we, ws + f0*FRAME_SEC)
                    end = min(we, ws + (f1+1)*FRAME_SEC)
                    ca = run["positions"][tok["a"]]
                    cb = run["positions"][tok["b"]-1]+1
                    aligned.append({
                        "text":tok["text"],"token_id":tok["id"],
                        "start":round(start,3),"end":round(max(start,end),3),
                        "mean_token_log_probability":round(mean_lp,5),
                        "run_path_score_per_frame":round(path_score,5),
                        "run":ri,
                        "source_caption_indices":source_captions(ca,cb,spans),
                        "audio_window_start":round(ws,3),
                        "audio_window_end":round(we,3)
                    })
                print(f"Run {ri}: {len(toks)} tokens aligned in {ws:.2f}-{we:.2f}s")
            except Exception as exc:
                failed.append({
                    "run":ri,"text":run["text"],
                    "reason":"ctc_alignment_failed","detail":str(exc),
                    "window":[round(ws,3),round(we,3)]
                })

    latin_out = [{"text":x["text"],"source_caption_indices":source_captions(x["a"],x["b"],spans),"reason":"latin_script_not_in_burmese_vocab"} for x in latin]
    caption_out = []
    for c in captions:
        ct = [x for x in aligned if c["index"] in x["source_caption_indices"]]
        caption_out.append({"index":c["index"],"srt_start":c["start"],"srt_end":c["end"],"text":c["text"],"aligned_tokens":ct})
    payload = {"match_key":key,"method":f"CTC Viterbi forced alignment ({args.alignment_mode})","model_repo":REPO,"audio":str(audio_path),"srt":str(srt_path),"duration_seconds":round(duration,3),"sample_rate":SR,"nominal_frame_step_seconds":FRAME_SEC,"timing_warning":"40 ms is the nominal encoder frame step, not guaranteed phonetic boundary accuracy.","tokenization":"minimum-token-count vocabulary DP; ties prefer longer current token; alternate segmentations may exist.","alignment_window":("one full-audio ordered target sequence; omitted Latin spans are absorbed by CTC blank states" if args.alignment_mode == "global" else "each Burmese run uses union of overlapping SRT caption intervals plus 350 ms margin; windows can overlap when English and Burmese share a caption."),"aligned_token_count":len(aligned),"unsupported_myanmar_runs":unsupported,"unsupported_latin_spans":latin_out,"failed_runs":failed,"aligned_tokens":aligned,"captions":caption_out,"greedy_diagnostics":diagnostics}
    jp, cp, rp = outdir/f"{key}.ctc-viterbi.json", outdir/f"{key}.ctc-viterbi.csv", outdir/f"{key}.ctc-viterbi.txt"
    jp.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
    fields=["text","token_id","start","end","mean_token_log_probability","run_path_score_per_frame","run","source_caption_indices","audio_window_start","audio_window_end"]
    with cp.open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader()
        for x in aligned:
            row=dict(x); row["source_caption_indices"]=",".join(map(str,x["source_caption_indices"])); w.writerow(row)
    with rp.open("w",encoding="utf-8") as f:
        f.write(f"Match: {key}\nMethod: CTC Viterbi\n\n")
        for c in caption_out:
            f.write(f"CAPTION {c['index']} ({c['srt_start']:.3f}-{c['srt_end']:.3f})\n{c['text']}\n")
            for x in c["aligned_tokens"]: f.write(f"  {x['start']:.3f}-{x['end']:.3f}\t{x['text']}\tID={x['token_id']}\n")
            f.write("\n")
        f.write("UNSUPPORTED LATIN\n")
        for x in latin_out: f.write(f"  {x['text']} | captions={x['source_caption_indices']}\n")
        f.write("\nUNSUPPORTED MYANMAR\n")
        for x in unsupported: f.write(f"  {x['text']} | {x['reason']}\n")
        f.write("\nFAILED RUNS\n")
        for x in failed: f.write(f"  {x['text']} | {x['reason']} | {x.get('detail','')}\n")
        f.write("\nGREEDY ASR DIAGNOSTICS\n")
        for x in diagnostics: f.write(f"  {x['window']} SRT={x['srt_text']} ASR={x['greedy_token_ids']}\n")
    print(f"Aligned tokens: {len(aligned)} | unsupported Latin: {len(latin_out)} | unsupported Burmese: {len(unsupported)} | failed runs: {len(failed)}")
    print(f"JSON: {jp}\nCSV: {cp}\nReport: {rp}")

if __name__ == "__main__":
    main()
