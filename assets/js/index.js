const url = 'https://masader-web-service.herokuapp.com/datasets';
const contributers_url = 'https://masader-web-service.herokuapp.com/datasets/tags?features=Added By'

function linkuize(text, link, short = true) {
    if (link != undefined && link != 'nan')
        return `<a href = "${link}" target="_blank" class="#${(short) ? "shorterText " : ""}underline"> ${text}</a>`;
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
        return '<span class="text-sm font-medium  px-2.5 py-0.5" style="background-color: #00800030; color:green; font-weight:bold; border-radius:5px">Free</span>';
    else if (text == 'upon-request')
        return '<span class="badge bg-info px-2.5 py-2">Free Upon Request</span>';
    else return '<span class="badge bg-danger px-2.5 py-2">Paid</span>';
}

function reformat_numbers(num) {
    values = num.split(',');
    if (values.length < 2) {
        return num;
    } else if (values.length == 2) {
        return values[0] + 'K';
    } else return values[0] + 'M';
}

async function getDetails(id) {
  return axios.get(url+"/"+id).then(response => response.data)
}

async function getOGimage(url) {
    // return axios.get(url).then(response => {
    //     let patren = /<meta property="og:image" content="(.*?)" \/>/g
    //     for (const match of response.data.matchAll(patren)) {
    //         return match[1]
    //     }
    // }).catch(() => {
    //     return "./assets/images/logo.png"
    // })

    if (url.includes("github"))
    {
        let owner = url.split("/")
        let preview = `https://opengraph.githubassets.com/1/${owner[3]}/${owner[4]}`
        return preview
    }
    else
    return "./assets/images/logo.png"
}

async function fomratDetails(data, index){
    // console.log(data, "s")
    await getOGimage(data['Link']).then(res => {
        return (res) ? image = res : image = "./assets/images/logo.png"

    })
  return '<div class="grid grid-cols-4">'+
            '<div class="col-span-1">'+
                // '<a class="text-center fs-3">'+ linkuize(data['Paper Title'], data['Paper Link'])+'</a>'+
                // '<a href = "'+data['Link']+'" target="_blank" class="shorterText underline mx-4" style="width: 70%"> '+data['Link']+'</a>'+
                '<a style="line-height: 9rem;" target="_blank" href="' + data['Link'] + '"><img style="width: 70%;" class="shorterText underline mx-4" src="'+ image +'"/></a>'+

            '</div>'+
            '<div class="col-span-3 relative ">'+
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
                        '<span class="text-gray-800">'+(data['Cost'] != 'nan' ? row['Cost'] : 'Not Available') +'</span>'+
                    '</div>'+
                    ' <div class="grid grid-cols-2  ">'+
                        '<span class="text-gray-400">Test Split</span>'+
                        '<span class="text-gray-800">'+data['Test Split'] +'</span>'+
                    '</div>'+
                '</div>'+
                '<div class="collapse-footer flex justify-end gap-x-5 mt-7">'+
                '<a href="'+`card?id=${index}`+ '" class="underline font-normal">Details</a>'+
                '<a href="'+data["Paper Link"]+'" target="_blank" class="underline font-normal">Paper</a>'+
            '</div>'+
        '</div>'
   // })
 }

 async function getContributersNum()
 {
    try {
        let res = await axios({
             url: contributers_url,
             method: 'get',
         }) 
         return res.data["Added By"].length
     }
     catch (err) {
         console.error(err);
     }
}

axios
    .get(url, {
        onDownloadProgress: (progressEvent) => {},
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
          className:      'fa-solid button table-cell flex rounded-tl-lg',
          orderable:      false,
          data:           null,
          defaultContent: ''
      
      })
        for (let i = 0; i < headersWhiteList.length; i++) {
            headers.push({
                index: 1+i,
                title: headersWhiteList[i].toUpperCase(),
            });
        }
        // console.log(headers[headers.length - 1].className = "rounded-tr-lg ")
        let rows = response.data;
        // console.log(headers);

        //  Createing table data
        let dataset = [];
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            var host = row['Host']
            if (host == 'other') host = "External Link"
            let link_host = linkuize(host, row['Link']);
            if (row['HF Link'] != 'nan') {
                link_host += '</br>' + linkuize(getIcon('hf'), row['HF Link']);
            }
            dataset.push({
                0: index + 1,
                1: index + 1,
                2: linkuize(row['Name'], `card?id=${index+1}`, false),
                3: link_host,
                4: row['Year'],
                5: getCountry(row['Dialect'] != 'nan' ? row['Dialect'].charAt(0).toUpperCase() + row['Dialect'].slice(1) : ''),
                6: row['Volume'] != 'nan' ? row['Volume'] : '',
                7: row['Unit'] != 'nan' ? row['Unit'].charAt(0).toUpperCase() + row['Unit'].slice(1) : '',
                8: linkuize(row['Paper Title'], row['Paper Link']),
                9: badgeRender(row['Access']),
                10: itemize(row['Tasks']),
            });
        }

        $.extend($.fn.dataTableExt.oSort, {
            'data-custom-pre': function (a) {
                // console.log(a);
            },
        });

        $(document).ready(function () {
            document.getElementById('numDatasets').textContent = dataset.length;
            getContributersNum().then(res => 
                document.getElementById('numContributers').textContent = res)
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
                order: [[1, 'asc']],
                searching: true
                // "columnDefs": [
                //   {
                //       "targets": 9,
                //       "render": function ( data, type, row ) {
                //         console.log(data)
                //         //   if (data == "free") return badgeRender(row['Access'])
                //       }
                //   },
                // ]
                
              });
          
             // opening and closing details
             $('#table tbody').on('click', 'td.button', function () {
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
                    getDetails(id).then(async (response) =>
                      row.child(await fomratDetails(response, id)).show()
                    );
                    tr.addClass('shown');
                }
              });
        });
    })
    .catch(function (error) {
        console.log(error);
    });
