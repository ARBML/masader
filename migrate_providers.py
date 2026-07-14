"""Replace provider aliases with canonical names from providers.json."""

import argparse
import json
from pathlib import Path

from json_format import write_json


ROOT = Path(__file__).resolve().parent
DATASETS_DIR = ROOT / "datasets"
PROVIDERS_FILE = ROOT / "providers.json"


def load_aliases():
    providers = json.loads(PROVIDERS_FILE.read_text(encoding="utf-8"))
    aliases = {}
    canonical_names = set(providers)

    for canonical, entry in providers.items():
        if not isinstance(entry, dict) or not isinstance(entry.get("aliases"), list):
            raise ValueError(f"{canonical}: expected an object with an aliases array")
        for alias in entry["aliases"]:
            if not isinstance(alias, str) or not alias:
                raise ValueError(f"{canonical}: aliases must be non-empty strings")
            if alias == canonical:
                raise ValueError(f"{canonical}: canonical name repeated as an alias")
            if alias in canonical_names:
                raise ValueError(f"{alias}: alias is also a canonical provider")
            if alias in aliases:
                raise ValueError(
                    f"{alias}: alias assigned to both {aliases[alias]} and {canonical}"
                )
            aliases[alias] = canonical

    return aliases


def canonicalize(values, aliases):
    canonical = []
    for value in values:
        value = aliases.get(value, value)
        if value not in canonical:
            canonical.append(value)
    return canonical


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="report datasets requiring migration without changing them",
    )
    args = parser.parse_args()

    aliases = load_aliases()
    changed_files = 0
    changed_values = 0

    for path in sorted(DATASETS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        providers = data.get("Provider", [])
        canonical = canonicalize(providers, aliases)
        if canonical == providers:
            continue

        changed_files += 1
        changed_values += sum(aliases.get(value, value) != value for value in providers)
        if not args.check:
            data["Provider"] = canonical
            write_json(path, data)

    action = "require migration" if args.check else "migrated"
    print(f"{changed_files} dataset file(s) {action}; {changed_values} value(s) replaced")
    if args.check and changed_files:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
