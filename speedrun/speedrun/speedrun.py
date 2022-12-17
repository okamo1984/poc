import logging
import time

from speedrun.client import SSHClient
from speedrun.vm_management import VMConnection, VmManager


class Speedrun:
    """Make speed of machine learning experiments up using virtual machine.

    :param vm_manager: Virual machine manager.
    :type vm_manager: speedrun.vm_management.VmManager
    :param ssh_client: SSH client.
    :type ssh_client: speedrun.client.SSHClient
    """

    def __init__(self, vm_manager: VmManager, ssh_client: SSHClient) -> None:
        self._vm_manager = vm_manager
        self._ssh_client = ssh_client
        self._logger = logging.getLogger(name=__name__)
        self._logger.addHandler(logging.StreamHandler())
        self._logger.setLevel(logging.INFO)

    def start(
        self,
        command: str,
        process: str,
        vm_name: str,
        image_name: str,
        vnet_name: str,
        subnet_name: str,
        location: str,
        vm_size: str,
        vm_password: str,
        nic_name: str = "vmnic-1",
    ):
        """Start machine learning experiments.

        :param command: Executed command in virtual machine.
        :type command: str
        :param process: Process name to check whether command is finished.
        :type process: str
        :param vm_name: Virtual machine name.
        :type vm_name: str
        :param image_name: Custom or managed virtual machine image name.
        :param vnet_name: Virtual network name.
        :type vnet_name: str
        :param subnet_name: Subnet name.
        :type subnet_name: str
        :param location: Azure data center location.
        :type location: str
        :param vm_size: Virtual machine size.
        :type vm_size: str
        :param vm_password: Virtual machine admin password.
        :type vm_password: str
        :param nic_name: Network interface name.
        :type nic_name: str
        """
        vm_connection = self._vm_manager.create(
            image_name=image_name,
            vm_name=vm_name,
            vm_password=vm_password,
            vm_size=vm_size,
            vnet_name=vnet_name,
            subnet_name=subnet_name,
            location=location,
            nic_name=nic_name,
        )

        if not self._is_process_alive(vm_connection, process):
            self._ssh_client.exec_command(vm_connection, command)

        while self._is_process_alive(vm_connection, process):
            time.sleep(10)

        self._logger.info(f"{command} is done")

    def _is_process_alive(self, vm_connection: VMConnection, process: str) -> bool:
        stdout, stderr = self._ssh_client.exec_command(vm_connection, f"pidof {process}")
        if stderr:
            for line in stderr:
                self._logger.error(line.strip("\n"))

        pid = ""
        for line in stdout:
            pid = line.strip("\n").strip()

        return pid != ""
