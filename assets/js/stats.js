var url = window.MasaderConfig.DATASETS_URL;

let headersWhiteList;
let dataset;
let myChart = null;
let dialectedEntries = {};

titles = {
    Host: 'Repositories used for hosting Arabic NLP datasets',
    Year: 'Number of datasets published every year',
    Access: 'Accessability of datasets',
    Tasks: 'Top 20 tasks in the published Arabic NLP datasets',
    Domain: 'Domains in Arabic NLP datasets',
    Source: 'Sources of Arabic NLP datasets',
    License: 'Linceses used in Arabic NLP datasets',
    Form: 'Text vs Spoken datasets',
    Dialects: 'Number of resources with respect of each country',
    // 'Dialects Groups': 'Distribution of the resources with respect of each Dialect',
    Venue: 'Venues used to publish NLP datasets',
    Provider: 'Top 10 providers of Arabic NLP datasets',
    Script: 'Scripts of writing Arabic NLP datasets',
};

function decodeDialect(dialect) {
    if (!dialect) return undefined;
    const dialectToCode = {
        'Modern Standard Arabic': 'MSA',
        'Classical Arabic': 'CLS',
        Egypt: 'EG',
        'Saudi Arabia': 'SA',
        'United Arab Emirates': 'AE',
        Qatar: 'QA',
        Kuwait: 'KW',
        Oman: 'OM',
        Bahrain: 'BH',
        Yemen: 'YE',
        Iraq: 'IQ',
        Syria: 'SY',
        Lebanon: 'LB',
        Jordan: 'JO',
        Palestine: 'PS',
        Sudan: 'SD',
        Tunisia: 'TN',
        Algeria: 'DZ',
        Morocco: 'MA',
        Mauritania: 'MR',
        Libya: 'LY',
        Somalia: 'SO',
        Djibouti: 'DJ',
        Levant: 'LEV',
        'North Africa': 'NOR',
        Gulf: 'GLF',
        mixed: 'mixed',
        Comoros: 'KM',
        'South Sudan': 'SS',
    };
    return dialectToCode[String(dialect).trim()];
}

function getSeries(data, idx, ignoreOther = true, subsetsIdx = -1) {
    let series = [];

    for (let index = 0; index < data.length; index++) {
        if (data[index][idx] === undefined) continue;

        if (
            headersWhiteList[idx] == 'Provider' &&
            ['', 'undefined', 'null'].includes(data[index][idx].trim())
        )
            continue;

        if (ignoreOther) {
            if (['other', 'unknown', ''].includes(data[index][idx])) continue;
        }

        if (
            headersWhiteList[idx] == 'Tasks' ||
            headersWhiteList[idx] == 'Domain' ||
            headersWhiteList[idx] == 'Source'
        ) {
            let tasks = data[index][idx].split(',');
            for (let index = 0; index < tasks.length; index++) {
                series.push(tasks[index].trim());
            }
        } else if (headersWhiteList[idx] == 'Provider') {
            const providers = new Set(
                data[index][idx]
                    .split(',')
                    .map((provider) => provider.trim())
                    .filter(Boolean)
            );
            series.push(...providers);
        } else if (headersWhiteList[idx] == 'Dialect') {
            let dialect =
                data[index][idx] != 'other'
                    ? decodeDialect(data[index][idx])
                    : 'other';

            // Subsets
            for (let subDialect of data[index][`${subsetsIdx}`]) {
                dialectCode = decodeDialect(subDialect['Dialect']);

                if (dialectCode) series.push(dialectCode.trim());
            }

            series.push(dialect.trim());
        } else {
            series.push(data[index][idx].trim());
        }
    }

    return series;
}

function groupedBar(canvas) {
    let datasets = [];
    let year_idx = headersWhiteList.indexOf('Year');
    let venue_idx = headersWhiteList.indexOf('Venue Type');

    let all_venue_types = Array.from(new Set(getSeries(dataset, venue_idx)));
    let all_years = Array.from(new Set(getSeries(dataset, year_idx))).sort();

    let color_theme = palette('tol-dv', all_venue_types.length).map(function (
        hex
    ) {
        return '#' + hex;
    });
    for (var i = 0; i < all_venue_types.length; i++) {
        series = [];
        let venue_name = all_venue_types[i];

        for (let index = 0; index < dataset.length; index++) {
            if (
                dataset[index][venue_idx] === undefined ||
                dataset[index][year_idx] === undefined
            )
                continue;
            if (dataset[index][venue_idx].trim() == venue_name) {
                series.push(dataset[index][year_idx].trim());
            }
        }

        const [elements, counts] = getCounts(series);

        let ex_counts = [];

        for (let index = 0; index < all_years.length; index++) {
            let year = all_years[index];
            let count_index = elements.indexOf(year);
            if (count_index > -1) ex_counts.push(counts[count_index]);
            else ex_counts.push(0);
        }

        let colors = [];

        for (let _ in ex_counts) {
            colors.push(color_theme[i]);
        }

        datasets.push({
            label: venue_name,
            data: ex_counts,
            backgroundColor: colors,
        });
    }
    const chartdata = {
        labels: all_years,
        datasets: datasets,
    };

    var config = {
        type: 'bar',
        data: chartdata,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: titles['Venue Type'],
                },
            },
        },
    };
    myChart = new Chart(canvas, config);
}

function createDialectVolumeBarChart(groupData, canvas) {
    let countriesDataset = {};
    for (const c in groupData) countriesDataset[c] = groupData[c].length;

    let labels = Object.keys(countriesDataset).map((code) =>
        countryCodeMapper(code)
    );
    let counts = Object.values(countriesDataset);

    [counts, labels] = sortArrays([counts, labels]);

    const chartdata = {
        labels: labels,
        datasets: [
            {
                axis: 'y',
                label: 'Dialects',
                data: counts,
                backgroundColor: palette('tol-dv', counts.length).map(function (
                    hex
                ) {
                    return '#' + hex;
                }),
            },
        ],
    };

    var config = {
        type: 'bar',
        data: chartdata,
        options: {
            indexAxis: 'y',
            plugins: {
                autocolors: {
                    mode: 'data',
                },
                title: {
                    display: true,
                    text: titles['Dialects'],
                },
                legend: {
                    display: false,
                },
            },
        },
    };
    myChart = new Chart(canvas, config);
}

function createChartContaier(title) {
    const container = document.createElement('div');
    container.id = `${title}-container`;
    container.classList.add('col-lg-6');

    const titleContainer = document.createElement('h2');

    const titleContainerClasses = ['leading-tight', 'text-3xl', 'fw-bolder'];
    titleContainerClasses.forEach((c) => titleContainer.classList.add(c));

    const titleElement = document.createElement('a');
    const titleElementClasses = ['hover:text-black', 'hover:underline'];
    titleElementClasses.forEach((c) => titleElement.classList.add(c));
    titleElement.textContent = `${title}`;
    titleElement.href = `#${container.id}`;

    titleContainer.appendChild(titleElement);

    container.appendChild(titleContainer);

    const canvas = document.createElement('canvas');

    container.appendChild(canvas);

    if (title === 'Venue') groupedBar(canvas);
    else if (title === 'Dialects')
        createDialectVolumeBarChart(
            getCountriesSubset(dialectedEntries),
            canvas
        );
    // else if (title === 'Dialects Groups')
    //   createDialectVolumeBarChart(getDialectsSubset(dialectedEntries), canvas);
    else if (title === 'Year')
        plotBar(title, canvas, (sorting = false), (truncate = 30));
    else if (title === 'Provider') plotBar(title, canvas, true, 10, true);
    else plotBar(title, canvas);

    return container;
}

Chart.defaults.plugins.labels = {};

function plotBar(
    col,
    canvas,
    sorting = true,
    truncate = 20,
    horizontal = false
) {
    let idx = headersWhiteList.indexOf(col);
    let series = getSeries(dataset, idx);

    var [elements, counts] = getCounts(series, (sorting = sorting));

    elements = elements.slice(0, truncate);
    counts = counts.slice(0, truncate);

    elements = elements.map((e) =>
        e.length < 20 ? e : e.slice(0, 20) + ' ...'
    );

    const chartdata = {
        labels: elements,
        datasets: [
            {
                axis: 'y',
                label: headersWhiteList[idx],
                data: counts,
                backgroundColor: palette('tol-dv', counts.length).map(function (
                    hex
                ) {
                    return '#' + hex;
                }),
            },
        ],
    };

    var config = {
        type: 'bar',
        data: chartdata,
        options: {
            indexAxis: horizontal ? 'y' : 'x',
            plugins: {
                autocolors: {
                    mode: 'data',
                },
                title: {
                    display: true,
                    text: titles[col],
                },
                legend: {
                    display: false,
                },
            },
        },
    };
    myChart = new Chart(canvas, config);
}

//https://gist.github.com/boukeversteegh/3219ffb912ac6ef7282b1f5ce7a379ad
function sortArrays(
    arrays,
    comparator = (a, b) => (a > b ? -1 : a < b ? 1 : 0)
) {
    let arrayKeys = Object.keys(arrays);
    let sortableArray = Object.values(arrays)[0];
    let indexes = Object.keys(sortableArray);
    let sortedIndexes = indexes.sort((a, b) =>
        comparator(sortableArray[a], sortableArray[b])
    );

    let sortByIndexes = (array, sortedIndexes) =>
        sortedIndexes.map((sortedIndex) => array[sortedIndex]);

    if (Array.isArray(arrays)) {
        return arrayKeys.map((arrayIndex) =>
            sortByIndexes(arrays[arrayIndex], sortedIndexes)
        );
    } else {
        let sortedArrays = {};
        arrayKeys.forEach((arrayKey) => {
            sortedArrays[arrayKey] = sortByIndexes(
                arrays[arrayKey],
                sortedIndexes
            );
        });
        return sortedArrays;
    }
}

function getCounts(array, sorting = true) {
    let labels = [],
        counts = [],
        arr = [...array], // clone array so we don't change the original when using .sort()
        prev;

    arr.sort();
    for (let element of arr) {
        if (element !== prev) {
            labels.push(element);
            counts.push(1);
        } else ++counts[counts.length - 1];
        prev = element;
    }
    if (sorting) {
        [counts, labels] = sortArrays([counts, labels]);
    }
    return [labels, counts];
}

function extractDilects(data) {
    const entryDialects = [
        decodeDialect(String(data['Dialect'])),
        ...data['Dialect Subsets'].map((d) => decodeDialect(d['Dialect'])),
    ];

    for (const d of entryDialects)
        if (d && d !== 'mixed')
            if (dialectedEntries[d]) dialectedEntries[d].push(data);
            else dialectedEntries[d] = [data];
}

axios
    .get(url)
    .then(function (response) {
        let rowData = response.data;

        headersWhiteList = [
            'License',
            'Year',
            'Language',
            'Dialect',
            'Domain',
            'Source',
            'Form',
            'Provider',
            'Script',
            'Host',
            'Access',
            'Tasks',
            'Venue Type',
            'Dialect Subsets',
        ];
        headersWhiteList = headersWhiteList.concat([
            'Name',
            'Link',
            'Volume',
            'Unit',
            'Paper Link',
        ]);

        $('.loading-spinner').hide();

        const subsetsIdx = headersWhiteList.indexOf('Dialect Subsets');

        // Grabbing row's values
        dataset = [];

        for (let i = 0; i < rowData.length; i++) {
            record = {};

            for (let j = 0; j < headersWhiteList.length; j++)
                if (j != subsetsIdx)
                    record[j] = String(rowData[i][headersWhiteList[j]]);
                else record[j] = rowData[i][headersWhiteList[j]];

            extractDilects({ index: i + 1, ...rowData[i] });
            dataset.push(record);
        }
        const chartsContainer = document.getElementById('chartsContainer');
        Object.keys(titles).forEach((t) =>
            chartsContainer.appendChild(createChartContaier(t))
        );
        getCountriesSubset(dialectedEntries);
    })
    .catch(function (error) {
        console.log(error);
    });
