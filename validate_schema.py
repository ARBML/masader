import json
import os
import sys
from glob import glob
from pathlib import Path

import requests

SCHEMA_URL = os.environ.get("SCHEMA_URL", "https://mextract-production.up.railway.app/schema")
SCHEMA_FILE = Path(__file__).resolve().parent / "schema.json"


def load_schema():
    if os.environ.get("USE_LOCAL_SCHEMA", "").lower() in ("1", "true", "yes"):
        return json.loads(SCHEMA_FILE.read_text())

    try:
        response = requests.post(SCHEMA_URL, data={"name": "ar"}, timeout=30)
        if not response.ok:
            raise RuntimeError(f"{response.status_code}: {response.text}")
        schema = response.json()
        if isinstance(schema, dict) and len(schema) == 1 and "detail" in schema:
            raise RuntimeError(schema["detail"])
        return schema
    except (requests.RequestException, RuntimeError) as e:
        if not SCHEMA_FILE.exists():
            sys.exit(f"Could not load schema from {SCHEMA_URL}: {e}")
        print(f"Warning: using {SCHEMA_FILE} ({e})", file=sys.stderr)
        return json.loads(SCHEMA_FILE.read_text())


schema = {k.replace("_", " "): v for k, v in load_schema().items()}

data_types = {c:schema[c]['answer_type'] for c in schema}
options = {c:schema[c]['options'] for c in schema if 'options' in schema[c]}

def validate_keys(data, key):
    if key.replace("_", " ") not in schema:
        sys.exit(f"Invalid key: {key}")
    return data

def validate_options(data, key):
    if key in options:
        if data_types[key] == "list[str]":
            for item in data[key]:
                if item not in options[key]:
                    sys.exit(f"Invalid item: {item} for {key}")
        elif data_types[key] == "str":
            if data[key] not in options[key]:
                sys.exit(f"Invalid option: {data[key]} for {key}")
    return data

def validate_types(data, key):
    if data_types[key] == "list[str]" and not isinstance(data[key], list):
        sys.exit(f"Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "str" and not isinstance(data[key], str):
        sys.exit(f"Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "float" and (not isinstance(data[key], float) and not isinstance(data[key], int)):
        sys.exit(f"Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "int" and not isinstance(data[key], int):
        sys.exit(f"Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "year" and not isinstance(data[key], int):
        sys.exit(f"Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "bool" and not isinstance(data[key], bool):
        sys.exit(f"Invalid type: {type(data[key])} for {key}")
    return data

for file in glob("datasets/*.json"):
    data = json.load(open(file))
    data.pop("Added By", None)
    data.pop("Added_By", None)
    for key in data.keys():
        validate_options(data, key)
        validate_types(data, key)
        validate_keys(data, key)
