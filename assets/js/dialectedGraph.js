let headers;
let clicked;

function populateTable(dataset) {
    $('#table').show();

    dataset = transformDataToTableEntry(dataset);
    console.log(dataset);
    $('#table').DataTable({
        data: dataset,
        columns: headers,
        lengthMenu: [
            [10, 100, 200, 300, 400, -1],
            [10, 100, 200, 300, 400, 'All'],
        ],
        scrollCollapse: true,
        paging: true,
        pagingType: 'numbers',
        bInfo: false,
        bDestroy: true,
        createdRow: function (row, data, dataIndex) {
            $('td:eq(9)', row).css('min-width', '200px');
        },
    });
}

function addClickEffects(element, dataset) {
    populateTable(dataset);
    element.classList.add('focus');

    if (clicked) clicked.classList.remove('focus');

    clicked = element;

    let dataSetText = document.createElement('p');
    dataSetText.textContent = 'The number of the datasets is ';

    const classes = ['fw-bold', 'text-primary'];

    let dataSetSpan = document.createElement('span');
    classes.forEach((c) => dataSetSpan.classList.add(c));
    dataSetSpan.textContent = dataset.length;

    dataSetText.appendChild(dataSetSpan);

    const dataSetLbl = document.getElementById('datasetSizeLbl');

    if (dataSetLbl.children.length > 0)
        dataSetLbl.removeChild(dataSetLbl.children[0]);

    dataSetLbl.appendChild(dataSetText);
}

function generateSingleEntry(countryData) {
    const classes = [
        'btn',
        'singleDialectBtn',
        'dialectBtn',
        'mb-1',
        'bt-1',
        'me-3',
    ];

    let singleEntryElement = document.createElement('button');
    singleEntryElement.textContent = countryCodeMapper(countryData.name);

    classes.forEach((c) => singleEntryElement.classList.add(c));

    singleEntryElement.addEventListener('click', () => {
        addClickEffects(singleEntryElement, countryData.dataset);
    });

    return singleEntryElement;
}

function generateGroupedEntry(groupData) {
    const classes = [
        'btn',
        'groupedDialectBtn',
        'dialectBtn',
        'btn-lg',
        'mt-2',
        'mb-3',
        'bt-3',
        'me-3',
    ];

    let groupEntryElement = document.createElement('button');
    groupEntryElement.textContent = groupData.name;

    classes.forEach((c) => groupEntryElement.classList.add(c));

    groupEntryElement.addEventListener('click', () => {
        addClickEffects(groupEntryElement, groupData.dataset);
    });

    return groupEntryElement;
}

function generateEntry(groupData) {
    if (groupData.countries.length > 1) {
        let subContainer = document.createElement('div');

        subContainer.appendChild(
            generateGroupedEntry({
                name: groupData.regionName,
                dataset: groupData.dataset,
            })
        );

        let countriesContainer = document.createElement('div');

        for (countryObject of groupData.countries)
            countriesContainer.append(
                generateSingleEntry({
                    name: countryObject.country,
                    dataset: countryObject.dataset,
                })
            );

        subContainer.appendChild(countriesContainer);

        return subContainer;
    }

    return generateGroupedEntry({
        name: groupData.regionName,
        dataset: groupData.dataset,
    });
}

function generateTable(groupedData) {
    const classes = ['dialectedTable', 'mt-1'];

    let mainContainer = document.createElement('div');
    classes.forEach((c) => mainContainer.classList.add(c));

    for (group of groupedData) mainContainer.appendChild(generateEntry(group));

    return mainContainer;
}

function createDialectedGraph(groupData, headersInfo) {
    $('#myChart').hide();
    $('#chartdiv').show();
    $('#table_wrapper').show();
    $('#datasetSizeLbl').show();
    headers = headersInfo;

    if (document.getElementById('chartdiv').children.length === 0) {
        const formattedData = groupedDialect(groupData);
        const htmlTableEntry = generateTable(formattedData);
        document.getElementById('chartdiv').appendChild(htmlTableEntry);
    }
}
