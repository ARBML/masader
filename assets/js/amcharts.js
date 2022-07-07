
function transformDataToTableEntry(dataset, headers){

  let formateedDataset = []
  let idx = 0;

  for (const row of dataset){

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
        5: row["Volume"] != "nan"  ? row["Volume"] : "",
        6: row["Unit"] != "nan" ? row["Unit"] : "",
        7: linkuize(row["Paper Title"], row["Paper Link"]),
        8: badgeRender(row["Access"]),
        9: itemize(row["Tasks"]),
      });

  }

  return formateedDataset;

}

function populateTable(dataset, headers){
    $("#table").show();

    dataset = transformDataToTableEntry(dataset, headers);

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

function createMap(groupData, dialectedEntries, headers) {
  $("#myChart").hide();
  $("#chartdiv").show();

  // Create root and chart
  var root = am5.Root.new("chartdiv");


    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);


    // Create chart
    var chart = root.container.children.push(am5map.MapChart.new(root, {
      homeZoomLevel: 4,
      homeGeoPoint: { longitude: 20, latitude: 20 }
    }));


  // Create world polygon series
  var worldSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"],
    })
  );

  worldSeries.mapPolygons.template.setAll({
    fill: am5.color(0xaaaaaa),
  });

  worldSeries.events.on("datavalidated", () => {
    chart.goHome();
  });


  // Add legend
  var legend = chart.children.push(
    am5.Legend.new(root, {
      useDefaultMarker: true,
      centerX: am5.p50,
      x: am5.p50,
      centerY: am5.p100,
      y: am5.p100,
      dy: -20,
      background: am5.RoundedRectangle.new(root, {
        fill: am5.color(0xffffff),
        fillOpacity: 0.2,
      }),
    })
  );

  legend.valueLabels.template.set("forceHidden", true);

  // Create series for each group
  var colors = am5.ColorSet.new(root, {
    step: 2,
  });
  colors.next();

  am5.array.each(groupData, function (group) {
    var countries = [];
    var color = colors.next();

    am5.array.each(group.data, function (country) {
      countries.push(country.id);
    });

    var polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        include: countries,
        name: group.name,
        fill: color,
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "[bold]{name}[/]\n Number of resources {joined}",
      interactive: true,
      fill: color,
      strokeWidth: 2,
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.Color.brighten(color, -0.3),
    });

    polygonSeries.mapPolygons.template.events.on("pointerover", function (ev) {
      ev.target.series.mapPolygons.each(function (polygon) {
        polygon.states.applyAnimate("hover");
      });

      populateTable(dialectedEntries[ev.target._dataItem.dataContext.id], headers);

    });

    polygonSeries.mapPolygons.template.events.on("pointerout", function (ev) {
      ev.target.series.mapPolygons.each(function (polygon) {
        polygon.states.applyAnimate("default");
      });
    });
    polygonSeries.data.setAll(group.data);

    legend.data.push(polygonSeries);
  });
}
