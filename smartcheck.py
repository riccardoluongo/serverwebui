from os import listdir
from subprocess import run, STDOUT, PIPE
from re import search
import json
import main

def get_drives():
    drives = [dev for dev in listdir("/dev/") if search("^[hs]d.$", dev) != None]
    nvme_drives = [dev for dev in listdir("/dev/") if search(".*nvme[^a-zA-Z]*\d$", dev) != None]
    for drive in nvme_drives:
        drives.append(drive)
    return drives

def smartcheck(drive):
    drive = '/dev/' + drive

    attr_json = run(f'/usr/sbin/smartctl -a {drive} --json', shell=True, text=True, stdout=PIPE, stderr=STDOUT)
    if attr_json.returncode == 1:
        main.app.logger.error(f"Couldn't retrieve SMART data for drive {drive}: {e}")
        return

    attributes = json.loads(attr_json.stdout)

    if 'nvme' in drive:
        return ('nvme',attributes['nvme_smart_health_information_log'])
    else:
        return ('ata',attributes['ata_smart_attributes'])
#by Riccardo Luongo, 21/05/2025