function transformDataToTableEntry(dataset, headers){

  let formateedDataset = []
  let idx = 0;

  for (const e of dataset){
    let entry = {}

    entry[0] = idx++;

    for (const e2 of headers)
      entry[Object.keys(entry).length] = e[e2['title']];
    

    formateedDataset.push(entry);

  }

  return formateedDataset;

}

function populateTable(dataset, headers){
    $("#table").show();

    dataset = transformDataToTableEntry(dataset, headers);

    headers = [
      {
        index: 0,
        title: 'No.'
      }
      ].concat(headers);


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
