
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

function createMap(dialectedEntries, headers) {
  $("#myChart").hide();
  $("#chartdiv").show();
  
  const map = new BaseMap();
  map.setEffectReference(populateTable);
  map.setEffectArgs(headers);
  map.populateData(dialectedEntries, populateTable, headers);


}
