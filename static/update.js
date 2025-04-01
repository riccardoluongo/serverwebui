function changecircle(color, id, value) {
    const duration=500;
    const element = document.getElementById(id);
    const startTime = performance.now();

    function getCurrentValue(element) {
        const backgroundStr = element.style.background.split("conic-gradient");
        if (backgroundStr.length < 2){
                return 0;
            }

        const match = backgroundStr[1].match(/(\d+)%/);
        return match ? parseInt(match[1], 10) : 0;
    }
    
    function update() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + (value - startValue) * progress);

        element.style.background = `radial-gradient(closest-side, rgb(31, 31, 31) 85%, transparent 86% 100%), 
                                    conic-gradient(${color} ${currentValue}%, rgb(102, 102, 102) 0)`;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    let startValue = getCurrentValue(element);
    requestAnimationFrame(update);
}

function updateCpuDiv() {
    fetch("/cpu_util")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("cpu_util_div").innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data.length == 0) {
                    document.getElementById("cpu_util_div").innerText = "N/A";
                    changecircle("red", "cpu-dot", "0")
                } else {
                    let cpu_usage = data.cpu_util;
                    let str_cpu_usage = String(data.cpu_util);

                    if(cpu_usage==100){
                        cpu_usage = Math.trunc(cpu_usage);
                    }
                    document.getElementById("cpu_util_div").innerText = cpu_usage + "%";

                    if (data.cpu_util < 60) {
                        changecircle("rgb(54, 73, 247)", "dot", str_cpu_usage);
                    } else if (data.cpu_util < 85) {
                        changecircle("rgb(245, 208, 22)", "dot", str_cpu_usage);
                    } else if (data.cpu_util > 85) {
                        changecircle("red", "dot", str_cpu_usage);
                    }
                }
            }
        });
}

function updateGpuDiv() {
    fetch("/gpu_util")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("gpu_util_div").innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data.length == 1) {
                    if(data[0]==100){
                        data[0] = Math.trunc(data[0]);
                    }

                    document.getElementById("gpu_util_div").innerText = data[0] + "%";

                    if (data[0] < 60) {
                        changecircle("rgb(54, 73, 247)", "gpu-dot", String(data[0]));
                    } else if (data[0] < 85) {
                        changecircle("rgb(245, 208, 22)", "gpu-dot", String(data[0]));
                    } else if (data[0] >= 85) {
                        changecircle("red", "gpu-dot", String(data[0]));
                    }
                }
                if (data.length > 1) {
                    let gpu_dot = document.getElementById("gpu-dot");

                    while (gpu_dot.firstChild) {
                        gpu_dot.removeChild(gpu_dot.firstChild);
                    }

                    let currentIndex = 0;

                    if (document.getElementById("gpu-dot-title") != null) {
                        document.getElementById("gpu-dot-title").remove();
                    }

                    function prevGpu() {
                        currentIndex = (currentIndex - 1 + data.length) % data.length;
                        updateDisplay();
                    }

                    function nextGpu() {
                        currentIndex = (currentIndex + 1) % data.length;
                        updateDisplay();
                    }

                    let gpu_util_value = gpu_dot.appendChild(
                        document.createElement("span")
                    );
                    setAttributes(gpu_util_value, {
                        id: "gpu_util_div",
                        class: "circle-values",
                    });

                    let gpu_dot_title_scrollable = gpu_dot.appendChild(
                        document.createElement("span")
                    );
                    gpu_dot_title_scrollable.setAttribute(
                        "class",
                        "gpu-dot-title-scrollable"
                    );

                    let left_btn = gpu_dot.appendChild(document.createElement("button"));
                    left_btn.setAttribute("class", "left-btn");
                    left_btn.onclick = prevGpu;

                    let left_arrow = left_btn.appendChild(document.createElement("i"));
                    left_arrow.setAttribute("class", "left-arrow");

                    let right_btn = gpu_dot.appendChild(document.createElement("button"));
                    right_btn.setAttribute("class", "right-btn");
                    right_btn.onclick = nextGpu;

                    let right_arrow = right_btn.appendChild(document.createElement("i"));
                    right_arrow.setAttribute("class", "right-arrow");

                    function updateDisplay() {
                        fetch("/gpu_util")
                            .then((response) => response.json())
                            .then((data) => {
                                document.getElementById("gpu_util_div").innerText =
                                    data[currentIndex] + "%";

                                if (data[currentIndex] < 60) {
                                    changecircle(
                                        "rgb(54, 73, 247)",
                                        "gpu-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] < 85) {
                                    changecircle(
                                        "rgb(245, 208, 22)",
                                        "gpu-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] >= 85) {
                                    changecircle("red", "gpu-dot", String(data[currentIndex]));
                                }
                                gpu_dot_title_scrollable.innerText = `GPU${currentIndex}`;
                            });
                    }
                    updateDisplay();
                    setInterval(() => updateDisplay(), refresh_rate);
                }
                if (data.length == 0) {
                    document.getElementById("gpu_util_div").innerText = "N/A";
                    changecircle("red", "gpu-dot", "0")
                }
            }
        });
}

function updateRamDiv() {
    fetch("/ram_util")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("ram_util_div").innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data.length == 0) {
                    document.getElementById("ram_util_div").innerText = "N/A";
                    changecircle("red", "ram-dot", "0")
                } else {
                    let ram_usage = data.ram_util;
                    if(ram_usage==100){
                        ram_usage = Math.trunc(ram_usage);
                    }

                    let str_ram_usage = String(data.ram_util);
                    document.getElementById("ram_util_div").innerText = ram_usage + "%";

                    if (ram_usage < 60) {
                        changecircle("rgb(54, 73, 247)", "ram-dot", str_ram_usage);
                    } else if (ram_usage < 85) {
                        changecircle("rgb(245, 208, 22)", "ram-dot", str_ram_usage);
                    } else if (ram_usage >= 85) {
                        changecircle("red", "ram-dot", str_ram_usage);
                    }
                }
            }
        });
}

function updateVramDiv() {
    fetch("/vram_util")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("vram_util_div").innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data.length == 1) {
                    if(data[0]==100){
                        data[0] = Math.trunc(data[0]);
                    }
                    document.getElementById("vram_util_div").innerText = data[0] + "%";

                    if (data[0] < 60) {
                        changecircle("rgb(54, 73, 247)", "vram-dot", String(data[0]));
                    } else if (data[0] < 85) {
                        changecircle("rgb(245, 208, 22)", "vram-dot", String(data[0]));
                    } else if (data[0] >= 85) {
                        changecircle("red", "vram-dot", String(data[0]));
                    }
                }
                if (data.length > 1) {
                    let vram_dot = document.getElementById("vram-dot");

                    while (vram_dot.firstChild) {
                        vram_dot.removeChild(vram_dot.firstChild);
                    }

                    let currentIndex = 0;

                    if (document.getElementById("vram-dot-title") != null) {
                        document.getElementById("vram-dot-title").remove();
                    }

                    function prevGpu() {
                        currentIndex = (currentIndex - 1 + data.length) % data.length;
                        updateDisplay();
                    }

                    function nextGpu() {
                        currentIndex = (currentIndex + 1) % data.length;
                        updateDisplay();
                    }

                    let vram_util_value = vram_dot.appendChild(
                        document.createElement("span")
                    );
                    setAttributes(vram_util_value, {
                        id: "vram_util_div",
                        class: "circle-values",
                    });

                    let vram_dot_title_scrollable = vram_dot.appendChild(
                        document.createElement("span")
                    );
                    vram_dot_title_scrollable.setAttribute(
                        "class",
                        "gpu-dot-title-scrollable"
                    );

                    let left_btn = vram_dot.appendChild(document.createElement("button"));
                    left_btn.setAttribute("class", "left-btn");
                    left_btn.onclick = prevGpu;

                    let left_arrow = left_btn.appendChild(document.createElement("i"));
                    left_arrow.setAttribute("class", "left-arrow");

                    let right_btn = vram_dot.appendChild(
                        document.createElement("button")
                    );
                    right_btn.setAttribute("class", "right-btn");
                    right_btn.onclick = nextGpu;

                    let right_arrow = right_btn.appendChild(document.createElement("i"));
                    right_arrow.setAttribute("class", "right-arrow");

                    function updateDisplay() {
                        fetch("/vram_util")
                            .then((response) => response.json())
                            .then((data) => {
                                document.getElementById("vram_util_div").innerText =
                                    data[currentIndex] + "%";

                                if (data[currentIndex] < 60) {
                                    changecircle(
                                        "rgb(54, 73, 247)",
                                        "vram-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] < 85) {
                                    changecircle(
                                        "rgb(245, 208, 22)",
                                        "vram-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] >= 85) {
                                    changecircle("red", "vram-dot", String(data[currentIndex]));
                                }
                                vram_dot_title_scrollable.innerText = `GPU${currentIndex}`;
                            });
                    }
                    updateDisplay();
                    setInterval(() => updateDisplay(), refresh_rate);
                }
                if (data.length == 0) {
                    document.getElementById("vram_util_div").innerText = "N/A";
                    changecircle("red", "vram-dot", "0")
                }
            }
        });
}

function updateCpuTempDiv() {
    fetch("/cpu_temp")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("cpu-temp-div").innerText = "N/A";
                document.getElementById("cpu-temp-div").style.color = "grey";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                let cpu_temperature = data.cpu_temp;
                document.getElementById("cpu-temp-div").innerText =
                    cpu_temperature + "°C";
                document.getElementById("cpu-temp-div").style.color = "white";
            }
        });
}

function updateGpuTempDiv() {
    fetch("/gpu_temp")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("gpu-temp-div").innerText = "N/A";
                document.getElementById("gpu-temp-div").style.color = "grey";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                let temp_rectangle = document.getElementById("temp-rectangle");
                let initial_temp_container = document.getElementById(
                    "initial-gpu-temp-container"
                );

                while (initial_temp_container.firstChild) {
                    initial_temp_container.removeChild(initial_temp_container.firstChild);
                }

                if (document.getElementById("gpus-temp-container") != null) {
                    document.getElementById("gpus-temp-container").remove();
                }

                let gpus_temp_container = temp_rectangle.appendChild(
                    document.createElement("div")
                );
                gpus_temp_container.setAttribute("id", "gpus-temp-container");

                while (gpus_temp_container.firstChild) {
                    gpus_temp_container.removeChild(gpus_temp_container.firstChild);
                }

                for (let gpu in data) {
                    let gpu_temp_title = gpus_temp_container.appendChild(
                        document.createElement("div")
                    );
                    setAttributes(gpu_temp_title, {
                        class: "mini-box-title",
                        style: "padding-top: 30px;",
                    });
                    gpu_temp_title.innerText = `GPU${gpu}:`;

                    let gpu_temp_value = gpus_temp_container.appendChild(
                        document.createElement("div")
                    );
                    setAttributes(gpu_temp_value, {
                        class: "mini-box-values",
                        style: "color: white;",
                    });
                    gpu_temp_value.innerText = `${data[gpu]}°C`;
                }
            }
        });
}

function updateCpuPwrDiv() {
    fetch("/cpu_pwr")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("cpu-pwr-div").innerText = "N/A";
                document.getElementById("cpu-pwr-div").style.color = "grey";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                let cpu_power = data.cpu_pwr;
                document.getElementById("cpu-pwr-div").innerText = cpu_power + "W";
                document.getElementById("cpu-pwr-div").style.color = "white";
            }
        });
}

function updateGpuPwrDiv() {
    fetch("/gpu_pwr")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("gpu-pwr-div").innerText = "N/A";
                document.getElementById("gpu-pwr-div").style.color = "grey";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                let pwr_rectangle = document.getElementById("pwr-rectangle");
                let initial_pwr_container = document.getElementById(
                    "initial-gpu-pwr-container"
                );

                while (initial_pwr_container.firstChild) {
                    initial_pwr_container.removeChild(initial_pwr_container.firstChild);
                }

                if (document.getElementById("gpus-pwr-container") != null) {
                    document.getElementById("gpus-pwr-container").remove();
                }

                let gpus_pwr_container = pwr_rectangle.appendChild(
                    document.createElement("div")
                );
                gpus_pwr_container.setAttribute("id", "gpus-pwr-container");

                while (gpus_pwr_container.firstChild) {
                    gpus_pwr_container.removeChild(gpus_pwr_container.firstChild);
                }

                for (let gpu in data) {
                    let gpu_pwr_title = gpus_pwr_container.appendChild(
                        document.createElement("div")
                    );
                    setAttributes(gpu_pwr_title, {
                        class: "mini-box-title",
                        style: "padding-top: 30px;",
                    });
                    gpu_pwr_title.innerText = `GPU${gpu}:`;

                    let gpu_pwr_value = gpus_pwr_container.appendChild(
                        document.createElement("div")
                    );
                    setAttributes(gpu_pwr_value, {
                        class: "mini-box-values",
                        style: "color: white;",
                    });
                    gpu_pwr_value.innerText = `${data[gpu]}W`;
                }
            }
        });
}

function UpdatePoolInfoDiv() {
    let drop_value = document.getElementById("pool-selector").value;
    fetch(`/pool_stats?pool=${drop_value}`)
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("pool-status").innerText = "N/A";
                document.getElementById("pool-status").style.color = "grey";

                document.getElementById("used-of").innerText = "N/A";
                document.getElementById("used-of").style.color = "grey";

                document.getElementById("free-space").innerText = "N/A";
                document.getElementById("free-space").style.color = "grey";

                document.getElementById("%-used").innerText = "N/A";
                document.getElementById("%-used").style.color = "grey";

                document.getElementById("storage-bar").setAttribute("value", "0");
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                document.getElementById("pool-status").innerText = `${data["health"]}`;
                document.getElementById("used-of").innerText = `${data["allocated"]} of ${data["size"]}`;
                document.getElementById("free-space").innerText = `${data["free"]}`;
                document.getElementById("%-used").innerText = `${data["capacity"]} used`;

                let perc_used = data["capacity"].slice(0, -1);
                document.getElementById("storage-bar").setAttribute("value", perc_used);
            }
        });
}

function UpdateSysInfoDiv() {
    fetch("/sysinfo")
        .then(function(response) {
            if (!response.ok) {
                let sysinfobox = document.getElementById("system-box");

                while (sysinfobox.firstChild) {
                    sysinfobox.removeChild(sysinfobox.firstChild);
                }

                let err_div = sysinfobox.appendChild(document.createElement("span"));
                err_div.setAttribute("class", "box-na");
                err_div.innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                let sys_data_form = data.sysinfo;
                let sysinfobox = document.getElementById("system-box");

                while (sysinfobox.firstChild) {
                    sysinfobox.removeChild(sysinfobox.firstChild);
                }

                for (let line in sys_data_form) {
                    let sinfo_div = sysinfobox.appendChild(document.createElement("div"));
                    sinfo_div.setAttribute("id", `i${line}`);
                    sinfo_div.setAttribute("class", "sysinfo-values");
                    sinfo_div.innerText = sys_data_form[line];
                }
            }
        });
}

function shutdown() {
    if (confirm("Shutdown the system now?")) {
        fetch("/shutdown")
            .then((response) => response.json())
            .then((data) => {
                alert(data.shutdown_comm);
            });
    }
}

function reboot() {
    if (confirm("Restart the system now?")) {
        fetch("/reboot");
    }
}

function UpdateTimeDiv() {
    let currenttd = new Date();
    let currenth = currenttd.getHours();
    let currentmin = currenttd.getMinutes();
    let currentday = currenttd.getDate();
    let currentmonth = currenttd.getMonth() + 1;
    let currentyear = currenttd.getFullYear();

    if (currentmin < 10) {
        currentmin = "0" + currentmin;
    }
    if (currenth < 10) {
        currenth = "0" + currenth;
    }
    if (currentday < 10) {
        currentday = "0" + currentday;
    }
    if (currentmonth < 10) {
        currentmonth = "0" + currentmonth;
    }

    let time = `${currenth}:${currentmin}`;
    let date = `${currentday}/${currentmonth}/${currentyear}`;

    document.getElementById("time").innerText = time;
    document.getElementById("date").innerText = date;
}

function UpdateLinksDiv() {
    fetch("/get_links")
        .then(function(response) {
            if (!response.ok) {
                const err = document.getElementById("links_wrapper").appendChild(document.createElement('span'))
                err.setAttribute("class", "link-err")
                err.innerText = "Couldn't retrieve links."
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                const links_wrapper = document.getElementById("links_wrapper");

                if (data.length > 0) {
                    for (const property in data) {
                        let link = links_wrapper.appendChild(document.createElement("a"));
                        link.setAttribute("id", `link${data[property][0]}`);
                        link.setAttribute("href", `${data[property][2]}`);
                        link.setAttribute("class", "link");
                        link.appendChild(document.createTextNode(`${data[property][1]}`));
                    }
                } else {
                    let link = links_wrapper.appendChild(document.createElement("a"));
                    link.setAttribute("href", `/edit_links`);
                    link.setAttribute("class", "link");
                    link.appendChild(document.createTextNode(`+ Create link`));
                }
            }
        });
}

function UpdateDropPools() {
    fetch("/pools_name")
        .then((response) => response.json())
        .then((data) => {
            const pools_drop = document.getElementById("pool-selector");
            for (const pool in data) {
                let pools_buttons = pools_drop.appendChild(
                    document.createElement("option")
                );
                pools_buttons.setAttribute("value", `${data[pool]}`);
                pools_buttons.appendChild(document.createTextNode(`${data[pool]}`));
            }
            pools_drop.setAttribute("value", data[0])
            FetchDisks()
            if (disk_interval_set == false) {
                disk_interval = setInterval(() => FetchDisks(), 10000);
                disk_interval_set = true;
            }
            sel_pool.addEventListener("change", FetchDisks);
        });
}

function FetchDisks() {
    let drop_value = document.getElementById("pool-selector").value;
    fetch(`/get_disks?pool=${drop_value}`)
        .then(function(response) {
            if (!response.ok) {
                let box = document.getElementById("raid-box");

                while (box.firstChild) {
                    box.removeChild(box.firstChild);
                }

                na_text = box.appendChild(document.createElement("div"));
                na_text.setAttribute("id", "na-raid");
                na_text.classList.add("box-na");
                na_text.innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                let box = document.getElementById("raid-box");

                while (box.firstChild) {
                    box.removeChild(box.firstChild);
                }

                for (line in data) {
                    let box_text = box.appendChild(document.createElement("div"));
                    box_text.setAttribute("id", `l${line}`);
                    box_text.classList.add("raid-text");
                    box_text.innerText = data[line];
                }
            }
            UpdatePoolInfoDiv();
            if (poolinfo_interval_set == false) {
                poolinfo_interval = setInterval(() => UpdatePoolInfoDiv(), 10000);
                poolinfo_interval_set = true;
            }
        });
}

function setRefreshRate() {
    fetch("/get_settings")
        .then((response) => response.json())
        .then((data) => {
            refresh_rate = data[2][2];
            setInterval(() => updateCpuDiv(), refresh_rate);
            setInterval(() => updateRamDiv(), refresh_rate);
            setInterval(() => updateGpuDiv(), refresh_rate);
            setInterval(() => updateVramDiv(), refresh_rate);
            setInterval(() => updateCpuTempDiv(), refresh_rate);
            setInterval(() => updateGpuTempDiv(), refresh_rate);
            setInterval(() => updateCpuPwrDiv(), refresh_rate);
            setInterval(() => updateGpuPwrDiv(), refresh_rate);
            setInterval(() => UpdateSysInfoDiv(), refresh_rate);
            setInterval(() => updateGpuFanDiv(), refresh_rate);
            setInterval(() => updateSystemFanDiv(), refresh_rate);
        });
}

function updateGpuFanDiv() {
    fetch("/gpu_fan_speed")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("gpu-fan-value").innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data.length == 0) {
                    let gpu_fan_container = document.getElementById('gpu-fan-container');

                    while (gpu_fan_container.firstChild) {
                        gpu_fan_container.removeChild(gpu_fan_container.firstChild);
                    }

                    let gpu_fan_icon = gpu_fan_container.appendChild(document.createElement('i'))
                    gpu_fan_icon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");

                    let gpu_fan_title_span = gpu_fan_container.appendChild(
                        document.createElement("span")
                    );
                    gpu_fan_title_span.setAttribute("class", "fan-title");
                    gpu_fan_title_span.innerText = ` GPU: `;

                    let gpu_fan_value_span = gpu_fan_container.appendChild(
                        document.createElement("span")
                    );
                    gpu_fan_value_span.setAttribute("class", "fan-value");
                    gpu_fan_value_span.innerText = `No fan available.`;
                }
                if (data.length > 0) {
                    let gpu_fan_container = document.getElementById('gpu-fan-container');

                    while (gpu_fan_container.firstChild) {
                        gpu_fan_container.removeChild(gpu_fan_container.firstChild);
                    }

                    for (let gpu in data) {
                        let fan_wrapper = gpu_fan_container.appendChild(
                            document.createElement("span")
                        );

                        let fan_icon = fan_wrapper.appendChild(document.createElement("i"));
                        fan_icon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");

                        let gpu_title_span = fan_wrapper.appendChild(
                            document.createElement("span")
                        );
                        gpu_title_span.setAttribute("class", "fan-title");
                        gpu_title_span.innerText = ` GPU${gpu}: `;

                        let gpu_value_span = fan_wrapper.appendChild(
                            document.createElement("span")
                        );
                        gpu_value_span.setAttribute("class", "fan-value");
                        gpu_value_span.innerText = `${data[gpu]}%`;
                    }
                }
            }
        });
}

function updateSystemFanDiv() {
    fetch("/system_fans_speed")
        .then(function(response) {
            if (!response.ok) {
                alert("Unable to retrieve system fans");
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data[0].length == 0) {
                    let cpu_fan_container = document.getElementById('sys-fan-container');

                    while (cpu_fan_container.firstChild) {
                        cpu_fan_container.removeChild(cpu_fan_container.firstChild);
                    }

                    let cpu_fan_icon = cpu_fan_container.appendChild(document.createElement('i'))
                    cpu_fan_icon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");

                    let cpu_fan_title_span = cpu_fan_container.appendChild(
                        document.createElement("span")
                    );
                    cpu_fan_title_span.setAttribute("class", "fan-title");
                    cpu_fan_title_span.innerText = ` SYS: `;

                    let cpu_fan_value_span = cpu_fan_container.appendChild(
                        document.createElement("span")
                    );
                    cpu_fan_value_span.setAttribute("class", "fan-value");
                    cpu_fan_value_span.innerText = `No fan available.`;
                }
                if (data[0].length > 0) {
                    let i = -1;
                    let cpu_fan_container = document.getElementById('cpu-fan-container');

                    while (cpu_fan_container.firstChild) {
                        cpu_fan_container.removeChild(cpu_fan_container.firstChild);
                    }

                    for (fan in data[0]) {
                        i++;
                        let fan_wrapper = cpu_fan_container.appendChild(
                            document.createElement("span")
                        );

                        let fan_icon = fan_wrapper.appendChild(
                            document.createElement("i")
                        );
                        fan_icon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");
                        let fan_title = fan_wrapper.appendChild(
                            document.createElement("span")
                        );
                        fan_title.setAttribute("class", "fan-title");
                        let fan_value = fan_wrapper.appendChild(
                            document.createElement("span")
                        );
                        fan_value.setAttribute("class", "fan-value");

                        if (data[0][fan][0] == "") {
                            fan_title.innerText = ` SYS${i}:`;
                        } else {
                            fan_title.innerText = ` ${data[0][fan][0]}`;
                        }

                        fan_value.innerText = ` ${data[0][fan][1]} RPM`;
                    }
                }
            }
        });
}

function showSmart() {
    if (typeof disk_interval !== "undefined") {
        clearInterval(disk_interval);
        disk_interval_set = false;
    }
    if (typeof poolinfo_interval !== "undefined") {
        clearInterval(poolinfo_interval);
        poolinfo_interval_set = false;
    }
    if (typeof storageInfo_interval !== "undefined") {
        clearInterval(storageInfo_interval);
        storageInfo_interval_set = false;
    }

    let storage_box_wrapper = document.getElementById("storage-box-wrapper");
    while (storage_box_wrapper.firstChild) {
        storage_box_wrapper.removeChild(storage_box_wrapper.firstChild);
    }

    updateDiskSelector();

    let disk_drop = document.getElementById("disk-selector");
    disk_drop.addEventListener("change", updateSmartDiv);
}

function updateDiskSelector() {
    let storage_box_wrapper = document.getElementById("storage-box-wrapper");

    let disk_sel_div = storage_box_wrapper.appendChild(
        document.createElement("div")
    );
    let disk_selector = disk_sel_div.appendChild(
        document.createElement("select")
    );
    setAttributes(disk_selector, {
        id: "disk-selector",
        class: "pool-selector",
        name: "disk-selector",
        title: "Choose a drive",
    });

    fetch("/get_drives")
        .then((response) => response.json())
        .then((data) => {
            for (let drive in data.sort()) {
                let drives_buttons = disk_selector.appendChild(
                    document.createElement("option")
                );
                drives_buttons.value = data[drive];
                drives_buttons.innerText = `${data[drive]}`;
                drives_buttons.setAttribute("id", drive)
            }
            disk_selector.setAttribute("value", data[0])
            updateSmartDiv();
        });
}

function updateSmartDiv() {
    let storage_box_wrapper = document.getElementById("storage-box-wrapper");

    if (document.getElementById("smart-table") != null) {
        document.getElementById("smart-table").remove();
    }
    let smart_table = storage_box_wrapper.appendChild(
        document.createElement("table")
    );
    setAttributes(smart_table, {
        class: "smart-table",
        id: "smart-table",
    });

    drive = document.getElementById("disk-selector").value;
    fetch(`/smart_data?drive=${drive}`)
        .then(function(response) {
            if (!response.ok) {
                let box = document.getElementById("smart-table");
                let box_wrapper = document.getElementById("storage-box-wrapper");

                if (box) {
                    box.remove();
                }

                na_text = box_wrapper.appendChild(document.createElement("div"));
                na_text.classList.add("smart-na");
                na_text.innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data[0] == "nvme") {
                    let title_row = smart_table.appendChild(document.createElement("tr"));

                    let name_th = title_row.appendChild(document.createElement("th"));
                    name_th.innerText = "NAME";

                    let value_th = title_row.appendChild(document.createElement("th"));
                    value_th.innerText = "VALUE";

                    title_row_children = title_row.children;

                    for (let i = 0; i < title_row_children.length; i++) {
                        const child = title_row_children[i];
                        child.setAttribute("class", "smart-th");
                    }

                    for (let [key, value] of Object.entries(data[1])) {
                        let attr_row = smart_table.appendChild(document.createElement("tr"));
                        attr_row.setAttribute("class", "smart-tr");

                        let name_td = attr_row.appendChild(document.createElement("td"));
                        name_td.innerText = key;

                        let value_td = attr_row.appendChild(document.createElement("td"));
                        value_td.innerText = value;
                    }
                } else {
                    let title_row = smart_table.appendChild(document.createElement("tr"));

                    let id_th = title_row.appendChild(document.createElement("th"));
                    id_th.innerText = "ID";

                    let name_th = title_row.appendChild(document.createElement("th"));
                    name_th.innerText = "NAME";

                    let value_th = title_row.appendChild(document.createElement("th"));
                    value_th.innerText = "VALUE";

                    let worst_th = title_row.appendChild(document.createElement("th"));
                    worst_th.innerText = "WORST";

                    let thresh_th = title_row.appendChild(document.createElement("th"));
                    thresh_th.innerText = "THRESH";

                    let raw_value_th = title_row.appendChild(document.createElement("th"));
                    raw_value_th.innerText = "RAW VALUE";

                    title_row_children = title_row.children;

                    for (let i = 0; i < title_row_children.length; i++) {
                        const child = title_row_children[i];
                        child.setAttribute("class", "smart-th");
                    }
                    for (let attr in data[1]["table"]) {
                        let attr_row = smart_table.appendChild(document.createElement("tr"));
                        attr_row.setAttribute("class", "smart-tr");

                        let id_td = attr_row.appendChild(document.createElement("td"));
                        id_td.innerText = data[1]["table"][attr]["id"];

                        let name_td = attr_row.appendChild(document.createElement("td"));
                        name_td.innerText = data[1]["table"][attr]["name"];

                        let value_td = attr_row.appendChild(document.createElement("td"));
                        value_td.innerText = data[1]["table"][attr]["value"];

                        let worst_td = attr_row.appendChild(document.createElement("td"));
                        worst_td.innerText = data[1]["table"][attr]["worst"];

                        let thresh_td = attr_row.appendChild(document.createElement("td"));
                        thresh_td.innerText = data[1]["table"][attr]["thresh"];

                        let raw_value_td = attr_row.appendChild(document.createElement("td"));
                        raw_value_td.innerText = data[1]["table"][attr]["raw"]["value"];

                        let row_children = attr_row.children;

                        for (let i = 0; i < row_children.length; i++) {
                            const child = row_children[i];
                            child.setAttribute("class", "smart-td");
                        }
                    }
                }
            }
        });
}

setRefreshRate();
setInterval(() => UpdateTimeDiv(), 1000);

function setAttributes(el, attrs) {
    for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function initializeZpoolInfo() {
    if (typeof storageInfo_interval !== "undefined") {
        clearInterval(storageInfo_interval);
        storageInfo_interval_set = false;
    }

    let storage_box_wrapper = document.getElementById("storage-box-wrapper");
    while (storage_box_wrapper.firstChild) {
        storage_box_wrapper.removeChild(storage_box_wrapper.firstChild);
    }

    let pool_sel_div = storage_box_wrapper.appendChild(
        document.createElement("div")
    );
    let pool_selector = pool_sel_div.appendChild(
        document.createElement("select")
    );
    setAttributes(pool_selector, {
        id: "pool-selector",
        class: "pool-selector",
        name: "pool-selector",
        title: "Choose a ZFS pool",
    });

    let pool_pre = storage_box_wrapper.appendChild(document.createElement("pre"));
    let raid_box = pool_pre.appendChild(document.createElement("div"));
    setAttributes(raid_box, {
        class: "raid-box",
        id: "raid-box",
    });

    let storage_box = storage_box_wrapper.appendChild(
        document.createElement("div")
    );
    storage_box.setAttribute("class", "storage-box");

    let pool_status_wrapper = storage_box.appendChild(
        document.createElement("div")
    );
    pool_status_wrapper.setAttribute("class", "pool-info-container");
    let status_title = pool_status_wrapper.appendChild(
        document.createElement("span")
    );
    status_title.setAttribute("class", "pool-info-titles");
    status_title.innerText = "Pool status:";
    let status_value = pool_status_wrapper.appendChild(
        document.createElement("span")
    );
    setAttributes(status_value, {
        id: "pool-status",
        class: "pool-info-values",
    });

    let used_of_wrapper = storage_box.appendChild(document.createElement("div"));
    used_of_wrapper.setAttribute("class", "pool-info-container");
    let used_title = used_of_wrapper.appendChild(document.createElement("span"));
    used_title.setAttribute("class", "pool-info-titles");
    used_title.innerText = "Used: ";
    let used_value = used_of_wrapper.appendChild(document.createElement("span"));
    setAttributes(used_value, {
        id: "used-of",
        class: "pool-info-values",
    });

    let free_space_wrapper = storage_box.appendChild(
        document.createElement("div")
    );
    free_space_wrapper.setAttribute("class", "pool-info-container");
    let free_space_title = free_space_wrapper.appendChild(
        document.createElement("span")
    );
    free_space_title.setAttribute("class", "pool-info-titles");
    free_space_title.innerText = "Free space: ";
    let free_space_value = free_space_wrapper.appendChild(
        document.createElement("span")
    );
    setAttributes(free_space_value, {
        id: "free-space",
        class: "pool-info-values",
    });

    let storage_bar_wrapper = storage_box.appendChild(
        document.createElement("div")
    );
    storage_bar_wrapper.setAttribute("class", "pool-info-container");
    let storage_bar = storage_bar_wrapper.appendChild(
        document.createElement("progress")
    );
    setAttributes(storage_bar, {
        id: "storage-bar",
        class: "storage-bar",
        value: "0.001",
        max: "100",
    });

    let perc_used_wrapper = storage_box.appendChild(
        document.createElement("div")
    );
    perc_used_wrapper.setAttribute("class", "pool-info-container");
    let perc_used = perc_used_wrapper.appendChild(document.createElement("span"));
    setAttributes(perc_used, {
        class: "perc-used",
        id: "%-used",
    });

    sel_pool = document.getElementById("pool-selector");
    UpdateDropPools();
}

function updateStorageInfo() {
    let storage_box_wrapper = document.getElementById("storage-box-wrapper");

    fetch('/get_storage_usage')
        .then(function(response) {
            if (!response.ok) {
                while (storage_box_wrapper.firstChild) {
                    storage_box_wrapper.removeChild(storage_box_wrapper.firstChild);
                }

                storage_box_wrapper.innerHTML = `
                    <h1 class="disk-na">N/A</h1>
                `
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                while (storage_box_wrapper.firstChild) {
                    storage_box_wrapper.removeChild(storage_box_wrapper.firstChild);
                }

                for (const disk in data) {
                    let disk_wrapper = storage_box_wrapper.appendChild(document.createElement('div'));
                    disk_wrapper.classList.add("disk-wrapper");

                    let drive = data[disk];
                    let bar = disk_wrapper.appendChild(document.createElement('progress'));
                    setAttributes(bar, {
                        "value": drive["used_percent"].slice(0, -1),
                        "max": "100",
                        "class": "storage-info-bar"
                    });

                    let stats = disk_wrapper.appendChild(document.createElement('div'));
                    stats.classList.add("disk-stats");
                    stats.innerText = `
                        ${drive["file_system"]} mounted at ${drive["mounted"]}: ${drive["used_percent"]} used (${drive["used"]}/${drive["total"]})
                    `
                }
            }
        })
    if (storageInfo_interval_set == false) {
        storageInfo_interval = setInterval(() => updateStorageInfo(), 10000);
        storageInfo_interval_set = true;
    }
}

function initializeStorageInfo() {
    if (typeof disk_interval !== "undefined") {
        clearInterval(disk_interval);
        disk_interval_set = false;
    }
    if (typeof poolinfo_interval !== "undefined") {
        clearInterval(poolinfo_interval);
        poolinfo_interval_set = false;
    }

    updateStorageInfo();
}

function poolsExist(){
    //TODO add N/A text when no zpool exists
}

window.onload = function() {
    disk_interval_set = false;
    poolinfo_interval_set = false;
    storageInfo_interval_set = false;
    let shut_btn = document.getElementById("shut-btn");
    let restart_btn = document.getElementById("restart-btn");
    let radios = document.getElementsByName('flexRadioDefault');
    restart_btn.addEventListener("click", reboot);
    shut_btn.addEventListener("click", shutdown);



    for (let i = 0, length = radios.length; i < length; i++) { //is this really needed??
        if (radios[i].checked) {
            var value = radios[i].value;
            if (value == "storage") {
                initializeStorageInfo();
            }
            if (value == "zpool") {
                initializeZpoolInfo();
            }
            if (value == "smart") {
                showSmart()
            }
            break;
        }
    }
    UpdateTimeDiv();
    updateCpuDiv();
    updateGpuDiv();
    updateRamDiv();
    updateVramDiv();
    updateCpuTempDiv();
    updateGpuTempDiv();
    updateCpuPwrDiv();
    updateGpuPwrDiv();
    UpdateSysInfoDiv();
    UpdateLinksDiv();
    updateSystemFanDiv();
    updateGpuFanDiv();
};
//By Riccardo Luongo, 01/04/2025