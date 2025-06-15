import json
import requests
import re
import os
url = "https://raw.githubusercontent.com/zaidalyafeai/MOLE/refs/heads/main/schema/ar.json"
from collections import Counter
# response = requests.get(url)
# schema = response.json()
tasks = []
schema = json.load(open("schema.json"))
# print(json_data)
data_types = {c:schema[c]['answer_type'] for c in schema}
options = {c:schema[c]['options'] for c in schema if 'options' in schema[c]}

def validate_url(url):
    # regex validation 
    return url.startswith("http") or url.startswith("mailto")

def cast_data(data):
    casted_data = {}
    added_by = data.get("Added By", "")
    for key, value in data.items():
        if key in data_types:
            casted_data[key] = cast_type(value, data_types[key])
    casted_data["Added By"] = added_by
    return casted_data

def validate_options(data):
    for key, value in data.items():
        if key in options:
            if data_types[key] == "List[str]":
                
                for item in value:
                    if item not in options[key]:
                        print(f"Invalid item: {item} for {key}")
                        if key == "Tasks":
                            tasks.append(item)
            elif data_types[key] == "str":
                if value not in options[key]:
                    # print(f"Invalid option: {value} for {key}")
                    data[key] = options[key][0]
    return data


def cast_type(value, type):
    if type == "url":
        value = str(value).strip()
        if value == "":
            return value
        elif validate_url(value):
            return value
        else:
            raise ValueError(f"Invalid URL: {value}")
    elif type == "List[str]":
       if isinstance(value, str):
           if value.strip() == "":
               return []
           return [item.strip() for item in value.split(",")]
       else:
           return value
    elif "List[Dict" in type:
        for d in value:
            for k,v in d.items():
                if k in data_types:
                    d[k] = cast_type(v, data_types[k])
                    if k in options:
                        if d[k] not in options[k]:
                            print(f"Invalid option: {d[k]} for {k}")
                else:
                    raise ValueError(f"Invalid key: {k}")
        print(value)
        return value
    elif type == "str":
        return str(value).strip()
    elif type == "date[year]":
        try:
            value = str(value).strip()
            return int(value)
        except:
            raise ValueError(f"Invalid year value: {value}")
    
    elif type == "float":
        value = str(value).strip()
        if ',' in value:
            value = value.replace(',', '')
        elif value == "":
            return 0.0
        return float(value)
    elif type == "bool":
        value = str(value).strip()
        if value == "Yes":
            return True
        elif value == "No":
            return False
        else:
            try:
                return bool(value)
            except:
                raise ValueError(f"Invalid boolean value: {value}")
    else:
        raise ValueError(f"Invalid type: {type}")

for file in os.listdir("datasets"):
    data = json.load(open(f"datasets/{file}"))
    

for file in os.listdir("datasets"):
    data = json.load(open(f"datasets/{file}"))
    data = cast_data(data)
    data = validate_options(data)
    json.dump(data, open(f"datasets/{file}", "w"), indent=4)


