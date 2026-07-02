"""Migrate the conflated `Collection Style` field into a clean two-axis model.

- `Source` keeps everything about how the data was *obtained/created*
  (crawling, recordings, LLM generation, manual construction).
- `Annotation Style` (renamed from `Collection Style`) now describes only how
  the data was *labeled*.

Acquisition-only values (crawling, LLM generated, manual curation of hand-built
or recorded data) are moved onto `Source` so no information is lost.
"""
import json
from collections import Counter
from glob import glob

WEB_SOURCES = {
    "web crawls", "social media", "web pages", "news articles", "reviews",
    "wikipedia", "commentary", "captions", "subtitles", "TV channels",
}
HAND_BUILT_SOURCES = {"other", "treebanks", "public datasets"}
RECORDING_SOURCES = {"studio recordings", "telephone conversations", "TV channels"}
CORPUS_ONLY_TASKS = {"language modeling", "spoken language modeling"}


def ensure(seq, val):
    if val not in seq:
        seq.append(val)


def migrate(data):
    old = data.get("Collection Style")
    if not isinstance(old, list):
        old = []
    S = set(old)
    src = list(data.get("Source") or [])
    srcset = set(src)
    tasks = set(data.get("Tasks") or [])

    has_mc = "manual curation" in S
    bucket_a = has_mc and srcset.issubset(HAND_BUILT_SOURCES)
    is_recording = bool(srcset & RECORDING_SOURCES)

    # --- move acquisition signal onto Source ---
    new_src = list(src)
    if "crawling" in S and not (srcset & WEB_SOURCES):
        ensure(new_src, "web crawls")
    if bucket_a:
        ensure(new_src, "manual construction")
        new_src = [x for x in new_src if x != "other"]

    # --- build annotation style ---
    N = []
    if "human annotation" in S:
        ensure(N, "human annotation")
    if "machine annotation" in S:
        ensure(N, "machine annotation")
    if "LLM generated" in S:
        ensure(N, "LLM annotation")
    if has_mc and not bucket_a and not is_recording:
        ensure(N, "human annotation")
    if "other" in S:
        ensure(N, "other")

    if not N:
        if tasks and tasks.issubset(CORPUS_ONLY_TASKS):
            N = ["none"]
        else:
            N = ["other"]

    # Labels carried over from a parent dataset rather than freshly produced.
    if N == ["other"] and data.get("Derived From"):
        N = ["inherited annotation"]

    return new_src, N


def rebuild(data, new_src, new_ann):
    out = {}
    for k, v in data.items():
        if k == "Source":
            out[k] = new_src
        elif k == "Collection Style":
            out["Annotation Style"] = new_ann
        else:
            out[k] = v
    if "Source" not in data:
        out["Source"] = new_src
    if "Collection Style" not in data:
        out["Annotation Style"] = new_ann
    return out


def main():
    ann_counter = Counter()
    src_added = Counter()
    files = sorted(glob("datasets/*.json"))
    for file in files:
        with open(file, "r") as f:
            data = json.load(f)
        before_src = set(data.get("Source") or [])
        new_src, new_ann = migrate(data)
        for added in set(new_src) - before_src:
            src_added[added] += 1
        ann_counter[tuple(sorted(new_ann))] += 1
        out = rebuild(data, new_src, new_ann)
        with open(file, "w") as f:
            json.dump(out, f, indent=4, ensure_ascii=False)

    print(f"Migrated {len(files)} files")
    print("\nSource additions:")
    for k, c in src_added.most_common():
        print(f"  +{c:4d}  {k}")
    print("\nResulting Annotation Style combinations:")
    for combo, c in ann_counter.most_common():
        print(f"  {c:4d}  {list(combo)}")


if __name__ == "__main__":
    main()
