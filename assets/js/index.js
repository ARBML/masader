const url = 'https://masader-web-service.herokuapp.com/datasets';

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
        for (let i = 0; i < headersWhiteList.length; i++) {
            headers.push({
                index: i,
                title: headersWhiteList[i],
            });
        }
        let rows = response.data;
        console.log(headers);

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
                1: linkuize(row['Name'], `card?id=${index + 1}`),
                2: link_host,
                3: row['Year'],
                4: getCountry(row['Dialect'] != 'nan' ? row['Dialect'] : ''),
                5: row['Volume'] != 'nan' ? row['Volume'] : '',
                6: row['Unit'] != 'nan' ? row['Unit'] : '',
                7: linkuize(row['Paper Title'], row['Paper Link']),
                8: badgeRender(row['Access']),
                9: itemize(row['Tasks']),
            });
        }

        $.extend($.fn.dataTableExt.oSort, {
            'data-custom-pre': function (a) {
                console.log(a);
            },
        });

        $(document).ready(function () {
            document.getElementById('numDatasets').textContent = dataset.length;
            $('#table').DataTable({
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
                    $('td:eq(9)', row).css('min-width', '200px');
                },
            });
        });
    })
    .catch(function (error) {
        console.log(error);
    });
