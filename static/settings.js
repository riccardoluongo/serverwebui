function updateLogFileDiv() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            let m = document.getElementById('num');
            m.value = data[0][2]
            let r = document.getElementById('ran');
            r.value = m.value
        })
}

async function changeLogFileNum(value) {
    await fetch(`/change_max_log_files?value=${value}`).then((response) => {
        if (response.ok) {
            updateLogFileDiv()
        } else {
            alert("Couldn't change the 'max_log_files' preference. Please try again or check the logs for further information")
        }
    })
}

function applyChanges() {
    let mvalue = document.getElementById('num').value;
    changeLogFileNum(mvalue).then(
        changeLogLevel().then(
            changeRefreshRate()
        )
    )
}

async function resetDefault() {
    if (confirm("Are you sure you want to restore the default settings?")) {
        await fetch(`/reset_settings`).then((response) => {
            if (response.ok) {
                updateLogFileDiv()
                updateLogLevelSelector()
                updateRefreshDiv()
            } else {
                alert("Couldn't reset the settings. Please try again or check the logs for further information.")
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

async function changeLogLevel() {
    let drop_value = document.getElementById('log-selector').value;
    await fetch(`/change_log_level?value=${drop_value}`).then((response) => {
        if (response.ok) {
            updateLogLevelSelector()
        } else {
            alert("Couldn't change the 'log_level' preference. Please try again or check the logs for further information.")
        }
    })
}

function updateRefreshDiv() {
    fetch('/get_settings')
        .then(response => response.json())
        .then(data => {
            m1 = document.getElementById('refresh-num');
            m1.value = data[2][2]
            let r1 = document.getElementById('refresh-ran');
            r1.value = m1.value
        })
}

async function changeRefreshRate() {
    let refresh_num_value = document.getElementById('refresh-num').value
    await fetch(`/change_refresh_rate?value=${refresh_num_value}`).then((response) => {
        if (response.ok) {
            updateRefreshDiv()
        } else {
            alert("Couldn't change the 'refresh_rate' preference. Please try again or check the logs for further information.")
        }
    })
}

window.onload = function() {
    updateLogFileDiv()

    let m = document.getElementById('num');
    let r = document.getElementById('ran');

    let m1 = document.getElementById('refresh-num');
    let r1 = document.getElementById('refresh-ran');

    let range = document.querySelector(".slider");
    let number = document.querySelector(".number-log");

    let apply_btn = document.getElementById("apply-btn");
    let reset_btn = document.getElementById("reset-btn");

    range.addEventListener("input", (e) => {
        number.value = e.target.value;
    })
    number.addEventListener("input", (e) => {
        range.value = e.target.value;
    })

    r1.addEventListener("input", (e) => {
        m1.value = e.target.value;
    })
    m1.addEventListener("input", (e) => {
        r1.value = e.target.value;
    })

    apply_btn.addEventListener("click", applyChanges);
    reset_btn.addEventListener("click", resetDefault);

    r.value = m.value;

    updateLogLevelSelector()
    updateRefreshDiv()
}

//by Riccardo Luongo, 29/05/2024