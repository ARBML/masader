// TODO: MAKE IT BETTER. REFACTOR...

class Client {
  static _endpoint = "https://masader-web-service.herokuapp.com/datasets";

  /**
   *
   * @param {string} path
   * @returns {Promise<any>}
   */
  static fetch(path) {
    return axios
      .get(`${this._endpoint}${path}`)
      .then((response) => response.data);
  }

  /**
   *
   * @param {any} object any object data
   * @return {string} querified object
   */
  static querifing(object) {
    return `${new URLSearchParams(object)}`;
  }

  /**
   *
   * @param {any} query
   * @returns {Promise<any[]>}
   */
  static fetchDataSet(query) {
    return this.fetch(`?${this.querifing(query)}`).then((data) => {
      return data;
    });
  }

  /**
   *
   * @param {string[]} listOfTag
   * @returns {Promise<{ [k: string]: string[]}>}
   */
  static fetchTag(listOfTag) {
    return this.fetch(`/tags?${this.querifing({ features: listOfTag })}`);
  }
}

class Interface {
  static listOfTogglable = new Map();

  static listOfDatasetCard = new Map();

  /**
   *
   * @param {string} value the value of the toggle button
   * @return {HTMLLabelElement}
   */
  static createTogglableChoice(value) {
    const label = document.createElement("label");

    label.classList.add(
      "border-1",
      "border-[#F95959]",
      "bg-[#F95959]/10",
      "rounded-full",
      "py-0.5",
      "px-2.5"
    );

    const check = document.createElement("input");

    check.type = "checkbox";

    check.name = value;

    check.classList.add("invisible", "w-0", "h-0");

    label.appendChild(check);

    const span = document.createElement("span");

    span.classList.add("text-[#F95959]");

    span.textContent = value;

    label.appendChild(span);

    return label;
  }

  /**
   *
   * @param {any} information
   * @return {HTMLLIElement}
   */
  static createDatasetCard(information) {
    const element = document.createElement("li");

    element.classList.add("flex", "flex-col", "gap-3");

    element.append(
      // this is the top part of the card
      (() => {
        const element = document.createElement("h3");

        element.classList.add("font-bold", "text-lg");

        element.textContent = information.Name;
        return element;
      })(),
      // this is the middle part of the card
      (() => {
        const element = document.createElement("div");

        element.classList.add(
          "grid",
          "grid-cols-1",
          "md:grid-cols-2",
          "lg:grid-cols-3",
          "gap-x-12",
          "gap-y-2"
        );

        const informative = {
          "Created At": document.createTextNode(information["Year"]),
          Volume: document.createTextNode(information["Volume"]),
          Unit: document.createTextNode(information["Unit"]),
          Language: document.createTextNode(information["Language"]),
          License: document.createTextNode(information["License"]),
          Accessibility: document.createTextNode(information["Access"]),
          Tasks: document.createTextNode(information["Tasks"]),
          Dialect: document.createTextNode(information["Dialect"]),
          Domain: document.createTextNode(information["Domain"]),
          Form: document.createTextNode(information["Form"]),
          "Collection Style": document.createTextNode(
            information["Collection Style"]
          ),
          Provider: document.createTextNode(information["Provider"]),
          Script: document.createTextNode(information["Script"]),
          Tokenized: document.createTextNode(information["Tokenized"]),
          Host: document.createTextNode(information["Host"]),
          Cost: document.createTextNode(information["Cost"]),
          "Test Split": document.createTextNode(information["Test Split"]),
        };

        for (let key in informative) {
          const value = informative[key];

          element.appendChild(
            (() => {
              const element = document.createElement("div");

              element.classList.add("flex", "justify-between", "gap-3");

              element.append(
                (() => {
                  const element = document.createElement("span");

                  element.classList.add(
                    "font-bold",
                    "capitalize",
                    "text-gray-600",
                    "whitespace-nowrap"
                  );

                  element.textContent = key;

                  return element;
                })(),
                (() => {
                  const element = document.createElement("span");
                  element.classList.add("truncate");
                  element.appendChild(value);
                  return element;
                })()
              );

              return element;
            })()
          );
        }

        return element;
      })(),
      // this is the bottom part of the card
      (() => {
        const element = document.createElement("div");

        element.classList.add("flex", "justify-between");

        element.append(
          // the ethical level
          (() => {
            const element = document.createElement("span");

            element.classList.add("capitalize", "font-bold");

            element.textContent = `${information["Ethical Risks"]} Ethical Risk`;

            return element;
          })(),
          (() => {
            const element = document.createElement("div");

            element.classList.add("gap-2", "flex");

            // more details re-directions
            element.append(
              (() => {
                const anchor = document.createElement("a");

                anchor.textContent = "details";
                return anchor;
              })(),
              (() => {
                const anchor = document.createElement("a");

                information["Paper Link"] != "nan" &&
                  (anchor.href = information["Paper Link"]);

                anchor.target = "_blank";

                anchor.textContent = "paper link";
                return anchor;
              })()
            );

            return element;
          })()
        );

        return element;
      })()
    );

    return element;
  }

  /**
   * @return {HTMLSpanElement}
   */
  static get qoute() {
    return document.querySelector(".in-quote");
  }

  /**
   * @return {HTMLFormElement}
   */
  static get form() {
    return document.querySelector("#form-engine");
  }

  static moreOf(identity, data) {
    document.getElementById(identity).innerHTML = "";
    for (let index in data) {
      const value = data[index];

      const element = Interface.createTogglableChoice(value);

      if (Interface.listOfTogglable.has(value)) {
        element.classList.toggle("bg-[#F95959]/10");
        element.classList.toggle("bg-[#F95959]/30");

        Interface.listOfDatasetCard.set(value, element);
      }

      element.firstChild.addEventListener("change", (event) => {
        Search.configuration.fields[identity] ??= [];

        const index = Search.configuration.fields[identity].findIndex(
          (e) => e == value
        );

        if (index > -1) {
          Search.configuration.fields[identity].splice(index, 1);
          Interface.listOfTogglable.delete(value);
        } else {
          Search.configuration.fields[identity].push(value);
          Interface.listOfTogglable.set(value, element);
        }

        element.classList.toggle("bg-[#F95959]/10");
        element.classList.toggle("bg-[#F95959]/30");

        setTimeout(ReSearch, 0);
      });

      document.getElementById(identity).appendChild(element);
    }
  }

  static lessOf(identity, data) {
    document.getElementById(identity).innerHTML = "";
    for (let index in data.slice(0, 6)) {
      const value = data[index];

      const element = Interface.createTogglableChoice(value);

      const isToggled = Search.configuration.fields[identity]?.includes(value);

      if (isToggled) {
        element.classList.toggle("bg-[#F95959]/10");
        element.classList.toggle("bg-[#F95959]/30");
      }

      element.firstChild.addEventListener("change", (event) => {
        Search.configuration.fields[identity] ??= [];

        const index = Search.configuration.fields[identity].findIndex(
          (e) => e == value
        );

        if (index > -1) {
          Search.configuration.fields[identity].splice(index, 1);
          Interface.listOfTogglable.delete(value);
        } else {
          Search.configuration.fields[identity].push(value);
          Interface.listOfTogglable.set(value, element);
        }

        element.classList.toggle("bg-[#F95959]/10");
        element.classList.toggle("bg-[#F95959]/30");

        setTimeout(ReSearch, 0);
      });

      document.getElementById(identity).appendChild(element);
    }
  }

  /**
   *
   * @param {number} index
   * @param {any[]} data
   */
  static pagination(index, data) {}
}

class Search {
  /**
   * @type {{ fields: { name?: string, since?: number, afore?: number }, entries: string[] }}
   */
  static configuration = {
    fields: {
      name: new URLSearchParams(window.location.search).get("q"),
    },
  };

  /**
   *
   * @param {string} key this would map the key to backend compatible key.
   * @return {string}
   */
  static mapping(key) {
    switch (key) {
      case "since":
      case "afore":
        return "Year";
      default:
        // it should capitalize the key value. hello, world -> Hello, World
        return key
          .split(" ")
          .map((key) => `${key[0].toUpperCase()}${key.slice(1, key.length)}`)
          .join(" ");
    }
  }

  /**
   *
   * @param {string} key unmapped key name
   * @return {"==" | ">" | "<"} the comparation sign
   */
  static sign(key) {
    switch (key) {
      case "since":
        return ">";
      case "afore":
        return "<";
      case "Tasks":
        return "Tasks.str.contains";
      case "Dialect":
        return "Dialect.str.contains";
      default:
        return "==";
    }
  }

  /**
   *
   * @param {string} key the key you would parse
   * @param {string | number} value the value you would compare with
   * @param {Boolean} contain if it should use contain or not
   * @return {string}
   */
  static parsing(key, value, contain = false) {
    if (contain) return `${this.sign(key)}('${value}')`;
    return `${this.mapping(key)} ${this.sign(key)} ${
      typeof value == "string" ? `'${value}'` : value
    }`;
  }

  /**
   *
   * @param {any} value
   * @return {boolean}
   */
  static isValuable(value) {
    switch (typeof value) {
      case "object":
        return value.length > 0;
      case "number":
        return true;
      default:
        return !!value;
    }
  }

  /**
   *
   * @param {{ fields: any, entries: any}} configuration the request configuration aka fields, data
   * @return {Promise<any[]>}
   */
  static request(configuration = Search.configuration) {
    const query = {
      // this should go through every key in fields and parse it. name: Shami -> Name == Shami ...
      query: Object.entries(configuration.fields)
        .filter(([_, value]) => this.isValuable(value))
        .map(([key, value]) => {
          if (typeof value == "object")
            return value.map((e) => this.parsing(key, e, true)).join(" and ");
          else return this.parsing(key, value);
        })
        .join(" and "),
      // this will define featrues key if entries is provided
      ...(!!configuration.entries?.length && {
        features: configuration.entries.join(","),
      }),
    };

    return Client.fetchDataSet(query);
  }

  static reset() {
    this.configuration = {
      fields: { name: Search.configuration.fields.name },
      entries: [],
    };

    Interface.listOfTogglable.forEach((element) => {
      element.classList.add("bg-[#F95959]/10");
      element.classList.remove("bg-[#F95959]/30");
    });

    Interface.form.q.value = this.configuration.fields.name;

    document.querySelector("#afore").value = null;
    document.querySelector("#since").value = null;

    ReSearch();
  }
}

Interface.form.q.value = Search.configuration.fields.name;

Interface.qoute.textContent = Interface.form.q.value;

Interface.form.addEventListener("submit", (e) => {
  e.preventDefault();
  Search.configuration.fields.name = Interface.form.q.value;
  Interface.qoute.textContent = Interface.form.q.value;

  const url = new URL(document.location);

  url.search = `${new URLSearchParams({ q: Interface.form.q.value })}`;

  window.history.pushState({}, "", `${url}`);
  ReSearch();
});

Client.fetchTag(["Tasks", "Dialect"]).then((data) => {
  const _data = { ...data };

  for (let k in _data) Interface.lessOf(k, _data[k]);

  document
    .querySelector("#collapse-dialect > input[type='text']")
    .addEventListener("change", (event) => {
      if (event.target.value.length == 0) {
        data = { ..._data };
        return Interface.lessOf("Dialect", data["Dialect"]);
      }

      data["Dialect"] = _data["Dialect"].filter((e) =>
        e.toLowerCase().includes(event.target.value.toLowerCase())
      );

      if (data["Dialect"].length == 0) {
        data = { ..._data };
        return Interface.lessOf("Dialect", data["Dialect"]);
      }

      Interface.moreOf("Dialect", data["Dialect"]);
    });

  document
    .querySelector("#collapse-tasks > input[type='text']")
    .addEventListener("change", (event) => {
      if (event.target.value.length == 0) {
        data = { ..._data };
        return Interface.lessOf("Tasks", data["Tasks"]);
      }

      data["Tasks"] = _data["Tasks"].filter((e) =>
        e.toLowerCase().includes(event.target.value.toLowerCase())
      );

      if (data["Tasks"].length == 0) {
        data = { ..._data };
        return Interface.lessOf("Tasks", data["Tasks"]);
      }

      Interface.moreOf("Tasks", data["Tasks"]);
    });

  document
    .querySelector("#show-more-for-tasks")
    .addEventListener("change", (event) => {
      if (event.target.checked) {
        Interface.moreOf("Tasks", data["Tasks"]);
        document.querySelector(`#${event.target.id} + span`).textContent =
          "show less";
      } else {
        Interface.lessOf("Tasks", data["Tasks"]);
        document.querySelector(`#${event.target.id} + span`).textContent =
          "show more";
      }
    });

  document
    .querySelector("#show-more-for-dialect")
    .addEventListener("change", (event) => {
      console.log(event.target.id);
      if (event.target.checked) {
        Interface.moreOf("Dialect", data["Dialect"]);
        document.querySelector(`#${event.target.id} + span`).textContent =
          "show less";
      } else {
        Interface.lessOf("Dialect", data["Dialect"]);
        document.querySelector(`#${event.target.id} + span`).textContent =
          "show more";
      }
    });
});

function ReSearch() {
  document.querySelector("#showcase").innerHTML = "";

  const element = document.querySelector("#showcase");

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
  ];

  Search.request({ ...Search.configuration, entries })
    .then((data) => {
      let limit = 16;
      let currentPage = 1;

      const reRender = () => {
        element.innerHTML = "";

        for (let information of data.slice(
          (currentPage - 1) * limit,
          currentPage * limit
        )) {
          element.append(
            Interface.createDatasetCard(information),
            (() => {
              const element = document.createElement("li");
              element.appendChild(document.createElement("hr"));
              return element;
            })()
          );
        }
      };

      reRender();

      const pageCount = Math.ceil(data.length / limit);

      document.querySelector(".pagination").innerHTML = "";

      if (pageCount > 1) {
        for (let index = 1; index <= pageCount; index++) {
          document.querySelector(".pagination").appendChild(
            (() => {
              const element = document.createElement("li");
              element.classList.add("page-item");
              element.appendChild(
                (() => {
                  const element = document.createElement("button");
                  element.classList.add("page-link");
                  element.textContent = index;
                  return element;
                })()
              );
              return element;
            })()
          );
        }

        document.querySelectorAll(".page-link").forEach((element) => {
          element.addEventListener("click", (event) => {
            currentPage = Number(event.target.innerText);
            console.log(currentPage);
            reRender();
          });
        });
      }

      if (currentPage == pageCount)
        element.appendChild(
          (() => {
            const element = document.createElement("li");
            element.appendChild(
              (() => {
                const element = document.createElement("span");

                element.textContent = "No further information";
                return element;
              })()
            );
            return element;
          })()
        );
    })
    .catch((error) => {
      console.log(error);
      element.appendChild(
        (() => {
          const element = document.createElement("li");
          element.appendChild(
            (() => {
              const element = document.createElement("span");
              element.textContent = "Couldn't find what you are looking for";
              return element;
            })()
          );
          return element;
        })()
      );
    });
}

document.querySelector("#since").addEventListener("blur", (event) => {
  if (isNaN(event.target.value)) return (event.target.value = null);

  Number(event.target.value) > 0 &&
    (Search.configuration.fields.since = Number(event.target.value));
  ReSearch();
});

document.querySelector("#afore").addEventListener("blur", (event) => {
  if (isNaN(event.target.value)) return (event.target.value = null);

  Number(event.target.value) > 0 &&
    (Search.configuration.fields.afore = Number(event.target.value));
  ReSearch();
});

ReSearch();
