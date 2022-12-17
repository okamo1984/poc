# Create vnet and subnet by terrafrom

## Instruction

```zsh
az storage account create -n speedrun -g speedrun -l japaneast
az storage container create -n tfstate --account-name speedrun
export ARM_ACCESS_KEY="storage account access key"
terrafrom init
# Create terraform.tfvars
terraform plan
terraform apply
```
