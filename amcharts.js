
function createMap(groupData){
    $("#myChart").hide();
    $("#chartdiv").show();

    am5.ready(function() {
      
    
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
    var worldSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"]
    }));
    
    worldSeries.mapPolygons.template.setAll({
      fill: am5.color(0xaaaaaa)
    });
    
    worldSeries.events.on("datavalidated", () => {
      chart.goHome();
    });
    
    
    // Add legend
    var legend = chart.children.push(am5.Legend.new(root, {
      useDefaultMarker: true,
      centerX: am5.p50,
      x: am5.p50,
      centerY: am5.p100,
      y: am5.p100,
      dy: -20,
      background: am5.RoundedRectangle.new(root, {
        fill: am5.color(0xffffff),
        fillOpacity: 0.2
      })
    }));
    
    legend.valueLabels.template.set("forceHidden", true)
    
    
    // Create series for each group
    var colors = am5.ColorSet.new(root, {
      step: 2
    });
    colors.next();
    
    am5.array.each(groupData, function(group) {
      var countries = [];
      var color = colors.next();
    
      am5.array.each(group.data, function(country) {
        countries.push(country.id)
      });
    
      var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        include: countries,
        name: group.name,
        fill: color
      }));
    
    
      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "[bold]{name}[/]\n num resources {joined}",
        interactive: true,
        fill: color,
        strokeWidth: 2
      });
    
      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.Color.brighten(color, -0.3)
      });
    
      polygonSeries.mapPolygons.template.events.on("pointerover", function(ev) {
        ev.target.series.mapPolygons.each(function(polygon) {
          polygon.states.applyAnimate("hover");
        });
      });
    
      polygonSeries.mapPolygons.template.events.on("pointerout", function(ev) {
        ev.target.series.mapPolygons.each(function(polygon) {
          polygon.states.applyAnimate("default");
        });
      });
      polygonSeries.data.setAll(group.data);
    
      legend.data.push(polygonSeries);
    });
    
    }); 
}