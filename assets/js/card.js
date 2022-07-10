let url = "https://masader-web-service.herokuapp.com/datasets/";
let isReportFormOpen = false;

$("#reportForm").hide();

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
    result += `<tr><td><b>${subset["Name"]}</b></td><td>${subset["Volume"]}</td></tr>`;
  })
  result += '</tbody></table>'
  return result
}

function itemize(text) {
  tasks = text.split(",")
  output = '<ul class="list-group list-group-flush bg-transparent">'
  for (let i = 0; i < tasks.length; i++) {
    output += '<li class="list-group-item bg-transparent">' + tasks[i].trim().replaceAll(' ', '-') + '</li>'
  }
  output += "</ul>"
  return output
}

function onReportBtnClicked() {

  if (isReportFormOpen) {
    document.getElementById("reportBtn").innerHTML = "Report issues with this card";
    $("#reportForm").hide();

  } else {
    document.getElementById("reportBtn").innerHTML = "Close";
    $("#reportForm").show();

  }

  isReportFormOpen = !isReportFormOpen;

}

async function onSendReportBtnClicked() {

  let issueForm = document.getElementById('issueMessage');
  const cardId = new URL(window.location.href).searchParams.get('id');

  const response = await fetch(`${url}${cardId}/issues`, {
    method: 'POST',
    body: JSON.stringify({ body: issueForm.value }),
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    const responseData = await response.json()

    onReportBtnClicked();
    issueForm.value = "";
    tata.success('Issues opend succesfully',
      `Thank you for openeing this issue, you can track this issue at ${responseData['issue_url']}`);

  } else {

    tata.error('Error during opening the issue', 'Please try again later, or contact us via our discord server');

  }

}

// get id from page parameters
const urlParams = new URLSearchParams(window.location.search);
const card_id = urlParams.get('id');


axios
  .get(url + card_id)
  .then(function (response) {
    let headers = [];
    let headersWhiteList = [
      "Name",
      "Link",
      "Year",
      "Volume",
      "Unit",
      "Paper Link",
      "Access",
      "Tasks",
      "License",
      "Language",
      "Dialect",
      "Domain",
      "Form",
      "Collection Style",
      "Ethical Risks",
      "Provider",
      "Derived From",
      "Script",
      "Tokenized",
      "Host",
      "Cost",
      "Test Split",
      "Subsets",
    ];

    $(".loading-spinner").hide();
    for (let i = 0; i < headersWhiteList.length; i++) {
      headers.push({
        index: i,
        title: headersWhiteList[i],
      });
    }
    let row = response.data;
    console.log(row);

    let dataset = [];

    for (let i = 0; i < headers.length; i++) {
      let element = headers[i]
      let value =
        row[element.title] != "nan" ? row[element.title] : "N/A";
      console.log(element.title, value);
      if (value == "N/A") {
        dataset.push({
          0: element.title,
          1: "",
        });
        continue
      }
      if (element.title == "Ethical Risks") {
        value = ethicalBadge(value); // calling "ethicalBadge" function to put some style to the value
      } else if (element.title == "Link" || element.title == "Paper Link") {
        value = linkuize(value, value);
      } else if (element.title == "Subsets") {
        if (row[element.title] != "nan") {
          let subsets = row[element.title];
          value = createSubsets(subsets);
        }
      } else if (element.title == "Tasks") {
        value = itemize(value);
      }
      dataset.push({
        0: element.title,
        1: value,
      });
    }
    console.log(dataset);
    $(document).ready(function () {
      $("#table_card").DataTable({
        data: dataset,
        columns: [
          {
            title: "Attribute",
          },
          {
            title: "Value",
          },
        ],
        lengthMenu: [10, 25, 50, 75, 100, 250],
        scrollCollapse: true,
        // scrollY: "720px",
        scrollCollapse: true,
        paging: false,
        order: [],
        bInfo: false,
      });
    });
  })
  .catch(function (error) {
    console.log(error);
  });

document.getElementById("reportBtn").addEventListener("click", onReportBtnClicked);
document.getElementById("sendReportBtn").addEventListener("click", onSendReportBtnClicked);