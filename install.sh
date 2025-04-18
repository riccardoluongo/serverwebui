#!/usr/bin/bash
kernel_ver=$(uname -r)
cd "$(dirname "$0")"

sudo add-apt-repository ppa:zhangsongcui3371/fastfetch
sudo apt update
sudo apt install linux-tools-generic python3.12-venv smartmontools linux-tools-$kernel_ver smartmontools jq fastfetchS-y 

python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt 

mkdir log
mkdir database

IS_ACTIVE=$(sudo systemctl is-active webui)
if [ "$IS_ACTIVE" == "active" ]; then
    echo "Service is already running"
    echo "Restarting service"
    sudo systemctl restart webui
    echo "Service restarted"
else
    read -p "Enter the port to use for the web interface: " PORT
    read -p "Enter the number of gunicorn workers to use:" WORKERS
    echo "Creating service file"
    sed -i -e "s|{DIR}|$PWD|g" webui.service
    sed -i -e "s/{PORT}/$PORT/g" webui.service
    sed -i -e "s/{WORKERS}/$WORKERS/g" webui.service
    sudo cp webui.service /etc/systemd/system/
    echo "Reloading daemon and enabling service"
    sudo systemctl daemon-reload
    sudo systemctl enable webui.service
    sudo systemctl start webui.service
    echo "Service Started"
fi

exit 0
