import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, Optional, Union

from dotenv import load_dotenv


@dataclass
class AzureEnvironments:
    azure_tenant_id: str
    azure_client_id: str
    azure_client_secret: str
    azure_subscription_id: str
    vm_password: str


CloudProvider = Literal["azure"]
Environments: Optional[Union[AzureEnvironments]] = None


def load_environments(provider: CloudProvider) -> Any:
    global Environments
    if Environments:
        return Environments

    load_dotenv(Path(__file__).parent / ".env")

    if provider == "azure":

        Environments = AzureEnvironments(
            azure_client_id=os.environ["AZURE_CLIENT_ID"],
            azure_client_secret=os.environ["AZURE_CLIENT_SECRET"],
            azure_subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
            azure_tenant_id=os.environ["AZURE_TENANT_ID"],
            vm_password=os.environ["VM_PASSWORD"],
        )

    return Environments
