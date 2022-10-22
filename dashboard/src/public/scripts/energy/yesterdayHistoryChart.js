document.addEventListener("DOMContentLoaded", function () {
  let data = document.getElementById("chart_data");
  data = JSON.parse(data.innerHTML);

  new Chart("history_chart", {
    type: "line",
    data: data.data,
    options: data.options,
  });
});
