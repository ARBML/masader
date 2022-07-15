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
          groupName: "Iraq",
          countries: ["IQ"]
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
          groupName: "North Africa",
          countries: ["DZ", "MR", "MA", "LY", "TN"]
        },
        {
          groupName: "Horn of Africa",
          countries: ["SO", "DJ"]
        },
      ];
  
    let formattedEntries = [];
  
    for (d of groups) {

      let countries = []
    
      for (const entry of d.countries)
        countries.push({
            country: entry,
            dataset: dialectedEntries[entry]
        });
      

      formattedEntries.push ({
        regionName: d.groupName,
        countries: countries,
        dataset: getGroupedDataset(dialectedEntries, d.countries)
      });
    }
  
    return formattedEntries;
  }

  function countryCodeMapper(code) {

    const map = {
      SA: "Saudi Arabia",
      QA: "Qatar",
      AE: "United Arab Emirates",
      KW: "Kuwait",
      OM: "Oman",
      BH: "Bahrain",
      SY: "Syria",
      LB: "Lebanon",
      JO: "Jordan",
      PS: "Palastine",
      DZ: "Algeria",
      MR: "Morooco",
      MA: "Mauritania", 
      LY: "Libya",
      TN: "Tunisia",
      DJ: "Djibouti",
      SO: "Somalia"
    }

    return map[code];

  }