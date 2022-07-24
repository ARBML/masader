const request = axios.create({
  baseURL: "https://masader-web-service.herokuapp.com",
});

const queries = new URLSearchParams(window.location.search);

const hightRankTasks = [
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
];

/**
 * @type {Set<HTMLInputElement>}
 */
const listOfTasks = new Set();

/**
 * @type {Set<HTMLInputElement>}
 */
const listOfDialect = new Set();

const entries = [
  "Name",
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

/**
 * this should return boolean of whatever the key are provided through query or not.
 * @param {string} k
 * @returns {boolean}
 */
const isProvided = (k) =>
  queries.has(k) && (queries.get(k) > 0 || queries.get(k).length > 0);

if (isProvided("name")) {
  const name = queries.get("name");
  $("#special").text(name);
  $("#form input[name='name']").val(name);
} else {
  $("#special").text("not provided".toUpperCase());
}

$("#form").on("submit", (event) => {
  event.preventDefault();

  if (isProvided("name"))
    queries.set("name", $("#form input[name='name']").val());
  else queries.delete("name");

  const url = new URL(window.location);

  url.search = `${queries}`;

  window.history.pushState({}, "", url);

  $("#pagination").pagination({
    ulClassName: "pagination",
    // TODO: custom style pagination
    className: "custom-paginationjs",
    pageNumber: isProvided("page") ? queries.get("page") : 1,
    dataSource: (cb) => {
      const parameter = new URLSearchParams({
        query: [
          ...(isProvided("name")
            ? [`Name.str.contains('(?i)${queries.get("name")}')`]
            : []),
          ...(isProvided("since") ? [`Year > ${queries.get("since")}`] : []),
          ...(isProvided("afore") ? [`Year < ${queries.get("afore")}`] : []),
          ...(listOfTasks.size > 0
            ? Array.from(listOfTasks.values())
                .filter((e) => e.checked)
                .map((e) => `Tasks.str.contains('${e.value}')`)
            : []),
          ...(listOfDialect.size > 0
            ? Array.from(listOfDialect.values())
                .filter((e) => e.checked)
                .map((e) => `Dialect.str.contains('${e.value}')`)
            : []),
        ].join(" and "),
        features: entries,
      });

      request
        .get(`/datasets?${parameter}`)
        .then((response) => response.data)
        .then(cb);
    },
    callback: (data, pagination) => {
      let string = "";

      for (let element of data) {
        string += "<li class='flex flex-col gap-3' >";
        string += `<h3 class='font-bold text-lg'>${element.Name}</h3>`;

        string +=
          "<div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-2'>";
        for (let attribute in element) {
          if (attribute == "Id") continue;
          string += "<div class='flex justify-between gap-3'>";
          string += `<span class='font-bold capitalize text-gray-600 whitespace-nowrap'>${attribute}</span>`;
          string += `<span class='truncate'>${
            element[attribute] != "nan" ? element[attribute] : "unknown"
          }</span>`;
          string += "</div>";
        }
        string += "</div>";

        string += "<div class='flex justify-between'>";
        string += `<span class='capitalize font-bold'>${element["Ethical Risks"]} Ethical Risk</span>`;
        string += "<div/>";

        string += "<div class='gap-2 flex'>";
        string += `<a class='capitalize font-bold' target='_blank' href='./card?id=${element["Id"]}'>details</a>`;
        string += `<a target='_blank' href='${element["Paper Link"]}' class='capitalize font-bold'>paper link</a>`;
        string += "</div>";

        string += "</li>";
        string += "<li><hr/></li>";
      }

      $("#list-of-detail").html(string);
    },
  });
});

isProvided("since") && $("#since").val(queries.get("since"));
isProvided("afore") && $("#afore").val(queries.get("afore"));

$("#since").on("blur", (event) => {
  queries.set("since", $("#since").val());
  $("#submit").click();
});

$("#afore").on("blur", (event) => {
  queries.set("afore", $("#afore").val());
  $("#submit").click();
});

function createToggable(column, value) {
  let string = "";
  string += `<label class='bg-black/[.02] border-black/50 text-black/50 border-1 cursor-pointer rounded-full py-0.5 px-2.5'>`;
  string += `<input type='checkbox' value='${value}' name='${column}' class='invisible w-0 h-0'/>`;
  string += `<span>${value}</span>`;
  string += "</label>";

  return string;
}

request
  .get("/datasets/tags?features=Dialect,Tasks")
  .then((resposne) => resposne.data)
  .then((data) => {
    (() => {
      let string = "";
      data["Tasks"] = data["Tasks"].sort((a) =>
        hightRankTasks.includes(a) ? -1 : 1
      );

      for (let value of data["Tasks"]) string += createToggable("Tasks", value);

      $("#list-of-tasks").html(string);

      $("label:has(input[name='Tasks'])").each((i, parent) => {
        if (i > 7) $(parent).addClass("hidden");
        listOfTasks.add($(parent).children("input")[0]);
        $(parent)
          .children("input")
          .on("change", (e) => {
            $(parent).toggleClass(
              "bg-[#F95959]/50 border-[#F95959] bg-black/[.02] border-black/50 text-[#F95959] text-black/50"
            );
            $("#submit").click();
          });
      });

      $("#search-through-tasks").on("change", (event) => {
        let i = 0;
        if (!event.target.value) $("#show-more-of-tasks").parent().show();
        else $("#show-more-of-tasks").parent().hide();
        listOfTasks.forEach((e) => {
          if (!event.target.value) {
            $(e).parent().removeClass("hidden");
            if (i++ > 7) $(e).parent().addClass("hidden");
            return;
          }
          if (
            !e.value.toLowerCase().includes(event.target.value.toLowerCase())
          ) {
            return $(e).parent().addClass("hidden");
          }

          $(e).parent()[0].classList.contains("hidden") &&
            $(e).parent()[0].classList.remove("hidden");
        });
      });
    })();

    (() => {
      let string = "";
      for (let e of data["Dialect"]) string += createToggable("Dialect", e);

      $("#list-of-dialect").html(string);

      $("label:has(input[name='Dialect'])").each((i, parent) => {
        if (i > 7) $(parent).addClass("hidden");
        listOfDialect.add($(parent).children("input")[0]);
        $(parent)
          .children("input")
          .on("change", (e) => {
            $(parent).toggleClass(
              "bg-[#F95959]/50 border-[#F95959] bg-black/[.02] border-black/50 text-[#F95959] text-black/50"
            );
            $("#submit").click();
          });
      });

      $("#search-through-dialect").on("change", (event) => {
        let i = 0;
        if (!event.target.value) $("#show-more-of-dialect").parent().show();
        else $("#show-more-of-dialect").parent().hide();
        listOfDialect.forEach((e) => {
          if (!event.target.value) {
            $(e).parent().removeClass("hidden");
            if (i++ > 7) $(e).parent().addClass("hidden");
            return;
          }
          if (
            !e.value.toLowerCase().includes(event.target.value.toLowerCase())
          ) {
            return $(e).parent().addClass("hidden");
          }

          $(e).parent()[0].classList.contains("hidden") &&
            $(e).parent()[0].classList.remove("hidden");
        });
      });
    })();
  });

$("#submit").click();

$("#show-more-of-dialect").on("change", (event) => {
  const isChecked = event.target.checked;

  const elements = Array.from(listOfDialect);
  console.log($($(event[0]).siblings("span")));

  if (isChecked) {
    elements.map((e) => $(e).parent().removeClass("hidden"));
    $("#show-more-of-dialect + span").text("show less");
  } else {
    $("#show-more-of-dialect + span").text("show more");
    $(event[0]).siblings("span").text("show more");
    elements
      .slice(9, elements.length)
      .map((e) => $(e).parent().addClass("hidden"));
  }
});

$("#show-more-of-tasks").on("change", (event) => {
  const isChecked = event.target.checked;

  const elements = Array.from(listOfTasks);

  if (isChecked) {
    elements.map((e) => $(e).parent().removeClass("hidden"));
    $("#show-more-of-tasks + span").text("show less");
  } else {
    $("#show-more-of-tasks + span").text("show more");
    elements
      .slice(9, elements.length)
      .map((e) => $(e).parent().addClass("hidden"));
  }
});

function Reset() {
  [...listOfTasks, ...listOfDialect].forEach((e) => {
    e.checked = false;
    $(e).parent().addClass("bg-black/[.02] border-black/50 text-black/50");
    $(e)
      .parent()
      .removeClass("bg-[#F95959]/50 border-[#F95959] text-[#F95959]");
  });
  $("#show-more-of-dialect + span").text("show more");
  $("#show-more-of-tasks + span").text("show more");
  $("#since").val("");
  $("#afore").val("");
  queries.delete("since");
  queries.delete("afore");
  $("#submit").click();
}
