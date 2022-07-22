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
    SO: "Somalia",

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

function createDialectVolumePieChart(groupData, canvas) {
  let countriesDataset = {};
  for (const c in groupData)
    countriesDataset[c] = groupData[c].length

  const mappingVolumes = Object.keys(countriesDataset).map((key) => {
        return `${countryCodeMapper(key)} (${key})`
        }
    );
  const data = {
    labels: mappingVolumes,
    datasets: [
      {
        data: Object.values(countriesDataset),
        backgroundColor: palette('tol-dv', Object.values(countriesDataset).length).map((hex) => {
          return '#' + hex;
        }),
      },
    ],
  };

  const config = {
    type: "doughnut",
    data: data,
    options: {
      resposive: true,
      plugins: {
        title: {
          display: true,
          text: "Volumes for each dialect",
        },
        labels: {
            render: 'label',
        },
        legend: {
          display: false
        },  
      },
    },
  };

  new Chart(canvas, config);
}
