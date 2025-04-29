from flask import *
from subprocess import check_output
import psutil
import zfscheck
from os import system
from threading import *
from nvitop import Device
from db import *
import logging
from datetime import datetime
import settings_db
from flask import Response
import smartcheck
from system_fans import get_system_fans
import json
from logging.handlers import RotatingFileHandler
import traceback
import re
import fastfetch_parse
from time import sleep

initialize_db()
settings_db.initialize_db()

now = datetime.now()
dt_string = now.strftime("%d_%m_%Y_%H_%M_%S")
app = Flask(__name__)
app_settings = settings_db.get_settings()

log_levels = {
    'debug': logging.DEBUG,
    'info': logging.INFO,
    'warning': logging.WARNING,
    'error': logging.ERROR,
    'critical': logging.CRITICAL
}

handler = RotatingFileHandler('log/main.log', maxBytes=int(app_settings[3][2])*1000, backupCount=int(app_settings[0][2]))
handler.setLevel(log_levels[app_settings[1][2]])
formatter = logging.Formatter('[%(levelname)s] [%(asctime)s] - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)
app.logger.setLevel(log_levels[app_settings[1][2]])
log = app.logger
app.secret_key = 'nigga' #not tryna make it secure, only used because it's required to use flash()

url_pattern = re.compile( #url validation, used in bookmarks
    r"^https?:\/\/"
    r"("                                         
        r"(localhost)"
        r"|"                                     
        r"([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})"       #domain
        r"|"                                     
        r"(\d{1,3}(\.\d{1,3}){3})"               #IP
    r")"
    r"(:\d{1,5})?"                               #port
    r"(\/[^\s]*)?"                               #path
    r"(\?[^\s#]*)?"                              #query
    r"(#[^\s]*)?$",                              #fragment
    re.IGNORECASE
)

def is_valid(url):
    return bool(url_pattern.match(url))

devices = Device.all()

def nospace(string):
    """Removes spaces from a string"""
    result = ""
    for char in string:
        if char != " ":
            result += char
    return result

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cpu_util')
def get_cpu_util():
    try:
        return jsonify(cpu_util = str(psutil.cpu_percent(1)))
    except Exception as e:
        log.error(f"Couldn't retrieve the CPU usage: {e}")
        return Response(
            f"Couldn't retrieve the CPU usage: {e}",
            status=500
        )

@app.route('/gpu_util')
def get_gpu_util():
    try:
        utils = []
        for dev in devices:
            if type(dev.gpu_utilization()) == int:
                utils.append(dev.gpu_utilization())
            else:
                utils.append("NaN")
        return utils
    except Exception as e:
        log.error(f"Couldn't retrieve the GPU usage: {e}")
        return Response(
            f"Couldn't retrieve the GPU usage: {e}",
            status=500
        )

@app.route('/ram_util')
def get_ram_util():
    try:
        return jsonify(ram_util = str(psutil.virtual_memory()[2]))
    except Exception as e:
        log.error(f"Couldn't retrieve the RAM usage: {e}")
        return Response(
            f"Couldn't retrieve the RAM usage: {e}",
            status=500
        )        

@app.route('/vram_util')
def get_vram_util():
    try:
        vram_utils = []
        for dev in devices:
            if type(dev.memory_percent()) == float:
                vram_utils.append(dev.memory_percent())
            else:
                vram_utils.append("NaN")
        return vram_utils
    except Exception as e:
        log.error(f"Couldn't retrieve the VRAM usage: {e}")
        return Response(
            f"Couldn't retrieve the VRAM usage: {e}",
            status=500
        )

@app.route('/cpu_temp')
def get_cpu_temp():
    try:
        cpu_temperature = psutil.sensors_temperatures()['coretemp'][0].current
        return jsonify(cpu_temp = str(int(cpu_temperature)))
    except Exception as e:
        log.error(f"Couldn't retrieve the CPU temperature: {e}")
        return Response(
            f"Couldn't retrieve the CPU temperature: {e}",
            status=500
        )

@app.route('/gpu_temp')
def get_gpu_temp():
    try:
        gpu_temps = [] 
        for dev in devices:
            if type(dev.temperature()) == int:
                gpu_temps.append(dev.temperature())
            else: gpu_temps.append("NaN")
        return gpu_temps
    except Exception as e:
        log.error(f"Couldn't retrieve the GPU temperature: {e}")
        return Response(
            f"Couldn't retrieve the GPU temperature: {e}",
            status=500
        )

@app.route('/cpu_pwr')
def get_cpu_pwr():
    try:
        cpu_power = nospace(check_output("turbostat --Summary --quiet --show PkgWatt --interval 1 -n1 | sed -n '2p'", shell=True, encoding='cp850').lower().split('\n')[0])
        return jsonify(cpu_pwr = str(cpu_power))
    except Exception as e:
        log.error(f"Couldn't retrieve the CPU power usage: {e}")
        return Response(
            f"Couldn't retrieve the CPU power usage: {e}",
            status=500
        )

@app.route('/gpu_pwr')
def get_gpu_pwr():
    try:
        gpus_pwr = []
        for dev in devices:
            if type(dev.power_usage()) == int:
                gpus_pwr.append(dev.power_usage()/1000)
            else:
                gpus_pwr.append("NaN")
        return gpus_pwr
    except Exception as e:
        log.error(f"Couldn't retrieve the GPU power usage: {e}")
        return Response(
            f"Couldn't retrieve the GPU power usage: {e}",
            status=500
        )

@app.route('/sysinfo')
def get_sysinfo():
    try:
        return jsonify(fastfetch_parse.parseOutput())
    except Exception as e:
        log.error(f"Couldn't retrieve system information: {e}")
        return Response(
            f"Couldn't retrieve system information: {e}",
            status=500
        )

@app.route('/shutdown')
def shutdown_pc():
    try:
        shutdown_command = check_output('shutdown -h -t 10 2>&1', shell=True, encoding='cp850').split(',')[0]
        log.info("The system is shutting down in 10 seconds.")
        return jsonify(shutdown_comm = shutdown_command)
    except Exception as e:
        log.error(f"Couldn't shut down the system: {e}")
        return Response(
            f"Couldn't shut down the system: {e}",
            status=500
        )

@app.route('/reboot')
def reboot_pc():
    log.info("System restarting!")
    system("reboot")

@app.route('/get_links')
def links():
    try:
        return jsonify(get_links())
    except Exception as e:
        log.error(f"Couldn't retrieve links: {e}")
        return Response(
            f"Couldn't retrieve links: {e}",
            status = 500
        )

@app.route('/edit_links', methods = ["GET", "POST"])
def edit_links():
    if request.method == "POST":
        name = request.form.get("link-name")
        url = request.form.get("link-url")

        if is_valid(url):
            try:
                create_link(name, url)
                log.info(f"Created link '{name}', URL: {url}")
            except Exception as e:
                log.error(f"Couldn't create new link: {e}")
                flash("Couldn't create link. Check the logs for further information")
                return redirect(url_for("edit_links"))
        else:
            flash("Couldn't create link: URL is not valid!")
            return redirect(url_for("edit_links"))
    return render_template('edit_links.html')

@app.route('/del_all', methods=["POST"])
def delete_all_links():
    try:
        delete_all()
        log.info('Deleted all links')
        return Response(
            f"Deleted all links",
            status=200
        )
    except Exception as e:
        log.error(f"Couldn't delete all the links: {e}")
        return Response(
            f"Couldn't delete all the links: {e}",
            status=500
        )
    
@app.route('/del_link', methods = ["POST"])
def delete_link_url():
    link_id = request.get_json()

    try:
        delete_link(link_id)
        log.info(f"Deleted link #{link_id}")
        return Response(
            f"Deleted link #{link_id}",
            status=200
        )
    except Exception as e:
        log.error(f"Couldn't delete link #{link_id}: {e}")
        return Response(
            f"Couldn't delete link #{link_id}: {e}",
            status=500
        )    

@app.route('/pools_name')
def get_pools_name():
    try:
        return jsonify(zfscheck.poolname())
    except Exception as e:
        log.error(f"Couldn't retrieve the ZFS pools in the system: {e}")
        return Response(
            f"Couldn't retrieve the ZFS pools in the system: {e}",
            status=500
        )

@app.route('/get_disks')
def get_disks_from_pool():
    try:
        pool = request.args["pool"]
        zfsinfo = zfscheck.zfscheck(pool)
        return jsonify(zfsinfo)
    except Exception as e:
        log.error(f"Couldn't check the status of the ZFS pool '{pool}': {e}")
        return Response(
            f"Couldn't check the status of the ZFS pool '{pool}': {e}",
            status=500
        )

@app.route('/pool_stats')
def get_pool_stats():
    try:
        pool = request.args["pool"]
        pool_stats = zfscheck.getpoolinfo(pool)
        return jsonify(pool_stats)
    except Exception as e:
        log.error(f"Couldn't retrieve information about the ZFS pool '{pool}': {e}")
        return Response(
            f"Couldn't retrieve information about the ZFS pool '{pool}': {e}",
            status=500
        )

@app.route('/settings', methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        try:
            max_log_file_size = request.form.get("size-num")
            max_log_files = request.form.get("files-num")
            log_level = request.form.get("log-selector")
            refresh_rate = request.form.get("refresh-num")

            settings_db.edit_settings(('max_size', max_log_file_size, 4))
            settings_db.edit_settings(('max_files', max_log_files, 1))
            settings_db.edit_settings(('log_level', log_level, 2))
            settings_db.edit_settings(('refresh_rate', refresh_rate, 3))
            
            log.info("Settings changed successfully")
            return redirect(url_for("settings"))
        except Exception as e:
            log.error(f"Couldn't change settings: {e}")
            flash("Couldn't change settings. Check the logs for further information")
            return redirect(url_for("settings"))
    return render_template("settings.html")

@app.route('/get_settings')
def get_settings():
    try:
        return jsonify(settings_db.get_settings())
    except Exception as e:
        log.error(f"Couldn't retrieve settings: {e}")
        return Response(
            f"Couldn't retrieve settings: {e}",
            status=500
        )

@app.route('/reset_settings', methods = ["POST"])
def reset_settings():
    try:
        settings_db.reset()
        log.info("Restored default settings")
        return Response(
            f"Restored default settings",
            status=200
        )
    except Exception as e:
        log.error(f"Couldn't restore the default settings: {e}")
        return Response(
            f"Couldn't restore the default settings: {e}",
            status=500
        )

@app.route('/gpu_fan_speed')
def get_gpu_fan_speed():
    try:
        gpu_fans = []
        for dev in devices:
            if type(dev.fan_speed()) == int:
                gpu_fans.append(dev.fan_speed())
            else:
                gpu_fans.append("NaN")
        return jsonify(gpu_fans)
    except Exception as e:
        log.error(f"Couldn't retrieve the GPU fan speed: {e}")
        return Response(
            f"Couldn't retrieve the GPU fan speed {e}",
            status=500
        )

@app.route('/system_fans_speed')
def get_system_fans_speed():
    try:
        return get_system_fans()
    except Exception as e:
        log.error(f"Couldn't retrieve the speed of the fans in the system: {e}")
        return Response(
            f"Couldn't retrieve the speed of the fans in the system: {e}",
            status=500
        )

@app.route('/smart_data')
def get_smart_data():
    drive = request.args["drive"]
    try:
        return jsonify(smartcheck.smartcheck(drive))
    except Exception as e:
        log.error(f"Couldn't retrieve SMART data: {e}")
        return Response(
            f"Couldn't retrieve SMART data: {e}",
            status=500
        )
    
@app.route('/get_drives')
def get_drives():
    try:
        return smartcheck.get_drives()
    except Exception as e:
        log.error(f"Couldn't retrieve drives in the system: {e}")
        return Response(
            f"Couldn't retrieve drives in the system: {e}",
            status=500
        )

@app.route('/edit_link', methods = ["POST"])
def edit_link():
    try:
        data = request.get_json()

        name = data[0]
        url = data[1]
        id = data[2]
        
        if is_valid(url):
            mod_link(name, url, id)
            log.info(f"Modified link #{id}")
            return Response(
                f"Modified link #{id}",
                status=200
            )
        else:
            log.error(f"Couldn't modify link #{id}: URL is not valid!")
            return Response(
                f"URL not valid",
                status=400
            )
    except Exception as e:
        log.error(f"Couldn't modify link #{id}: {e}")
        return Response(
            f"Couldn't modify link #{id}",
            status=500
        )

@app.route('/get_storage_usage')
def get_storage_usage():
    try:
        command = """df -h | grep -vE '^(overlay|tmpfs|devtmpfs|squashfs|proc|sysfs|efivarfs|cgroup2?|debugfs|tracefs|pstore|securityfs|devpts|fusectl|mqueue|autofs|rpc_pipefs|binfmt_misc|bpf)' | tr -s ' ' | jq -sR 'split("\n") | .[1:-1] | map(split(" ")) |
        map({"file_system": .[0],
            "total": .[1],
            "used": .[2],
            "available": .[3],
            "used_percent": .[4],
            "mounted": .[5]})'
        """
        storage_usage = check_output(command, shell=True, encoding='cp850')
        return jsonify(json.loads(storage_usage))
    except Exception as e:
        log.error(f"Couldn't retrieve storage usage: {e}")
        return Response(
            "Couldn't retrieve storage usage",
            status=500
        )

@app.route('/netio')
def get_netio():
    interface = request.args['interface']
    counter = psutil.net_io_counters(pernic=True, nowrap=True)[interface]
    oldDown = counter.bytes_recv
    oldUp = counter.bytes_sent

    sleep(1)

    counter = psutil.net_io_counters(pernic=True, nowrap=True)[interface]
    newDown = counter.bytes_recv
    newUp = counter.bytes_sent

    down = newDown - oldDown
    up = newUp - oldUp

    if down < 1024:
        down = str(down) + "B/s"
    elif 1024 < down < 1048576:
        down /= 1024
        down = str(round(down, 2)) + "KiB/s"
    elif 1048576 <= down < 1073741824:
        down /= 1048576
        down = str(round(down, 2)) + "MiB/s"
    elif down >= 1073741824:
        down /= 1073741824
        down = str(round(down, 2)) + "GiB/s"

    if up < 1024:
        up = str(up) + "B/s"
    elif 1024 < up < 1048576:
        up /= 1024
        up = str(round(up, 2)) + "KiB/s"
    elif 1048576 <= up < 1073741824:
        up /= 1048576
        up = str(round(up, 2)) + "MiB/s"
    elif up >= 1073741824:
        up /= 1073741824
        up = str(round(up, 2)) + "GiB/s"

    return [down, up]

log.info("App started succesfully")
#By Riccardo Luongo, 29/04/2025