document.addEventListener("DOMContentLoaded", () => {
  const date = new Date(document.getElementById("date").innerHTML);
  const datePicker = document.getElementById("datepicker");
  datePicker.value = date.toISOString().split("T")[0];

  document.getElementById("clock_in").innerHTML = getLocalTime("clock_in");
  document.getElementById("break_in").innerHTML = getLocalTime("break_in");
  document.getElementById("break_out").innerHTML = getLocalTime("break_out");
  document.getElementById("clock_out").innerHTML = getLocalTime("clock_out");
});

getLocalTime = (id) => {
  const isostring = document.getElementById(id).innerHTML;
  if (!isostring) return "";

  const localStringFull = new Date(isostring).toLocaleTimeString();
  const hours = localStringFull.split(":")[0];
  const minutes = localStringFull.split(":")[1];
  return `${hours}:${minutes}`;
};
