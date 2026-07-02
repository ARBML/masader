"""Quality-assurance checks for datasets/*.json.

Runs a set of content checks (beyond schema validation) and reports any
problems it finds. Each check is a small function that takes a dataset dict
(keys use spaces, e.g. "HF Link") and returns a list of human-readable issue
messages. Add new checks to the CHECKS list at the bottom.

Usage:
    python3 quality_assurance.py                 # report all issues
    python3 quality_assurance.py --check host    # run a single check
    python3 quality_assurance.py --json qa_report.json

Exit code is non-zero when any issue is found (useful for CI).
"""

import argparse
import json
import re
import sys
from glob import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATASETS_DIR = ROOT / "datasets"
REPORT_FILE = ROOT / "qa_report.json"
VENUES_FILE = ROOT / "venues.json"

# Volumes are integer counts stored as floats; allow a tiny rounding slack.
VOLUME_TOLERANCE = 0.5

# Hosts that cannot be reliably validated against Link/HF Link and are skipped.
HOST_SKIP = {"other", "Gdrive", "OneDrive", "CAMeL Resources", "Dropbox", "QCRI Resources"}

# Map each `Host` option to substrings that should appear in `Link`/`HF Link`.
HOST_DOMAINS = {
    "GitHub": ["github.com", "github.io"],
    "GitLab": ["gitlab.com", "gitlab.io"],
    "CodaLab": ["codalab.org", "codalab"],
    "data.world": ["data.world"],
    "Dropbox": ["dropbox.com"],
    "LDC": ["ldc.upenn.edu", "catalog.ldc"],
    "MPDI": ["mdpi.com"],
    "Mendeley Data": ["mendeley.com", "data.mendeley"],
    "Mozilla": ["mozilla.org", "commonvoice.mozilla"],
    "QCRI Resources": ["qcri.org", "qcri", "hbku.edu.qa"],
    "ResearchGate": ["researchgate.net"],
    "sourceforge": ["sourceforge.net"],
    "zenodo": ["zenodo.org", "zenodo."],
    "HuggingFace": ["huggingface.co", "hf.co"],
    "ELRA": ["elra.info", "catalogue.elra", "elra.com"],
    "kaggle": ["kaggle.com"],
}

# An initial: a single letter, optionally followed by a period (e.g. "M", "M.").
INITIAL_RE = re.compile(r"^[A-Za-z]\.?$")


def normalize_venue(value):
    """Canonical comparison key: lowercase, drop punctuation, leading 'the',
    '&' -> 'and', collapse whitespace."""
    if not isinstance(value, str):
        return ""
    value = value.strip().lower()
    if not value:
        return ""
    value = value.replace("&", " and ")
    value = re.sub(r"[^\w\s]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"^the\s+", "", value)
    return value


def load_venues():
    data = json.loads(VENUES_FILE.read_text(encoding="utf-8"))
    return data["venues"]


def _links(data):
    """Lowercased, non-empty Link / HF Link values for a dataset."""
    out = []
    for key in ("Link", "HF Link"):
        value = data.get(key)
        if isinstance(value, str) and value.strip():
            out.append(value.strip().lower())
    return out


def _has_task(data, task):
    tasks = data.get("Tasks")
    return isinstance(tasks, list) and task in tasks


def check_subsets_volume(data, ctx):
    """Subset volumes must match the dataset's total Volume.

    For machine-translation datasets whose dialect subsets are parallel (all
    share the same count), total Volume equals each subset Volume (not their
    sum). Otherwise, the sum of subset volumes must equal total Volume.
    """
    subsets = data.get("Dialect Subsets")
    if not isinstance(subsets, list) or not subsets:
        return []

    total = data.get("Volume")
    if not isinstance(total, (int, float)):
        return ["has Dialect Subsets but no numeric Volume to compare against"]

    volumes = []
    for i, sub in enumerate(subsets):
        vol = sub.get("Volume") if isinstance(sub, dict) else None
        if not isinstance(vol, (int, float)):
            return [f"subset #{i + 1} ({sub.get('Name', '?')}) has no numeric Volume"]
        volumes.append(vol)

    ref = volumes[0]
    parallel_mt = (
        _has_task(data, "machine translation")
        and all(abs(v - ref) <= VOLUME_TOLERANCE for v in volumes[1:])
    )

    if parallel_mt:
        if abs(total - ref) > VOLUME_TOLERANCE:
            return [
                f"Volume {total:g} != dialect subset volume {ref:g} "
                f"(parallel MT: total should match each dialect, not their sum)"
            ]
        return []

    subtotal = sum(volumes)
    if abs(subtotal - total) > VOLUME_TOLERANCE:
        return [
            f"Volume {total:g} != sum of {len(subsets)} subset volumes {subtotal:g}"
        ]
    return []


def check_host(data, ctx):
    """`Host` must be reflected in one of `Link` / `HF Link`."""
    host = data.get("Host")
    if not isinstance(host, str) or not host.strip():
        return ["Host is empty"]
    host = host.strip()
    if host in HOST_SKIP:
        return []

    domains = HOST_DOMAINS.get(host)
    if domains is None:
        return [f"unknown Host '{host}' (no domain mapping)"]

    links = _links(data)
    if not links:
        return [f"Host is '{host}' but both Link and HF Link are empty"]

    if any(any(dom in link for dom in domains) for link in links):
        return []
    return [
        f"Host '{host}' not found in Link/HF Link (expected one of {domains})"
    ]


def check_public_derived_from(data, ctx):
    """Datasets sourced from public datasets must list Derived From."""
    source = data.get("Source")
    source = source if isinstance(source, list) else []
    if "public datasets" not in source:
        return []

    derived = data.get("Derived From")
    if not isinstance(derived, list) or not any(
        isinstance(d, str) and d.strip() for d in derived
    ):
        return ["Source includes 'public datasets' but Derived From is empty"]
    return []


def check_venue_reference(data, ctx):
    """Venue Title is the key into venues.json; Name must follow it."""
    raw_title = data.get("Venue Title")
    raw_name = data.get("Venue Name")

    key = normalize_venue(raw_title)
    if not key:
        return []

    entry = ctx["venue_title_lookup"].get(key)
    if entry is None:
        return [f"Venue Title '{raw_title}' not found in venues.json"]

    issues = []
    if (raw_title or "") != entry["title"]:
        issues.append(f"Venue Title '{raw_title}' should be '{entry['title']}'")
    if (raw_name or "") != entry["name"]:
        issues.append(f"Venue Name '{raw_name}' should be '{entry['name']}'")
    return issues


def check_author_full_names(data, ctx):
    """Author first names must be spelled out, not shortened to an initial."""
    authors = data.get("Authors")
    if not isinstance(authors, list):
        return []

    issues = []
    for author in authors:
        if not isinstance(author, str) or not author.strip():
            continue
        tokens = author.strip().split()
        if tokens and INITIAL_RE.match(tokens[0]):
            issues.append(f"author '{author}' uses an initial for the first name")
    return issues


CHECKS = {
    "subsets": check_subsets_volume,
    "host": check_host,
    "public-derived": check_public_derived_from,
    "venue": check_venue_reference,
    "authors": check_author_full_names,
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="append",
        choices=sorted(CHECKS),
        help="run only the named check(s); may be repeated (default: all)",
    )
    parser.add_argument(
        "--json",
        type=Path,
        default=REPORT_FILE,
        help=f"path for the JSON report (default {REPORT_FILE.name})",
    )
    args = parser.parse_args()

    selected = args.check or sorted(CHECKS)

    venues = load_venues()
    title_lookup = {}  # normalized Venue Title (or alias) -> reference entry
    for entry in venues:
        for surface in [entry["title"], *entry.get("aliases", [])]:
            k = normalize_venue(surface)
            if k:
                title_lookup.setdefault(k, entry)
    ctx = {"venue_title_lookup": title_lookup}

    findings = []  # {"file", "check", "message"}
    per_check = {name: 0 for name in selected}
    files = 0

    for file in sorted(glob(str(DATASETS_DIR / "*.json"))):
        files += 1
        fname = Path(file).name
        try:
            data = json.loads(Path(file).read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as e:
            findings.append({"file": fname, "check": "parse", "message": str(e)})
            continue

        for name in selected:
            for message in CHECKS[name](data, ctx):
                findings.append({"file": fname, "check": name, "message": message})
                per_check[name] += 1

    report = {
        "stats": {
            "files_scanned": files,
            "checks_run": selected,
            "issues_total": len(findings),
            "issues_per_check": per_check,
        },
        "findings": sorted(findings, key=lambda r: (r["check"], r["file"])),
    }
    args.json.write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    for name in selected:
        print(f"{per_check[name]:5d}  {name}")
    print(f"\nScanned {files} files, found {len(findings)} issue(s).")
    print(f"Details written to {args.json}")

    if findings:
        sys.exit(1)


if __name__ == "__main__":
    main()
