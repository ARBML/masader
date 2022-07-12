/**
 * This method populate the table of that contains the datasets
 * @param {*} dataset The dataset to be viewd on the table
 * @param {*} headers The headers of the table
 */
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

/**
 * This method transform the dialected enteries into a format that is accepted by the map.
 * This method only works for single-dialected view
 * @param {*} dialectedEntries the dialected enteries 
 * @returns A formatted version of dialected enteries
 */
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

/**
 * This method return the dataset of an entire groups without duplications
 * @param {*} dialectedEntries the dialected entries
 * @param {*} group the group of countries
 * @returns 
 */
function getGroupedDataset(dialectedEntries, group) {
  let groupedDataset = new Set();

  for (country of group)
    dialectedEntries[country].forEach((e) => groupedDataset.add(e));

  return [...groupedDataset]
}

/**
 * This method transform the dialected enteries into a format that is accepted by the map.
 * This method only works for grouped-dialected view
 * @param {*} dialectedEntries the dialected enteries 
 * @returns A formatted version of dialected enteries
 */
function groupedDialect(dialectedEntries) {

  const groups = [
      {
        groupName: "Gulf",
        countries: ["SA", "QA", "AE", "KW", "OM", "BH", "GLF"]
      },
      {
        groupName: "Yeman",
        countries: ["YE"],
      },
      {
        groupName: "Levant",
        countries: ["SY", "LB", "JO", "PS", "LEV"]
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
        countries: ["DZ", "MR", "MA", "LY", "TN", "NOR"]
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