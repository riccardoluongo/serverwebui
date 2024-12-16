from os import listdir
from subprocess import check_output
from re import search
import json

def get_drives():
    drives = [dev for dev in listdir("/dev/") if search("^[hs]d.$", dev) != None]
    nvme_drives = [dev for dev in listdir("/dev/") if search(".*nvme[^a-zA-Z]*\d$", dev) != None]
    for drive in nvme_drives:
        drives.append(drive)
    return drives

def smartcheck(drive):
    drive = '/dev/' + drive
    attr_json = check_output(f'/usr/sbin/smartctl -a {drive} --json', shell=True, encoding='cp850')
    attributes = json.loads(attr_json)

    if 'nvme' in drive:
        return ('nvme',attributes['nvme_smart_health_information_log'])
    else:
        return ('ata',attributes['ata_smart_attributes'])
#by Riccardo Luongo, 16/12/2024