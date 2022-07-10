
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

function populateTable(dataset, headers) {
  $("#table").show();

  dataset = transformDataToTableEntry(dataset);

  $("#table").DataTable({
    data: dataset,
    columns: headers,
    lengthMenu: [
      [10, 100, 200, 300, 400, -1],
      [10, 100, 200, 300, 400, "All"],
    ],
    scrollCollapse: true,
    paging: true,
    pagingType: "numbers",
    bInfo: false,
    bDestroy: true,
    createdRow: function (row, data, dataIndex) {
      $("td:eq(9)", row).css("min-width", "200px");
    },
  });
}

function singleDialect(dialectedEntries){

  let formattedEntries = {};

  for (d in dialectedEntries){
    formattedEntries[Object.keys(formattedEntries).length] = {
        countryCodes: [d],
        dataset: dialectedEntries[d]
      };
  }

  return formattedEntries;
}


function getGroupedDataset(dialectedEntries, group){
    let groupedDataset = new Set();

    for (country of group)
      dialectedEntries[country].forEach((e) => groupedDataset.add(e));

    return [...groupedDataset]
}

function groupedDialect(dialectedEntries){

  const groups = [["SA", "QA", "AE", "KW", "OM", "BH"], ["YE"],["SY", "LB", "JO", "PS"],["EG"], ["SD"], ["SO", "DJ"], ["DZ","MR", "MA"], ["LY","TN"], ["IQ"]];
  let formattedEntries = {};

  for (d of groups){
    formattedEntries[Object.keys(formattedEntries).length] = {
        countryCodes: d,
        dataset: getGroupedDataset(dialectedEntries, d)
      };
  }

  return formattedEntries;
}


function createMap(dialectedEntries, headers) {
  $("#myChart").hide();
  $("#chartdiv").show();
  $("#MapHint").show();

  const map = new BaseMap();
  map.setEffectReference(populateTable);
  map.setEffectArgs(headers);
  map.populateData(groupedDialect(dialectedEntries), populateTable, headers);


}
