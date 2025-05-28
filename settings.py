from json import dump, load

PATH = 'settings/settings.json'
DEFAULT_SETTINGS = {
    'max_files' : 10,
    'log_level' : 'info',
    'refresh_rate' : 2000,
    'max_size' : 2000,
    'active_fans' : False
}

def create_default():
    with open(PATH, 'w') as f:
        dump(DEFAULT_SETTINGS, f)

def read_settings():
    with open(PATH, 'r') as f:
        return load(f)

def edit_settings(settings :dict):
    with open(PATH, 'w') as f:
        dump(settings, f)

def settings_are_valid():
    settings = read_settings()

    if (type(settings) != type(DEFAULT_SETTINGS) or len(settings) != len(DEFAULT_SETTINGS)):
        return False

    for key in settings.keys():
        if type(settings[key]) != type(DEFAULT_SETTINGS[key]):
            return False

    return True

#Riccardo Luongo, 29/05/2025
