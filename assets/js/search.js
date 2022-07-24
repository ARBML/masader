const request = axios.create({
  baseURL: "https://masader-web-service.herokuapp.com",
});

const queries = new URLSearchParams(window.location.search);

const Tasks = new Set();

const Dialect = new Set();

const has = (k) =>
  queries.has(k) && (queries.get(k) > 0 || queries.get(k).length > 0);

if (queries.has("name") && queries.get("name").length > 0) {
  const name = queries.get("name");
  $("#special").text(name);
  $("#form input[name='name']").val(name);
} else {
  $("#special").text("not provided".toUpperCase());
}

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
];

$("#form").on("submit", (event) => {
  event.preventDefault();

  if (has("name")) queries.set("name", $("#form input[name='name']").val());
  else queries.delete("name");

  const url = new URL(window.location);

  url.search = `${queries}`;

  window.history.pushState({}, "", url);

  $("#pagination").pagination({
    ulClassName: "pagination",
    // TODO: custom style pagination
    className: "custom-paginationjs",
    pageNumber: has("page") ? queries.get("page") : 1,
    dataSource: (cb) => {
      const parameter = new URLSearchParams({
        query: [
          ...(has("name")
            ? [`Name.str.contains('(?i)${queries.get("name")}')`]
            : []),
          ...(has("since") ? [`Year > ${queries.get("since")}`] : []),
          ...(has("afore") ? [`Year < ${queries.get("afore")}`] : []),
          ...(Tasks.size > 0
            ? Array.from(Tasks.values()).map(
                (task) => `Tasks.str.contains('${task}')`
              )
            : []),
          ...(Dialect.size > 0
            ? Array.from(Dialect.values()).map(
                (dialect) => `Dialect.str.contains('${dialect}')`
              )
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
          string += "<div class='flex justify-between gap-3'>";
          string += `<span class='font-bold capitalize text-gray-600 whitespace-nowrap'>${attribute}</span>`;
          string += `<span class='truncate'>${element[attribute]}</span>`;
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

has("since") && $("#since").val(queries.get("since"));
has("afore") && $("#afore").val(queries.get("afore"));

$("#since").on("blur", (event) => {
  if (isNaN($("#since").val())) return;
  queries.set("since", $("#since").val());
  $("#submit").click();
});

$("#afore").on("blur", (event) => {
  if (isNaN($("#afore").val())) return;
  queries.set("afore", $("#afore").val());
  $("#submit").click();
});

function createToggable(column, value) {
  let string = "";
  string += `<label class='toggable-for-${column} ${
    (column == "Tasks" ? Tasks.has(value) : Dialect.has(value))
      ? "bg-[#F95959]/50 border-[#F95959] text-[#F95959]"
      : "bg-black/[.02] border-black/50 text-black/50"
  } border-1 cursor-pointer rounded-full py-0.5 px-2.5'>`;
  string += `<input onchange='onChecked("${column}", "${value}");' type='checkbox' name='${value}' class='invisible w-0 h-0'/>`;
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
      for (let e of data["Tasks"]) string += createToggable("Tasks", e);

      $("#list-of-tasks").html(string);

      $("#search-through-tasks").on("change", (event) => {
        $(".toggable-for-Tasks").each((_, element) => {
          if (!event.target.value) $(element).show();
          if (
            !$(element)
              .find("input")
              .attr("name")
              .toLowerCase()
              .includes(event.target.value.toLowerCase())
          ) {
            $(element).hide();
          }
        });
      });
    })();

    (() => {
      let string = "";
      for (let e of data["Dialect"]) string += createToggable("Dialect", e);

      $("#list-of-dialect").html(string);

      $("#search-through-dialect").on("change", (event) => {
        $(".toggable-for-Dialect").each((_, element) => {
          if (!event.target.value) $(element).show();
          if (
            !$(element)
              .find("input")
              .attr("name")
              .toLowerCase()
              .includes(event.target.value.toLowerCase())
          ) {
            $(element).hide();
          }
        });
      });
    })();
  });

$("#submit").click();

function onChecked(column, value) {
  if (column == "Tasks")
    Tasks.has(value) ? Tasks.delete(value) : Tasks.add(value);
  else Dialect.has(value) ? Dialect.delete(value) : Dialect.add(value);

  $(`label:has(input[name='${value}'])`).toggleClass(
    "bg-[#F95959]/50 border-[#F95959] bg-black/[.02] border-black/50 text-[#F95959] text-black/50"
  );

  $("#submit").click();
}

$("#show-more-of-dialect").on("change", (event) => {
  const isChecked = event.target.checked;

  $("#list-of-dialect").toggleClass("max-h-36");
  if (isChecked) $("#show-more-of-dialect + span").text("show less");
  else $("#show-more-of-dialect + span").text("show more");
});

$("#show-more-of-tasks").on("change", (event) => {
  const isChecked = event.target.checked;

  $("#list-of-tasks").toggleClass("max-h-36");
  if (isChecked) $("#show-more-of-tasks + span").text("show less");
  else $("#show-more-of-tasks + span").text("show more");
});
