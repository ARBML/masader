import json
from glob import glob

json_schema = json.load(open("schema.json"))
SCHEMA_ORDER = [
    "Name", "Dialect Subsets", "HF Link", "Link", "License", "Year",
    "Language", "Dialect", "Source", "Domain", "Form", "Annotation Style",
    "Description", "Volume", "Unit", "Provider", "Derived From", "Paper Title", "Paper Link", "Script", "Tokenized", "Host", "Access", "Cost", "Has Splits",
    "Partial", "Tasks", "Venue Title", "Venue Type", "Venue Name", "Authors", "Affiliations",
    "Abstract", "Added By"]

for file in glob("datasets/*.json"):
    with open(file, "r") as f:
        data = json.load(f)

    # 1. Rename Domain -> Source, add Domain with default
    if "Domain" in data and "Source" not in data:
        data["Source"] = data.pop("Domain")
        data["Domain"] = ["general"]

    # 2. Rename Test Split -> Has Splits
    if "Test Split" in data:
        data["Has Splits"] = data.pop("Test Split")

    # 2. Rename Subsets -> Dialect Subsets
    if "Subsets" in data:
        data["Dialect Subsets"] = data.pop("Subsets")

    # 3. Add Partial with default false
    if "Partial" not in data:
        data["Partial"] = False

    data.pop("Ethical Risks", None)

    # Reorder keys to match schema
    ordered = {k: data[k] for k in SCHEMA_ORDER if k in data}
    for k in data:
        if k not in ordered:
            ordered[k] = data[k]

    with open(file, "w") as f:
        json.dump(ordered, f, indent=4, ensure_ascii=False)
        f.write("\n")

print("Migration complete")
