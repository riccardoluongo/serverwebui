#!/usr/bin/bash
cd "$(dirname "$0")"
kernel_ver=$(uname -r)
apt install linux-tools-generic pipx smartmontools linux-tools-$kernel_ver smartmontools linux-cpupower -y 
python3 -m pipx install flask nvitop psutil gunicorn
python3 -m pipx ensurepath
mkdir log

IS_ACTIVE=$(sudo systemctl is-active webui)
if [ "$IS_ACTIVE" == "active" ]; then
    echo "Service is already running"
    echo "Restarting service"
    sudo systemctl restart webui
    echo "Service restarted"
else
    read -p "Enter the port to use for the web interface: " PORT
    echo "Creating service file"
    sudo cat > /etc/systemd/system/webui.service << EOF
[Unit]
Description=This service will start serverWebUI at system startup

[Service]
User=root
WorkingDirectory=$PWD
ExecStart=$PWD/start.sh -p '$PORT'

[Install]
WantedBy=default.target
EOF
    echo "Reloading daemon and enabling service"
    sudo systemctl daemon-reload
    sudo systemctl enable webui.service
    sudo systemctl start webui.service
    echo "Service Started"
fi

exit 0