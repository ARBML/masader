/**
 * 创建方言数量分布的饼图
 * @param {Object.<string, Array>} groupData - 按方言分组的数据对象，键为方言代码，值为对应数据数组
 * @param {HTMLCanvasElement} canvas - 用于绘制饼图的canvas元素
 */
function createDialectVolumePieChart(groupData, canvas) {
  let countriesDataset = {};
  let sum = 0;
  for (const c in groupData)
    sum += groupData[c].length

  for (const c in groupData)
    countriesDataset[c] = groupData[c].length/sum*100;
  

  const mappingVolumes = Object.keys(countriesDataset).map((key) => {
        return `${countryCodeMapper(key)}`
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
        rotation: -35,
        radius:  "80%", 
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
          text: "Datasets for each dialect",
        },
        labels: {
            render: 'label',
            fontColor: '#004242',
            fontStyle: 'bold',
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
              label: (context) =>`${context.label}: ${(context.parsed).toFixed(2)}%`,
          }
        }
      },
    },
  };

  new Chart(canvas, config);
}
