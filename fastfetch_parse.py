from subprocess import check_output
from json import loads
from math import trunc

def getUptime(uptimeMilliseconds):
    uptimeMilliseconds /= 1000
    seconds = trunc(uptimeMilliseconds % 60)
    uptimeMilliseconds /= 60
    minutes = trunc(uptimeMilliseconds % 60)
    uptimeMilliseconds /= 60
    hours = trunc(uptimeMilliseconds % 24)
    uptimeMilliseconds /= 24
    days = trunc(uptimeMilliseconds)

    return(f"{days} days {hours} hours {minutes} minutes")

def parseOutput():
    commandOutput = check_output("fastfetch --format json", universal_newlines=True, encoding="cp850", shell=True)
    jsonOutput = loads(commandOutput)
    modules = ["Title", "OS", "Host", "Kernel", "Uptime", "CPU", "GPU", "Memory", "Swap"]
    filteredOutput = []

    for module in jsonOutput:
        if module["type"] in modules:
            filteredOutput.append(module["result"])

    sysInfo = {
        "hostname" : filteredOutput[0]["hostName"],
        "os" : filteredOutput[1]["prettyName"],
        "host" : filteredOutput[2]["name"],
        "kernel" : filteredOutput[3]["name"] + " " + filteredOutput[3]["release"],
        "uptime" : getUptime(filteredOutput[4]["uptime"]),
        "cpu" : filteredOutput[5]["cpu"] + " @ " + str(filteredOutput[5]["frequency"]["max"]/1000) + "GHz",
        "gpu" : [gpu["name"] for gpu in filteredOutput[6]],
        "memory" : f"{round(filteredOutput[7]['used']/1048576)}MiB / {round(filteredOutput[7]['total']/1048576)}MiB"
    }
    print(sysInfo)
    
parseOutput()
#by Riccardo Luongo, 02/04/2025 I <3 you M