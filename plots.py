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

ACCESS_ORDER = ("Free", "Upon-Request", "With-Fee")
MACHINE_GENERATED_STYLES = {"machine annotation", "LLM annotation"}
ARABICNLP_WANLP_VENUES = ("ArabicNLP", "WANLP")


def load_datasets():
    datasets = []
    for path in sorted(DATASETS_DIR.glob("*.json")):
        datasets.append(json.loads(path.read_text(encoding="utf-8")))
    return datasets


def field_values(datasets, key, default="(missing)"):
    """Scalar field values, using *default* when empty or absent."""
    out = []
    for data in datasets:
        value = data.get(key)
        if value is None or (isinstance(value, str) and not value.strip()):
            out.append(default)
        else:
            out.append(value)
    return out


def dialect_mentions(data):
    """Dialect labels from the dataset field and from each subset."""
    mentions = []
    dialect = data.get("Dialect")
    if isinstance(dialect, str) and dialect.strip():
        mentions.append(dialect.strip())
    for sub in data.get("Dialect Subsets") or []:
        if not isinstance(sub, dict):
            continue
        sub_dialect = sub.get("Dialect")
        if isinstance(sub_dialect, str) and sub_dialect.strip():
            mentions.append(sub_dialect.strip())
    return mentions


def counter_items(counter, *, order=None, top=None):
    if order:
        items = [(label, counter[label]) for label in order if counter.get(label, 0)]
        for label, count in counter.items():
            if label not in order and count:
                items.append((label, count))
        return items
    return counter.most_common(top)


def print_table(title, rows, *, label_header="category"):
    if not rows:
        print(f"{title}\n(no data)\n")
        return

    total = sum(count for _, count in rows)
    label_w = max(len(label_header), *(len(str(label)) for label, _ in rows))
    count_w = max(len("count"), *(len(str(count)) for _, count in rows))

    print(title)
    print(f"  {label_header:<{label_w}}  {'count':>{count_w}}  {'pct':>6}")
    print(f"  {'-' * label_w}  {'-' * count_w}  {'-' * 6}")
    for label, count in rows:
        pct = 100 * count / total if total else 0
        print(f"  {str(label):<{label_w}}  {count:>{count_w}}  {pct:5.1f}%")
    print(f"  {'total':<{label_w}}  {total:>{count_w}}  100.0%")
    print()


def plot_bar(title, labels, values, *, orientation="vertical", ylabel="count"):
    plt.clf()
    if orientation == "horizontal":
        plt.bar(labels, values, orientation="horizontal")
        plt.xlabel(ylabel)
    else:
        plt.bar(labels, values)
        plt.ylabel(ylabel)
    plt.title(title)
    plt.show()


def show_counter(title, counter, *, order=None, top=None, orientation="vertical", as_table=False, as_plot=False):
    rows = counter_items(counter, order=order, top=top)
    if as_table:
        print_table(title, rows)
    if as_plot:
        labels = [label for label, _ in rows]
        values = [count for _, count in rows]
        plot_bar(title, labels, values, orientation=orientation)


def stats_access(datasets):
    return "Dataset access", Counter(field_values(datasets, "Access")), {"order": ACCESS_ORDER}


def stats_form(datasets):
    return "Data form", Counter(field_values(datasets, "Form")), {}


def stats_language(datasets):
    return "Language", Counter(field_values(datasets, "Language")), {}


def stats_domain(datasets):
    counter = Counter()
    for data in datasets:
        domains = data.get("Domain")
        if isinstance(domains, list):
            for d in domains:
                if isinstance(d, str) and d.strip():
                    counter[d.strip()] += 1
        elif isinstance(domains, str) and domains.strip():
            counter[domains.strip()] += 1
        else:
            counter["(missing)"] += 1
    return "Domain", counter, {
        "orientation": "horizontal",
        "label_header": "domain",
    }


def stats_venue_type(datasets):
    return "Venue type", Counter(field_values(datasets, "Venue Type")), {}


def stats_ethical_risks(datasets):
    return "Ethical risks", Counter(field_values(datasets, "Ethical Risks")), {
        "order": ("Low", "Medium", "High"),
    }


def stats_host(datasets, top=10):
    return f"Top {top} hosts", Counter(field_values(datasets, "Host")), {
        "top": top,
        "orientation": "horizontal",
    }


def normalize_venue_title(title):
    if title in ARABICNLP_WANLP_VENUES:
        return "ArabicNLP / WANLP"
    return title


def stats_venue(datasets, top=10):
    counter = Counter(
        normalize_venue_title(title)
        for title in field_values(datasets, "Venue Title")
        if title != "(missing)"
    )
    return f"Top {top} publishing venues", counter, {
        "top": top,
        "orientation": "horizontal",
    }


def stats_year(datasets):
    years = [y for y in field_values(datasets, "Year", default=None) if isinstance(y, (int, float))]
    counter = Counter(int(y) for y in years)
    rows = sorted(counter.items())
    return "Datasets by publication year", rows, {}


ANTHOLOGY_MODERN_YEAR_RE = re.compile(r"(\d{4})\.(?:arabicnlp|wanlp)", re.IGNORECASE)
ANTHOLOGY_VENUE_YEAR_RE = re.compile(r"(?:wanlp|arabicnlp)[-_](\d{4})", re.IGNORECASE)
ANTHOLOGY_OLD_W_YEAR_RE = re.compile(r"aclanthology\.org/(?:[^/]+/)?W(\d{2})", re.IGNORECASE)


def year_from_paper_link(link):
    """Publication year from an ACL Anthology id embedded in *link*."""
    if not isinstance(link, str) or not link.strip():
        return None
    match = ANTHOLOGY_MODERN_YEAR_RE.search(link)
    if match:
        return int(match.group(1))
    match = ANTHOLOGY_VENUE_YEAR_RE.search(link)
    if match:
        return int(match.group(1))
    match = ANTHOLOGY_OLD_W_YEAR_RE.search(link)
    if match:
        return 2000 + int(match.group(1))
    return None


def stats_arabicnlp_wanlp_year(datasets):
    by_year = {}
    for data in datasets:
        venue = data.get("Venue Title")
        if venue not in ARABICNLP_WANLP_VENUES:
            continue
        year = year_from_paper_link(data.get("Paper Link"))
        if year is None:
            meta_year = data.get("Year")
            if not isinstance(meta_year, (int, float)):
                continue
            year = int(meta_year)
        by_year.setdefault(year, Counter())[venue] += 1
    rows = [
        (year, by_year[year].get("WANLP", 0), by_year[year].get("ArabicNLP", 0))
        for year in sorted(by_year)
    ]
    return "Papers at ArabicNLP and WANLP by year (from Paper Link)", rows, {}


def stats_dialect(datasets):
    counter = Counter()
    for data in datasets:
        mentions = dialect_mentions(data)
        if mentions:
            counter.update(mentions)
        else:
            counter["(missing)"] += 1
    return "Dialect (field + subsets)", counter, {
        "orientation": "horizontal",
        "label_header": "dialect",
    }


def stats_machine_generated(datasets):
    manual = 0
    machine = 0
    for data in datasets:
        styles = data.get("Annotation Style")
        if not isinstance(styles, list):
            manual += 1
            continue
        normalized = {s.strip().lower() for s in styles if isinstance(s, str)}
        if normalized & {s.lower() for s in MACHINE_GENERATED_STYLES}:
            machine += 1
        else:
            manual += 1
    rows = [("other", manual), ("machine/LLM", machine)]
    return "Machine-generated vs other collection styles", rows, {}


def render_access(datasets, *, as_table=False, as_plot=False):
    title, counter, opts = stats_access(datasets)
    title = f"{title} (n={len(datasets)})"
    show_counter(title, counter, as_table=as_table, as_plot=as_plot, **opts)


def render_form(datasets, *, as_table=False, as_plot=False):
    title, counter, opts = stats_form(datasets)
    show_counter(title, counter, as_table=as_table, as_plot=as_plot, **opts)


def render_language(datasets, *, as_table=False, as_plot=False):
    title, counter, opts = stats_language(datasets)
    show_counter(title, counter, as_table=as_table, as_plot=as_plot, **opts)


def render_domain(datasets, *, as_table=False, as_plot=False, top=20):
    title, counter, opts = stats_domain(datasets)
    label_header = opts.pop("label_header")
    if as_table:
        print_table(title, counter_items(counter), label_header=label_header)
    if as_plot:
        show_counter(title, counter, as_table=False, as_plot=True, top=top, **opts)


def render_venue_type(datasets, *, as_table=False, as_plot=False):
    title, counter, opts = stats_venue_type(datasets)
    show_counter(title, counter, as_table=as_table, as_plot=as_plot, **opts)


def render_ethical_risks(datasets, *, as_table=False, as_plot=False):
    title, counter, opts = stats_ethical_risks(datasets)
    show_counter(title, counter, as_table=as_table, as_plot=as_plot, **opts)


def render_host(datasets, *, as_table=False, as_plot=False):
    title, counter, opts = stats_host(datasets)
    show_counter(title, counter, as_table=as_table, as_plot=as_plot, **opts)


def render_venue(datasets, *, as_table=False, as_plot=False):
    title, counter, opts = stats_venue(datasets)
    show_counter(title, counter, as_table=as_table, as_plot=as_plot, **opts)


def render_year(datasets, *, as_table=False, as_plot=False):
    title, rows, _ = stats_year(datasets)
    if not rows:
        print("No year values to show.\n")
        return
    if as_table:
        print_table(title, rows, label_header="year")
    if as_plot:
        years, counts = zip(*rows)
        plt.clf()
        plt.bar([str(y) for y in years], list(counts))
        plt.title(title)
        plt.xlabel("year")
        plt.ylabel("count")
        plt.show()


def print_arabicnlp_wanlp_year_table(title, rows):
    if not rows:
        print(f"{title}\n(no data)\n")
        return

    total_wanlp = sum(wanlp for _, wanlp, _ in rows)
    total_arabicnlp = sum(arabicnlp for _, _, arabicnlp in rows)
    total = total_wanlp + total_arabicnlp
    year_w = max(len("year"), *(len(str(year)) for year, _, _ in rows))
    count_w = max(len("count"), len(str(max(total_wanlp, total_arabicnlp, 1))))

    print(title)
    print(f"  {'year':<{year_w}}  {'WANLP':>{count_w}}  {'ArabicNLP':>{count_w}}  {'total':>{count_w}}")
    print(f"  {'-' * year_w}  {'-' * count_w}  {'-' * count_w}  {'-' * count_w}")
    for year, wanlp, arabicnlp in rows:
        row_total = wanlp + arabicnlp
        print(
            f"  {str(year):<{year_w}}  {wanlp:>{count_w}}  {arabicnlp:>{count_w}}  {row_total:>{count_w}}"
        )
    print(
        f"  {'total':<{year_w}}  {total_wanlp:>{count_w}}  {total_arabicnlp:>{count_w}}  {total:>{count_w}}"
    )
    print()


def render_arabicnlp_wanlp_year(datasets, *, as_table=False, as_plot=False):
    title, rows, _ = stats_arabicnlp_wanlp_year(datasets)
    if not rows:
        print("No ArabicNLP or WANLP papers with a year in Paper Link to show.\n")
        return
    if as_table:
        print_arabicnlp_wanlp_year_table(title, rows)
    if as_plot:
        years = [str(year) for year, _, _ in rows]
        wanlp = [count for _, count, _ in rows]
        arabicnlp = [count for _, _, count in rows]
        plt.clf()
        plt.multiple_bar(years, [wanlp, arabicnlp], labels=["WANLP", "ArabicNLP"])
        plt.title(title)
        plt.xlabel("year")
        plt.ylabel("papers")
        plt.show()


def render_dialect(datasets, *, as_table=False, as_plot=False, top=20):
    title, counter, opts = stats_dialect(datasets)
    label_header = opts.pop("label_header")
    if as_table:
        print_table(title, counter_items(counter), label_header=label_header)
    if as_plot:
        show_counter(title, counter, as_table=False, as_plot=True, top=top, **opts)


def render_machine_generated(datasets, *, as_table=False, as_plot=False):
    title, rows, _ = stats_machine_generated(datasets)
    if as_table:
        print_table(title, rows)
    if as_plot:
        labels, values = zip(*rows)
        plot_bar(title, list(labels), list(values))


PLOTS = {
    "access": render_access,
    "arabicnlp-wanlp-year": render_arabicnlp_wanlp_year,
    "dialect": render_dialect,
    "domain": render_domain,
    "form": render_form,
    "language": render_language,
    "venue": render_venue,
    "venue-type": render_venue_type,
    "ethical-risks": render_ethical_risks,
    "host": render_host,
    "year": render_year,
    "machine-generated": render_machine_generated,
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--plot",
        action="append",
        choices=sorted(PLOTS),
        help="stat to show (default: all); may be repeated",
    )
    parser.add_argument(
        "--table",
        action="store_true",
        help="show stats as tables instead of charts",
    )
    parser.add_argument(
        "--both",
        action="store_true",
        help="show both charts and tables",
    )
    args = parser.parse_args()

    if args.table and args.both:
        parser.error("use either --table or --both, not both flags")

    as_table = args.table or args.both
    as_plot = not args.table or args.both
    selected = args.plot or sorted(PLOTS)

    datasets = load_datasets()
    print(f"Loaded {len(datasets)} datasets from {DATASETS_DIR.name}/\n")

    for name in selected:
        print(f"--- {name} ---")
        PLOTS[name](datasets, as_table=as_table, as_plot=as_plot)
        if as_plot and not as_table:
            print()


if __name__ == "__main__":
    main()
