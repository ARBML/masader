function linkuize(text, link) {
  if (link != undefined || link != "nan")
    return `<a href = "${link}" target="_blank"> ${text}</a>`
  else
    return ""
}

function itemize(text) {
  tasks = text.split(",")
  output = '<ul class="list-group list-group-flush bg-transparent">'
  for (let i = 0; i < tasks.length; i++) {
    output += '<li class="list-group-item bg-transparent">' + tasks[i].trim().replaceAll(' ', '-') + '</li>'
  }
  output += "</ul>"
  return output
}

function badgeRender(text) {
  text = text.toString().toLowerCase();
  if (text.toLowerCase() == "free") return '<span class="badge bg-success">Free</span>'
  else if (text == "upon-request") return '<span class="badge bg-info">Free Upon Request</span>'
  else return '<span class="badge bg-danger">Paid</span>'
}

function getCountry(text) {
  text = text.split("(");
  text = text[text.length - 1].split(")")[0];
  if (text == "Modern Standard Arabic") {
    return "MSA";
  }
  return text;
}

function getIcon(text) {
  const lower = text.toLowerCase()
  if (icons[lower] != undefined || icons[lower] != "nan") {
    return icons[lower];
  } else {
    return text;
  }
}

function transformDataToTableEntry(dataset) {

  let formateedDataset = []
  let idx = 0;

  for (const row of dataset) {

    let link_host = linkuize(row["Host"], row["Link"]);
    if (row["HF Link"] != "nan") {
      link_host += "</br>" + linkuize(getIcon("hf"), row["HF Link"]);
    }

    formateedDataset.push({
      0: ++idx,
      1: linkuize(row["Name"], `card?id=${row["index"]}`),
      2: link_host,
      3: row["Year"],
      4: getCountry(row["Dialect"] != "nan" ? row["Dialect"] : ""),
      5: row["Volume"] != "nan" ? row["Volume"] : "",
      6: row["Unit"] != "nan" ? row["Unit"] : "",
      7: linkuize(row["Paper Title"], row["Paper Link"]),
      8: badgeRender(row["Access"]),
      9: itemize(row["Tasks"]),
    });

  }

  return formateedDataset;

}
