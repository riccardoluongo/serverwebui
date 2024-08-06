import sqlite3
from sqlite3 import Error
import re
from time import sleep

database_file = r"./database/settings.db"

def initialize_db():
    """
    connect to the database,
    create the settings table if it does not exist
    """
    links_table_command = """ CREATE TABLE IF NOT EXISTS settings (
                                        id integer PRIMARY KEY,
                                        key text NOT NULL,
                                        value text
                                    ); """
    conn = None

    try:
        conn = sqlite3.connect(database_file, check_same_thread=False)
        cur = conn.cursor()
        print("INFO - Successfully connected to the settings database.")
    except Error as e:
        print(f"ERROR - Error while connecting to the settings database: {e}")

    #create the settings table if it does not exist
    try:
        cur.execute(links_table_command)
        print("INFO - Settings database initialized.")
    except Error as e:
        print(f"ERROR - Error while initializing the settings database: {e}")

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
        print("WARNING - The database is corrupted. Restoring the default settings...")
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
        print("INFO - Default settings restored.")
        return 0
    except Exception as e:
        print(f'ERROR - Error while restoring the default settings: {e}')
        return (1, e)

def create_settings(key, value :tuple) -> int:
    """
    This function should only be used the first time the database is initialized. DONT RUN THIS
    :param key, value:
    :return: last row id 
    """
    conn = sqlite3.connect(database_file, check_same_thread=False)
    sql = ''' INSERT INTO settings(key,value)
              VALUES(?,?) '''
    cur = conn.cursor()
    cur.execute(sql, (key, value))
    conn.commit()
    return cur.lastrowid

def edit_settings(setting :tuple):
    """
    update key, value
    :param setting (key, value, id):
    """
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
        print(f'ERROR - Error while changing a preference ({setting}): {e}')
        return (1, e)
    finally:
        if conn:
            conn.close()

def delete_setting(id :int):
    """
    TESTING ONLY. DONT USE THIS
    :param id: id of the setting
    :return:
    """
    conn = sqlite3.connect(database_file, check_same_thread=False)
    sql = 'DELETE FROM settings WHERE id=?'
    cur = conn.cursor()
    cur.execute(sql, (id,))
    conn.commit()
    
def get_settings():
    """
    Query all settings in the settings table
    :return exit code, settings -> tuple(int, list):
    """
    conn = sqlite3.connect(database_file, check_same_thread=False)
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM settings")
        settings = cur.fetchall()
        return (0, settings)
    except Exception as e:
        print(f'ERROR - Error while retrieving settings: {e}')
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

#TESTING ONLY!!
if __name__ == '__main__':
    initialize_db()
    print(get_settings())

#by Riccardo Luongo, 09/06/2024