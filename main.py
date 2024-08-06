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
import logrotator
import settings_db
from flask import Response
import smartcheck
from system_fans import get_system_fans

now = datetime.now()
dt_string = now.strftime("%d_%m_%Y_%H_%M_%S")

sys.stdout = open(f'log/{dt_string}.log', 'a') #redirect stdout to a file for logging purposes
sys.stderr = sys.stdout #redirect stderr to the same file

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

log = logging.getLogger('werkzeug')

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

logrotator.log_rotate('log', int(settings[1][0][2]))

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
        print(f"ERROR - Error while retrieving the CPU usage: {e}")
        return Response(
            f"Error while retrieving the CPU usage: {e}",
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
        print(f"ERROR - Error while retrieving the GPU usage: {e}")
        return Response(
            f"Error while retrieving the GPU usage: {e}",
            status=500,
        )

@app.route('/ram_util')
def get_ram_util():
    try:
        return jsonify(ram_util = str(psutil.virtual_memory()[2]))
    except Exception as e:
        print(f"ERROR - Error while retrieving the RAM usage: {e}")
        return Response(
            f"Error while retrieving the RAM usage: {e}",
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
        print(f"ERROR - Error while retrieving the VRAM usage: {e}")
        return Response(
            f"Error while retrieving the VRAM usage: {e}",
            status=500,
        )

@app.route('/cpu_temp')
def get_cpu_temp():
    try:
        cpu_temperature = psutil.sensors_temperatures()['coretemp'][0].current
        return jsonify(cpu_temp = str(int(cpu_temperature)))
    except Exception as e:
        print(f"ERROR - Error while retrieving the CPU temperature: {e}")
        return Response(
            f"Error while retrieving the CPU temperature: {e}",
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
        print(f"ERROR - Error while retrieving the GPU temperature: {e}")
        return Response(
            f"Error while retrieving the GPU temperature: {e}",
            status=500,
        )

@app.route('/cpu_pwr')
def get_cpu_pwr():
    try:
        #this is unstable since it relies on turbostat and may break in case of a kernel update. In that case, update the linux-tools-common package
        cpu_power = nospace(check_output("turbostat --Summary --quiet --show PkgWatt --interval 1 -n1 | sed -n '2p'", shell=True, encoding='cp850').lower().split('\n')[0])
        return jsonify(cpu_pwr = str(cpu_power))
    except Exception as e:
        print(f"ERROR - Error while retrieving the CPU power usage: {e}")
        return Response(
            f"Error while retrieving the CPU power usage: {e}",
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
        print(f"ERROR - Error while retrieving the GPU power usage: {e}")
        return Response(
            f"Error while retrieving the GPU power usage: {e}",
            status=500,
        )

@app.route('/sysinfo')
def get_sysinfo():
    try:
        sysinfo_comm = check_output("neofetch --backend '' | sed 's/\x1B\[[0-9;]*m//g' | sed 's/,//g'", shell=True, encoding='cp850').split('\n')[2:][:-5]
        return jsonify(sysinfo = sysinfo_comm)
    except Exception as e:
        print(f"ERROR - Error while retrieving system information: {e}")
        return Response(
            f"Error while retrieving system information: {e}",
            status=500,
        )

@app.route('/shutdown')
def shutdown_pc():
    try:
        shutdown_command = check_output('shutdown -h -t 10 2>&1', shell=True, encoding='cp850').split(',')[0]
        print("INFO - The system is shutting down in 10 seconds.")
        return jsonify(shutdown_comm = shutdown_command)
    except Exception as e:
        print(f"ERROR - Error while trying to shut down the system: {e}")
        return Response(
            f"Error while trying to shut down the system: {e}",
            status=500,
        )

@app.route('/reboot')
def reboot_pc():
    system("reboot")

@app.route('/get_links')
def links():
    return jsonify(get_links())

@app.route('/edit_links')
def edit_links():
    return render_template('edit_links.html')

@app.route('/create_link_url')
def create_link_url():
    name = request.args['name']
    url = request.args['url']

    create_link(name, url)
    print(f"INFO - Created a new link. Name: {name}, Url: {url}")

    return redirect('/edit_links')

@app.route('/del_all')
def delete_all_links():
    delete_all()
    print('INFO - All the links have been deleted.')
    
    return redirect('/edit_links')

@app.route('/del_link')
def delete_link_url():
    link_id = request.args['id']

    delete_link(link_id)
    print(f"INFO - Link [{link_id}] has been deleted.")
    
    return redirect('/edit_links')

@app.route('/pools_name')
def get_pools_name():
    return zfscheck.poolname()

@app.route('/choose_pool')
def choose_pool():
    global selected_pool
    if request.args['pool'] != "":
        selected_pool = request.args['pool']
        print(f"INFO - {selected_pool} pool has been selected.")
    else:
        print(f"WARNING - 'selected_pool' is an empty string. The value has been set to the first pool in the system ({selected_pool}).")
    return redirect('/')

@app.route('/get_disks')
def get_disks_from_pool():
    code = zfscheck.zfscheck(selected_pool)
    if code[0] == 0:
        return jsonify(code[1])
    else:
        return Response(
            f"Error while checking the status of the zfs pool '{selected_pool}': {code[1]}",
            status=500,
        )

@app.route('/pool_stats')
def get_pool_stats():
    code = zfscheck.getpoolinfo(selected_pool)
    if code[0] == 0:
        return code[1]
    else:
        return Response(
            f"Error while while retrieving information about the zfs pool '{selected_pool}': {code[1]}",
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
            f"Error while retrieving settings: {code[1]}",
            status=500,
        )

@app.route('/change_max_log_files')
def change_max_log_files():
    value = request.args['value']
    code = settings_db.edit_settings(('max_files', value, 1))
    if code == 0:
        print(f"INFO - Updated preference 'max_files', value={value}")
        return redirect('/settings')
    else:
        return Response(
            f"Error while changing the max log files: {code[1]}",
            status=500,
        )            

@app.route('/reset_settings')
def reset_settings():
    code = settings_db.reset()
    if code == 0:
        return redirect('/settings')
    else:
        return Response(
            f"Error while restoring the default settings: {code[1]}",
            status=500,
        )

@app.route('/change_log_level')
def change_log_level():
    value = request.args['value']
    code = settings_db.edit_settings(('log_level', value, 2))
    if code == 0:
        print(f"INFO - Updated preference 'log_level', value={value}")
        return redirect('/settings')
    else:
        return Response(
            f"Error when changing the log level: {code[1]}",
            status=500,
        )

@app.route('/change_refresh_rate')
def change_refresh_rate():
    value = request.args['value']
    code = settings_db.edit_settings(('refresh_rate', value, 3))
    if code == 0:
        print(f"INFO - Updated preference 'refresh_rate', value={value}")
        return redirect('/settings')
    else:
        return Response(
            f"Error when changing the refresh rate: {code[1]}",
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
        print(f"ERROR - Error while retrieving the GPU fan speed: {e}")
        return Response(
            f"Error while retrieving the GPU fan speed {e}",
            status=500,
        )

@app.route('/system_fans_speed')
def get_system_fans_speed():
    try:
        return get_system_fans()
    except Exception as e:
        print(f"ERROR - Error while retrieving the speed of the fans in the system: {e}")
        return Response(
            f"Error while retrieving the speed of the fans in the system: {e}",
            status=500,
        )

@app.route('/choose_drive')
def choose_drive():
    global selected_drive
    if request.args['drive'] != "":
        selected_drive = request.args['drive']
        print(f"INFO - {selected_drive} drive has been selected.")
    else:
        print(f"WARNING - 'selected_drive' is an empty string. The value has been set to the first pool in the system ({selected_drive}).")
    return redirect('/')

@app.route('/smart_data')
def get_smart_data():
    try:
        return jsonify(smartcheck.smartcheck(selected_drive))
    except Exception as e:
        print(f'ERROR - Error while retrieving SMART data: {e}')
        return Response(
            f"Error while retrieving SMART data: {e}",
            status=500,
        )
    
@app.route('/get_drives')
def get_drives():
    try:
        return smartcheck.get_drives()
    except Exception as e:
        print(f'ERROR - Error while retrieving drives in the system: {e}')
        return Response(
            f"Error while retrieving drives in the system: {e}",
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
        print(f'ERROR- Error while editing link #{id}: {e}')
        return Response(
            f"Error while editing link",
            status=500
        )

print("INFO - App started.")
app.run(host= sys.argv[-2], port = sys.argv[-1], debug=False)
#By Riccardo Luongo, 07/07/2024