"""Generate a self-contained index.html showing dataset plots with Chart.js.

Usage:
    python3 web_plots.py                # writes index.html
    python3 web_plots.py --output out.html

No server needed — just open the generated HTML in a browser.
Reuses the stats functions from plots.py.
"""

import argparse
import json
from datetime import datetime
from pathlib import Path

import plots

ROOT = Path(__file__).resolve().parent
DATASETS_DIR = ROOT / "datasets"

PLOT_NAMES = [
    "access",
    "form",
    "language",
    "venue-type",
    "ethical-risks",
    "host",
    "venue",
    "year",
    "arabicnlp-wanlp-year",
    "dialect",
    "domain",
    "machine-generated",
]

STATS_FUNCS = {
    "access": plots.stats_access,
    "form": plots.stats_form,
    "language": plots.stats_language,
    "venue-type": plots.stats_venue_type,
    "ethical-risks": plots.stats_ethical_risks,
    "host": plots.stats_host,
    "venue": plots.stats_venue,
    "year": plots.stats_year,
    "arabicnlp-wanlp-year": plots.stats_arabicnlp_wanlp_year,
    "dialect": plots.stats_dialect,
    "domain": plots.stats_domain,
    "machine-generated": plots.stats_machine_generated,
}

RENDER_FUNCS = {
    "access": plots.render_access,
    "form": plots.render_form,
    "language": plots.render_language,
    "venue-type": plots.render_venue_type,
    "ethical-risks": plots.render_ethical_risks,
    "host": plots.render_host,
    "venue": plots.render_venue,
    "year": plots.render_year,
    "arabicnlp-wanlp-year": plots.render_arabicnlp_wanlp_year,
    "dialect": plots.render_dialect,
    "domain": plots.render_domain,
    "machine-generated": plots.render_machine_generated,
}


def build_specs(datasets):
    specs = []
    for name in PLOT_NAMES:
        title, payload, opts = STATS_FUNCS[name](datasets)
        if name == "year":
            labels = [str(r[0]) for r in payload]
            data = [r[1] for r in payload]
            specs.append({
                "id": name,
                "title": f"{title} (n={len(datasets)})",
                "type": "bar",
                "labels": labels,
                "datasets": [{"label": "datasets", "data": data}],
            })
        elif name == "arabicnlp-wanlp-year":
            labels = [str(r[0]) for r in payload]
            wanlp = [r[1] for r in payload]
            arabicnlp = [r[2] for r in payload]
            specs.append({
                "id": name,
                "title": title,
                "type": "stacked-bar",
                "labels": labels,
                "datasets": [
                    {"label": "WANLP", "data": wanlp},
                    {"label": "ArabicNLP", "data": arabicnlp},
                ],
            })
        elif name == "machine-generated":
            labels = [r[0] for r in payload]
            data = [r[1] for r in payload]
            specs.append({
                "id": name,
                "title": title,
                "type": "pie",
                "labels": labels,
                "datasets": [{"label": "datasets", "data": data}],
            })
        else:
            order = opts.get("order")
            top = opts.get("top")
            if order:
                items = [(label, payload[label]) for label in order if payload.get(label, 0)]
                for label, count in payload.items():
                    if label not in order and count:
                        items.append((label, count))
            else:
                items = payload.most_common(top)
            labels = [str(r[0]) for r in items]
            data = [r[1] for r in items]
            horizontal = opts.get("orientation") == "horizontal"
            specs.append({
                "id": name,
                "title": f"{title} (n={len(datasets)})",
                "type": "horizontal-bar" if horizontal else "bar",
                "labels": labels,
                "datasets": [{"label": "datasets", "data": data}],
            })
    return specs


PAGE_TPL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Masader — Dataset Plots</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  :root {
    --bg: #0f1115;
    --card: #171a21;
    --card-2: #1e222b;
    --border: #2a2f3a;
    --text: #e6e9ef;
    --muted: #8b94a6;
    --accent: #6ea8fe;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  header {
    padding: 28px 32px 16px;
    border-bottom: 1px solid var(--border);
  }
  header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 600; }
  header p { margin: 0; color: var(--muted); font-size: 14px; }
  main {
    padding: 24px 32px 60px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 20px;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
  .card h2 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
  .card-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .toggle {
    background: var(--card-2);
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
  }
  .toggle:hover { color: var(--text); border-color: var(--accent); }
  .viz { position: relative; height: 280px; margin-top: 10px; }
  .table-wrap {
    max-height: 280px;
    overflow: auto;
    margin-top: 10px;
    display: none;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid var(--border); }
  th { color: var(--muted); font-weight: 600; position: sticky; top: 0; background: var(--card); }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  footer { padding: 20px 32px; color: var(--muted); font-size: 12px; text-align: center; }
</style>
</head>
<body>
<header>
  <h1>Masader — Dataset Plots</h1>
  <p>Generated <span id="gen"></span> from <span id="n"></span> datasets.</p>
</header>
<main id="grid"></main>
<footer>Generated by <code>web_plots.py</code> &middot; Charts by Chart.js</footer>

<script>
const SPECS = __SPECS__;
const N = __N__;
const GEN = "__GEN__";

document.getElementById("n").textContent = N;
document.getElementById("gen").textContent = GEN;

const PALETTE = [
  "#6ea8fe", "#f97583", "#56d364", "#fbbf24", "#a78bfa",
  "#22d3ee", "#fb7185", "#34d399", "#f59e0b", "#818cf8",
  "#2dd4bf", "#f472b6"
];

function colorFor(i) { return PALETTE[i % PALETTE.length]; }

function makeChart(ctx, spec) {
  const labels = spec.labels;
  const isHorizontal = spec.type === "horizontal-bar";
  const isPie = spec.type === "pie";
  const stacked = spec.type === "stacked-bar";
  const datasets = spec.datasets.map((ds, i) => {
    const color = isPie
      ? labels.map((_, j) => colorFor(j))
      : colorFor(i);
    return {
      label: ds.label,
      data: ds.data,
      backgroundColor: color,
      borderColor: color,
      borderWidth: isPie ? 1 : 0,
      borderRadius: isPie ? 0 : 4,
    };
  });
  return new Chart(ctx, {
    type: isPie ? "doughnut" : "bar",
    data: { labels, datasets },
    options: {
      indexAxis: isHorizontal ? "y" : "x",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: isPie || stacked,
          position: "bottom",
          labels: { color: "#e6e9ef", boxWidth: 12, font: { size: 11 } }
        },
        tooltip: { bodyFont: { size: 12 }, titleFont: { size: 12 } }
      },
      scales: isPie ? {} : {
        x: {
          stacked: stacked,
          ticks: { color: "#8b94a6", autoSkip: true, maxRotation: isHorizontal ? 0 : 45 }
        },
        y: {
          stacked: stacked,
          beginAtZero: true,
          ticks: { color: "#8b94a6" }
        }
      }
    }
  });
}

function tableFor(spec) {
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const tbl = document.createElement("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = "<th>category</th>" +
    (spec.datasets.length > 1
      ? spec.datasets.map(d => "<th>" + d.label + "</th>").join("")
      : "<th>count</th>") +
    "<th>pct</th>";
  thead.appendChild(headRow);
  tbl.appendChild(thead);
  const tbody = document.createElement("tbody");
  const totals = spec.datasets.map(d => d.data.reduce((a, b) => a + b, 0));
  const grand = totals.reduce((a, b) => a + b, 0);
  spec.labels.forEach((label, i) => {
    const tr = document.createElement("tr");
    let cells = "<td>" + label + "</td>";
    spec.datasets.forEach((d) => {
      cells += '<td class="num">' + d.data[i] + "</td>";
    });
    const rowSum = spec.datasets.reduce((s, d) => s + (d.data[i] || 0), 0);
    const pct = grand ? (rowSum / grand * 100).toFixed(1) : "0.0";
    cells += '<td class="num">' + pct + "%</td>";
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  });
  const tfoot = document.createElement("tfoot");
  const footRow = document.createElement("tr");
  let footCells = "<td><strong>total</strong></td>";
  spec.datasets.forEach((d, di) => {
    footCells += '<td class="num"><strong>' + totals[di] + "</strong></td>";
  });
  footCells += '<td class="num"><strong>100.0%</strong></td>';
  footRow.innerHTML = footCells;
  tfoot.appendChild(footRow);
  tbl.appendChild(tbody);
  tbl.appendChild(tfoot);
  wrap.appendChild(tbl);
  return wrap;
}

const grid = document.getElementById("grid");
SPECS.forEach((spec, idx) => {
  const card = document.createElement("div");
  card.className = "card";
  const bar = document.createElement("div");
  bar.className = "card-bar";
  bar.innerHTML = '<h2>' + spec.title + '</h2><span class="toggle" data-idx="' + idx + '">table</span>';
  const viz = document.createElement("div");
  viz.className = "viz";
  const canvas = document.createElement("canvas");
  viz.appendChild(canvas);
  const tblWrap = tableFor(spec);
  card.appendChild(bar);
  card.appendChild(viz);
  card.appendChild(tblWrap);
  grid.appendChild(card);
  makeChart(canvas.getContext("2d"), spec);
  bar.querySelector(".toggle").addEventListener("click", function (e) {
    const showTable = tblWrap.style.display === "block";
    if (showTable) {
      tblWrap.style.display = "none";
      viz.style.display = "block";
      e.target.textContent = "table";
    } else {
      tblWrap.style.display = "block";
      viz.style.display = "none";
      e.target.textContent = "chart";
    }
  });
});
</script>
</body>
</html>
"""


def generate(datasets, output):
    specs = build_specs(datasets)
    html = (
        PAGE_TPL
        .replace("__SPECS__", json.dumps(specs, ensure_ascii=False))
        .replace("__N__", str(len(datasets)))
        .replace("__GEN__", datetime.now().strftime("%Y-%m-%d %H:%M"))
    )
    Path(output).write_text(html, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default=str(ROOT / "index.html"), help="output HTML path")
    args = parser.parse_args()
    datasets = plots.load_datasets()
    generate(datasets, args.output)
    print(f"Wrote {args.output} ({len(datasets)} datasets, {len(PLOT_NAMES)} charts)")


if __name__ == "__main__":
    main()
