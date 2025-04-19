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
    jsonOutput = loads(check_output("fastfetch -c fastfetch.jsonc --format json", universal_newlines=True, encoding="cp850", shell=True))

    sysInfo = {
        "hostname" : jsonOutput[0]["result"]["hostName"],
        "os" : jsonOutput[1]["result"]["prettyName"],
        "host" : jsonOutput[2]["result"]["name"],
        "kernel" : jsonOutput[3]["result"]["name"] + " " + jsonOutput[3]["result"]["release"],
        "uptime" : getUptime(jsonOutput[4]["result"]["uptime"]),
        "cpu" : jsonOutput[5]["result"]["cpu"],
        "gpu" : [gpu["name"] for gpu in jsonOutput[6]["result"]],
        "vram" : [gpu["memory"]["dedicated"] for gpu in jsonOutput[6]["result"]],
        "memory" : f"{round(jsonOutput[7]['result']['used']/1073741824, 1)}GiB / {round(jsonOutput[7]['result']['total']/1073741824, 1)}GiB",
        "processes" : jsonOutput[8]["result"],
        "packages" : jsonOutput[9]["result"]["all"],
        "ip" : jsonOutput[10]["result"][0]["ipv4"] if len(jsonOutput[10]["result"]) > 0 else "N/A",
        "interface" : jsonOutput[10]["result"][0]["name"] if len(jsonOutput[10]["result"]) > 0 else "N/A"
    }
    return sysInfo
#by Riccardo Luongo, 19/04/2025