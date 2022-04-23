var url = "https://sheets.googleapis.com/v4/spreadsheets/1YO-Vl4DO-lnp8sQpFlcX1cDtzxFoVkCmU1PVw_ZHJDg?key=AIzaSyC6dSsmyQw-No2CJz7zuCrMGglNa3WwKHU&includeGridData=true";

function ethicalBadge(text) {
    text = text.toLowerCase();
    if (text == "low") return '<span class="badge bg-success">Low</span>';
    else if (text == "medium") return '<span class="badge bg-warning">Medium</span>';
    else return '<span class="badge bg-danger text-light">High</span>';
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
// this, alternatively, can be used for loading spinner
// {
//     onDownloadProgress: (pe) => document.querySelector('.main-container').innerHTML = "loading spinnehingie"
// }
axios.get(url, ).then(function(response) {
        const startIdx = 1
        var rowData = response.data.sheets[0].data[0].rowData
        var dataset = []
        var headers = []
        $('.loading-spinner').hide()

        function getIndex() {
            var idx = document.URL.indexOf('?');
            var index = document.URL.substring(idx + 1, document.URL.length)
            return index
        }
        const MaxColLength = 26
        const MaxRowLength = 406
        const idx = getIndex();

        var firstRow = rowData[startIdx].values
        var dataCardIndices = [4, 6, 7, 8, 9, 10, 14, 15, 16, 19, 20, 21, 23, 24]
        var ignoredIndices = [2, 17, 11] //ignore description
        var dataCardHeaders = []
        var allDataCard = []
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

        for (let i = startIdx + 1; i < MaxRowLength; i++) {
            var colData = rowData[i].values
            var currData = []
            var currDataCard = []

            if (colData[0].formattedValue === undefined) {
                continue
            }

            dataName = ''
            for (let j = 0; j < MaxColLength; j++) {
                var item = colData[j].formattedValue
                //console.log(item);
                if (ignoredIndices.includes(j)) {
                    continue
                }
                if (dataCardIndices.includes(j)) {
                    if (item) {
                        if (j == 14) {
                            // item = ethicalBadge(colData[j].formattedValue);
                            item = item;
                        }
                        currDataCard.push(item)
                    } else
                        currDataCard.push("")
                    continue
                }
            }

            params = `dataname=${dataName}&`
            for (let j = 0; j < currDataCard.length; j++) {
                const name = dataCardHeaders[j]
                value = currDataCard[j]
                params += `${name}=${value}&`
            }
            params += getSubsets(rowData, i)
            allDataCard.push(params)
        }

        $(document).ready(function() {
            function getParams(idx) {
                var dataset = []
                var subsets = []
                var subsetList = '<table>'
                var pairs = allDataCard[idx].split('&');
                var dataName = ""

                for (var i = 0; i < pairs.length - 1; i++) {
                    data = pairs[i].split('=')

                    var name = data[0].replace(/%20/g, " ");
                    var value = data[1].replace(/%20/g, " ");


                    // ETHICAL RISKS : adjust the table to make it more clearer 
                    if (value == "Low" || value == "Medium" || value == "High") {
                        value = ethicalBadge(value)
                    }


                    if (name.includes("subset")) {
                        name = name.replace("subset-", "");
                        subsetList += `<tr> <td><b>${name}</b></td> <td> ${value} </td> </tr>`
                    } else if (name.includes("dataname")) {
                        $("h3").text(`Data Card for ${value}`)
                    } else
                        dataset.push([name, value]);

                }
                subsetList += '</table>'
                dataset.push(['Subsets', subsetList])
                return dataset;
            }
            const dataset = getParams(idx);

            $('#table').DataTable({
                data: dataset,
                columns: [{
                        title: "Attribute"
                    },
                    {
                        title: "Value"
                    },
                ],
                "lengthMenu": [10, 25, 50, 75, 100, 250],
                scrollCollapse: true,
                // scrollY: "720px",
                scrollCollapse: true,
                paging: false,
                "order": [],
                "bInfo": false
            });
        });
    })
    .catch(function(error) {
        console.log(error);
    });