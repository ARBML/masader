function linkuize(text, link) {
    if (link != undefined && link != 'nan')
        return `<a href = "${link}" target="_blank"> ${text}</a>`;
    else return 'Not Available';
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
    if (text == 'free') return '<span class="badge bg-success">Free</span>';
    else if (text == 'upon-request')
        return '<span class="badge bg-info">Free Upon Request</span>';
    else return '<span class="badge bg-danger">Paid</span>';
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

function reformat_numbers(num) {
    values = num.split(',');
    if (values.length < 2) {
        return num;
    } else if (values.length == 2) {
        return values[0] + 'K';
    } else return values[0] + 'M';
}
