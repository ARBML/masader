import json
import requests
import re
import os
url = "https://raw.githubusercontent.com/zaidalyafeai/MOLE/refs/heads/main/schema/ar.json"

response = requests.get(url)
json_data = response.json()
# print(json_data)
data_types = {c:json_data[c]['answer_type'] for c in json_data}

def validate_url(url):
    # regex validation 
    return url.startswith("http") or url.startswith("mailto")

def cast_type(value, type):
    if type == "url":
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
    elif type == "str":
        return str(value)
    elif type == "date[year]":
        try:
            return int(value)
        except:
            raise ValueError(f"Invalid year value: {value}")
    
    elif type == "float":
        value = str(value)
        if ',' in value:
            value = value.replace(',', '')
        elif value == "":
            print(f"Invalid float value: {value}")
            return 0.0
        return float(value)
    elif type == "bool":
        if value == "Yes":
            return True
        elif value == "No":
            return False
        else:
            try:
                return bool(value)
            except:
                raise ValueError(f"Invalid boolean value: {value}")
    elif "List[Dict" in type:
        if isinstance(value, str):
            return [json.loads(item.strip()) for item in value.split(",")]
        else:
            return value
    else:
        raise ValueError(f"Invalid type: {type}")
    
for file in os.listdir("datasets"):
    print(file)
    data = json.load(open(f"datasets/{file}"))
    casted_data = {}
    for key, value in data.items():
        if key in data_types:
            data[key] = cast_type(value, data_types[key])
            casted_data[key] = data[key]
    json.dump(casted_data, open(f"datasets/{file}", "w"), indent=4)