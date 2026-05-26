from glob import glob
from collections import Counter
import json 

json_files = glob("datasets/*.json")
datasets = [json.load(open(f)) for f in json_files]

# count the form of the datasets
forms = [d["Form"] for d in datasets]
forms_count = Counter(forms)
print(forms_count)
print("")
# count machine generated data
count = 0
for ex in datasets:
    if "machine annotation" in ex["Collection Style"] or "LLM generated" in ex["Collection Style"]:
        count += 1
print("Machine generated data", count)
print("")
# count the dialects
dialects = []
for ex in datasets:
    for subset in ex["Subsets"]:
        dialects.append(subset["Dialect"])
    dialects.append(ex["Dialect"])
print("Dialects", Counter(dialects))
print("")
# license
licenses = Counter([ex['License'] for ex in datasets])
print("Licenses", licenses)
print("")
# multilingual datasets
multilingual = Counter([ex['Language'] for ex in datasets])
print("datasets", multilingual)
print("")
# count the number of datasets per year
years = Counter([ex['Year'] for ex in datasets])
print("Years", years)
print("")

# count the number of datasets per task
tasks = []

for ex in datasets:
    tasks.extend(ex['Tasks'])
print("Tasks", Counter(tasks))
print("")



