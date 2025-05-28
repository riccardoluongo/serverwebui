function updateSettings() {
  fetch('/get_settings')
    .then(response => response.json())
    .then(settings => {
      const filesNumber = document.getElementsByName('files-num')[0];
      const filesRange = document.getElementsByName('files-ran')[0];

      const sizeNumber = document.getElementsByName('size-num')[0];
      const sizeRange = document.getElementsByName('size-ran')[0];

      const logLevelSelector = document.getElementById("log-selector");

      const refreshNumber = document.getElementsByName('refresh-num')[0];
      const refreshRange = document.getElementsByName('refresh-ran')[0];

      const activeFansCheckbox = document.getElementsByName('active-fans')[0];
      const activeFansText = document.getElementsByClassName('active-fan-text')[0];

      filesNumber.value = settings["max_files"];
      filesRange.value = filesNumber.value;

      sizeNumber.value = settings["max_size"];
      sizeRange.value = sizeNumber.value;

      setSelectedIndex(logLevelSelector, settings["log_level"]);

      refreshNumber.value = settings["refresh_rate"];
      refreshRange.value = refreshNumber.value;

      activeFansCheckbox.checked = settings["active_fans"] == "on" ? true : false;
      activeFansText.innerText = activeFansCheckbox.checked ? "Yes" : "No";
      activeFansCheckbox.addEventListener("click", () => { activeFansText.innerText = activeFansCheckbox.checked ? "Yes" : "No" });
    })
}

async function resetDefault() {
  if (confirm("Are you sure you want to restore the default settings?")) {
    await fetch("/reset_settings", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.ok) {
          updateMaxLogFilesDiv();
          updateLogLevelSelector();
          updateRefreshDiv();
          updateMaxLogFileSize();
        } else {
          alert("Couldn't reset the settings. Check the logs for further information.");
        }
      })
  }
}

function setSelectedIndex(s, valsearch) {
  for (i = 0; i < s.options.length; i++) {
    if (s.options[i].value == valsearch) {
      s.options[i].selected = true;
      break;
    }
  }
}

window.onload = function () {
  const resetButton = document.getElementById("reset-btn");
  const sliders = document.getElementsByClassName("slider");

  for (let i = 0; i < sliders.length; i++) {
    let range = document.getElementsByClassName("slider")[i];
    let number = document.getElementsByClassName("number")[i];

    range.addEventListener("input", (e) => { number.value = e.target.value; });
    number.addEventListener("input", (e) => { range.value = e.target.value; });
  }

  resetButton.addEventListener("click", resetDefault);

  updateSettings();
}
//Riccardo Luongo, 29/05/2025
