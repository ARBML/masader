// TODO: Map country codes to country names for chart labels.
// function countryCodeMapper(code) {
//   const map = {
//     SA: "Saudi Arabia",
//     QA: "Qatar",
//     AE: "United Arab Emirates",
//     KW: "Kuwait",
//     OM: "Oman",
//     BH: "Bahrain",
//     SY: "Syria",
//     LB: "Lebanon",
//     JO: "Jordan",
//     PS: "Palastine",
//     DZ: "Algeria",
//     MR: "Morooco",
//     MA: "Mauritania",
//     LY: "Libya",
//     TN: "Tunisia",
//     DJ: "Djibouti",
//     SO: "Somalia",
//   };

//   return map[code];
// }

function createDialectVolumePieChart(groupData) {
  let volumes = {};
  for (const c in groupData) {
    let sum = 0;
    groupData[c].forEach((e) => {
      sum += parseInt(e.Volume.replaceAll(",", ""));
    });
    volumes[c] = sum;
    //{"AE": 1234, "SO":123} country:volume object
  }

  var canvas = document.getElementById("myChart");

  const data = {
    labels: Object.keys(volumes),
    datasets: [
      {
        label: "dataset1",
        data: Object.values(volumes),
	// TODO: Assign array to backgroundColor for each slice's color
	backgroundColor: 'red'
      },
    ],
  };

  const config = {
    type: "pie",
    data: data,
    options: {
      resposive: true,
      plugins: {
        autocolors: {
          mode: "data",
        },
        title: {
          display: true,
          text: "Volumes of cool countries",
        },
      },
    },
  };

  if (document.getElementById("chartdiv").children.length === 0) {
    if (myChart != null) {
      // Remove chart if exists
      myChart.destroy();
    }

    new Chart(canvas, config);
    $("#myChart").show();
  }
}
