# Create base os image for Azure

## Instruction

```zsh
az group create -n speedrun -l japaneast
az keyvault create -l japaneast -n speedrunkeyvault -g speedrun
az ad sp create-for-rbac --query "{ client_id: appId, client_secret: password, tenant_id: tenant }" > azure-secret.json
# Add "subscription_id" to azure-secret.json
az keyvault secret set -n packer-sp-cred --vault-name speedrunkeyvault -f azure-secret.json
az keyvault secret download -n packer-sp-cred --vault-name speedrunkeyvault -o json -f azure-secret.json
packer build -var-file=azure-secret.json -var 'image_name=speedrun-python' base-image.json
```
