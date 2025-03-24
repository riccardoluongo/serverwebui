import sqlite3
import re

database_file = r"./database/settings.db"

def initialize_db():
    settings_table_command = """ CREATE TABLE IF NOT EXISTS settings (
                                        id integer PRIMARY KEY,
                                        key text NOT NULL,
                                        value text
                                    ); """

    conn = sqlite3.connect(database_file, check_same_thread=False)
    cur = conn.cursor()
    cur.execute(settings_table_command)

    if settings_valid() == False:
        reset()

def settings_valid():
    settings = get_settings()

    try:
        (max_files, log_level, refresh_rate, max_size) = settings
    except: #settings are empty, create them!
        reset()
        return True

    def max_log_files_valid():
        pattern = r'\b([1-9]|[1-4][0-9]|50)\b'
        match = re.search(pattern, max_files[2])
        return bool(match)

    def log_level_valid():
        possible_values = ['debug', 'info', 'warning', 'error', 'critical']
        for value in possible_values:
            if value == log_level[2]:
                return True
        return False
    
    def refresh_rate_valid():
        pattern = r"\b([5-9][0-9]{2}|[1-9][0-9]{3}|10000)\b"
        match = re.search(pattern, refresh_rate[2])
        return bool(match)

    def max_file_size_valid():
        pattern = r"\b([1-9][0-9]{1,2}|[1-9][0-9]{3}|10000)\b"
        match = re.search(pattern, max_size[2])
        return bool(match)

    if len(settings) != 4:
        return False
    
    if(
        max_files[1] == "max_files" and max_log_files_valid() and
        log_level[1] == "log_level" and log_level_valid() and
        refresh_rate[1] == "refresh_rate" and refresh_rate_valid() and
        max_size[1] and max_file_size_valid()
    ):
        return True
    else:
        return False

def reset():
    delete_all()
    create_settings('max_files', 10)
    create_settings('log_level', 'info')
    create_settings('refresh_rate', 2000)
    create_settings('max_size', 2000)

def create_settings(key, value :tuple) -> int:
    conn = sqlite3.connect(database_file, check_same_thread=False)
    sql = ''' INSERT INTO settings(key,value)
              VALUES(?,?) '''
    cur = conn.cursor()
    cur.execute(sql, (key, value))
    conn.commit()
    return cur.lastrowid

def edit_settings(setting :tuple):
    sql = ''' UPDATE settings
              SET key = ? ,
                  value = ?
              WHERE id = ?'''
    conn = sqlite3.connect(database_file, check_same_thread=False)
    cur = conn.cursor()

    cur.execute("BEGIN")
    cur.execute(sql, setting)
    conn.commit()
    cur.close()
    conn.close()

def get_settings():
    conn = sqlite3.connect(database_file, check_same_thread=False)
    cur = conn.cursor()
    cur.execute("SELECT * FROM settings")
    settings = cur.fetchall()
    return settings

def delete_all():
    conn = sqlite3.connect(database_file, check_same_thread=False)
    sql = 'DELETE FROM settings'
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()
#by Riccardo Luongo, 25/01/2025