import asyncio
import json
import sys
from glob import glob
from pathlib import Path

from openai import AsyncOpenAI
from tqdm.asyncio import tqdm

client = AsyncOpenAI(base_url="http://localhost:8080/v1", api_key="not-needed")
MODEL = "Qwen3.6-35B-A3B"

DOMAIN_OPTIONS = [
    "religion", "medicine", "news", "education", "science", "literature",
    "finance", "law", "politics", "culture", "society", "crisis", "general",
]

SOURCE_OPTIONS = [
    "social media", "news articles", "reviews", "commentary", "books",
    "wikipedia", "web pages", "public datasets", "TV channels", "captions",
    "LLM", "telephone conversations", "studio recordings", "subtitles",
    "treebanks", "web crawls", "other",
]

UNIT_OPTIONS = [
    "tokens", "sentences", "documents", "conversations", "images", "videos", "hours",
]

PROMPT = """You are an expert data annotator for Arabic NLP datasets.

Given the following dataset metadata, re-annotate three fields.

Dataset:
- Name: {name}
- Description: {description}
- Tasks: {tasks}
- Current Domain: {current_domain}
- Current Source: {current_source}
- Current Unit: {current_unit}

Instructions:
1. Domain: Select one or more from: {domain_options}
   What is the subject matter of this dataset?
2. Source: Select one or more from: {source_options}
   Where does the data come from?

Return ONLY a JSON object with no explanation:
{{"Domain": [...], "Source": [...]}}
"""


def read_dataset(file):
    with open(file, "r") as f:
        return json.load(f)


def write_dataset(file, data):
    Path(file).write_text(
        json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8"
    )


async def annotate(dataset, file):
    name = dataset.get("Name", "")
    description = dataset.get("Description", "")
    tasks = dataset.get("Tasks", [])
    current_domain = dataset.get("Domain", [])
    current_source = dataset.get("Source", [])
    current_unit = dataset.get("Unit", "")

    prompt = PROMPT.format(
        name=name,
        description=description[:500],
        tasks=tasks,
        current_domain=current_domain,
        current_source=current_source,
        current_unit=current_unit,
        domain_options=DOMAIN_OPTIONS,
        source_options=SOURCE_OPTIONS,
        unit_options=UNIT_OPTIONS,
    )

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=256,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
        )
        content = response.choices[0].message.content.strip()

        # Extract JSON from response
        start = content.find("{")
        end = content.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError(f"No JSON found in response: {content}")

        result = json.loads(content[start:end])

        # Validate and apply
        domain = result.get("Domain", current_domain)
        if isinstance(domain, str):
            domain = [domain]
        domain = [d for d in domain if d in DOMAIN_OPTIONS] or current_domain

        source = result.get("Source", current_source)
        if isinstance(source, str):
            source = [source]
        source = [s for s in source if s in SOURCE_OPTIONS] or current_source

        unit = result.get("Unit", current_unit)
        if unit not in UNIT_OPTIONS:
            unit = current_unit

        dataset["Domain"] = domain
        dataset["Source"] = source
        dataset["Unit"] = unit

    except Exception as e:
        print(f"  ERROR {file}: {e}", file=sys.stderr)

    return dataset


def main():
    files = sorted(glob("datasets/*.json"))
    total = len(files)
    print(f"Processing {total} datasets...")

    # Load all datasets
    datasets = [(read_dataset(f), f) for f in files]

    # Process in batches
    batch_size = 32

    async def run():
        pbar = tqdm(total=total, desc="Annotating", unit="ds")
        for i in range(0, len(datasets), batch_size):
            batch = datasets[i : i + batch_size]
            tasks = [annotate(ds, f) for ds, f in batch]
            results = await asyncio.gather(*tasks)
            for (ds, f), result in zip(batch, results):
                write_dataset(f, result)
            pbar.update(len(batch))
        pbar.close()

    asyncio.run(run())
    print("Annotation complete")


if __name__ == "__main__":
    main()
