import sqlite3
from sqlite3 import Error
import re
from main import log

database_file = r"./database/settings.db"

def initialize_db():
    links_table_command = """ CREATE TABLE IF NOT EXISTS settings (
                                        id integer PRIMARY KEY,
                                        key text NOT NULL,
                                        value text
                                    ); """
    conn = None

    try:
        conn = sqlite3.connect(database_file, check_same_thread=False)
        cur = conn.cursor()
        log.info("Successfully connected to the settings database")
    except Error as e:
        log.error(f"Couldn't connect to the settings database: {e}")

    #create the settings table if it does not exist
    try:
        cur.execute(links_table_command)
        log.info("Settings database initialized")
    except Error as e:
        log.error(f"Couldn't initialize the settings database: {e}")

    def log_level_not_valid():
        possible_values = ['debug', 'info', 'warning', 'error', 'critical']
        for value in possible_values:
            if value == get_settings()[1][1][2]:
                return False
        return True

    def max_log_files_valid():
        pattern = r'\b([1-9]|[1-4][0-9]|50)\b'
        match = re.search(pattern, get_settings()[1][0][2])
        return bool(match)

    if len(get_settings()[1]) != 3 or get_settings()[1][0][1] != "max_files" or get_settings()[1][1][1] != "log_level" or log_level_not_valid() or max_log_files_valid() == False or get_settings()[1][2][1] != 'refresh_rate':
        log.warning("The settings database is corrupted. Restoring default values...")
        reset()

def reset():
    """
    Deletes all the entries in the database and inserts the default settings.
    """
    try:
        delete_all()
        create_settings('max_files', 10)
        create_settings('log_level', 'info')
        create_settings('refresh_rate', 2000)
        log.info("Restored default settings")
        return 0
    except Exception as e:
        log.error(f"Couldn't restore the default settings: {e}")
        return (1, e)

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
    try:
        conn = sqlite3.connect(database_file, check_same_thread=False)
        cur = conn.cursor()

        cur.execute('BEGIN')
        cur.execute(sql, setting)

        conn.commit()

        cur.close()
        conn.close()
        return 0
    except Exception as e:
        conn.rollback()
        log.error(f"Couldn't change '{setting}' preference: {e}")
        return (1, e)
    finally:
        if conn:
            conn.close()

def get_settings():
    conn = sqlite3.connect(database_file, check_same_thread=False)
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM settings")
        settings = cur.fetchall()
        return (0, settings)
    except Exception as e:
        log.error(f"Couldn't retrieve settings: {e}")
        return (1, e)

def delete_all():
    """
    Deletes all the entries from the settings table
    """
    conn = sqlite3.connect(database_file, check_same_thread=False)
    sql = 'DELETE FROM settings'
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()
#by Riccardo Luongo, 16/12/2024