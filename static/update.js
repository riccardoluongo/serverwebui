function changeCircle(color, id, value) {
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

    const startValue = getCurrentValue(element);
    requestAnimationFrame(update);
}

function updateCpuDiv() {
    fetch("/cpu_util")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("cpu_util_div").innerText = "N/A";
            } else 
                return response.json();
            }
        )
        .then((data) => {
            if (data) {
                if (data.length == 0) {
                    document.getElementById("cpu_util_div").innerText = "N/A";
                    changeCircle("red", "cpu-dot", "0")
                } else {
                    const cpuUsage = data.cpu_util;
                    const cpuUsagestr = String(data.cpu_util);

                    if(cpuUsage==100){
                        cpuUsage = Math.trunc(cpuUsage);
                    }
                    document.getElementById("cpu_util_div").innerText = cpuUsage + "%";

                    if (data.cpu_util < 60) {
                        changeCircle("rgb(54, 73, 247)", "dot", cpuUsagestr);
                    } else if (data.cpu_util < 85) {
                        changeCircle("rgb(245, 208, 22)", "dot", cpuUsagestr);
                    } else if (data.cpu_util > 85) {
                        changeCircle("red", "dot", cpuUsagestr);
                    }
                }
            }
        });
    }

function updateGpuDiv(gpuIndex) {
    fetch("/gpu_util")
        .then(function(response) {
            if (!response.ok) {
                document.getElementById("gpu_util_div").innerText = "N/A";
                updateVramDiv(0);
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
                        changeCircle("rgb(54, 73, 247)", "gpu-dot", String(data[0]));
                    } else if (data[0] < 85) {
                        changeCircle("rgb(245, 208, 22)", "gpu-dot", String(data[0]));
                    } else if (data[0] >= 85) {
                        changeCircle("red", "gpu-dot", String(data[0]));
                    }
                    updateVramDiv(0);
                }
                if (data.length > 1) { //TODO fix flickering, very inefficient!!
                    let currentIndex = gpuIndex;
                    const gpuDot = document.getElementById("gpu-dot");
                    const utilSpan = document.createElement("span"); //very futile attempt at trying to speed things up
                    const nameDiv = document.createElement("div");
                    const containerSpan = document.createElement("span");
                    const leftI = document.createElement("i");
                    const rightI = document.createElement("i");
                    const titleSpan = document.createElement("span");

                    while (gpuDot.firstChild) {
                        gpuDot.removeChild(gpuDot.firstChild);
                    }

                    function prevGpu() {
                        currentIndex = (currentIndex - 1 + data.length) % data.length;
                        updateDisplay();
                        updateVramDiv(currentIndex);
                    }

                    function nextGpu() {
                        currentIndex = (currentIndex + 1) % data.length;
                        updateDisplay();
                        updateVramDiv(currentIndex);
                    }

                    const gpuUtilValue = gpuDot.appendChild(utilSpan);
                    setAttributes(gpuUtilValue, {
                        id: "gpu_util_div",
                        class: "circle-values",
                    });

                    const gpuNameDiv = gpuDot.appendChild(nameDiv);
                    setAttributes(gpuNameDiv, {
                        "class" : "resources-details",
                        "id" : "gpu-name"
                    })

                    const gpuSelectContainer = gpuDot.appendChild(containerSpan);
                    gpuSelectContainer.classList.add("circle-titles");

                    const leftArrow = gpuSelectContainer.appendChild(leftI);
                    leftArrow.setAttribute("class", "left-arrow");
                    leftArrow.onclick = prevGpu;

                    const gpuDotTitleScrollable = gpuSelectContainer.appendChild(titleSpan);

                    const rightArrow = gpuSelectContainer.appendChild(rightI);
                    rightArrow.setAttribute("class", "right-arrow");
                    rightArrow.onclick = nextGpu;

                    function updateDisplay() {
                        fetch("/gpu_util")
                            .then((response) => response.json())
                            .then((data) => {
                                document.getElementById("gpu_util_div").innerText = data[currentIndex] + "%";

                                if (data[currentIndex] < 60) {
                                    changeCircle(
                                        "rgb(54, 73, 247)",
                                        "gpu-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] < 85) {
                                    changeCircle(
                                        "rgb(245, 208, 22)",
                                        "gpu-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] >= 85) {
                                    changeCircle("red", "gpu-dot", String(data[currentIndex]));
                                }
                                gpuDotTitleScrollable.innerText = `GPU${currentIndex}`;
                            });
                    }
                    updateDisplay();
                    updateVramDiv(currentIndex);
                }
                if (data.length == 0) {
                    document.getElementById("gpu_util_div").innerText = "N/A";
                    changeCircle("red", "gpu-dot", "0");
                    updateVramDiv(0);
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
                    changeCircle("red", "ram-dot", "0")
                } else {
                    let ram_usage = data.ram_util;
                    if(ram_usage==100){
                        ram_usage = Math.trunc(ram_usage);
                    }

                    const ramUsageStr = String(data.ram_util);
                    document.getElementById("ram_util_div").innerText = ram_usage + "%";

                    if (ram_usage < 60) {
                        changeCircle("rgb(54, 73, 247)", "ram-dot", ramUsageStr);
                    } else if (ram_usage < 85) {
                        changeCircle("rgb(245, 208, 22)", "ram-dot", ramUsageStr);
                    } else if (ram_usage >= 85) {
                        changeCircle("red", "ram-dot", ramUsageStr);
                    }
                }
            }
        });
}

function updateVramDiv(gpuIndex) {
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
                        changeCircle("rgb(54, 73, 247)", "vram-dot", String(data[0]));
                    } else if (data[0] < 85) {
                        changeCircle("rgb(245, 208, 22)", "vram-dot", String(data[0]));
                    } else if (data[0] >= 85) {
                        changeCircle("red", "vram-dot", String(data[0]));
                    }
                    updateSysInfo(0);
                }
                if (data.length > 1) {
                    let currentIndex = gpuIndex;
                    const vramDot = document.getElementById("vram-dot");
                    const utilSpan = document.createElement("span"); //very futile attempt at trying to speed things up
                    const nameDiv = document.createElement("div");
                    const containerSpan = document.createElement("span");
                    const leftI = document.createElement("i");
                    const rightI = document.createElement("i");
                    const titleSpan = document.createElement("span");

                    while (vramDot.firstChild) {
                        vramDot.removeChild(vramDot.firstChild);
                    }

                    function prevGpu() {
                        currentIndex = (currentIndex - 1 + data.length) % data.length;
                        updateDisplay();
                        updateGpuDiv(currentIndex);
                        updateSysInfo(currentIndex);
                    }

                    function nextGpu() {
                        currentIndex = (currentIndex + 1) % data.length;
                        updateDisplay();
                        updateGpuDiv(currentIndex);
                        updateSysInfo(currentIndex);
                    }

                    const vramUtilValue = vramDot.appendChild(utilSpan);
                    setAttributes(vramUtilValue, {
                        id: "vram_util_div",
                        class: "circle-values",
                    });

                    const vramNameDiv = vramDot.appendChild(nameDiv);
                    setAttributes(vramNameDiv, {
                        "class" : "resources-details",
                        "id" : "vram-usage"
                    })

                    const vramSelectContainer = vramDot.appendChild(containerSpan);
                    vramSelectContainer.classList.add("circle-titles");

                    const leftArrow = vramSelectContainer.appendChild(leftI);
                    leftArrow.setAttribute("class", "left-arrow");
                    leftArrow.onclick = prevGpu;

                    const vramTitleDiv = vramSelectContainer.appendChild(titleSpan);

                    const rightArrow = vramSelectContainer.appendChild(rightI);
                    rightArrow.setAttribute("class", "right-arrow");
                    rightArrow.onclick = nextGpu;

                    function updateDisplay() {
                        fetch("/vram_util")
                            .then((response) => response.json())
                            .then((data) => {
                                document.getElementById("vram_util_div").innerText = data[currentIndex] + "%";

                                if (data[currentIndex] < 60) {
                                    changeCircle(
                                        "rgb(54, 73, 247)",
                                        "vram-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] < 85) {
                                    changeCircle(
                                        "rgb(245, 208, 22)",
                                        "vram-dot",
                                        String(data[currentIndex])
                                    );
                                } else if (data[currentIndex] >= 85) {
                                    changeCircle("red", "vram-dot", String(data[currentIndex]));
                                }
                                vramTitleDiv.innerText = `GPU${currentIndex}`;
                            });
                    }
                    updateDisplay();
                    updateSysInfo(currentIndex);
                }
                if (data.length == 0) {
                    document.getElementById("vram_util_div").innerText = "N/A";
                    changeCircle("red", "vram-dot", "0");
                    updateSysInfo(0);
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
                const cpuTemperature = data.cpu_temp;
                document.getElementById("cpu-temp-div").innerText = cpuTemperature + "°C";
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
                const tempRectangle = document.getElementById("temp-rectangle");
                const initialTempContainer = document.getElementById("initial-gpu-temp-container");

                while (initialTempContainer.firstChild) {
                    initialTempContainer.removeChild(initialTempContainer.firstChild);
                }

                if (document.getElementById("gpus-temp-container") != null) {
                    document.getElementById("gpus-temp-container").remove();
                }

                const gpusTempContainer = tempRectangle.appendChild(document.createElement("div"));
                gpusTempContainer.setAttribute("id", "gpus-temp-container");

                while (gpusTempContainer.firstChild) {
                    gpusTempContainer.removeChild(gpusTempContainer.firstChild);
                }

                for (const gpu in data) {
                    const gpuTempTitle = gpusTempContainer.appendChild(document.createElement("div"));
                    setAttributes(gpuTempTitle, {
                        class: "mini-box-title",
                        style: "padding-top: 30px;",
                    });
                    gpuTempTitle.innerText = `GPU${gpu}:`;

                    const gpuTempValue = gpusTempContainer.appendChild(document.createElement("div"));
                    setAttributes(gpuTempValue, {
                        class: "mini-box-values",
                        style: "color: white;",
                    });
                    gpuTempValue.innerText = `${data[gpu]}°C`;
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
                const cpuPower = data.cpu_pwr;
                document.getElementById("cpu-pwr-div").innerText = cpuPower + "W";
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
                const pwrRectangle = document.getElementById("pwr-rectangle");
                const initialPowerContainer = document.getElementById("initial-gpu-pwr-container");

                while (initialPowerContainer.firstChild) {
                    initialPowerContainer.removeChild(initialPowerContainer.firstChild);
                }

                if (document.getElementById("gpus-pwr-container") != null) {
                    document.getElementById("gpus-pwr-container").remove();
                }

                const gpusPwrContainer = pwrRectangle.appendChild(document.createElement("div"));
                gpusPwrContainer.setAttribute("id", "gpus-pwr-container");

                while (gpusPwrContainer.firstChild) {
                    gpusPwrContainer.removeChild(gpusPwrContainer.firstChild);
                }

                for (const gpu in data) {
                    const gpuPowerTitle = gpusPwrContainer.appendChild(document.createElement("div"));
                    setAttributes(gpuPowerTitle, {
                        class: "mini-box-title",
                        style: "padding-top: 30px;",
                    });
                    gpuPowerTitle.innerText = `GPU${gpu}:`;

                    const gpuPowerValue = gpusPwrContainer.appendChild(document.createElement("div"));
                    setAttributes(gpuPowerValue, {
                        class: "mini-box-values",
                        style: "color: white;",
                    });
                    gpuPowerValue.innerText = `${data[gpu]}W`;
                }
            }
        });
}

function UpdatePoolInfoDiv() {
    const dropValue = document.getElementById("pool-selector").value;

    fetch(`/pool_stats?pool=${dropValue}`)
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

                const percUsed = data["capacity"].slice(0, -1);
                document.getElementById("storage-bar").setAttribute("value", percUsed);
            }
        });
}

function updateSysInfo(gpuIndex) {
    const cpuNameDiv = document.getElementById("cpu-name");
    const ramUsageDiv = document.getElementById("ram-usage");
    const gpuNameDiv = document.getElementById("gpu-name");
    const vramUsageDiv = document.getElementById("vram-usage");

    fetch("/sysinfo")
        .then(function(response) {
            if (!response.ok) {
                const sysInfoBox = document.getElementById("system-box");

                while(sysInfoBox.firstChild){
                    sysInfoBox.removeChild(sysInfoBox.firstChild);
                }

                const errDiv = sysInfoBox.appendChild(document.createElement("div"));
                errDiv.setAttribute("class", "box-na");
                errDiv.innerText = "N/A";

                cpuNameDiv.innerText = "N/A";
                ramUsageDiv.innerText = "N/A";
                gpuNameDiv.innerText = "N/A";
                vramUsageDiv.innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                const totalVram = (data["vram"][gpuIndex]["total"] / 1073741824).toFixed(1);
                const usedVram = (data["vram"][gpuIndex]["used"] / 1073741824).toFixed(1);
                const osNameDiv = document.getElementById("os-name");
                const kernelNameDiv = document.getElementById("kernel-name");
                const uptimeDiv = document.getElementById("uptime");
                const packagesDiv = document.getElementById("packages");
                const hostDiv = document.getElementById("host");
                const processesDiv = document.getElementById("processes");
                const ipDiv = document.getElementById("ip");
                const interfaceDiv = document.getElementById("interface");

                cpuNameDiv.innerText = data["cpu"];
                ramUsageDiv.innerText = data["memory"];
                gpuNameDiv.innerText = data["gpu"][gpuIndex];
                vramUsageDiv.innerText = `${usedVram}GiB / ${totalVram}GiB`;
                osNameDiv.innerText = data["os"];
                kernelNameDiv.innerText = data["kernel"];
                packagesDiv.innerText = `${data["packages"]} packages installed`;
                uptimeDiv.innerText = `up ${data["uptime"]}`;
                hostDiv.innerText = data["host"];
                processesDiv.innerText = `${data["processes"]} processes running`;
                interfaceDiv.innerText = data["interface"];
                ipDiv.innerText = data["ip"];
                updateNetIo();
            }
        });
}

function updateNetIo(){
    const netioDiv = document.getElementById("netio");
    fetch("/netio")
    .then(function(response){
            if(!response.ok){
                netioDiv.innerText = "N/A";
            }
            else { 
                return response.json()
            }
        })
        .then((data) => {
            if(data){
                netioDiv.innerText = `${data[0]} in ${data[1]} out`;
            }
        }) 
}

function chooseLogo() {
    const osLogoImg = document.getElementById("os-logo");
    
    fetch("/sysinfo")
        .then((response) => response.json()) 
        .then((data) => {
                const os = data["os"].toLowerCase();

                if(os.indexOf("ubuntu") > -1){
                    osLogoImg.setAttribute("src", "/static/logos/ubuntu.svg");
                }
                else if(os.indexOf("debian") > -1){
                    osLogoImg.setAttribute("src", "/static/logos/debian.svg");
                }
                else if(os.indexOf("arch") > -1){
                    osLogoImg.setAttribute("src", "/static/logos/arch.svg");
                }
                else if(os.indexOf("void") > -1){
                    osLogoImg.setAttribute("src", "/static/logos/void.svg");
                }
                else if(os.indexOf("gentoo") > -1){
                    osLogoImg.setAttribute("src", "/static/logos/gentoo.svg");
                }
                else if(os.indexOf("fedora") > -1){
                    osLogoImg.setAttribute("src", "/static/logos/fedora.svg");
                }
                else{
                    osLogoImg.setAttribute("src", "/static/logos/linux.svg");
                }
            })
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
    const currentDate = new Date();
    let currentHour = currentDate.getHours();
    let currentMin = currentDate.getMinutes();
    let currentDay = currentDate.getDate();
    let currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (currentMin < 10) {
        currentMin = "0" + currentMin;
    }
    if (currentHour < 10) {
        currentHour = "0" + currentHour;
    }
    if (currentDay < 10) {
        currentDay = "0" + currentDay;
    }
    if (currentMonth < 10) {
        currentMonth = "0" + currentMonth;
    }

    let time = `${currentHour}:${currentMin}`;
    let date = `${currentDay}/${currentMonth}/${currentYear}`;

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
                const linksWrapper = document.getElementById("links_wrapper");

                if (data.length > 0) {
                    for (const property in data) {
                        const link = linksWrapper.appendChild(document.createElement("a"));

                        link.setAttribute("id", `link${data[property][0]}`);
                        link.setAttribute("href", `${data[property][2]}`);
                        link.setAttribute("class", "link");
                        link.appendChild(document.createTextNode(`${data[property][1]}`));
                    }
                } else {
                    const link = linksWrapper.appendChild(document.createElement("a"));

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
        const poolsDrop = document.getElementById("pool-selector");

        for (const pool in data) {
            const poolsButtons = poolsDrop.appendChild(document.createElement("option"));
            poolsButtons.setAttribute("value", `${data[pool]}`);
            poolsButtons.appendChild(document.createTextNode(`${data[pool]}`));
        }

        poolsDrop.setAttribute("value", data[0]);
        
        FetchDisks();
        if (disk_interval_set == false) {
            disk_interval = setInterval(() => FetchDisks(), 10000);
            disk_interval_set = true;
        }
        sel_pool.addEventListener("change", FetchDisks);
    })
}

function FetchDisks() {
    const dropValue = document.getElementById("pool-selector").value;

    fetch(`/get_disks?pool=${dropValue}`)
    .then((response) => response.json())
    .then((data) => {
        const box = document.getElementById("raid-box");

        while (box.firstChild) {
            box.removeChild(box.firstChild);
        }

        for (line in data) {
            const boxText = box.appendChild(document.createElement("div"));
            boxText.setAttribute("id", `l${line}`);
            boxText.classList.add("raid-text");
            boxText.innerText = data[line];
        }

        UpdatePoolInfoDiv();
        if (poolinfo_interval_set == false) {
            poolinfo_interval = setInterval(() => UpdatePoolInfoDiv(), 10000);
            poolinfo_interval_set = true;
        }
    })
}


function setRefreshRate() {
    fetch("/get_settings")
        .then((response) => response.json())
        .then((data) => {
            refresh_rate = data[2][2];
            setInterval(() => updateCpuDiv(), refresh_rate);
            setInterval(() => updateRamDiv(), refresh_rate);
            setInterval(() => updateGpuDiv(), refresh_rate);
            setInterval(() => updateCpuTempDiv(), refresh_rate);
            setInterval(() => updateGpuTempDiv(), refresh_rate);
            setInterval(() => updateCpuPwrDiv(), refresh_rate);
            setInterval(() => updateGpuPwrDiv(), refresh_rate);
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
                    const gpuFanContainer = document.getElementById('gpu-fan-container');

                    while (gpuFanContainer.firstChild) {
                        gpuFanContainer.removeChild(gpuFanContainer.firstChild);
                    }

                    const gpuFanIcon = gpuFanContainer.appendChild(document.createElement('i'))
                    gpuFanIcon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");

                    const gpuFanTitleSpan = gpuFanContainer.appendChild(document.createElement("span"));
                    gpuFanTitleSpan.setAttribute("class", "fan-title");
                    gpuFanTitleSpan.innerText = ` GPU: `;

                    const gpuFanValueSpan = gpuFanContainer.appendChild(document.createElement("span"));
                    gpuFanValueSpan.setAttribute("class", "fan-value");
                    gpuFanValueSpan.innerText = `No fan available`;
                }
                if (data.length > 0) {
                    const gpuFanContainer = document.getElementById('gpu-fan-container');

                    while (gpuFanContainer.firstChild) {
                        gpuFanContainer.removeChild(gpuFanContainer.firstChild);
                    }

                    for (const gpu in data) {
                        const fanWrapper = gpuFanContainer.appendChild(document.createElement("span"));

                        const fanIcon = fanWrapper.appendChild(document.createElement("i"));
                        fanIcon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");

                        const gpuTitleSpan = fanWrapper.appendChild(document.createElement("span"));
                        gpuTitleSpan.setAttribute("class", "fan-title");
                        gpuTitleSpan.innerText = ` GPU${gpu}: `;

                        const gpuValueSpan = fanWrapper.appendChild(document.createElement("span"));
                        gpuValueSpan.setAttribute("class", "fan-value");
                        gpuValueSpan.innerText = `${data[gpu]}%`;
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
                    const cpuFanContainer = document.getElementById('sys-fan-container');

                    while (cpuFanContainer.firstChild) {
                        cpuFanContainer.removeChild(cpuFanContainer.firstChild);
                    }

                    const cpuFanIcon = cpuFanContainer.appendChild(document.createElement('i'))
                    cpuFanIcon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");

                    const cpuFanTitleSpan = cpuFanContainer.appendChild(document.createElement("span"));
                    cpuFanTitleSpan.setAttribute("class", "fan-title");
                    cpuFanTitleSpan.innerText = ` SYS: `;

                    const cpuFanValueSpan = cpuFanContainer.appendChild(document.createElement("span"));
                    cpuFanValueSpan.setAttribute("class", "fan-value");
                    cpuFanValueSpan.innerText = `No fan available`;
                }
                if (data[0].length > 0) {
                    let i = -1;
                    const cpuFanContainer = document.getElementById('cpu-fan-container');

                    while (cpuFanContainer.firstChild) {
                        cpuFanContainer.removeChild(cpuFanContainer.firstChild);
                    }

                    for (fan in data[0]) {
                        i++;
                        const fanWrapper = cpuFanContainer.appendChild(document.createElement("span"));

                        const fanIcon = fanWrapper.appendChild(document.createElement("i"));
                        fanIcon.setAttribute("class", "fa-solid fa-fan fan-icon fa-2xl");

                        const fanTitle = fanWrapper.appendChild(document.createElement("span"));
                        fanTitle.setAttribute("class", "fan-title");

                        const fanValue = fanWrapper.appendChild(document.createElement("span"));
                        fanValue.setAttribute("class", "fan-value");

                        if (data[0][fan][0] == "") {
                            fanTitle.innerText = ` SYS${i}:`;
                        } else {
                            fanTitle.innerText = ` ${data[0][fan][0]}`;
                        }

                        fanValue.innerText = ` ${data[0][fan][1]} RPM`;
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

    const storageBoxWrapper = document.getElementById("storage-box-wrapper");
    while (storageBoxWrapper.firstChild) {
        storageBoxWrapper.removeChild(storageBoxWrapper.firstChild);
    }

    updateDiskSelector();

    const diskDrop = document.getElementById("disk-selector");
    diskDrop.addEventListener("change", updateSmartDiv);
}

function updateDiskSelector() {
    const storageBoxWrapper = document.getElementById("storage-box-wrapper");

    const diskSelDiv = storageBoxWrapper.appendChild(document.createElement("div"));
    const diskSelector = diskSelDiv.appendChild(document.createElement("select"));
    setAttributes(diskSelector, {
        id: "disk-selector",
        class: "pool-selector",
        name: "disk-selector",
        title: "Choose a drive",
    });

    fetch("/get_drives")
        .then((response) => response.json())
        .then((data) => {
            for (const drive in data.sort()) {
                const drivesButtons = diskSelector.appendChild(document.createElement("option"));
                drivesButtons.value = data[drive];
                drivesButtons.innerText = `${data[drive]}`;
                drivesButtons.setAttribute("id", drive);
            }
            diskSelector.setAttribute("value", data[0]);
            updateSmartDiv();
        });
}

function updateSmartDiv() {
    const storageBoxWrapper = document.getElementById("storage-box-wrapper");

    if (document.getElementById("smart-table") != null) {
        document.getElementById("smart-table").remove();
    }
    const smartTable = storageBoxWrapper.appendChild(document.createElement("table"));
    setAttributes(smartTable, {
        class: "smart-table",
        id: "smart-table",
    });

    const drive = document.getElementById("disk-selector").value;

    fetch(`/smart_data?drive=${drive}`)
        .then(function(response) {
            if (!response.ok) {
                const box = document.getElementById("smart-table");
                const boxWrapper = document.getElementById("storage-box-wrapper");

                if (box) {
                    box.remove();
                }

                const naText = boxWrapper.appendChild(document.createElement("div"));
                naText.classList.add("smart-na");
                naText.innerText = "N/A";
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                if (data[0] == "nvme") {
                    const titleRow = smartTable.appendChild(document.createElement("tr"));

                    const nameTh = titleRow.appendChild(document.createElement("th"));
                    nameTh.innerText = "NAME";

                    const valueTh = titleRow.appendChild(document.createElement("th"));
                    valueTh.innerText = "VALUE";

                    const titleRowChildren = titleRow.children;

                    for (let i = 0; i < titleRowChildren.length; i++) {
                        const child = titleRowChildren[i];
                        child.setAttribute("class", "smart-th");
                    }

                    for (const [key, value] of Object.entries(data[1])) {
                        const attrRow = smartTable.appendChild(document.createElement("tr"));
                        attrRow.setAttribute("class", "smart-tr");

                        const nameTd = attrRow.appendChild(document.createElement("td"));
                        nameTd.innerText = key;

                        const valueTd = attrRow.appendChild(document.createElement("td"));
                        valueTd.innerText = value;
                    }
                } else {
                    const titleRow = smartTable.appendChild(document.createElement("tr"));

                    const idTh = titleRow.appendChild(document.createElement("th"));
                    idTh.innerText = "ID";

                    const nameTh = titleRow.appendChild(document.createElement("th"));
                    nameTh.innerText = "NAME";

                    const valueTh = titleRow.appendChild(document.createElement("th"));
                    valueTh.innerText = "VALUE";

                    const worstTh = titleRow.appendChild(document.createElement("th"));
                    worstTh.innerText = "WORST";

                    const threshTh = titleRow.appendChild(document.createElement("th"));
                    threshTh.innerText = "THRESH";

                    const rawValueTh = titleRow.appendChild(document.createElement("th"));
                    rawValueTh.innerText = "RAW VALUE";

                    const titleRowChildren = titleRow.children;

                    for (let i = 0; i < titleRowChildren.length; i++) {
                        const child = titleRowChildren[i];
                        child.setAttribute("class", "smart-th");
                    }
                    for (const attr in data[1]["table"]) {
                        const attrRow = smartTable.appendChild(document.createElement("tr"));
                        attrRow.setAttribute("class", "smart-tr");

                        const idTd = attrRow.appendChild(document.createElement("td"));
                        idTd.innerText = data[1]["table"][attr]["id"];

                        const nameTd = attrRow.appendChild(document.createElement("td"));
                        nameTd.innerText = data[1]["table"][attr]["name"];

                        const valueTd = attrRow.appendChild(document.createElement("td"));
                        valueTd.innerText = data[1]["table"][attr]["value"];

                        const worstTd = attrRow.appendChild(document.createElement("td"));
                        worstTd.innerText = data[1]["table"][attr]["worst"];

                        const threshTd = attrRow.appendChild(document.createElement("td"));
                        threshTd.innerText = data[1]["table"][attr]["thresh"];

                        const rawValueTd = attrRow.appendChild(document.createElement("td"));
                        rawValueTd.innerText = data[1]["table"][attr]["raw"]["value"];

                        const rowChildren = attrRow.children;

                        for (let i = 0; i < rowChildren.length; i++) {
                            const child = rowChildren[i];
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
    for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function initializeZpoolInfo() {
    if (typeof storageInfo_interval !== "undefined") {
        clearInterval(storageInfo_interval);
        storageInfo_interval_set = false;
    }

    const storageBoxWrapper = document.getElementById("storage-box-wrapper");
    while (storageBoxWrapper.firstChild) {
        storageBoxWrapper.removeChild(storageBoxWrapper.firstChild);
    }

    const poolSelDiv = storageBoxWrapper.appendChild(document.createElement("div"));
    const poolSelector = poolSelDiv.appendChild(document.createElement("select"));
    setAttributes(poolSelector, {
        id: "pool-selector",
        class: "pool-selector",
        name: "pool-selector",
        title: "Choose a ZFS pool",
    });

    const poolPre = storageBoxWrapper.appendChild(document.createElement("pre"));
    const raidBox = poolPre.appendChild(document.createElement("div"));
    setAttributes(raidBox, {
        class: "raid-box",
        id: "raid-box",
    });

    const storageBox = storageBoxWrapper.appendChild(document.createElement("div"));
    storageBox.setAttribute("class", "storage-box");

    const poolStatusWrapper = storageBox.appendChild(document.createElement("div"));
    poolStatusWrapper.setAttribute("class", "pool-info-container");

    const statusTitle = poolStatusWrapper.appendChild(document.createElement("span"));
    statusTitle.setAttribute("class", "pool-info-titles");
    statusTitle.innerText = "Pool status:";

    const statusValue = poolStatusWrapper.appendChild(document.createElement("span"));
    setAttributes(statusValue, {
        id: "pool-status",
        class: "pool-info-values",
    });

    const usedOfWrapper = storageBox.appendChild(document.createElement("div"));
    usedOfWrapper.setAttribute("class", "pool-info-container");

    const usedTitle = usedOfWrapper.appendChild(document.createElement("span"));
    usedTitle.setAttribute("class", "pool-info-titles");
    usedTitle.innerText = "Used: ";

    const usedValue = usedOfWrapper.appendChild(document.createElement("span"));
    setAttributes(usedValue, {
        id: "used-of",
        class: "pool-info-values",
    });

    const freeSpaceWrapper = storageBox.appendChild(document.createElement("div"));
    freeSpaceWrapper.setAttribute("class", "pool-info-container");

    const freeSpaceTitle = freeSpaceWrapper.appendChild(document.createElement("span"));
    freeSpaceTitle.setAttribute("class", "pool-info-titles");
    freeSpaceTitle.innerText = "Free space: ";

    const freeSpaceValue = freeSpaceWrapper.appendChild(document.createElement("span"));
    setAttributes(freeSpaceValue, {
        id: "free-space",
        class: "pool-info-values",
    });

    const storageBarWrapper = storageBox.appendChild(document.createElement("div"));
    storageBarWrapper.setAttribute("class", "pool-info-container");

    const storage_bar = storageBarWrapper.appendChild(document.createElement("progress"));
    setAttributes(storage_bar, {
        id: "storage-bar",
        class: "storage-bar",
        value: "0.001",
        max: "100",
    });

    const percUsed_wrapper = storageBox.appendChild(document.createElement("div"));
    percUsed_wrapper.setAttribute("class", "pool-info-container");

    const percUsed = percUsed_wrapper.appendChild(document.createElement("span"));
    setAttributes(percUsed, {
        class: "perc-used",
        id: "%-used",
    });

    sel_pool = document.getElementById("pool-selector");
    UpdateDropPools();
}

function updateStorageInfo() {
    const storageBoxWrapper = document.getElementById("storage-box-wrapper");

    fetch('/get_storage_usage')
        .then(function(response) {
            if (!response.ok) {
                while (storageBoxWrapper.firstChild) {
                    storageBoxWrapper.removeChild(storageBoxWrapper.firstChild);
                }

                storageBoxWrapper.innerHTML = `
                    <h1 class="disk-na">N/A</h1>
                `
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (data) {
                while (storageBoxWrapper.firstChild) {
                    storageBoxWrapper.removeChild(storageBoxWrapper.firstChild);
                }

                for (const disk in data) {
                    const diskWrapper = storageBoxWrapper.appendChild(document.createElement('div'));
                    diskWrapper.classList.add("disk-wrapper");

                    const drive = data[disk];
                    const bar = diskWrapper.appendChild(document.createElement('progress'));
                    setAttributes(bar, {
                        "value": drive["used_percent"].slice(0, -1),
                        "max": "100",
                        "class": "storage-info-bar"
                    });

                    const stats = diskWrapper.appendChild(document.createElement('div'));
                    stats.classList.add("disk-stats");
                    stats.innerText = `${drive["file_system"]} mounted at ${drive["mounted"]}: ${drive["used_percent"]} used (${drive["used"]}/${drive["total"]})`;
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

async function poolsExist(){
    const response = await fetch("/pools_name");
    if (!response.ok) {
        return false;
    } else {
        return true;
    }
}

window.onload = function() {
    const shutBtn = document.getElementById("shut-btn");
    const restartBtn = document.getElementById("restart-btn");
    const radios = document.getElementsByName('flexRadioDefault');
    disk_interval_set = false;
    poolinfo_interval_set = false;
    storageInfo_interval_set = false;
    restartBtn.addEventListener("click", reboot);
    shutBtn.addEventListener("click", shutdown);

    radios[0].addEventListener("click", initializeStorageInfo);
    poolsExist().then(exists => {
        if(exists){
            radios[1].addEventListener("click", initializeZpoolInfo);
        } else{
            radios[1].setAttribute("disabled", "");
        }
    });
    radios[2].addEventListener("click", showSmart);

    for (let i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            if (i == 0) {
                initializeStorageInfo();
            } else if (i == 1) {
                initializeZpoolInfo();
            } else if (i == 2) {
                showSmart();
            }
        }
    }

    UpdateTimeDiv();
    updateCpuDiv();
    updateGpuDiv();
    updateRamDiv();
    updateCpuTempDiv();
    updateGpuTempDiv();
    updateCpuPwrDiv();
    updateGpuPwrDiv();
    UpdateLinksDiv();
    updateSystemFanDiv();
    updateGpuFanDiv();
    chooseLogo();
};
//By Riccardo Luongo, 08/04/2025