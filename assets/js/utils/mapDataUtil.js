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

function singleDialect(dialectedEntries) {

  let formattedEntries = {};

  for (d in dialectedEntries) {
    formattedEntries[Object.keys(formattedEntries).length] = {
      countryCodes: [d],
      dataset: dialectedEntries[d]
    };
  }

  return formattedEntries;
}


function getGroupedDataset(dialectedEntries, group) {
  let groupedDataset = new Set();

  for (country of group)
    dialectedEntries[country].forEach((e) => groupedDataset.add(e));

  return [...groupedDataset]
}

function groupedDialect(dialectedEntries) {

  const groups = [["SA", "QA", "AE", "KW", "OM", "BH"], ["YE"], ["SY", "LB", "JO", "PS"], ["EG"], ["SD"], ["SO", "DJ"], ["DZ", "MR", "MA"], ["LY", "TN"], ["IQ"]];
  let formattedEntries = {};

  for (d of groups) {
    formattedEntries[Object.keys(formattedEntries).length] = {
      countryCodes: d,
      dataset: getGroupedDataset(dialectedEntries, d)
    };
  }

  return formattedEntries;
}