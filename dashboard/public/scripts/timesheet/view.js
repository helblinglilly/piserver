document.addEventListener("DOMContentLoaded", () => {
  const date = new Date(document.getElementById("date").innerHTML);
  const datePicker = document.getElementById("datepicker");
  datePicker.value = date.toISOString().split("T")[0];
});
