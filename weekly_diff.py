"""Weekly diff for datasets/*.json against the state N days ago.

Compares the current working-tree datasets against the closest commit on
datasets/ before (now - N days) and reports:

  A. General stats          - dataset counts, added/removed datasets, touched files
  B. Schema-level updates   - schema.json structural evolution + per-field value
                              diffusion across datasets
  C. Field-level comparison  - per-file deep diff of every schema key

Usage:
    python3 weekly_diff.py
    python3 weekly_diff.py --days 14
    python3 weekly_diff.py --report out.md --verbose

Always exits 0 (pure reporter).
"""

import argparse
import json
import subprocess
import sys
from datetime import datetime, timedelta
from glob import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATASETS_DIR = ROOT / "datasets"
SCHEMA_FILE = ROOT / "schema.json"
DEFAULT_REPORT = ROOT / "weekly_diff_report.md"
TOP_N_FILES = 20

LIST_KEYS = {
    "Tasks",
    "Domain",
    "Source",
    "Annotation Style",
    "Authors",
    "Affiliations",
    "Derived From",
    "Provider",
}

SUBSET_KEY = "Dialect Subsets"
SUBSET_FIELDS = ("Name", "Volume", "Unit", "Dialect")


def run_git(args):
    result = subprocess.run(
        ["git", "-C", str(ROOT), *args],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip())
    return result.stdout


def normalize_key(key):
    return key.replace("_", " ")


def find_baseline_commit(days):
    before = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
    out = run_git(["log", "-1", f"--before={before}", "--format=%H|%ci|%s", "--", "datasets/"]).strip()
    if out:
        return out.split("|", 2)
    out = run_git(["log", "-2", "--format=%H|%ci|%s", "--", "datasets/"]).strip().splitlines()
    if len(out) >= 2:
        print(f"Warning: no commit on datasets/ older than {days} days; "
              f"falling back to prior commit.")
        return out[1].split("|", 2)
    if out:
        print(f"Warning: only one commit on datasets/ exists; using it as baseline.")
        return out[0].split("|", 2)
    sys.exit("No commits found on datasets/")


def read_dataset_file(path, commit=None):
    if commit is None:
        text = Path(path).read_text(encoding="utf-8")
    else:
        rel = str(Path(path).relative_to(ROOT))
        text = run_git(["show", f"{commit}:{rel}"])
    data = json.loads(text)
    return {normalize_key(k): v for k, v in data.items()}


def read_schema_file(commit=None):
    if commit is None:
        text = SCHEMA_FILE.read_text(encoding="utf-8")
    else:
        text = run_git(["show", f"{commit}:schema.json"])
    return json.loads(text)


def list_dataset_files(commit=None):
    args = ["ls-tree", "-r", "--name-only"]
    if commit:
        args += [commit, "--", "datasets/"]
    else:
        args += ["HEAD", "--", "datasets/"]
    out = run_git(args).strip().splitlines()
    return [Path(ROOT, line) for line in out if line.endswith(".json")]


def list_disk_dataset_files():
    return sorted(Path(p) for p in glob(str(DATASETS_DIR / "*.json")))


def diff_scalar(old, new):
    return {"kind": "scalar", "old": old, "new": new}


def diff_list_of_scalars(old, new):
    old_set, new_set = list(old), list(new)
    old_s = set(old_set)
    new_s = set(new_set)
    added = [x for x in new_set if x not in old_s]
    removed = [x for x in old_set if x not in new_s]
    return {"kind": "list", "added": added, "removed": removed}


def diff_subsets(old, new):
    old_by_name = {s.get("Name"): s for s in (old or []) if isinstance(s, dict)}
    new_by_name = {s.get("Name"): s for s in (new or []) if isinstance(s, dict)}
    added_names = [n for n in new_by_name if n not in old_by_name]
    removed_names = [n for n in old_by_name if n not in new_by_name]
    field_changes = {}
    for name in new_by_name:
        if name in old_by_name:
            o, n = old_by_name[name], new_by_name[name]
            changes = {}
            for f in SUBSET_FIELDS:
                if o.get(f) != n.get(f):
                    changes[f] = {"old": o.get(f), "new": n.get(f)}
            if changes:
                field_changes[name] = changes
    return {
        "kind": "subsets",
        "added": added_names,
        "removed": removed_names,
        "field_changes": field_changes,
    }


def diff_dataset(old, new):
    """Return {key: change_dict} for keys that differ. None if identical."""
    changes = {}
    all_keys = set(old) | set(new)
    for key in sorted(all_keys):
        in_old, in_new = key in old, key in new
        if in_old and not in_new:
            changes[key] = {"kind": "key_removed"}
        elif in_new and not in_old:
            changes[key] = {"kind": "key_added", "value": new[key]}
        else:
            ov, nv = old[key], new[key]
            if ov == nv:
                continue
            if key == SUBSET_KEY and isinstance(ov, list) and isinstance(nv, list):
                changes[key] = diff_subsets(ov, nv)
            elif isinstance(ov, list) and isinstance(nv, list):
                changes[key] = diff_list_of_scalars(ov, nv)
            else:
                changes[key] = diff_scalar(ov, nv)
    return changes


def count_edits(changes):
    """Total field-level edits in a per-file change dict (for ranking)."""
    total = 0
    for key, ch in changes.items():
        k = ch["kind"]
        if k in ("key_removed", "key_added"):
            total += 1
        elif k == "scalar":
            total += 1
        elif k == "list":
            total += len(ch["added"]) + len(ch["removed"])
        elif k == "subsets":
            total += len(ch["added"]) + len(ch["removed"])
            for fch in ch["field_changes"].values():
                total += len(fch)
    return total


def diff_schema(old_schema, new_schema):
    keys_old, keys_new = set(old_schema), set(new_schema)
    added = sorted(keys_new - keys_old)
    removed = sorted(keys_old - keys_new)
    modified = {}
    for key in sorted(keys_old & keys_new):
        o, n = old_schema[key], new_schema[key]
        if o == n:
            continue
        entry = {}
        for field in ("answer_type", "answer_min", "answer_max"):
            if o.get(field) != n.get(field):
                entry[field] = {"old": o.get(field), "new": n.get(field)}
        oo = o.get("options")
        no = n.get("options")
        if oo is not None or no is not None:
            os = oo or []
            ns = no or []
            opt_added = [x for x in ns if x not in set(os)]
            opt_removed = [x for x in os if x not in set(ns)]
            if opt_added or opt_removed:
                entry["options_added"] = opt_added
                entry["options_removed"] = opt_removed
        if entry:
            modified[key] = entry
    return {"added": added, "removed": removed, "modified": modified}


def build_report(days, verbose):
    b_hash, b_date, b_subject = find_baseline_commit(days)

    old_files = {p.name for p in list_dataset_files(b_hash)}
    new_files = {p.name for p in list_disk_dataset_files()}

    added_files = sorted(new_files - old_files)
    removed_files = sorted(old_files - new_files)
    common_files = sorted(new_files & old_files)

    file_diffs = []
    for name in common_files:
        old = read_dataset_file(DATASETS_DIR / name, b_hash)
        new = read_dataset_file(DATASETS_DIR / name, None)
        ch = diff_dataset(old, new)
        if ch:
            file_diffs.append({"file": name, "changes": ch, "edits": count_edits(ch)})

    file_diffs.sort(key=lambda r: r["edits"], reverse=True)

    old_schema = read_schema_file(b_hash)
    new_schema = read_schema_file(None)
    schema_evolution = diff_schema(old_schema, new_schema)

    diffusion = {}
    for name in added_files:
        new = read_dataset_file(DATASETS_DIR / name, None)
        for key in new:
            d = diffusion.setdefault(key, {"added": 0, "removed": 0, "changed": 0})
            d["added"] += 1
    for name in removed_files:
        old = read_dataset_file(DATASETS_DIR / name, b_hash)
        for key in old:
            d = diffusion.setdefault(key, {"added": 0, "removed": 0, "changed": 0})
            d["removed"] += 1
    for fd in file_diffs:
        for key, ch in fd["changes"].items():
            d = diffusion.setdefault(key, {"added": 0, "removed": 0, "changed": 0})
            if ch["kind"] == "key_added":
                d["added"] += 1
            elif ch["kind"] == "key_removed":
                d["removed"] += 1
            else:
                d["changed"] += 1
    diffusion_sorted = sorted(
        diffusion.items(),
        key=lambda kv: -(kv[1]["added"] + kv[1]["removed"] + kv[1]["changed"]),
    )

    return {
        "days": days,
        "baseline": {"hash": b_hash, "date": b_date, "subject": b_subject},
        "section_a": {
            "count_now": len(new_files),
            "count_old": len(old_files),
            "delta": len(new_files) - len(old_files),
            "added_files": added_files,
            "removed_files": removed_files,
            "common_files": len(common_files),
            "touched_files": len(file_diffs),
        },
        "section_b": {
            "schema_evolution": schema_evolution,
            "value_diffusion": diffusion_sorted,
        },
        "section_c": file_diffs,
        "verbose": verbose,
    }


def fmt_value(v):
    if isinstance(v, (list, dict)):
        s = json.dumps(v, ensure_ascii=False)
        if len(s) > 80:
            s = s[:77] + "..."
        return s
    return repr(v)


def render(report):
    L = []
    b = report["baseline"]
    L.append("# Weekly Datasets Diff Report")
    L.append("")
    L.append(f"- Window: **{report['days']} days**")
    L.append(f"- Baseline commit: `{b['hash'][:7]}` ({b['date']}) — *{b['subject']}*")
    L.append(f"- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    L.append("")

    a = report["section_a"]
    L.append("## A. General Stats")
    L.append("")
    L.append("| Metric | Value |")
    L.append("|---|---|")
    L.append(f"| Datasets now | {a['count_now']} |")
    L.append(f"| Datasets {report['days']} days ago | {a['count_old']} |")
    L.append(f"| Net change | {'+' if a['delta']>=0 else ''}{a['delta']} |")
    L.append(f"| Common files | {a['common_files']} |")
    L.append(f"| Touched files (modified) | {a['touched_files']} |")
    L.append(f"| Added datasets | {len(a['added_files'])} |")
    L.append(f"| Removed datasets | {len(a['removed_files'])} |")
    L.append("")

    if a["added_files"]:
        L.append("### Added datasets")
        L.append("")
        for f in a["added_files"]:
            L.append(f"- `{f}`")
        L.append("")
    if a["removed_files"]:
        L.append("### Removed datasets")
        L.append("")
        for f in a["removed_files"]:
            L.append(f"- `{f}`")
        L.append("")

    L.append("## B. Schema-level Updates")
    L.append("")
    se = report["section_b"]["schema_evolution"]
    L.append("### (b) Schema.json structural evolution")
    L.append("")
    if se["added"]:
        L.append("**Added schema keys:**")
        for k in se["added"]:
            L.append(f"- `{k}`")
        L.append("")
    if se["removed"]:
        L.append("**Removed schema keys:**")
        for k in se["removed"]:
            L.append(f"- `{k}`")
        L.append("")
    if se["modified"]:
        L.append("**Modified schema keys:**")
        L.append("")
        L.append("| Key | Field | Old | New |")
        L.append("|---|---|---|---|")
        for key, entry in se["modified"].items():
            for field, delta in entry.items():
                if field in ("answer_type", "answer_min", "answer_max"):
                    L.append(f"| `{key}` | `{field}` | {fmt_value(delta['old'])} | {fmt_value(delta['new'])} |")
            if "options_added" in entry or "options_removed" in entry:
                oa = entry.get("options_added", [])
                ore = entry.get("options_removed", [])
                old_cell = ", ".join(f"`{x}`" for x in ore) if ore else ""
                new_cell = ", ".join(f"`{x}`" for x in oa) if oa else ""
                L.append(f"| `{key}` | options | {old_cell} | {new_cell} |")
        L.append("")
    if not (se["added"] or se["removed"] or se["modified"]):
        L.append("_No structural changes to schema.json._")
        L.append("")

    L.append("### (a) Field-value diffusion across datasets")
    L.append("")
    L.append("| Schema key | Added | Removed | Changed | Total |")
    L.append("|---|---:|---:|---:|---:|")
    for key, d in report["section_b"]["value_diffusion"]:
        total = d["added"] + d["removed"] + d["changed"]
        if total == 0:
            continue
        L.append(f"| `{key}` | {d['added']} | {d['removed']} | {d['changed']} | {total} |")
    if not report["section_b"]["value_diffusion"]:
        L.append("| _(none)_ | | | | |")
    L.append("")

    L.append("## C. Field-level Annotation Comparison")
    L.append("")
    files = report["section_c"]
    if not files:
        L.append("_No dataset files were modified in the window._")
        L.append("")
    else:
        shown = files if report["verbose"] else files[:TOP_N_FILES]
        if not report["verbose"] and len(files) > TOP_N_FILES:
            L.append(f"_Showing top {TOP_N_FILES} of {len(files)} modified files by total edits. "
                      f"Use `--verbose` for the full list._")
            L.append("")
        for fd in shown:
            L.append(f"### `{fd['file']}`  —  {fd['edits']} edit(s)")
            L.append("")
            L.append("| Field | Change |")
            L.append("|---|---|")
            for key, ch in sorted(fd["changes"].items()):
                k = ch["kind"]
                if k == "key_removed":
                    L.append(f"| `{key}` | removed |")
                elif k == "key_added":
                    L.append(f"| `{key}` | added: {fmt_value(ch['value'])} |")
                elif k == "scalar":
                    L.append(f"| `{key}` | `{fmt_value(ch['old'])}` → `{fmt_value(ch['new'])}` |")
                elif k == "list":
                    parts = []
                    if ch["added"]:
                        parts.append("+ " + ", ".join(f"`{x}`" for x in ch["added"]))
                    if ch["removed"]:
                        parts.append("- " + ", ".join(f"`{x}`" for x in ch["removed"]))
                    L.append(f"| `{key}` | {'; '.join(parts)} |")
                elif k == "subsets":
                    parts = []
                    if ch["added"]:
                        parts.append("+ subsets: " + ", ".join(f"`{x}`" for x in ch["added"]))
                    if ch["removed"]:
                        parts.append("- subsets: " + ", ".join(f"`{x}`" for x in ch["removed"]))
                    for name, fch in ch["field_changes"].items():
                        for f, d in fch.items():
                            parts.append(f"`{name}.{f}`: `{fmt_value(d['old'])}` → `{fmt_value(d['new'])}`")
                    L.append(f"| `{key}` | {'; '.join(parts)} |")
            L.append("")

    return "\n".join(L)


def print_summary(report):
    a = report["section_a"]
    b = report["baseline"]
    print(f"Baseline: {b['hash'][:7]} ({b['date']}) — {b['subject']}")
    print(f"Datasets: {a['count_now']} now vs {a['count_old']} {report['days']} days ago "
          f"(net {'+' if a['delta']>=0 else ''}{a['delta']})")
    print(f"Added: {len(a['added_files'])}  Removed: {len(a['removed_files'])}  "
          f"Modified: {a['touched_files']}")
    se = report["section_b"]["schema_evolution"]
    print(f"Schema: +{len(se['added'])} keys  -{len(se['removed'])} keys  "
          f"~{len(se['modified'])} modified")
    print("Top changed fields:")
    for key, d in report["section_b"]["value_diffusion"][:10]:
        total = d["added"] + d["removed"] + d["changed"]
        if total == 0:
            continue
        print(f"  {key:<22} +{d['added']:<4} -{d['removed']:<4} ~{d['changed']:<4} (total {total})")
    print(f"\nReport written to {report['report_path']}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=7, help="lookback window in days")
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT, help="markdown report path")
    parser.add_argument("--verbose", action="store_true", help="show all modified files, not just top 20")
    args = parser.parse_args()

    if args.days < 1:
        parser.error("--days must be >= 1")

    report = build_report(args.days, args.verbose)
    report["report_path"] = str(args.report)

    md = render(report)
    args.report.write_text(md, encoding="utf-8")
    print_summary(report)


if __name__ == "__main__":
    main()
