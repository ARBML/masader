var url = "https://masader-web-service.herokuapp.com/datasets";
var urlEmbClus =
  "https://masader-web-service.herokuapp.com/datasets?features=Cluster,Embeddings";

function reformat_numbers(num) {
  if (num === undefined) return "";
  values = num.split(",");
  if (values.length < 2) {
    return num;
  } else if (values.length == 2) {
    return values[0] + "K";
  } else return values[0] + "M";
}

function reformat_dialect(dialect) {
  if (dialect.trim() != "mixed") {
    dialect = dialect.split("(")[2].split(")")[0];
  }

  return dialect;
}

function reformat_tasks(tasks) {
  let out_html = "";

  tasks = tasks.split(",");
  for (let j = 0; j < tasks.length; j += 1) {
    out_html += tasks[j] + "</br>";
  }

  return out_html;
}

function createHtml(i) {
  let div = '<div style="font-family: Cairo, "Open Sans"> ';
  let table = '<table style="border-collapse: collapse; border: none;">';
  let html_out = div + table;
  let list_to_show = ["Name", "Year", "Dialect", "Volume", "Tasks"];
  for (let j = 0; j < list_to_show.length; j += 1) {
    let index_to_header = headersWhiteList.indexOf(list_to_show[j]);
    let header = headersWhiteList[index_to_header];
    let value = " " + dataset[i][index_to_header];
    html_out += '<tr style="border: none;">';
    html_out += '<td style="border: none;">';
    html_out += "<b>" + header + "</b>";
    html_out += "</td>";
    html_out += '<td style="border: none;">';

    if (header == "Volume") {
      html_out +=
        reformat_numbers(value) + " " + dataset[i][index_to_header + 1];
    } else if (header == "Name") {
      html_out += `<a href = "">${value}</a>`;
    } else if (header == "Dialect") {
      html_out += reformat_dialect(value);
    } else if (header == "Tasks") {
      html_out += reformat_tasks(value);
    } else {
      html_out += value;
    }

    html_out += "</td>";
    html_out += "</tr>";
  }

  return html_out + "</table>" + "</div>";
}

const reteriveClustersEmbeddings = async () => {
    return await axios.get(urlEmbClus).then(function (response) {
        info = { embeddings: [], clusters: [] };
        response.data.forEach((r) => {
            info.embeddings.push(r.Embeddings);
            info.clusters.push(r.Cluster);
        });
        return info;
    });
    return info;
};

axios
  .get(url)
  .then(async function (response) {
    let rowData = response.data;

    headersWhiteList = [
      "Name",
      "Link",
      "License",
      "Year",
      "Language",
      "Dialect",
      "Domain",
      "Form",
      "Volume",
      "Unit",
      "Ethical Risks",
      "Script",
      "Access",
      "Tasks",
      "Venue Type",
    ];
    $(".loading-spinner").hide();

    // Grabbing row's values
    dataset = [];
    for (let i = 0; i < rowData.length; i++) {
      record = {};
      for (let j = 0; j < headersWhiteList.length; j++)
        record[j] = rowData[i][headersWhiteList[j]];

      dataset.push(record);
    }

    const info = await reteriveClustersEmbeddings();
    var embeddings = info.embeddings;
    var clusters = info.clusters;

    let box = document.querySelector(".box");
    const width = box.offsetWidth;
    const height = 500;

    var svg = d3.select("svg");
    var dimension = document.body.getBoundingClientRect();

    var tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("z-index", "10")
      .style("visibility", "hidden");
    var data = d3.range(0, embeddings.length).map(function (d) {
      return {
        x: embeddings[d][1],
        y: embeddings[d][0],
      };
    });

    let xs = [...data].map((d) => d.x);
    let ys = [...data].map((d) => d.y);
    let xma = Math.ceil(Math.max(0, ...xs) + 5);
    let xmi = Math.ceil(Math.min(0, ...xs) - 5);
    let yma = Math.ceil(Math.max(0, ...ys) + 5);
    let ymi = Math.ceil(Math.min(0, ...ys) - 5);

    var x = d3.scaleLinear().domain([xmi, xma]).range([0, width]);

    // Add Y axis
    var y = d3.scaleLinear().domain([ymi, yma]).range([height, 0]);

    var zoom = d3
      .zoom()
      .scaleExtent([0.5, 10]) // This control how much you can unzoom (x0.5) and zoom (x20)
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", updateChart);

    var svg = d3
      .select("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "white")
      .attr("style", "outline: thin solid gray;")
      .call(zoom); // Adds zoom functionality

    var canvas = svg.append("g").attr("class", "zoomable");

    function updateChart() {
      if (canvas) {
        canvas.attr("transform", d3.event.transform);
        // recover the new scale
        var newX = d3.event.transform.rescaleX(x);
        var newY = d3.event.transform.rescaleY(y);

        // update circle position
        canvas
          .selectAll("circle")
          .attr("cx", function (d) {
            return newX(d.x);
          })
          .attr("cy", function (d) {
            return newY(d.y);
          });
      }
    }

    canvas
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", function (_, i, n) {
        let vol_index = headersWhiteList.indexOf("Volume");
        try {
          let volume = parseInt(dataset[i][vol_index].replaceAll(",", ""))+1;
          if (isNaN(volume)) {
            return 10;
          } else return Math.log(volume);
        } catch (err) {
          return 10;
        }
      })
      .attr("opacity", 0.8)
      .attr("cx", function (d) {
        return x(d.x);
      })
      .attr("cy", function (d) {
        return y(d.y);
      })
      .style("fill", function (_, i, n) {
        const index = clusters[i];
        return d3.schemeCategory20[index];
      })
      .on("mouseover", function (_, i, n) {
        tooltip = tooltip.html(createHtml(i));
        d3.select(this).style("stroke", "#eaeaea");
        d3.select(this).style("stroke-width", "5");
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function () {
        return tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).style("stroke", "white");
        d3.select(this).style("stroke-width", "0");
        return tooltip.style("visibility", "hidden");
      })
      .on("click", function (_, i, n) {
        let url = "card.html?" + i;
        window.open(url, "_blank").focus();
      });
  })
  .catch(function (error) {
    console.log(error);
  });
