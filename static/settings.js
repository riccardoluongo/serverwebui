function updateMaxLogFilesDiv() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            let files_num = document.getElementsByName('files-num')[0];
            let files_ran = document.getElementsByName('files-ran')[0];
            files_num.value = data[0][2];
            files_ran.value = files_num.value
        })
}

function updateMaxLogFileSize() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            let files_num = document.getElementsByName('size-num')[0];
            let files_ran = document.getElementsByName('size-ran')[0];
            files_num.value = data[3][2]
            files_ran.value = files_num.value
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
                    updateMaxLogFilesDiv()
                    updateLogLevelSelector()
                    updateRefreshDiv()
                    updateMaxLogFileSize()
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

function updateLogLevelSelector() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            let value = data[1][2];
            let dropdown = document.getElementById("log-selector");
            setSelectedIndex(dropdown, value);
        })
}

function updateRefreshDiv() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            let refresh_num = document.getElementsByName('refresh-num')[0];
            refresh_num.value = data[2][2]
            let refresh_ran = document.getElementsByName('refresh-ran')[0];
            refresh_ran.value = refresh_num.value
        })
}

window.onload = function() {
    let reset_btn = document.getElementById("reset-btn");
    let sliders = document.getElementsByClassName("slider");

    for (let i = 0; i < sliders.length; i++) {
        let range = document.getElementsByClassName("slider")[i];
        let number = document.getElementsByClassName("number")[i];

        range.addEventListener("input", (e) => {
            number.value = e.target.value;
        })
        number.addEventListener("input", (e) => {
            range.value = e.target.value;
        })
    }

    reset_btn.addEventListener("click", resetDefault);

    updateMaxLogFileSize()
    updateMaxLogFilesDiv()
    updateLogLevelSelector()
    updateRefreshDiv()
}
//by Riccardo Luongo, 27/12/2024