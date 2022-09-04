document.addEventListener("DOMContentLoaded", function () {
  let electricityData = document.getElementById("energy_chart_data");
  electricityData = JSON.parse(electricityData.innerHTML);

  let gasData = document.getElementById("gas_chart_data");
  gasData = JSON.parse(gasData.innerHTML);

  console.log(gasData);

  new Chart("electric_history_chart", {
    type: "line",
    data: electricityData.data,
    options: electricityData.options,
  });

  new Chart("gas_history_chart", {
    type: "line",
    data: gasData.data,
    options: gasData.options,
  });
});
