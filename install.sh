#!/usr/bin/bash
cd "$(dirname "$0")"
kernel_ver=$(uname -r)
apt install linux-tools-generic neofetch python3-pip smartmontools linux-tools-$kernel_ver -y
pip install -r requirements.txt

IS_ACTIVE=$(sudo systemctl is-active webui)
if [ "$IS_ACTIVE" == "active" ]; then
    echo "Service is running"
    echo "Restarting service"
    sudo systemctl restart webui
    echo "Service restarted"
else
    read -p "Enter your local IP address: " IP
    read -p "Enter the port to use for the web interface: " PORT
    echo "Creating service file"
    sudo cat > /etc/systemd/system/webui.service << EOF
[Unit]
Description=This service will start serverWebUI at system startup

[Service]
User=root
WorkingDirectory=$PWD
ExecStart=$PWD/start.sh -i '$IP' -p '$PORT'

[Install]
WantedBy=default.target
EOF
    echo "Reloading daemon and enabling service"
    sudo systemctl daemon-reload
    sudo systemctl enable webui.service
    sudo systemctl start webui.service
    echo "Service Started"
f``

exit 0