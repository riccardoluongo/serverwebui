import psutil

def get_system_fans():
    fans = psutil.sensors_fans()
    fan_list = []
    inactive_fans = []
    active_fans = []
    for key in fans:
        for fan in fans[key]:
            fan_list.append(fan)
    for fan in fan_list:
        if fan[1] == 0:
            inactive_fans.append(fan)
        else:
            active_fans.append(fan)
    return [active_fans, inactive_fans]
            
if __name__ == '__main__':
    print(get_system_fans())

#by Riccardo Luongo, 07/07/2024