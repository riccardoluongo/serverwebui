from subprocess import check_output

def zfscheck(pool: str):
    status_output = check_output(f'zpool status {pool} -L', shell=True, encoding='cp850')
    lines = status_output.split('\n')[4:][:-2]
    return lines

def getpoolinfo(pool: str):
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

    return pool_stats

def poolname():
    names = check_output('zpool list -Ho name', shell=True, encoding='cp850')
    pools_lines = names.strip().split('\n')
    return pools_lines
#by Riccardo Luongo, 17/12/2024