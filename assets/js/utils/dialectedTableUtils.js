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

      let countries = []
    
      for (const entry of d.countries)
        countries.push({
            Country: entry,
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