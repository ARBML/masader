const url = 'https://masader-web-service.herokuapp.com/datasets';

function linkuize(text, link) {
    if (link != undefined && link != 'nan')
        return `<a href = "${link}" target="_blank" class="shorterText underline"> ${text}</a>`;
    else return 'Not Available';
}

function getCountry(text) {
    text = text.split('(');
    text = text[text.length - 1].split(')')[0];
    if (text == 'Modern Standard Arabic') {
        return 'MSA';
    }
    return text;
}

function getIcon(text) {
    const lower = text.toLowerCase();
    if (icons[lower] != undefined || icons[lower] != 'nan') {
        return icons[lower];
    } else {
        return text;
    }
}
function itemize(text) {
    tasks = text.split(',');
    output = '<ul class="list-group list-group-flush bg-transparent">';
    for (let i = 0; i < tasks.length; i++) {
        output +=
            '<li class="list-group-item bg-transparent">' +
            tasks[i].trim().replaceAll(' ', '-') +
            '</li>';
    }
    output += '</ul>';
    return output;
}

function badgeRender(text) {
    text = text.toString().toLowerCase();
    if (text.toLowerCase() == 'free')
        return '<span class="text-white text-sm font-medium  px-2.5 py-0.5 rounded" style="background-color: #F95959">Free</span>';
    else if (text == 'upon-request')
        return '<span class="badge bg-info">Free Upon Request</span>';
    else return '<span class="badge bg-danger">Paid</span>';
}

function reformat_numbers(num) {
    values = num.split(',');
    if (values.length < 2) {
        return num;
    } else if (values.length == 2) {
        return values[0] + 'K';
    } else return values[0] + 'M';
}

function getShorter(){

}

function getDetails(id) {
  return axios.get(url+"/"+id).then(response => response.data)
}

function fomratDetails(data){
    console.log(data)
  return '<div class="grid grid-cols-4">'+
            '<div class="col-span-1">'+
                // '<a class="text-center fs-3">'+ linkuize(data['Paper Title'], data['Paper Link'])+'</a>'+
                
                '<a href = "'+data['Link']+'" target="_blank" class="shorterText underline mx-4" style="width: 70%"> '+data['Link']+'</a>'+
                '<meta property="og:image" content='+data['Link']+'/>'+

            '</div>'+
            '<div class="col-span-3">'+
                '<div class="grid grid-rows-6 grid-flow-col ">'+
                    ' <div class="grid grid-cols-2 ">'+
                        '<span class="text-gray-400">Name</span>'+
                        '<span class="text-gray-800">'+data['Name'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2">'+
                        '<span class=" text-gray-400">Created At</span>'+
                        '<span class=" text-gray-800">'+data['Year'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2 ">'+
                        '<span class="text-gray-400">Volume</span>'+
                        '<span class="text-gray-800">'+data['Volume'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Unit</span>'+
                        '<span class="text-gray-800">'+data['Unit'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Language</span>'+
                        '<span class="text-gray-800">'+data['Language'] +'</span>'+
                    '</div>'+
                    ' <div class=" grid grid-cols-2 ">'+
                        '<span class="text-gray-400">License</span>'+
                        '<span class="text-gray-800">'+data['License'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Accessibility</span>'+
                        '<span class="text-gray-800">'+data['Access'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Tasks</span>'+
                        '<span class="text-gray-800">'+data['Tasks'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Dialect</span>'+
                        '<span class="text-gray-800">'+data['Dialect'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Domain</span>'+
                        '<span class="text-gray-800">'+data['Domain'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Form</span>'+
                        '<span class="text-gray-800">'+data['Form'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Collection Style</span>'+
                        '<span class="text-gray-800">'+data['Collection Style'] +'</span>'+
                    '</div>'+
                    ' <div class=" grid grid-cols-2 ">'+
                        '<span class="text-gray-400">Provider</span>'+
                        '<span class="text-gray-800">'+data['Provider'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Script</span>'+
                        '<span class="text-gray-800">'+data['Script'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Tokenized</span>'+
                        '<span class="text-gray-800">'+data['Tokenized'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Host</span>'+
                        '<span class="text-gray-800">'+data['Host'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Cost</span>'+
                        '<span class="text-gray-800">'+data['Cost'] +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Test Split</span>'+
                        '<span class="text-gray-800">'+data['Test Split'] +'</span>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'
   // })
 }

axios
    .get(url, {
        // TODO:: Adding a download progress bar. * IT CANNOT BE APPLIED BECAUSE THE SIZE OF THE ENCODING DATA. *
        onDownloadProgress: (progressEvent) => {
            // const percentage = Math.round(
            //     (progressEvent.loaded * 100) / progressEvent.total
            //   );
            // console.log('download', percentage);
        },
    })
    .then(function (response) {
        let headers = [];
        let headersWhiteList = [
            'No.',
            'Name',
            'Link',
            'Year',
            'Dialect',
            'Volume',
            'Unit',
            'Paper Link',
            'Access',
            'Tasks',
        ];
        $('.loading-spinner').hide();
        headers.push({
          index: 0,
          className:      'fa-solid fa-angle-down table-cell flex',
          orderable:      false,
          data:           null,
          defaultContent: ''
      
      })
        for (let i = 0; i < headersWhiteList.length; i++) {
            headers.push({
                index: 1+i,
                title: headersWhiteList[i],
            });
        }
        let rows = response.data;
        console.log(headers);

        //  Createing table data
        let dataset = [];
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            let link_host = linkuize(row['Host'], row['Link']);
            if (row['HF Link'] != 'nan') {
                link_host += '</br>' + linkuize(getIcon('hf'), row['HF Link']);
            }
            dataset.push({
                0: index + 1,
                1: index + 1,
                2: row['Name'],
                3: link_host,
                4: row['Year'],
                5: getCountry(row['Dialect'] != 'nan' ? row['Dialect'] : ''),
                6: row['Volume'] != 'nan' ? row['Volume'] : '',
                7: row['Unit'] != 'nan' ? row['Unit'] : '',
                8: linkuize(row['Paper Title'], row['Paper Link']),
                9: badgeRender(row['Access']),
                10: itemize(row['Tasks']),
            });
        }

        $.extend($.fn.dataTableExt.oSort, {
            'data-custom-pre': function (a) {
                console.log(a);
            },
        });

        $(document).ready(function () {
            document.getElementById('numDatasets').textContent = dataset.length;
            let table = $('#table').DataTable({
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
                dom: 'pt',
                createdRow: function (row, data, dataIndex) {
                    $('td:eq(`10`)', row).css('min-width', '200px');
                },
                // "columnDefs": [
                //   {
                //       "targets": 0,
                //       "render": function ( data, type, row ) {
                //           return "<i class='fa-solid fa-angle-down'></i>";
                //       }
                //   },
                // ]
                
              });
          
             // opening and closing details
             $('#table tbody').on('click', 'td.fa-angle-down', function () {
                var tr = $(this).closest('tr');
                var row = table.row( tr );
                if ( row.child.isShown() ) {
                    row.child.hide();
                    tr.removeClass('shown');
                }
                else {
                    id = row.data()[1];
                    loader = $(".loading-spinner").html();
                    row.child(loader).show();
                    getDetails(id).then(response => row.child(fomratDetails(response)).show())
                    tr.addClass('shown');
                }
              });
        });
    })
    .catch(function (error) {
        console.log(error);
    });
