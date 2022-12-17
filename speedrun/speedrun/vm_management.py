from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class VMConnection:
    hostname: str
    port: int
    username: str
    password: str


class VmManager(ABC):
    @abstractmethod
    def create(
        self,
        vm_name: str,
        image_name: str,
        vnet_name: str,
        subnet_name: str,
        location: str,
        vm_size: str,
        vm_password: str,
        nic_name: str = "vmnic-1",
    ) -> VMConnection:
        """Create virtual machine.

        OS image of virutal machine must be exist before creating it.

        :param vm_name: Virtual machine name.
        :type vm_name: str
        :param image_name: Custom or managed virtual machine image name.
        :type image_name: str
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
        return NotImplemented
