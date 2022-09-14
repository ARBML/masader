const request = axios.create({
  baseURL: "https://masader-web-service.herokuapp.com",
});

function ethicalBadge(text) {
  text = text.toLowerCase();
  if (text == 'low') return '<span class="badge bg-success">Low</span>';
  else if (text == 'medium')
      return '<span class="badge bg-warning">Medium</span>';
  else return '<span class="badge bg-danger text-light">High</span>';
}

function accessBadge(text) {
  text = text.toString().toLowerCase();
  if (text.toLowerCase() == 'free')
      return '<span class="text-sm font-medium  px-2.5 py-0.5" style="background-color: #00800030; color:green; font-weight:bold; border-radius:5px">Free</span>';
  else if (text == 'upon-request')
      return '<span class="badge bg-info px-2.5 py-2">Free Upon Request</span>';
  else return '<span class="badge bg-danger px-2.5 py-2">Paid</span>';
}

function setAttributes(attribute, element){

  if (attribute == "Cost"){
    if(element[attribute] != "nan") return element[attribute]
    else return "0$"
  }else if (attribute == "Access"){
    return accessBadge(element[attribute])
  }
  else if (element[attribute] != "nan"){
    return element[attribute]
  }

  return "unknown"
  
}

const shove = {
  Tasks: [
    "machine translation",
    "speech recognition",
    "information retrieval",
    "sentiment analysis",
    "language modeling",
    "topic classification",
    "dialect identification",
    "text generation",
    "cross-lingual information retrieval",
    "named entity recognition",
    "question answering",
    "information detection",
    "summarization",
    "speaker identification",
    "hate speech detection",
    "morphological analysis",
    "translation",
    "information extraction",
  ],
};

const entries = [
  "Name",
  "Link",
  "Test Split",
  "Cost",
  "Host",
  "Tokenized",
  "Script",
  "Provider",
  "Collection Style",
  "Form",
  "Domain",
  "Dialect",
  "Tasks",
  "Access",
  "License",
  "Language",
  "Unit",
  "Volume",
  "Year",
  "Ethical Risks",
  "Id",
  "Paper Link",
];

const queries = new URLSearchParams(window.location.search);

/**
 * this should return boolean of whatever the key are provided through query or not.
 * @param {string} k
 * @returns {boolean}
 */
const isProvided = (k) =>
  queries.has(k) && (queries.get(k) > 0 || queries.get(k).length > 0);

/**
 * @type {Set<HTMLInputElement>}
 */
const listOfToggable = new Set();

/**
 * @type {HTMLLabelElement}
 */
const form = document.querySelector("#form");

if (isProvided("name")) {
  const name = queries.get("name");
  $("#special").text(name);
  $("input[name='name']").each((_, e) => $(e).val(name));
} else {
  $("#special").text("not provided".toUpperCase());
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  $("#loader").removeClass("hidden");

  const name = $("#form input[name='name']").val();

  if (!name) queries.delete("name");
  else {
    queries.set("name", $("#form input[name='name']").val());
  }

  $("input[name='name']").each((_, e) => $(e).val(`${name}`));

  $("#special").text(name || "not provided".toUpperCase());

  const url = new URL(window.location);

  url.search = `${queries}`;

  window.history.pushState({}, "", url);

  $("#pagination").pagination({
    ulClassName: "pagination",
    dataSource: (cb) => {
      const parameter = new URLSearchParams({
        query: [
          ...(isProvided("name")
            ? [`Name.str.contains('(?i)${queries.get("name")}')`]
            : []),
          ...(isProvided("dialect") ? [`Dialect.str.contains('(?i)${queries.get("dialect")}')`] : []),
          ...(isProvided("license") ? [`License.str.contains('(?i)${queries.get("license")}')`] : []),
          ...(isProvided("access") ? [`Access.str.contains('(?i)${queries.get("access")}')`] : []),
          ...(isProvided("since") ? [`Year > ${queries.get("since")}`] : []),
          ...(isProvided("afore") ? [`Year < ${queries.get("afore")}`] : []),
          ...(listOfToggable.size > 0
            ? Array.from(listOfToggable.values())
                .filter((e) => $(e).children("input")[0].checked)
                .map((e) => $(e).children("input")[0])
                .map((e) => `${e.name}.str.contains('${e.value}')`)
            : []),
        ].join(" and "),
        features: entries,
      });
      request
        .get(`/datasets?${parameter}`)
        .then((response) => response.data)
        .then(cb);
    },
    callback: (data) => {
      let html = "";

      for (let element of data) {
        html += "<li class='flex flex-col gap-3' >";
        html += `<a class='font-bold text-primary' target='_blank' href="${element["Link"]}">${element["Name"]}</a>`;

        html +=
          "<div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-2'>";
        
        html += "<div class='flex justify-between gap-3'>";
        html += `<span class='font-bold capitalize text-gray-600 whitespace-nowrap'>ID</span>`;
        html += `<span class='truncate'>${element.Id}</span>`;
          html += "</div>";
        for (let attribute in element) {
          if (["Id", "Ethical Risks", "Paper Link", "Link", "Name"].includes(attribute))
            continue;
          html += "<div class='flex justify-between gap-3'>";
          html += `<span class='font-bold capitalize text-gray-600 whitespace-nowrap'>${attribute}</span>`;
          html += `<span class='truncate'>${
            setAttributes(attribute, element)
          }</span>`;
          html += "</div>";
        }
        html += "</div>";

        html += "<div class='flex justify-between'>";
        html += `<span class='capitalize font-bold'> Ethical Risks ${ethicalBadge(element["Ethical Risks"])} </span>`;
        html += "<div/>";

        html += "<div class='gap-2 flex'>";
        html += `<a class='capitalize font-bold text-primary' target='_blank' href='./card?id=${element["Id"]}'>details</a>`;
        html += `<a class='capitalize font-bold text-primary' target='_blank' href='${element["Paper Link"]}'>paper link</a>`;
        html += "</div>";

        html += "</li>";
        html += "<li><hr/></li>";
      }

      $("#list-of-detail").html(html);

      $("#loader").addClass("hidden");
    },
  });
});

(() => {
  const queries = new URLSearchParams();

  queries.set("features", ["Dialect", "Tasks", "Access", "License"]);

  request
    .get(`datasets/tags?${queries}`)
    .then((response) => response.data)
    .then((object) => {
      for (let k in object) {
        document.querySelector(`#${k} > div`).addEventListener("click", (e) => {
          $(`#${k} > .body`).toggleClass("max-h-0");
          $(`#${k} > div > i`).toggleClass("fa-chevron-up");
        });

        if (shove[k])
          object[k] = object[k].sort((e) => (shove[k].includes(e) ? -1 : 1));

        for (let index in object[k]) {
          const value = object[k][index];
          const element = document.createElement("label");

          element.classList.add(
            "bg-black/[.02]",
            "border-black/50",
            "text-black/50",
            "border-1",
            "cursor-pointer",
            "rounded-full",
            "py-0.5",
            "px-2.5"
          );

          if (index > 7) element.classList.add("hidden");

          {
            const el = document.createElement("input");

            el.name = k;

            el.value = value;

            el.type = "checkbox";

            el.classList.add("invisible", "w-0", "h-0");

            el.addEventListener("change", (event) => {
              [
                "bg-black/[.02]",
                "border-black/50",
                "text-black/50",
                "bg-[#F95959]/50",
                "border-[#F95959]",
                "text-[#F95959]",
              ].forEach((className) => element.classList.toggle(className));
              submit();
            });

            element.appendChild(el);
          }

          {
            const el = document.createElement("span");

            el.textContent = value;

            element.appendChild(el);
          }

          listOfToggable.add(element);
          document
            .querySelector(`#${k} > .body > ul.options`)
            .appendChild(element);
        }

        const elements = Array.from(listOfToggable).filter(
          (element) => $(element).children("input")[0].name == k
        );

        /**
         * @type {HTMLInputElement}
         */
        const expander = document.querySelector(`#${k} input.expander`);

        /**
         * @type {HTMLInputElement}
         */
        const through = document.querySelector(`#${k} input.through`);

        through.addEventListener("keyup", (event) => {
          const value = event.target.value.toLowerCase();

          if (value.length > 0) $(expander).parent().addClass("hidden");
          else $(expander).parent().removeClass("hidden");

          elements.forEach((el, index) => {
            const isMatching = $(el)
              .children("input")[0]
              .value.toLowerCase()
              .includes(value);

            if ((value.length <= 0 && index > 7) || !isMatching)
              return el.classList.add("hidden");

            el.classList.remove("hidden");
          });
        });

        expander.addEventListener("change", (event) => {
          /**
           * @type {HTMLInputElement}
           */
          const element = event.target;

          /**
           * @type {boolean}
           */
          const isChecked = element.checked;

          elements.map((el, index) => {
            if (!isChecked && index > 7) return el.classList.add("hidden");
            el.classList.remove("hidden");
          });

          $(element)
            .siblings("span")
            .text(`show ${isChecked ? "less" : "more"}`);
        });
      }
    });
})();

document.querySelector("#reset").addEventListener("click", () => {
  Array.from(listOfToggable).map((element) => {
    const isChecked = $(element).children("input")[0].checked;

    if (isChecked)
      element.classList.remove(
        "bg-[#F95959]/50",
        "border-[#F95959]",
        "text-[#F95959]"
      );

    element.classList.add("bg-black/[.02]", "border-black/50", "text-black/50");

    $(element).children("input")[0].checked = false;
    return false;
  });

  Array.from(document.querySelectorAll("#Year input").values()).map(
    (e) => (e.value = "")
  );

  queries.delete("afore");
  queries.delete("since");
  submit();
});

document.querySelectorAll("#Year input").forEach((e) => {
  // ! for some reason keyup mess up the layout because of many request to the form. ig
  e.addEventListener("blur", (event) => {
    queries.set(event.target.name, event.target.value);
    submit();
  });
});

document.querySelector(`#Year > div`).addEventListener("click", (e) => {
  $(`#Year > .body`).toggleClass("max-h-0");
  $(`#Year > div > i`).toggleClass("fa-chevron-up");
});

function submit() {
  $("#submit").click();
}

submit();
