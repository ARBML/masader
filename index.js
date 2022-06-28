const url = "https://sheets.googleapis.com/v4/spreadsheets/1YO-Vl4DO-lnp8sQpFlcX1cDtzxFoVkCmU1PVw_ZHJDg?key=AIzaSyC6dSsmyQw-No2CJz7zuCrMGglNa3WwKHU&includeGridData=true";

function linkuize(text, link) {
    if(link != undefined)
        return `<a href = "${link}" target="_blank"> ${text}</a>`
    else
        return ""
}

function getCountry(text){
    text = text.split("(")
    text = text[text.length - 1].split(")")[0]
    if (text == "Modern Standard Arabic"){
        return "MSA"
    }
    return text
}
function getIcon(text){
    const lower = text.toLowerCase()
    if(icons[lower] != undefined)
    {
        return icons[lower]
    }
    else
    {
        return text
    }
}
function itemize(text) {
    tasks = text.split(",")
    output = '<ul class="list-group list-group-flush bg-transparent">'
    for (let i = 0; i < tasks.length; i++) {
        output += '<li class="list-group-item bg-transparent">' + tasks[i].trim().replaceAll(' ','-') + '</li>'
    }
    output += "</ul>"
    return output
}

function badgeRender(text) {
    text = text.toString().toLowerCase();
    if (text.toLowerCase() == "free") return '<span class="badge bg-success">Free</span>'
    else if (text == "upon-request") return '<span class="badge bg-info">Free Upon Request</span>'
    else return '<span class="badge bg-danger">Paid</span>'
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

axios.get(url, {
    // TODO:: Adding a download progress bar. * IT CANNOT BE APPLIED BECAUSE THE SIZE OF THE ENCODING DATA. *
    onDownloadProgress: progressEvent => {
        // const percentage = Math.round(
        //     (progressEvent.loaded * 100) / progressEvent.total
        //   );
        // console.log('download', percentage);        
      }
}).then(function(response) {
        let rowData = response.data.sheets[0].data[0].rowData
        let headers = []
        let headersWhiteList = ['No.', 'Name', 'Link', 'Year', 'Dialect', 'Volume', 'Unit', 'Paper Link', 'Access', 'Tasks']
        $('.loading-spinner').hide()

        // Grabbing header's index's to help us to get value's of just by header index 
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
        
        // Grabbing row's values
        let rows = []
        for (let index = 2; index < tempRows.length; index++) {
            const fileds = tempRows[index]
            if (fileds != undefined) {
                if (!isNaN(fileds[0].formattedValue)){
                    rows.push(fileds)
                }
            }
            
        }
        
        //  Createing table data
        let dataset = []
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const hf_link = row[headers[2].index + 1].formattedValue
            const pr_text = row[headers[2].index + 19].formattedValue
            const pr_link = row[headers[2].index].formattedValue

            dataset.push({
                0: row[headers[0].index].formattedValue,
                1: linkuize(row[headers[1].index].formattedValue, `card.html?${index}`),
                2: linkuize(getIcon(pr_text), pr_link)+'</br>'
                +  linkuize(getIcon('hf'), hf_link),
                3: row[headers[3].index].formattedValue,
                4: getCountry(row[headers[4].index].formattedValue),
                5: row[headers[5].index].formattedValue ? row[headers[5].index].formattedValue : '',
                6: row[headers[6].index].formattedValue ? row[headers[6].index].formattedValue : '',
                7: linkuize(row[headers[7].index - 1].formattedValue, row[headers[7].index].formattedValue),
                8: badgeRender(row[headers[8].index].formattedValue),
                9: itemize(row[headers[9].index].formattedValue),
            })
        }

        $.extend($.fn.dataTableExt.oSort, {
            "data-custom-pre": function(a) {
                console.log(a)
            }
        });

        $(document).ready(function() {
            document.getElementById("numDatasets").textContent=dataset.length;
            $('#table').DataTable({
                data: dataset,
                columns: headers,
                "lengthMenu": [[10, 100, 200, 300, 400, -1], [10, 100, 200, 300, 400, "All"]],
                scrollCollapse: true,
                paging: true,
                "pagingType": "numbers",
                "bInfo": false,
                'createdRow': function(row, data, dataIndex){
                    $('td:eq(9)', row).css('min-width', '200px');
                 }
            });

        });



    })
    .catch(function(error) {
        console.log(error);
    });