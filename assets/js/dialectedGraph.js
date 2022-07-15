function createDialectedGraph(groupData, headers) {
    $('#myChart').hide();
    $('#chartdiv').show();
    
    const formattedData = groupedDialect(groupData)
    console.log(formattedData);

}
