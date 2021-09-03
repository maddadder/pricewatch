const body = document.getElementsByTagName("body");

const snowflakesContainer = document.createElement("div");
snowflakesContainer.className = "snowflakes";
snowflakesContainer.setAttribute("aria-hidden", "true");

const snowflake = document.createElement("div");
snowflake.className = "snowflake";
snowflake.innerHTML = "❆";

for (let i = 0; i < 12; i++) {
  snowflakesContainer.appendChild(snowflake.cloneNode(true));
}

body[0]?.prepend(snowflakesContainer);
