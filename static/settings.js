function updateMaxLogFilesDiv() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            const filesNumber = document.getElementsByName('files-num')[0];
            const filesRange = document.getElementsByName('files-ran')[0];

            filesNumber.value = data[0][2];
            filesRange.value = filesNumber.value
        })
}

function updateMaxLogFileSize() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            const filesNumber = document.getElementsByName('size-num')[0];
            const filesRange = document.getElementsByName('size-ran')[0];

            filesNumber.value = data[3][2]
            filesRange.value = filesNumber.value
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

function updateLogLevelSelector() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            const value = data[1][2];
            const dropdown = document.getElementById("log-selector");
            
            setSelectedIndex(dropdown, value);
        })
}

function updateRefreshDiv() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            const refreshNumber = document.getElementsByName('refresh-num')[0];
            const refreshRange = document.getElementsByName('refresh-ran')[0];

            refreshNumber.value = data[2][2]
            refreshRange.value = refreshNumber.value
        })
}

window.onload = function() {
    const resetButton = document.getElementById("reset-btn");
    const sliders = document.getElementsByClassName("slider");

    for (let i = 0; i < sliders.length; i++) {
        let range = document.getElementsByClassName("slider")[i];
        let number = document.getElementsByClassName("number")[i];

        range.addEventListener("input", (e) => {number.value = e.target.value;});
        number.addEventListener("input", (e) => {range.value = e.target.value;});
    }

    resetButton.addEventListener("click", resetDefault);

    updateMaxLogFileSize();
    updateMaxLogFilesDiv();
    updateLogLevelSelector();
    updateRefreshDiv();
}
//by Riccardo Luongo, 08/04/2025