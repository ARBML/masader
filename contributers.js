const url = "https://sheets.googleapis.com/v4/spreadsheets/1YO-Vl4DO-lnp8sQpFlcX1cDtzxFoVkCmU1PVw_ZHJDg?key=AIzaSyC6dSsmyQw-No2CJz7zuCrMGglNa3WwKHU&includeGridData=true";

function linkuize(text, link) {
    if(link != undefined)
        return `<a href = "${link}" target="_blank"> ${text}</a>`
    else
        return ""
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
        $('.loading-spinner').hide()

        
        // Grabbing row's values
        let tempRows = []
        rowData.filter(row => {
            tempRows.push(row.values)
        })
        const contributers = new Set()

        for (let index = 2; index < tempRows.length; index++) {
            const fileds = tempRows[index]
            if (fileds != undefined) {
                if (fileds[34].formattedValue != undefined){
                    contributers.add(fileds[34].formattedValue)
                }
            }
        }

        var ul = document.getElementById("list");
        var li = document.createElement("li");
        contributers.forEach(key =>
        {
            li = document.createElement("li")
            li.appendChild(document.createTextNode(key))
            ul.appendChild(li)
        }
        );





    })
    .catch(function(error) {
        console.log(error);
    });