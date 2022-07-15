let headers;
function populateTable(dataset) {
    $("#table").show();
  
    dataset = transformDataToTableEntry(dataset);
    console.log(dataset);
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

function generateSingleEntry(countryData){
    const classes = ["btn", "btn-outline-dark", "mb-1","bt-1", "me-3"];

    var singleEntryElement = document.createElement('button');
    singleEntryElement.textContent = countryData.name;

    classes.forEach((c) => singleEntryElement.classList.add(c));

    singleEntryElement.addEventListener("click", () => {
        populateTable(countryData.dataset);
    });

    return singleEntryElement;
}

function generateGroupedEntry(groupData){
    const classes = ["btn", "btn-outline-info", "btn-lg", "mt-2", "mb-3","bt-3", "me-3"];

    var groupEntryElement = document.createElement('button');
    groupEntryElement.textContent = groupData.name;

    classes.forEach((c) => groupEntryElement.classList.add(c));

    groupEntryElement.addEventListener("click", () => {
        populateTable(groupData.dataset);
    });


    return groupEntryElement;
}

function generateEntry(groupData){

    if (groupData.countries.length > 1){
        let subContainer = document.createElement('div');

        subContainer.appendChild(generateGroupedEntry({name: groupData.regionName, dataset: groupData.dataset}));
        
        let countriesContainer = document.createElement('div');

        for (countryObject of groupData.countries)
            countriesContainer.append(generateSingleEntry({name: countryObject.country, dataset: countryObject.dataset}));

        subContainer.appendChild(countriesContainer);
        
        return subContainer;
    }

    return generateGroupedEntry({name: groupData.regionName, dataset: groupData.dataset});
    

}

function generateTable(groupedData){
    const classes = ["dialectedTable", "mt-1"];

    let mainContainer = document.createElement('div');
    classes.forEach((c) => mainContainer.classList.add(c));

    for (group of groupedData)
        mainContainer.appendChild(generateEntry(group));

    return mainContainer;
}

function createDialectedGraph(groupData, headersInfo) {
    $('#myChart').hide();
    $('#chartdiv').show();
    headers = headersInfo;

    const formattedData = groupedDialect(groupData)
    const htmlTableEntry = generateTable(formattedData);
    document.getElementById("countriesBar").appendChild(htmlTableEntry);
}
