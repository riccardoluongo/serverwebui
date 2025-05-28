#!/usr/bin/bash
kernel_ver=$(uname -r)
os_name=$(cat /etc/os-release | grep -w 'NAME')
cd "$(dirname "$0")"

if grep -iwq "ubuntu" <<< $os_name; then
    sudo add-apt-repository ppa:zhangsongcui3371/fastfetch
    sudo apt update
    sudo apt install python3.12-venv smartmontools linux-tools-$kernel_ver smartmontools jq fastfetch -y
elif grep -iwq "arch" <<< $os_name; then
    sudo pacman -Syu turbostat fastfetch smartmontools cpupower python-pip jq --noconfirm
elif grep -iwq "fedora" <<< $os_name; then
    sudo dnf install fastfetch smartmontools cpupower python-pip jq --assumeyes
fi

python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt

mkdir log
mkdir database
mkdir settings

IS_ACTIVE=$(sudo systemctl is-active webui)
if [ "$IS_ACTIVE" == "active" ]; then
    echo "Service is already running"
    echo "Restarting service"
    sudo systemctl restart webui
    echo "Service restarted"
else
    read -p "Enter the port to use for the web interface: " PORT
    read -p "Enter the number of gunicorn workers to use: " WORKERS
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
