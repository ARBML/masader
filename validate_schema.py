import json
import os
import re
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

def validate_keys(data, key, file):
    if key not in schema:
        sys.exit(f"{file}: Invalid key: {key}")
    return data

def validate_options(data, key, file):
    if key in options:
        if data_types[key] == "list[str]":
            for item in data[key]:
                if item not in options[key]:
                    sys.exit(f"{file}: Invalid item: {item} for {key}")
        elif data_types[key] == "str":
            if data[key] not in options[key]:
                sys.exit(f"{file}: Invalid option: {data[key]} for {key}")
    return data

def validate_types(data, key, file):
    if "list" in data_types[key] and not isinstance(data[key], list):
        sys.exit(f"{file}: Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "list[dict[Name, Volume, Unit, Dialect]]" and not all(isinstance(item, dict) for item in data[key]):
        sys.exit(f"{file}: Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "str" and not isinstance(data[key], str):
        sys.exit(f"{file}: Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "float" and (not isinstance(data[key], float) and not isinstance(data[key], int)):
        sys.exit(f"{file}: Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "int" and not isinstance(data[key], int):
        sys.exit(f"{file}: Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "year" and not isinstance(data[key], int):
        sys.exit(f"{file}: Invalid type: {type(data[key])} for {key}")
    elif data_types[key] == "bool" and not isinstance(data[key], bool):
        sys.exit(f"{file}: Invalid type: {type(data[key])} for {key}")
    return data

SUBSET_FIELDS_RE = re.compile(r"list\[dict\[([^\]]+)\]\]")

def subset_fields(answer_type):
    match = SUBSET_FIELDS_RE.match(answer_type)
    if not match:
        return []
    return [field.strip() for field in match.group(1).split(",")]

def validate_subsets(data, key, file):
    fields = subset_fields(data_types[key])
    if not fields:
        return data
    for i, item in enumerate(data[key]):
        ctx = f"{file}:{key}[{i}]"
        if not isinstance(item, dict):
            sys.exit(f"{ctx}: Invalid type: {type(item)}")
        for field in item:
            if field not in fields:
                sys.exit(f"{ctx}: Invalid key: {field}")
        for field in fields:
            if field not in item:
                sys.exit(f"{ctx}: Missing key: {field}")
            validate_options(item, field, ctx)
            validate_types(item, field, ctx)
            validate_keys(item, field, ctx)
def validate_venues(data, file):
    normalized_veneus = json.load(open("venues.json"))

    if data["Venue Title"] not in normalized_veneus:
        sys.exit(f"{file}: Invalid Venue Title: {data['Venue Title']}")
    if data["Venue Name"] != normalized_veneus[data["Venue Title"]]["name"]:
        sys.exit(f"{file}: Invalid Venue Name: {data['Venue Name']}")
    if data["Venue Type"] != normalized_veneus[data["Venue Title"]]["type"]:
        sys.exit(f"{file}: Invalid Venue Type: {data['Venue Type']}")
    return data

for file in glob("datasets/*.json"):
    data = json.load(open(file))
    data = {k.replace("_", " "): v for k, v in data.items()}
    data.pop("Added By", None)
    for key in schema:
        validate_keys(data, key, file)
        validate_options(data, key, file)
        validate_types(data, key, file)
        validate_subsets(data, key, file)
    validate_venues(data, file)


print("Schema validation passed")
