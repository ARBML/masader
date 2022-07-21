const groups = ["LEV", "NOR", "GLF", "MSA", "CLS"];

function getCountriesSubset(groupedData) {
    countries = {};
    for (c in groupedData)
        if (!groups.includes(c))
            countries[c] = groupedData[c]
    
    return countries;
}

function getDialectsSubset(groupedData) {
    countries = {};
    for (c in groupedData)
        if (groups.includes(c))
            countries[c] = groupedData[c]
    
    return countries;
}