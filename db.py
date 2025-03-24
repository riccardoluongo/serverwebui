import sqlite3

def initialize_db():
    database_file = r"./database/main.db"
    links_table_command = """ CREATE TABLE IF NOT EXISTS links (
                                        id integer PRIMARY KEY,
                                        name text NOT NULL,
                                        url text
                                    ); """

    global conn
    global cur

    conn = sqlite3.connect(database_file, check_same_thread=False)
    cur = conn.cursor()
    cur.execute(links_table_command)

def create_link(name, url :tuple):
    sql = ''' INSERT INTO links(name,url)
              VALUES(?,?) '''
    cur = conn.cursor()

    cur.execute(sql, (name, url))
    conn.commit()
    return cur.lastrowid

def mod_link(name, url, id :tuple):
    sql = ''' UPDATE links
              SET name = ? ,
                  url = ?
              WHERE id = ?'''
    cur.execute(sql, (name, url, id))
    conn.commit()

def delete_link(id :int):
    sql = 'DELETE FROM links WHERE id=?'
    cur = conn.cursor()

    cur.execute(sql, (id,))
    conn.commit()        
    
def get_links() -> list:
    cur = conn.cursor()
    cur.execute("SELECT * FROM links")

    links = cur.fetchall()
    return links

def delete_all():
    sql = 'DELETE FROM links'
    cur = conn.cursor()

    cur.execute(sql)
    conn.commit()        
#By Riccardo Luongo, 17/12/2024