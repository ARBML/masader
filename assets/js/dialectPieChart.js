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
  let volumes = {};
  for (const c in groupData) {
    let sum = 0;
    groupData[c].forEach((e) => {
      sum += parseInt(e.Volume.replaceAll(",", ""));
    });
    volumes[c] = sum;
  }

  const mappingVolumes = Object.keys(volumes).map((key) => {
        return `${countryCodeMapper(key)} (${key})`
        }
    );
  const data = {
    labels: mappingVolumes,
    datasets: [
      {
        data: Object.values(volumes),
        backgroundColor: [
          "#3C53A1D9",
          "#C7E8FCD9",
          "#9ED2F4D9",
          "#F8CC89D9",
          "#AA1C3BD9",
        ],
      },
    ],
  };

  const config = {
    type: "pie",
    data: data,
    options: {
      resposive: true,
      plugins: {
        title: {
          display: true,
          text: "Volumes for each dialect",
        },
      },
    },
  };
    
  new Chart(canvas, config);
}
