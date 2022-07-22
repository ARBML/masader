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
      if (e.Volume != 'nan')
        sum += parseInt(e.Volume.replaceAll(",", ""));
    });
    volumes[c] = Math.log(sum);
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
          "#4aab80",
          "#6d0343",
          "#281e8d",
          "#7b5683",
          "#badbad",
          "#c099c0",
          "#c0c099",
          "#00c0de",
          "#336655",
          "#a9da80",
          "#9680da",
          "#da80d0",
          "#c13b7c",
          "#e5510e",
          "#c98c29",
          "#585457",
          "#aca2ab",
          "#643f50",
          "#412b61",
          "#284f64",
          "#267ba9",
          "#42a9e1",
        ],
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
          text: "Volumes for each dialect (LOG)",
        },
          labels: {
            render: 'label',
            fontColor: 'white',
          }
        
      },
    },
  };

  new Chart(canvas, config);
}
