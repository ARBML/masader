const url = 'https://masader-web-service.herokuapp.com/datasets';

function linkuize(text, link) {
    if (link != undefined && link != 'nan')
        return `<a href = "${link}" target="_blank" class="shorterText"> ${text}</a>`;
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
        return '<span class="badge bg-success">Free</span>';
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
  return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
  '<tr>'+
  '<td>Name</td>'+
    '<td>'+data['Name']+'</td>'+
      '</tr>'+
      '<tr>'+
      '<td>Created At</td>'+
      '<td>'+data['year']+'</td>'+
      '</tr>'+
      '<tr>'+
      '<td>Volume</td>'+
      '<td>'+ data['Volume'] +'</td>'+
      '</tr>'+
      '</table>';
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
          className:      'details-control',
          orderable:      false,
          data:           null,
          defaultContent: ''
      
      })
        for (let i = 0; i < headersWhiteList.length; i++) {
            headers.push({
                index: ++i,
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
                2: linkuize(row['Name'], `card?id=${index + 1}`),
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
                createdRow: function (row, data, dataIndex) {
                    $('td:eq(`10`)', row).css('min-width', '200px');
                },"columnDefs": [
                  {
                      "targets": 0,
                      "render": function ( data, type, row ) {
                          return "<i class='fa-solid fa-angle-down'></i>";
                      }
                  },
                ]
                
              });
          
             // opening and closing details
             $('#table tbody').on('click', 'td.details-control', function () {
                var tr = $(this).closest('tr');
                var row = table.row( tr );
                console.log(row,"row")
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
