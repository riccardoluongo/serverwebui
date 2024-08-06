from subprocess import check_output

def zfscheck(pool: str) -> tuple:
    """
    Runs the zpool status command and formats the output for usage in the app

    :param pool: pool name
    """
    try:
        status_output = check_output(f'zpool status {pool} -L', shell=True, encoding='cp850')
        lines = status_output.split('\n')[4:][:-2]
        return (0, lines)
    except Exception as e:
        print(f"ERROR - Error while checking the status of the zfs pool '{pool}': {e}")
        return (1, e)

def getpoolinfo(pool: str) -> tuple:
    """
    Runs the zpool list command for various stats and formats the output for usage in the app

    :param pool: pool name
    """
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
        print(f"ERROR - Error while retrieving information about the zfs pool '{pool}': {e}")
        return (1, e)

def poolname():
    """
    Runs the zpool list command to detect all the ZFS pools in the system and returns them in a list

    :return pools_lines: list of all the ZFS pools in the system
    """
    try:
        names = check_output('zpool list -Ho name', shell=True, encoding='cp850')
        pools_lines = names.strip().split('\n')
        return pools_lines
    except Exception as e:
        pools_lines = []
        print(f"ERROR - Error while retrieving the zfs pools in the system: {e}")
        return pools_lines

#by Riccardo Luongo, 31/08/2023
#updated on 08/03/2024
#updated on 30/04/2024
#updated on 01/05/2024
#updated on 09/06/2024
#updated on 07/07/2024