let url = "https://sheets.googleapis.com/v4/spreadsheets/1YO-Vl4DO-lnp8sQpFlcX1cDtzxFoVkCmU1PVw_ZHJDg?key=AIzaSyC6dSsmyQw-No2CJz7zuCrMGglNa3WwKHU&includeGridData=true";
function linkuize(text, link) {
    return `<a href = "${link}" target="_blank"> ${text}</a>`
}

function ethicalBadge(text) {
    text = text.toLowerCase();
    if (text == "low") return '<span class="badge bg-success">Low</span>';
    else if (text == "medium") return '<span class="badge bg-warning">Medium</span>';
    else return '<span class="badge bg-danger text-light">High</span>';
}

function createSubsets(subsetsValue) {
    let result = '<table><tbody>'
    subsetsValue.forEach(subset => {
        result += `<tr><td><b>${subset.country}</b></td><td>${subset.volume}</td></tr>`
    })
    result += '</tbody></table>'
    return result
}
// this, alternatively, can be used for loading spinner
// {
//     onDownloadProgress: (pe) => document.querySelector('.main-container').innerHTML = "loading spinnehingie"
// }
axios.get(url, ).then(function(response) {
        let rowData = response.data.sheets[0].data[0].rowData
        let headers = []

        // If you disable display name don't remove it from "headersWhiteList" becuase we use this as index key to push subsets to his row 
        let headersWhiteList = ['Name','Link', 'Year', 'Volume', 'Unit', 'Paper Link', 'Access', 'Tasks', 'License', 'Language', 'Dialect', 'Domain', 'Form', 'Collection Style', 'Ethical Risks', 'Provider', 'Derived From', 'Script', 'Tokenized', 'Host', 'Cost', 'Test Split', 'Subsets']
        
        $('.loading-spinner').hide()

        function getIndex() {
            let idx = document.URL.indexOf('?');
            let index = document.URL.substring(idx + 1, document.URL.length)
            return index
        }
        const idx = getIndex();

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
        
        // Get row's values and grabbing subsets and push it to row array as one array 
        let rows = []
        for (let index = 2; index < tempRows.length; index++) {
            const fileds = tempRows[index]
            if (fileds != undefined) {
                if (!isNaN(fileds[0].formattedValue)){
                    rows.push({index: rows.length, fileds: fileds})
                }else {
                    if (fileds[1].formattedValue != undefined) {
                        let preRow = rows.filter(row => {
                            if (row.fileds[1].formattedValue == fileds[1].formattedValue) {
                                return row
                            }
                        })
                        if (preRow[0] != undefined && rows[preRow[0].index].subsets == undefined) {
                            rows[preRow[0].index].subsets = []
                            rows[preRow[0].index].subsets.push({country: fileds[2].formattedValue, volume: fileds[13].formattedValue})
                        }else if (preRow[0] != undefined) {
                            rows[preRow[0].index].subsets.push({country: fileds[2].formattedValue, volume: fileds[13].formattedValue})
                        }
                    }
                }
            }
            
        }

        let dataset = []
        let row = rows[idx].fileds;

        // For each on "headersWhiteList" to display data with defult sort
        headersWhiteList.forEach(element => {
                let value = row[headers.filter(h => h.title == element)[0].index].formattedValue ? row[headers.filter(h => h.title == element)[0].index].formattedValue : ''
                if (element == 'Ethical Risks') {
                    value = ethicalBadge(value) // calling "ethicalBadge" function to put some style to the value 
                }
                    else if (element == 'Link' || element == 'Paper Link'){
                    console.log(value)
                    value = linkuize(value, value)
                }
                 else if (element == 'Subsets') {
                    if (rows[idx].subsets) {
                        let subsets = rows[idx].subsets
                        value = createSubsets(subsets)
                    }
                }
                dataset.push({
                    0: element,
                    1: value
                })
        });

        $(document).ready(function() {

            $('#table_card').DataTable({
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