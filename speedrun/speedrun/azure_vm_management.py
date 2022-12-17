import base64
import gzip
import logging
from typing import Any, Optional

from azure.core.exceptions import ResourceNotFoundError
from azure.identity import DefaultAzureCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.compute.models import (
    DataDisk,
    DiskCreateOptionTypes,
    HardwareProfile,
    ImageReference,
    NetworkProfile,
    OSProfile,
    StorageProfile,
    VirtualMachine,
    VirtualMachineExtension,
)
from azure.mgmt.network import NetworkManagementClient
from azure.mgmt.network.models import (
    NetworkInterface,
    NetworkInterfaceIPConfiguration,
    Subnet,
)

from .vm_management import VMConnection, VmManager


class AzureVmManager(VmManager):
    """Management Azure Virutal Machine.

    :param credential: Azure credentials.
    :param subscription_id: Azure subscription id.
    :param resource_group_name: Azure resource group name of virtual machine.
    """

    ADMIN_USERNAME = "speedrun"

    def __init__(
        self,
        credencial: Optional[Any],
        subscription_id: str,
        resource_group_name: str,
    ) -> None:
        if not credencial:
            credencial = DefaultAzureCredential()
        self._compute_management_client = ComputeManagementClient(
            credencial, subscription_id=subscription_id
        )
        self._network_management_client = NetworkManagementClient(
            credencial, subscription_id=subscription_id
        )
        self._resource_group_name = resource_group_name
        self._logger = logging.getLogger(name=__name__)
        self._logger.addHandler(logging.StreamHandler())
        self._logger.setLevel(logging.INFO)

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
        """Create azure virtual machine.

        OS image of virutal machine must be exist before creating it. Data disk is created in `/datadrive`.
        If use it, specify valid location.

        :param vm_name: Virtual machine name.
        :type vm_name: str
        :param image_name: Custom or managed virtual machine image name.
        :type image_name: str
        :param vnet_name: Virtual network name.
        :type vnet_name: str
        :param subnet: Subnet.
        :type subnet: azure.mgmt.network.models.Subnet
        :param location: Azure data center location.
        :type location: str
        :param vm_size: Virtual machine size.
        :type vm_size: str
        :param vm_password: Virtual machine admin password.
        :type vm_password: str
        :param nic_name: Network interface name.
        :type nic_name: str
        """
        base_image = self._compute_management_client.images.get(
            self._resource_group_name, image_name
        )
        self._logger.info(f"Get base image, id: {base_image.id}")

        subnet = self._network_management_client.subnets.get(
            self._resource_group_name, vnet_name, subnet_name
        )
        self._logger.info(f"Get subnet, id: {subnet.id}")

        nic = self._create_nic(nic_name, location, subnet)
        self._create_vm(vm_name, location, vm_size, base_image.id, vm_password, nic)

        return VMConnection(
            hostname=nic.ip_configurations[0].private_ip_address,
            port=22,
            username=self.ADMIN_USERNAME,
            password=vm_password,
        )

    def _create_nic(
        self,
        nic_name: str,
        location: str,
        subnet: Subnet,
    ) -> NetworkInterface:
        try:
            nic = self._network_management_client.network_interfaces.get(
                self._resource_group_name, nic_name
            )
        except ResourceNotFoundError:
            nic = self._network_management_client.network_interfaces.begin_create_or_update(
                self._resource_group_name,
                nic_name,
                NetworkInterface(
                    location=location,
                    ip_configurations=[
                        NetworkInterfaceIPConfiguration(
                            name="IpConfiguration1",
                            private_ip_allocation_method="Dynamic",
                            subnet=subnet,
                            primary=True,
                        )
                    ],
                ),
            ).result()
            self._logger.info(f"Finish to create network interface, id: {nic.id}")

        return nic

    def _create_vm(
        self,
        vm_name: str,
        location: str,
        vm_size: str,
        base_image_id: str,
        vm_password: str,
        nic: NetworkInterface,
    ) -> VirtualMachine:
        try:
            vm = self._compute_management_client.virtual_machines.get(
                self._resource_group_name, vm_name
            )
        except ResourceNotFoundError:
            vm = self._compute_management_client.virtual_machines.begin_create_or_update(
                self._resource_group_name,
                vm_name,
                VirtualMachine(
                    location=location,
                    hardware_profile=HardwareProfile(vm_size=vm_size),
                    storage_profile=StorageProfile(
                        image_reference=ImageReference(id=base_image_id),
                        data_disks=[
                            DataDisk(
                                lun=0,
                                disk_size_gb="100",
                                create_option=DiskCreateOptionTypes.EMPTY,
                            )
                        ],
                    ),
                    os_profile=OSProfile(
                        admin_username=self.ADMIN_USERNAME,
                        computer_name=self.ADMIN_USERNAME,
                        admin_password=vm_password,
                    ),
                    network_profile=NetworkProfile(network_interfaces=[nic]),
                ),
            ).result()
            self._logger.info(f"Finish to create vm, id: {vm.id}")

            # VM Extension
            script_source = """#!/bin/sh
            mkdir /datadrive
            set +e
            parted /dev/sdc --script mklabel gpt mkpart xfspart xfs 0% 100%
            mkfs.xfs -f /dev/sdc1
            partprobe /dev/sdc1
            set -e
            mount /dev/sdc1 /datadrive
            """
            script = base64.b64encode(gzip.compress(script_source.encode("utf-8"), 9))
            vm_extension = (
                self._compute_management_client.virtual_machine_extensions.begin_create_or_update(
                    self._resource_group_name,
                    vm.name,
                    "customScript",
                    VirtualMachineExtension(
                        location=location,
                        publisher="Microsoft.Azure.Extensions",
                        type_properties_type="CustomScript",
                        settings={"script": script.decode("utf-8")},
                        type_handler_version="2.1",
                    ),
                ).result()
            )
            self._logger.info(f"Finish to set vm extension, id:{vm_extension.id}")

        return vm
