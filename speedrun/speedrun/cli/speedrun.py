from azure.identity import ClientSecretCredential

from speedrun.azure_vm_management import AzureVmManager
from speedrun.environments import AzureEnvironments, load_environments
from speedrun.speedrun import Speedrun
from speedrun.ssh_client import ParamikoSSHClinet


def main():
    environments: AzureEnvironments = load_environments("azure")
    speedrun = Speedrun(
        AzureVmManager(
            ClientSecretCredential(
                environments.azure_tenant_id,
                environments.azure_client_id,
                environments.azure_client_secret,
            ),
            environments.azure_subscription_id,
            "speedrun",
        ),
        ParamikoSSHClinet(),
    )
    speedrun.start(
        "ls -l /datadrive &",
        "ls",
        "speedrun",
        "speedrun-python",
        "speedrun-network",
        "ml-subnet",
        "japaneast",
        "Standard_DS2_v2",
        environments.vm_password,
    )


if __name__ == "__main__":
    main()
