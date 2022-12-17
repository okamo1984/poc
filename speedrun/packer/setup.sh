#!/bin/sh
sudo apt-get update
sudo apt-get upgrade -y
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y --no-install-recommends build-essential python3.9 python3.9-distutils python3.9-venv python3.9-dev
python3.9 -m venv venv
. venv/bin/activate
pip install speedrun-0.1.0-py3-none-any.whl[azure]
rm speedrun-0.1.0-py3-none-any.whl
deactivate

sudo /usr/sbin/waagent -force -deprovision && export HISTSIZE=0 && sudo sync
