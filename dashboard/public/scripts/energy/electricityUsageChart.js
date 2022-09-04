document.addEventListener("DOMContentLoaded", function () {
  electricityData = document.getElementById("electricity_data");
  electricityData = JSON.parse(electricityData.innerHTML);

  gasData = document.getElementById("gas_usage_data");
  gasData = JSON.parse(gasData.innerHTML);

  new Chart("electricity_usage", {
    type: "line",
    data: electricityData.data,
    options: electricityData.options,
  });

  new Chart("gas_usage", {
    type: "line",
    data: gasData.data,
    options: gasData.options,
  });
});
