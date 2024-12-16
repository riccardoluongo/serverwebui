from flask import *
from subprocess import check_output
import psutil
import zfscheck
from os import system
from threading import *
from nvitop import Device
from db import *
import logging
import sys
from datetime import datetime
import settings_db
from flask import Response
import smartcheck
from system_fans import get_system_fans
import json
from logging.handlers import RotatingFileHandler

now = datetime.now()
dt_string = now.strftime("%d_%m_%Y_%H_%M_%S")

handler = RotatingFileHandler('log/main.log', maxBytes=1000000, backupCount=10)
handler.setLevel(logging.INFO)
formatter = logging.Formatter('[%(levelname)s] [%(asctime)s] - %(message)s')
handler.setFormatter(formatter)
app.logger.addHandler(handler)
log = app.logger

global selected_pool
if len(zfscheck.poolname()) > 0:
	selected_pool = zfscheck.poolname()[0]

global selected_drive
if len(smartcheck.get_drives()) > 0:
    selected_drive = sorted(smartcheck.get_drives())[0]

initialize_db()
settings_db.initialize_db()
settings = settings_db.get_settings()

app = Flask(__name__)

if settings[1][1][2] == 'debug': 
    log.setLevel(logging.DEBUG)
elif settings[1][1][2] == 'info': 
    log.setLevel(logging.INFO)
elif settings[1][1][2] == 'warning':
    log.setLevel(logging.WARNING)
elif settings[1][1][2] == 'error':
    log.setLevel(logging.ERROR)
elif settings[1][1][2] == 'critical':
    log.setLevel(logging.CRITICAL)

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
            status=500,
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
            status=500,
        )

@app.route('/ram_util')
def get_ram_util():
    try:
        return jsonify(ram_util = str(psutil.virtual_memory()[2]))
    except Exception as e:
        log.error(f"Couldn't retrieve the RAM usage: {e}")
        return Response(
            f"Couldn't retrieve the RAM usage: {e}",
            status=500,
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
            status=500,
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
            status=500,
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
            status=500,
        )

@app.route('/cpu_pwr')
def get_cpu_pwr():
    try:
        #this is unstable since it relies on turbostat and may break in case of a kernel update. In that case, update the linux-tools-common package
        cpu_power = nospace(check_output("turbostat --Summary --quiet --show PkgWatt --interval 1 -n1 | sed -n '2p'", shell=True, encoding='cp850').lower().split('\n')[0])
        return jsonify(cpu_pwr = str(cpu_power))
    except Exception as e:
        log.error(f"Couldn't retrieve the CPU power usage: {e}")
        return Response(
            f"Couldn't retrieve the CPU power usage: {e}",
            status=500,
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
            status=500,
        )

@app.route('/sysinfo')
def get_sysinfo():
    try:
        sysinfo_comm = check_output("neofetch --backend '' | sed 's/\x1B\[[0-9;]*m//g' | sed 's/,//g'", shell=True, encoding='cp850').split('\n')[2:][:-5]
        return jsonify(sysinfo = sysinfo_comm)
    except Exception as e:
        log.error(f"Couldn't retrieve system information: {e}")
        return Response(
            f"Couldn't retrieve system information: {e}",
            status=500,
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
            status=500,
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

@app.route('/edit_links')
def edit_links():
    return render_template('edit_links.html')

@app.route('/create_link_url')
def create_link_url():
    name = request.args['name']
    url = request.args['url']

    create_link(name, url)
    log.info(f"Created link '{name}', URL: {url}")

    return redirect('/edit_links')

@app.route('/del_all')
def delete_all_links():
    delete_all()
    log.info('Deleted all links')
    
    return redirect('/edit_links')

@app.route('/del_link')
def delete_link_url():
    link_id = request.args['id']

    delete_link(link_id)
    log.info(f"Deleted link #{link_id}")
    
    return redirect('/edit_links')

@app.route('/pools_name')
def get_pools_name():
    return zfscheck.poolname()

@app.route('/choose_pool')
def choose_pool():
    global selected_pool
    if request.args['pool'] != "":
        selected_pool = request.args['pool']
        log.info(f"Selected '{selected_pool}' pool")
    else:
        log.warning(f"'selected_pool' is an empty string. The value has been set to the first pool in the system ({selected_pool})")#remove if async func fixed
    return redirect('/')

@app.route('/get_disks')
def get_disks_from_pool():
    code = zfscheck.zfscheck(selected_pool)
    if code[0] == 0:
        return jsonify(code[1])
    else:
        return Response(
            f"Couldn't retrieve the status of the ZFS pool '{selected_pool}': {code[1]}",
            status=500,
        )

@app.route('/pool_stats')
def get_pool_stats():
    code = zfscheck.getpoolinfo(selected_pool)
    if code[0] == 0:
        return code[1]
    else:
        return Response(
            f"Couldn't retrieve information about the ZFS pool '{selected_pool}': {code[1]}",
            status=500,
        )

@app.route('/settings')
def settings():
    return render_template('settings.html')

@app.route('/get_settings')
def get_settings():
    code = settings_db.get_settings()
    if code[0] == 0:
        return jsonify(code[1])
    else:
        return Response(
            f"Couldn't retrieve settings: {code[1]}",
            status=500,
        )

@app.route('/change_max_log_files')
def change_max_log_files():
    value = request.args['value']
    code = settings_db.edit_settings(('max_files', value, 1))
    if code == 0:
        log.info(f"Updated preference 'max_files', value={value}")
        return redirect('/settings')
    else:
        return Response(
            f"Couldn't change the 'max_files' preference: {code[1]}",
            status=500,
        )            

@app.route('/reset_settings')
def reset_settings():
    code = settings_db.reset()
    if code == 0:
        return redirect('/settings')
    else:
        return Response(
            f"Couldn't restore the default settings: {code[1]}",
            status=500,
        )

@app.route('/change_log_level')
def change_log_level():
    value = request.args['value']
    code = settings_db.edit_settings(('log_level', value, 2))
    if code == 0:
        log.info(f"Updated preference 'log_level', value={value}")
        return redirect('/settings')
    else:
        return Response(
            f"Couldn't change the 'log_level' preference: {code[1]}",
            status=500,
        )

@app.route('/change_refresh_rate')
def change_refresh_rate():
    value = request.args['value']
    code = settings_db.edit_settings(('refresh_rate', value, 3))
    if code == 0:
        log.info(f"Updated preference 'refresh_rate', value={value}")
        return redirect('/settings')
    else:
        return Response(
            f"Couldn't change the 'refresh_rate' preference: {code[1]}",
            status=500,
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
            status=500,
        )

@app.route('/system_fans_speed')
def get_system_fans_speed():
    try:
        return get_system_fans()
    except Exception as e:
        log.error(f"Couldn't retrieve the speed of the fans in the system: {e}")
        return Response(
            f"Couldn't retrieve the speed of the fans in the system: {e}",
            status=500,
        )

@app.route('/choose_drive')
def choose_drive():
    global selected_drive
    if request.args['drive'] != "":
        selected_drive = request.args['drive']
        log.debug(f"Selected drive '{selected_drive}'")
    else:
        log.warning(f"'selected_drive' is an empty string. The value has been set to the first pool in the system ({selected_drive}).")
    return redirect('/')

@app.route('/smart_data')
def get_smart_data():
    try:
        return jsonify(smartcheck.smartcheck(selected_drive))
    except Exception as e:
        log.error(f"Couldn't retrieve SMART data: {e}")
        return Response(
            f"Couldn't retrieve SMART data: {e}",
            status=500,
        )
    
@app.route('/get_drives')
def get_drives():
    try:
        return smartcheck.get_drives()
    except Exception as e:
        log.error(f"Couldn't retrieve drives in the system: {e}")
        return Response(
            f"Couldn't retrieve drives in the system: {e}",
            status=500,
        )

@app.route('/edit_link')
def edit_link():
    try:
        name = request.args['name']
        url = request.args['url']
        id = request.args['id']
        
        mod_link(name, url, id)
        return redirect('/edit_links')
    except Exception as e:
        log.error(f"Couldn't edit link #{id}: {e}")
        return Response(
            "Couldn't edit link",
            status=500
        )

@app.route('/get_storage_usage')
def get_storage_usage():
    try:
        command = """df -h --exclude-type=overlay --exclude-type=tmpfs --exclude-type=efivarfs | tr -s ' '   | jq -sR   'split("\n") | .[1:-1] | map(split(" ")) |
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

print("App started succesfully")
log.info("App started succesfully")
#By Riccardo Luongo, 16/12/2024