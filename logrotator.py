import os

def log_rotate(path, max_files):
    files = os.listdir(path)
    while len(files) > int(max_files):
        files = os.listdir(path)
        if len(files) > int(max_files):
            oldest_file = min(files, key=lambda x: os.path.getctime(os.path.join(path, x)))
            os.remove(os.path.join(path, oldest_file))
            print(f"INFO - The oldest file was deleted from the logs folder because the folder reached its file number limit ({max_files})")
        else:
            print(f"INFO - The number of files in the logs folder is below the limit ({max_files}). No action needed")

#By Riccardo Luongo, 21/04/2024