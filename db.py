import sqlite3
from sqlite3 import Error
from main import log

def initialize_db():
    database_file = r"./database/main.db"
    links_table_command = """ CREATE TABLE IF NOT EXISTS links (
                                        id integer PRIMARY KEY,
                                        name text NOT NULL,
                                        url text
                                    ); """

    global conn
    global cur
    conn = None

    try:
        conn = sqlite3.connect(database_file, check_same_thread=False)
        cur = conn.cursor()
        log.info("Successfully connected to the links database")
    except Error as e:
        log.error(f"Couldn't connect to the links database: {e}")

    try:
        cur.execute(links_table_command)
        log.info("Initialized links database")
    except Error as e:
        log.error(f"Couldn't initialize the links database: {e}")

def create_link(name, url :tuple):
    sql = ''' INSERT INTO links(name,url)
              VALUES(?,?) '''
    cur = conn.cursor()
    try:
        cur.execute(sql, (name, url))
        conn.commit()
        return cur.lastrowid
    except Exception as e:
        log.error(f"Couldn't create new link: {e}")

def mod_link(name, url, id :tuple):
    """
    Edit a link by link id
    :param link (name, url, id):
    """
    sql = ''' UPDATE links
              SET name = ? ,
                  url = ?
              WHERE id = ?'''
    cur.execute(sql, (name, url, id))
    conn.commit()

def delete_link(id :int):
    """
    Delete a link by link id
    :param id: id of the link
    :return:
    """
    sql = 'DELETE FROM links WHERE id=?'
    cur = conn.cursor()
    try:
        cur.execute(sql, (id,))
        conn.commit()
    except Exception as e:
        log.error(f"Couldn't delete link {id}: {e}")
    
def get_links() -> list:
    cur = conn.cursor()
    cur.execute("SELECT * FROM links")

    links = cur.fetchall()
    return links

def delete_all():
    """
    Deletes all the entries from the database
    """
    sql = 'DELETE FROM links'
    cur = conn.cursor()
    try:
        cur.execute(sql)
        conn.commit()
    except Exception as e:
        log.error(f"Couldn't delete all the links: {e}")
#By Riccardo Luongo, 16/12/2024