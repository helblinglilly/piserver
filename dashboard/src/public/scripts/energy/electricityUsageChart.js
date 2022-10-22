document.addEventListener("DOMContentLoaded", function () {
  let usageData = document.getElementById("usage_data");
  usageData = JSON.parse(usageData.innerHTML);

  let standingChargeData = document.getElementById("standing_charge_data");
  standingChargeData = JSON.parse(standingChargeData.innerHTML);

  let kwhChargeData = document.getElementById("kwh_rate_data");
  kwhChargeData = JSON.parse(kwhChargeData.innerHTML);

  let chargedData = document.getElementById("charged_data");
  chargedData = JSON.parse(chargedData.innerHTML);

  new Chart("usage_chart", {
    type: "line",
    data: usageData.data,
    options: usageData.options,
  });

  new Chart("standing_charge_chart", {
    type: "line",
    data: standingChargeData.data,
    options: standingChargeData.options,
  });

  new Chart("kwh_rate_chart", {
    type: "line",
    data: kwhChargeData.data,
    options: kwhChargeData.options,
  });

  new Chart("charged_data_chart", {
    type: "line",
    data: chargedData.data,
    options: chargedData.options,
  });
});
