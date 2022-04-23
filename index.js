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

// this, alternatively, can be used for loading spinner
// {
//     onDownloadProgress: (pe) => document.querySelector('.main-container').innerHTML = "loading spinnehingie"
// }

axios.get(url, {
    // TODO:: Adding a download progress bar. * IT CANNOT BE APPLIED BECAUSE THE SIZE OF THE ENCODING DATA. *
    onDownloadProgress: progressEvent => {
        // const percentage = Math.round(
        //     (progressEvent.loaded * 100) / progressEvent.total
        //   );
        // console.log('download', percentage);        
      }
}).then(function(response) {
        var rowData = response.data.sheets[0].data[0].rowData
        var headers = []
        let headersWhiteList = ['No.', 'Name', 'Link', 'Year', 'Volume', 'Unit', 'Paper Link', 'Access', 'Tasks']
        $('.loading-spinner').hide()


        rowData[1].values.filter(header => header.formattedValue != undefined).forEach((header, headerIndex) => {
            if (headersWhiteList.includes(header.formattedValue)){
                headers.push({
                    index: headerIndex,
                    title: header.formattedValue
                })
            }
        })

        let tempRows = []
        rowData.filter(row => {
            tempRows.push(row.values)
        })
        
        let rows = []
        for (let index = 2; index < tempRows.length; index++) {
            const fileds = tempRows[index]
            if (fileds != undefined) {
                if (!isNaN(fileds[0].formattedValue)){
                    rows.push(fileds)
                }
            }
            
        }
        
        let dataset = []
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            dataset.push({
                0: row[headers[0].index].formattedValue,
                1: linkuize(row[headers[1].index].formattedValue, `card.html?${index}`),
                2: linkuize(row[headers[2].index + 18].formattedValue, row[headers[2].index].formattedValue),
                3: row[headers[3].index].formattedValue,
                4: row[headers[4].index].formattedValue ? row[headers[4].index].formattedValue : '',
                5: row[headers[5].index].formattedValue ? row[headers[5].index].formattedValue : '',
                6: linkuize(row[headers[6].index - 1].formattedValue, row[headers[6].index].formattedValue),
                7: badgeRender(row[headers[7].index].formattedValue),
                8: itemize(row[headers[8].index].formattedValue),
            })
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
                "lengthMenu": [5, 10, 25, 50, 75, 100, 250],
                // scrollY: "720px",
                scrollCollapse: true,
                paging: true,
                "pagingType": "numbers",
                "bInfo": false,
                
            });

        });



    })
    .catch(function(error) {
        console.log(error);
    });