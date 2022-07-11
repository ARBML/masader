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

  let formattedEntries = [];

  for (d in dialectedEntries) {
    formattedEntries.push({

      regionName: undefined,
      countries: [d],
      dataset: dialectedEntries[d],
    }

    );
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

  const groups = [
      {
        groupName: "Gulf",
        countries: ["SA", "QA", "AE", "KW", "OM", "BH"]
      },
      {
        groupName: "Yeman",
        countries: ["YE"],
      },
      {
        groupName: "Levant",
        countries: ["SY", "LB", "JO", "PS"]
      },
      {
        groupName: "Egypt",
        countries: ["EG"]
      },
      {
        groupName: "Sudan",
        countries: ["SD"]
      },
      {
        groupName: "Iraq",
        countries: ["IQ"]
      },
      {
        groupName: "Horn of Africa",
        countries: ["SO", "DJ"]
      },
      {
        groupName: "North Africa",
        countries: ["DZ", "MR", "MA", "LY", "TN"]
      },
    ];

  let formattedEntries = [];

  for (d of groups) {
    formattedEntries.push ({
      regionName: d.groupName,
      countries: d.countries,
      dataset: getGroupedDataset(dialectedEntries, d.countries)
    });
  }

  return formattedEntries;
}