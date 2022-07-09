
class BaseMap {

    constructor() {


        this.focused = undefined;
        this.focusedColor = undefined;

        // Create root and chart
        this.root = am5.Root.new("chartdiv");


        // Set themes
        this.root.setThemes([
            am5themes_Animated.new(this.root)
        ]);


        // Create chart
        this.chart = this.root.container.children.push(
            am5map.MapChart.new(this.root, {
                homeZoomLevel: 4,
                homeGeoPoint: { longitude: 20, latitude: 20 }
            }
            ));


        // Create world polygon series
        var worldSeries = this.chart.series.push(
            am5map.MapPolygonSeries.new(this.root, {
                geoJSON: am5geodata_worldLow,
                exclude: ["AQ"],
                fill: am5.color(0xaaaaaa),
            })
        );

        worldSeries.events.on("datavalidated", () => {
            this.chart.goHome();
        });


        // Add legend
        var legend = this.chart.children.push(
            am5.Legend.new(this.root, {
                useDefaultMarker: true,
                centerX: am5.p50,
                x: am5.p50,
                centerY: am5.p100,
                y: am5.p100,
                dy: -20,
                background: am5.RoundedRectangle.new(this.root, {
                    fill: am5.color(0xffffff),
                    fillOpacity: 0.2,
                }),
            })
        );

        legend.valueLabels.template.set("forceHidden", true);


        // Create series for each group
        this.colors = am5.ColorSet.new(this.root, {
            step: 1,
        });
        this.colors.next();

    }

    setEffectReference(ref) {
        this.applyEffect = ref;
    }

    setEffectArgs(effectsArgs) {
        this.effectsArgs = effectsArgs
    }

    populateData(data) {

        for (const country in data){
    
            // Change it to whitelist
            if ([undefined, "GLF", "NOR", "CLS"].includes(country))
              continue
        
            var countrySeries = this.chart.series.push(
              am5map.MapPolygonSeries.new(this.root, {
                geoJSON: am5geodata_worldLow,
                include: country,
              })
            );

            const sColor = this.colors.next();
          
            this.addBaseEffects(countrySeries, sColor);

            countrySeries.mapPolygons.template.setAll({
              tooltipText: `[bold]{name}[/]\n Number of resources {count}[/]`,
              templateField: "polygonSettings",
              strokeWidth: 2,
            });

            countrySeries.data.setAll([
                {
                  id: country,
                  count: dialectedEntries[country].length,
                  polygonSettings: {
                    fill: sColor
                  },
                }
              ]);

        }
    }

    addBaseEffects(countrySeries, sColor) {

        // Effects

        countrySeries.mapPolygons.template.states.create("hover", {
            fill: am5.Color.brighten(sColor, -0.3),
        });

        countrySeries.mapPolygons.template.events.on("pointerover",  (ev) => {
            ev.target.series.mapPolygons.each( (polygon) => {
                console.log(polygon);
                polygon.states.applyAnimate("hover");
            });

            if (!this.focused)
                this.applyEffect(dialectedEntries[ev.target._dataItem.dataContext.id], this.effectsArgs);

        });

        countrySeries.mapPolygons.template.events.on("pointerout", function(ev) {
            ev.target.series.mapPolygons.each(function(polygon) {
              polygon.states.applyAnimate("default");
            });
          });

        countrySeries.mapPolygons.template.events.on("click", (ev) => {

            if (this.focused) {

                this.focused.states._states.default._settings.fill = this.focusedColor
                this.focused.set('fill', this.focusedColor)

                this.focused = undefined;
                this.focusedColor = undefined;

            } else {
                const pol = ev.target.series.mapPolygons._values[0];
                this.focusedColor = sColor;
                pol.states._states.default._settings.fill = am5.Color.brighten(sColor, -0.5)
                this.focused = pol;
            }

            this.applyEffect(dialectedEntries[ev.target._dataItem.dataContext.id], this.effectsArgs);

        });

    }

}