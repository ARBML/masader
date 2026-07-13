var url = window.MasaderConfig.DATASETS_URL;
var urlEmbClus = window.MasaderConfig.DATASETS_WITH_EMBEDDINGS_URL;

function reformat_numbers(num) {
    if (num === undefined || num === null) return '';
    num = String(num);
    const values = num.split(',');
    if (values.length < 2) {
        return num;
    } else if (values.length == 2) {
        return values[0] + 'K';
    } else return values[0] + 'M';
}

function reformat_dialect(dialect) {
    dialect = String(dialect || '').trim();
    const parts = dialect.split('(');
    return parts.length > 2 ? parts[2].split(')')[0] : dialect;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;',
        }[character];
    });
}

function createHtml(record) {
    const tasks = String(record.Tasks || '')
        .split(',')
        .map((task) => task.trim())
        .filter(Boolean)
        .map((task) => `<span>${escapeHtml(task)}</span>`)
        .join('');
    const volume = [reformat_numbers(record.Volume), record.Unit]
        .filter(Boolean)
        .map(escapeHtml)
        .join(' ');

    return `
        <div class="cluster-tooltip__eyebrow">Dataset</div>
        <div class="cluster-tooltip__name">${escapeHtml(record.Name)}</div>
        <dl class="cluster-tooltip__facts">
            <div><dt>Published</dt><dd>${escapeHtml(
                record.Year || 'Unknown'
            )}</dd></div>
            <div><dt>Dialect</dt><dd>${escapeHtml(
                reformat_dialect(record.Dialect)
            )}</dd></div>
            <div><dt>Volume</dt><dd>${volume || 'Not specified'}</dd></div>
        </dl>
        ${
            tasks
                ? `<div class="cluster-tooltip__tasks"><div>Tasks</div><p>${tasks}</p></div>`
                : ''
        }
    `;
}

const reteriveClustersEmbeddings = async () => {
    return await axios.get(urlEmbClus).then(function (response) {
        const info = { embeddings: [], clusters: [] };
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

        const clusterHeaders = [
            'Name',
            'Link',
            'License',
            'Year',
            'Language',
            'Dialect',
            'Domain',
            'Form',
            'Volume',
            'Unit',
            'Script',
            'Access',
            'Tasks',
            'Venue Type',
        ];
        $('.loading-spinner').hide();

        // Grabbing row's values
        const clusterDataset = [];
        for (let i = 0; i < rowData.length; i++) {
            const record = {};
            for (let j = 0; j < clusterHeaders.length; j++)
                record[clusterHeaders[j]] = rowData[i][clusterHeaders[j]];

            clusterDataset.push(record);
        }

        const info = await reteriveClustersEmbeddings();
        var embeddings = info.embeddings;
        var clusters = info.clusters;

        let box = document.querySelector('.box');
        const width = box.offsetWidth;
        const height = 500;

        var tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'cluster-tooltip')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('pointer-events', 'none')
            .style('visibility', 'hidden');
        var data = d3
            .range(0, embeddings.length)
            .map(function (d) {
                const record = clusterDataset[d] || {};
                const volume =
                    parseInt(String(record.Volume ?? '').replaceAll(',', '')) +
                    1;

                return {
                    x: embeddings[d][1],
                    y: embeddings[d][0],
                    cluster: clusters[d],
                    index: d,
                    radius: isNaN(volume) ? 10 : Math.max(3, Math.log(volume)),
                    record: record,
                };
            })
            .sort((a, b) => b.radius - a.radius);

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
            .on('zoom', updateChart);

        var svg = d3
            .select('#cluster-plot')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'white')
            .attr('style', 'outline: thin solid gray;')
            .call(zoom); // Adds zoom functionality

        var canvas = svg.append('g').attr('class', 'zoomable');

        function updateChart() {
            if (canvas) {
                canvas.attr('transform', d3.event.transform);
            }
        }

        const circles = canvas
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('r', function (d) {
                return d.radius;
            })
            .attr('opacity', 0.8)
            .attr('cx', function (d) {
                return x(d.x);
            })
            .attr('cy', function (d) {
                return y(d.y);
            })
            .style('fill', function (d) {
                return d3.schemeCategory20[d.cluster];
            });

        const circleNodes = {};
        circles.each(function (d) {
            circleNodes[d.index] = this;
        });

        const voronoi = d3
            .voronoi()
            .x((d) => x(d.x))
            .y((d) => y(d.y))
            .extent([
                [0, 0],
                [width, height],
            ]);
        const hitAreas = voronoi
            .polygons(data)
            .filter((polygon) => polygon !== null);
        let activeCircle = null;

        function clearActiveCircle() {
            if (activeCircle) {
                activeCircle.style('stroke', 'white').style('stroke-width', 0);
                activeCircle = null;
            }
            tooltip.style('visibility', 'hidden');
        }

        function isPointerOnNode(d) {
            const pointer = d3.mouse(canvas.node());
            return (
                Math.hypot(pointer[0] - x(d.x), pointer[1] - y(d.y)) <= d.radius
            );
        }

        function updateHover(d) {
            if (!isPointerOnNode(d)) {
                clearActiveCircle();
                return;
            }

            const nextCircle = d3.select(circleNodes[d.index]);
            if (!activeCircle || activeCircle.node() !== nextCircle.node()) {
                clearActiveCircle();
                activeCircle = nextCircle;
                activeCircle
                    .style('stroke', '#eaeaea')
                    .style('stroke-width', 5);
                tooltip.html(createHtml(d.record));
            }

            const padding = 16;
            const tooltipNode = tooltip.node();
            const left = Math.min(
                d3.event.pageX + 10,
                window.scrollX +
                    window.innerWidth -
                    tooltipNode.offsetWidth -
                    padding
            );
            const top = Math.max(
                window.scrollY + padding,
                Math.min(
                    d3.event.pageY - 10,
                    window.scrollY +
                        window.innerHeight -
                        tooltipNode.offsetHeight -
                        padding
                )
            );

            tooltip
                .style('visibility', 'visible')
                .style('top', top + 'px')
                .style('left', left + 'px');
        }

        canvas
            .append('g')
            .attr('class', 'cluster-hit-areas')
            .selectAll('path')
            .data(hitAreas)
            .enter()
            .append('path')
            .attr('d', (polygon) => 'M' + polygon.join('L') + 'Z')
            .style('fill', 'transparent')
            .style('pointer-events', 'all')
            .on('mouseover', function (polygon) {
                updateHover(polygon.data);
            })
            .on('mousemove', function (polygon) {
                updateHover(polygon.data);
            })
            .on('mouseout', clearActiveCircle)
            .on('click', function (polygon) {
                const d = polygon.data;
                if (!isPointerOnNode(d)) return;

                let url = 'card.html?' + d.index;
                window.open(url, '_blank').focus();
            });
    })
    .catch(function (error) {
        console.log(error);
    });
