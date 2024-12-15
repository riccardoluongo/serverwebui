import sqlite3
from sqlite3 import Error

def initialize_db():
    """
    connect to the database,
    create the links table it it does not exist
    """
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
        print("INFO - Successfully connected to the links database.")
    except Error as e:
        print(f"ERROR - Error while connecting to the links database: {e}")

    #create the links table if it does not exist
    try:
        cur.execute(links_table_command)
        print("INFO - Links database initialized.")
    except Error as e:
        print(f"ERROR - Error while initializing the links database: {e}")

def create_link(name, url :tuple):
    """
    Create a new link into the links table
    :param name, link:
    :return: project id
    """
    sql = ''' INSERT INTO links(name,url)
              VALUES(?,?) '''
    cur = conn.cursor()
    try:
        cur.execute(sql, (name, url))
        conn.commit()
        return cur.lastrowid #id of the element just created. This shouldn't be needed.
    except Exception as e:
        print(f"ERROR - Error while creating a new link: {e}")

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
        print(f"ERROR - Error while deleting link {id}: {e}")
    
def get_links() -> list:
    """
    Query all links in the links table
    :return links -> list:
    """
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
        print(f"ERROR - Error while deleting all the links: {e}")
#By Riccardo Luongo, 11/12/2024