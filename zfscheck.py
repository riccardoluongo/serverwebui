from subprocess import check_output
from main import log

def zfscheck(pool: str) -> tuple:
    try:
        status_output = check_output(f'zpool status {pool} -L', shell=True, encoding='cp850')
        lines = status_output.split('\n')[4:][:-2]
        return (0, lines)
    except Exception as e:
        log.error(f"Couldn't check the status of the ZFS pool '{pool}': {e}")
        return (1, e)

def getpoolinfo(pool: str) -> tuple:
    try:
        pool_health = check_output(f'zpool list {pool} -Ho health', shell=True, encoding='cp850')[:-1]
        pool_allocated = check_output(f'zpool list {pool} -Ho allocated', shell=True, encoding='cp850')[:-1]
        pool_free = check_output(f'zpool list {pool} -Ho free', shell=True, encoding='cp850')[:-1]
        pool_capacity = check_output(f'zpool list {pool} -Ho capacity', shell=True, encoding='cp850')[:-1]
        pool_size = check_output(f'zpool list {pool} -Ho size', shell=True, encoding='cp850')[:-1]

        pool_stats = {
            'health' : pool_health,
            'allocated' : pool_allocated,
            'free' : pool_free,
            'capacity' : pool_capacity,
            'size' : pool_size
        }

        return (0, pool_stats)
    except Exception as e:
        log.error(f"Couldn't retrieve information about the ZFS pool '{pool}': {e}")
        return (1, e)

def poolname():
    try:
        names = check_output('zpool list -Ho name', shell=True, encoding='cp850')
        pools_lines = names.strip().split('\n')
        return pools_lines
    except Exception as e:
        pools_lines = []
        log.error(f"Couldn't retrieve the ZFS pools in the system: {e}")
        return pools_lines
#by Riccardo Luongo, 16/12/2023