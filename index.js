const url = "https://sheets.googleapis.com/v4/spreadsheets/1YO-Vl4DO-lnp8sQpFlcX1cDtzxFoVkCmU1PVw_ZHJDg?key=AIzaSyC6dSsmyQw-No2CJz7zuCrMGglNa3WwKHU&includeGridData=true";

function linkuize(text, link) {
    return `<a href = "${link}" target="_blank"> ${text}</a>`
}

function itemize(text) {
    tasks = text.split(",")
    output = "<ul>"
    for (let i = 0; i < tasks.length; i++) {
        output += "<li>" + tasks[i] + "</li>"
    }
    output += "</ul>"
    return output
}

function badgeRender(text) {
    text = text.toString().toLowerCase();
    if (text.toLowerCase() == "free") return '<span class="badge bg-success">Free</span>'
    else if (text == "upon-request") return '<span class="badge bg-danger text-light">Upon Request</span>'
    else return '<span class="badge bg-dark">Paid</span>'
}

function reformat_numbers(num) {
    values = num.split(',')
    if (values.length < 2) {
        return num
    } else if (values.length == 2) {
        return values[0] + 'K'
    } else
        return values[0] + 'M'
}

function getSubsets(rowData, i) {

    var currData = []
    var currDataCard = []
    params = ''
    i += 1
    while (true) {
        var colData = rowData[i].values

        if (colData[0].formattedValue !== undefined || colData[2].formattedValue === undefined)
            break

        subset_name = colData[2].formattedValue
        volume = colData[12].formattedValue
        unit = colData[13].formattedValue
        // console.log(subset_name)
        params += `subset-${subset_name}=${volume} ${unit}&`
        i += 1
    }
    return params
}
axios.get(url, {
    // TODO:: Adding a download progress bar. * IT CANNOT BE APPLIED BECAUSE THE SIZE OF THE ENCODING DATA. *
    onDownloadProgress: progressEvent => {
        // const percentage = Math.round(
        //     (progressEvent.loaded * 100) / progressEvent.total
        //   );
        // console.log('download', percentage);        
      }
}).then(function(response) {
        const startIdx = 1
        var rowData = response.data.sheets[0].data[0].rowData
        var dataset = []
        var headers = []
        $('.loading-spinner').hide()

        const MaxColLength = 26
        const MaxRowLength = 406

        var firstRow = rowData[startIdx].values
        var dataCardIndices = [4, 6, 7, 8, 9, 10, 14, 15, 16, 19, 20, 21, 23, 24] // extract from request thoes headers(title,paper-link..etc).
        var ignoredIndices = [2, 17, 11] //ignore description (ignore headers)
        var dataCardHeaders = []
        var allDataCard = []
        var dataCounter;
        for (let j = 0; j < MaxColLength; j++) {
            const header = firstRow[j].formattedValue
            if (dataCardIndices.includes(j))
                dataCardHeaders.push(header)

            else if (ignoredIndices.includes(j))
                continue
            else
                headers.push({
                    title: header
                })
        }
        datasetNames = []

        // we should start with value(row) number 2 becuase we've done with number 1 and has been extracted.
        for (let i = startIdx + 1; i < MaxRowLength; i++) {
            var colData = rowData[i].values
            var currData = []
            var currDataCard = []
            console.log(colData)
            if (colData[0].formattedValue === undefined) {
                continue
            }
            dataName = ''
            for (let j = 0; j < MaxColLength; j++) {
                const item = colData[j].formattedValue
                if (ignoredIndices.includes(j)) {
                    continue
                }
                if (dataCardIndices.includes(j)) {
                    if (item)
                        currDataCard.push(item)
                    else
                        currDataCard.push("")
                    continue
                }
                if (item) {
                    if (j == 1) {
                        dataName = item
                        datasetNames.push(dataName)
                    } else if (j == 3) {
                        text = colData[21].formattedValue
                        currData.push(linkuize(text, item))
                    } else if (j == 12) {
                        //maybe use formatting ?
                        // currData.push(reformat_numbers(item))
                        currData.push(item)
                    } else if (j == 18) {
                        text = colData[j - 1].formattedValue
                        currData.push(linkuize(text, item))
                    } else if (j == 22) {
                        currData.push(badgeRender(colData[22].formattedValue));
                    } else if (j == 25) {
                        currData.push(itemize(item.toLowerCase()))
                    } else {
                        currData.push(item)
                    }
                } else
                    currData.push("")
            }


            allDataCard.push(currDataCard)
            params = ''
            for (let j = 0; j < currDataCard.length; j++) {
                const name = dataCardHeaders[j]
                value = currDataCard[j]
                params += `${name}=${value}&`
            }
            params += getSubsets(rowData, i)
            dataCounter = datasetNames.indexOf(dataName)
            currData.splice(1, 0, `<a href = 'card.html?${dataCounter}' target='_blank'>${dataName}</a>`)
            // currData.splice(1, 0, dataName)
            dataset.push(currData)
        }

        $.extend($.fn.dataTableExt.oSort, {
            "data-custom-pre": function(a) {
                console.log(a)
            }
        });

        $(document).ready(function() {
            $('#table').DataTable({
                data: dataset,
                columns: headers,
                // "lengthMenu": [[-1], ["All"]],
                "lengthMenu": [10, 25, 50, 75, 100, 250],
                // scrollY: "720px",
                scrollCollapse: true,
                paging: true,
                "pagingType": "numbers",
                "bInfo": false
            });

        });



    })
    .catch(function(error) {
        console.log(error);
    });