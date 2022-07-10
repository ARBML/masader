const url = "https://sheets.googleapis.com/v4/spreadsheets/1YO-Vl4DO-lnp8sQpFlcX1cDtzxFoVkCmU1PVw_ZHJDg?key=AIzaSyC6dSsmyQw-No2CJz7zuCrMGglNa3WwKHU&includeGridData=true";


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
}).then(function (response) {
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
            if (fileds[34].formattedValue != undefined) {
                contributers.add(fileds[34].formattedValue)
            }
        }
    }

    var ul = document.getElementById("list");
    var li = document.createElement("li");
    contributers.forEach(key => {
        li = document.createElement("li")
        li.appendChild(document.createTextNode(key))
        ul.appendChild(li)
    }
    );

})
    .catch(function (error) {
        console.log(error);
    });