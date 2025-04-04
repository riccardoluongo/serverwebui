# serverWebUI
A simple dashboard for your Ubuntu server, running on a Flask backend.

This program parses hardware and performance information (such as CPU and GPU temperature, fan speed and power consupmtion, storage information such as SMART data and zpool stats) from various monitoring tools and shows it in a simple web interface, together with basic system controls and a bookmark feature, for quick access to your self-hosted services or favorite websites.

## Compatibility
Supported on Ubuntu. Other Debian-based distributions should be supported, although might have problems with dependencies, which will need to be installed manually.

Both Intel and AMD CPUs are supported, meanwhile only Nvidia GPUs are supported as of now. Support for Intel and AMD in the works.

## Dependencies
Make sure you have the following dependencies installed before trying to use this project!
If you plan to install using the auto install script, you may skip the installation of these.

Packages:
```
linux-tools-generic
neofetch
pipx
smartmontools
linux-tools-$(uname-r)
linux-cpupower
```

Python packages (to be installed in the virtual environment; see below.):
```
flask
nvitop
psutil
gunicorn
```

## Installation
A very rudimentary installation script is available, but it is recommended to follow the instructions and install manually.
### Manual installation

Clone the repository: 

```
git clone https://github.com/riccardoluongo/serverwebui
cd serverwebui
```

Create the log directory:
```
mkdir log
```

Create and activate a python virtual environment:
```
python -m venv venv
source venv/bin/activate
```

Install the required packages:
```
pip install -r requirements.txt
```

Make the start.sh script executable:
```
chmod +x start.sh
```

You can now run the program with:
```
sudo ./start.sh -p YOURPORT
```
or create a systemd service to automatically start it at boot:
>* Edit webui.service
>* Replace DIR with the current directory ($PWD)
>* Replace PORT with the port you want to use
>* Copy the file to the systemd services directory:
```
sudo cp webui.service /etc/systemd/system/
```
>* Enable and start the service:
```
sudo systemctl daemon-reload
sudo systemctl enable webui.service
sudo systemctl start webui.service
```

### Automatic installation

Make the install and start scripts executable:
```
sudo chmod +x install.sh
sudo chmod +x start.sh
```

Run the install script:
```
sudo ./install.sh
```
During the installation, you will be prompted for the port to use for the web server. Once entered, the installation should complete on its own.

The dashboard should now be reachable at the port of choice.
