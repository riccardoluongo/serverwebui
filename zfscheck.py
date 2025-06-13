from subprocess import run, check_output, STDOUT, PIPE
from zpool_status import ZPool

def zfscheck(pool: str):
    return ZPool(check_name=True, name=pool).get_status()

def getpoolinfo(pool: str):
    return check_output(f'zpool list {pool} -H', shell=True, universal_newlines=True).split()

def poolname():
    command = run('zpool list -Ho name', shell=True, encoding='cp850', stdout=PIPE, stderr=STDOUT)

    if command.returncode == 0:
        pools = command.stdout.strip().split('\n')
    else:
        pools = command.returncode

    return pools
#by Riccardo Luongo, 06/06/2025