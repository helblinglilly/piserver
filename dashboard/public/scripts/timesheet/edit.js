document.addEventListener("DOMContentLoaded", () => {
  const date = new Date(document.getElementById("date").innerHTML);
  const datePicker = document.getElementById("datepicker");
  datePicker.value = date.toISOString().split("T")[0];

  document.getElementById("input-clock_in").defaultValue = getLocalTime("input-clock_in");
  document.getElementById("input-break_in").defaultValue = getLocalTime("input-break_in");
  document.getElementById("input-break_out").defaultValue =
    getLocalTime("input-break_out");
  document.getElementById("input-clock_out").defaultValue =
    getLocalTime("input-clock_out");
});

getLocalTime = (id) => {
  const isostring = document.getElementById(id).defaultValue;
  if (!isostring) return "";

  const localStringFull = new Date(isostring).toLocaleTimeString();
  const hours = localStringFull.split(":")[0];
  const minutes = localStringFull.split(":")[1];
  return `${hours}:${minutes}`;
};

function edit(action) {
  let editLabel;
  let saveLabel;
  let input;

  if (action === "clock_in") {
    editLabel = document.getElementById("a-edit-clock_in");
    saveLabel = document.getElementById("a-save-clock_in");
    input = document.getElementById("input-clock_in");
  } else if (action === "break_in") {
    editLabel = document.getElementById("a-edit-break_in");
    saveLabel = document.getElementById("a-save-break_in");
    input = document.getElementById("input-break_in");
  } else if (action === "break_out") {
    editLabel = document.getElementById("a-edit-break_out");
    saveLabel = document.getElementById("a-save-break_out");
    input = document.getElementById("input-break_out");
  } else if (action === "clock_out") {
    editLabel = document.getElementById("a-edit-clock_out");
    saveLabel = document.getElementById("a-save-clock_out");
    input = document.getElementById("input-clock_out");
  }

  toggleEditLabel(editLabel);
  toggleSaveLabel(saveLabel);
  toggleInput(input);
}

function toggleEditLabel(editLabel) {
  if (editLabel.innerHTML === "Edit") {
    editLabel.innerHTML = "Lock";
  } else {
    editLabel.innerHTML = "Edit";
  }
}

function toggleSaveLabel(saveLabel) {
  if (saveLabel.getAttribute("enabled") === "false") {
    saveLabel.setAttribute("enabled", "true");
    saveLabel.removeAttribute("style");
  } else {
    saveLabel.setAttribute("enabled", "false");
    saveLabel.setAttribute("style", "color: #c2c2c2;");
  }
}

function toggleInput(input) {
  if (input.classList.contains("is-danger")) {
    input.removeAttribute("readonly");
    input.classList.remove("is-danger");
    input.classList.add("is-success");
    input.removeAttribute("style");
  } else {
    input.setAttribute("readonly", true);
    input.classList.add("is-danger");
    input.classList.remove("is-success");
    input.setAttribute("style", "color:#c2c2c2");
  }
}

function save(action) {
  if (action === "clock_in") {
    let state = document.getElementById("a-save-clock_in");
    state = state.getAttribute("enabled");
    if (state === "true") document.forms["save-clock_in"].submit();
  } else if (action === "break_in") {
    let state = document.getElementById("a-save-break_in");
    state = state.getAttribute("enabled");
    if (state === "true") document.forms["save-break_in"].submit();
  } else if (action === "break_out") {
    let state = document.getElementById("a-save-break_out");
    state = state.getAttribute("enabled");
    if (state === "true") document.forms["save-break_out"].submit();
  } else if (action === "clock_out") {
    let state = document.getElementById("a-save-clock_out");
    state = state.getAttribute("enabled");
    if (state === "true") document.forms["save-clock_out"].submit();
  }
}
