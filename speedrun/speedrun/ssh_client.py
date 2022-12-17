from abc import ABC, abstractmethod
from dataclasses import asdict
from typing import Iterable, Tuple

import paramiko

from speedrun.vm_management import VMConnection


class SSHClient(ABC):
    @abstractmethod
    def exec_command(
        self, vm_connection: VMConnection, command: str
    ) -> Tuple[Iterable[str], Iterable[str]]:
        """Execution command in virtual machine.

        :param vm_connection: Connection of virtual machine.
        :type vm_connection: speedrun.vm_management.VMConnection
        :param command: Executed command in virtual machine.
        :type command: str
        """
        return NotImplemented


class ParamikoSSHClinet(SSHClient):
    def exec_command(
        self, vm_connection: VMConnection, command: str
    ) -> Tuple[Iterable[str], Iterable[str]]:
        """Execution command in virtual machine.

        Host key is added automatically.

        :param vm_connection: Connection of virtual machine.
        :type vm_connection: speedrun.vm_management.VMConnection
        :param command: Executed command in virtual machine.
        :type command: str
        """
        with paramiko.SSHClient() as client:
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(**asdict(vm_connection))
            stdin, stdout, stderr = client.exec_command(command)

        return stdout, stderr
