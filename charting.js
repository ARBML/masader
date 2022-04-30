const url = "https://sheets.googleapis.com/v4/spreadsheets/1YO-Vl4DO-lnp8sQpFlcX1cDtzxFoVkCmU1PVw_ZHJDg?key=AIzaSyC6dSsmyQw-No2CJz7zuCrMGglNa3WwKHU&includeGridData=true";

let headersWhiteList;
let dataset;
let myChart = null;

function getSeries(data, idx, return_codes = false){

    let series = []

    for (let index = 0; index < data.length; index++) {
        // console.log(data[index][idx])
        if(data[index][idx] === undefined)
            continue
        if (headersWhiteList[idx] == 'Tasks')
        {
            let tasks = data[index][idx].split(",");
            for (let index = 0; index < tasks.length; index++) {
                series.push(tasks[index].trim())
            }

        }
        else if(headersWhiteList[idx] == 'Dialect')
        {
            let dialect = data[index][idx]
            if (dialect != 'other')
            {
                // dialect = dialect.split(':')[1]
                // dialect = dialect.replace('Arabic', '')
                // dialect = dialect.replace(/[()]/g,'')
                dialect = dialect.split(':')[0]
                dialect = dialect.split('-')[1]
            }
            
            series.push(dialect.trim())

        }
        else
        {
            series.push(data[index][idx].trim())
        }
        
                 
    }
    return series
}

function plotBar(col)
{
    $("#myChart").show();
    $("#chartdiv").hide();
    if (myChart != null)
    {
        myChart.destroy();
    }
    let idx = headersWhiteList.indexOf(col)
    let series = getSeries(dataset, idx)

    const [elements, counts] = getCounts(series)
    console.log(elements)

    const chartdata = {
        labels: elements,
        datasets: [{
            axis: 'y',
            label:headersWhiteList[idx],
            data: counts,
            backgroundColor: palette('tol-dv', counts.length).map(
                function(hex) {
                    return '#' + hex;
            })
        }]
    }
    var canvas = document.getElementById("myChart");
    var config = {
        type: 'bar',
        data: chartdata,
        options: {
            plugins: {
                autocolors: {
                mode: 'data'
                }
            }
        }
    }
    myChart = new Chart(canvas, config);
}

//https://gist.github.com/boukeversteegh/3219ffb912ac6ef7282b1f5ce7a379ad
function sortArrays(arrays, comparator = (a, b) => (a > b) ? -1 : (a < b) ? 1 : 0) {
    let arrayKeys = Object.keys(arrays);
    let sortableArray = Object.values(arrays)[0];
    let indexes = Object.keys(sortableArray);
    let sortedIndexes = indexes.sort((a, b) => comparator(sortableArray[a], sortableArray[b]));
  
    let sortByIndexes = (array, sortedIndexes) => sortedIndexes.map(sortedIndex => array[sortedIndex]);
  
    if (Array.isArray(arrays)) {
      return arrayKeys.map(arrayIndex => sortByIndexes(arrays[arrayIndex], sortedIndexes));
    } else {
      let sortedArrays = {};
      arrayKeys.forEach((arrayKey) => {
        sortedArrays[arrayKey] = sortByIndexes(arrays[arrayKey], sortedIndexes);
      });
      return sortedArrays;
    }
  }

function getCounts(array, sorting = true)
{
    let labels = [],
    counts = [],
    arr = [...array], // clone array so we don't change the original when using .sort()
    prev;

    arr.sort();
    for (let element of arr) {
        if (element !== prev) {
            labels.push(element);
            counts.push(1);
        }
        else ++counts[counts.length - 1];
        prev = element;
    }
    if (sorting)
    {
        [counts, labels] = sortArrays([counts, labels]) 
    }
    return [labels, counts];
}

axios.get(url, ).then(function(response) {
    let rowData = response.data.sheets[0].data[0].rowData
    let headers = []
    headersWhiteList = ['License', 'Year', 'Language', 'Dialect', 'Domain', 'Form', 'Ethical Risks', 'Script', 'Access', 'Tasks']
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

    // console.log(headers)
    let tempRows = []
    rowData.filter(row => {
        tempRows.push(row.values)
    })
    
    // Grabbing row's values
    let rows = []
    for (let index = 2; index < tempRows.length; index++) {
        const fileds = tempRows[index]
        if (fileds != undefined) {
            // if (!isNaN(fileds[0].formattedValue)){
                rows.push(fileds)
            // }
        }
        
    }
    
    //  Createing table data
    dataset = []
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        let entry = {}
        for (let index = 0; index < headersWhiteList.length; index++) {
            entry[index] = row[headers[index].index].formattedValue
        }
        dataset.push(entry)
    }

    var changedText = document.getElementById('myDropdown');

    document.getElementById('myDropdown').addEventListener('change', function() {
        if (this.value != "Dialect")
            plotBar(this.value) 
        else{
            let idx = headersWhiteList.indexOf("Dialect")
            let series = getSeries(dataset, idx)
            const [elements, counts] = getCounts(series)
            console.log(elements)
            let groupData = []

            for (let i = 0; i < elements.length; i++){
                let group = []

                for (let j = 0; j < counts.length; j++) {
                    if (counts[j] == i)
                    {
                        group.push({"id":elements[j], "joined": i + ""})
                    }
                }
                if (group.length > 0)
                    groupData.push({"name": "", "data":group})
            }
            createMap(groupData)
        }   
    });

})
.catch(function(error) {
    console.log(error);
});
    

  