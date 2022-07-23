const groupsOnly = ["LEV", "NOR", "GLF", "MSA", "CLS"];

const groupsDetails = {
    GLF: ["SA", "QA", "AE", "KW", "OM", "BH", "GLF"],
    YE: ["YE"],
    LEV: ["SY", "LB", "JO", "PS", "LEV"],
    EG: ["EG"],
    SD: ["SD"],
    IQ: ["IQ"],
    HOF: ["SO", "DJ"],
    NOR: ["DZ", "MR", "MA", "LY", "TN", "NOR"],
    MSA: ["MSA"],
    CLS: ["CLS"]
};

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
      MA: "Morooco",
      MR: "Mauritania",
      LY: "Libya",
      TN: "Tunisia",
      DJ: "Djibouti",
      SO: "Somalia",
      HOF: "Horn of Africa",
      LEV: "Levant",
      EG: "Egypt",
      GLF: "Gulf",
      MSA: "Modern Standard Arabic",
      CLS: "Classic",
      NOR: "North Africa",
      IQ: "Iraq",
      SD: "Sudan",
      YE: "Yeman",
    };
    return map[code];
}

function getGroupedDataset(dialectedEntries, group) {
    let groupedDataset = new Set();
  
    for (country of group)
      dialectedEntries[country].forEach((e) => groupedDataset.add(e));

    return [...groupedDataset]
  }

function getCountriesSubset(groupedData) {
    countries = {};
    for (c in groupedData)
        if (!groupsOnly.includes(c))
            countries[c] = groupedData[c]

    return countries;
}

function getDialectsSubset(groupedData) {
    dialects = {};
    for (c in groupsDetails)
        dialects[c] = getGroupedDataset(groupedData, groupsDetails[c])

    return dialects;
}