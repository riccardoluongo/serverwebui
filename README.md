# serverWebUI
A simple dashboard for your Ubuntu server, running on a Flask backend.

This program parses hardware and performance information (such as CPU and GPU temperature, fan speed and power consumption and storage information such as SMART data and disk usage, with support for ZFS) from various monitoring tools and shows it in a simple web interface, together with basic system controls and a bookmark feature, for quick access to your self-hosted services or favorite websites.

## Compatibility
Supported on Ubuntu. Other Debian-based distributions should be supported, although might have problems with dependencies, which will need to be installed manually.

Both Intel and AMD CPUs are supported, meanwhile only Nvidia GPUs are supported as of now. Support for Intel and AMD in the works.

## Installation
To install on your system as a systemd service, first clone the repository: 

```
git clone https://github.com/riccardoluongo/serverwebui
cd serverwebui
```

Then make the install and run scripts executable:
```
sudo chmod +x install.sh
sudo chmod +x start.sh
```

And run the install script:
```
sudo ./install.sh
```
During the installation, you will be prompted for the port to use for the webserver. Once entered, the installation should complete on its own.

The dashboard should now be reachable at the address of choice.
