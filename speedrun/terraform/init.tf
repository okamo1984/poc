terraform {
  backend "azurerm" {
    storage_account_name = "speedrun"
    container_name       = "tfstate"
    key                  = "speedrun.terraform.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.52.0"
    }
  }
}

provider "azurerm" {
  features {}

  subscription_id = var.subscription_id
  client_id       = var.client_id
  client_secret   = var.client_secret
  tenant_id       = var.tenant_id
}

data "azurerm_resource_group" "speedrun" {
  name = "speedrun"
}

resource "azurerm_virtual_network" "speedrun" {
  name                = "speedrun-network"
  resource_group_name = data.azurerm_resource_group.speedrun.name
  location            = data.azurerm_resource_group.speedrun.location
  address_space       = ["10.10.0.0/16"]
}

resource "azurerm_network_security_group" "ssh_nsg" {
  name                = "sshnsg"
  location            = data.azurerm_resource_group.speedrun.location
  resource_group_name = data.azurerm_resource_group.speedrun.name

  security_rule {
    name                       = "ssh-rule"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet" "speedrun" {
  name                 = "speedrun-subnet"
  resource_group_name  = data.azurerm_resource_group.speedrun.name
  virtual_network_name = azurerm_virtual_network.speedrun.name
  address_prefixes     = ["10.10.10.0/24"]

  service_endpoints = [
    "Microsoft.Storage"
  ]
}

resource "azurerm_subnet_network_security_group_association" "ml_subnet_nsg" {
  subnet_id                 = azurerm_subnet.speedrun.id
  network_security_group_id = azurerm_network_security_group.ssh_nsg.id
}

module "management" {
  source              = "./modules/management"
  vnet_name           = azurerm_virtual_network.speedrun.name
  resource_group_name = data.azurerm_resource_group.speedrun.name
  location            = data.azurerm_resource_group.speedrun.location
  nsg_id              = azurerm_network_security_group.ssh_nsg.id
}

output "management_vm_ip_address" {
  value = module.management.vm_public_ip_address
}

# module "kubernetes" {
#   source              = "./modules/kubernetes"
#   vnet_name           = azurerm_virtual_network.speedrun.name
#   resource_group_name = data.azurerm_resource_group.speedrun.name
#   location            = data.azurerm_resource_group.speedrun.location
#   nsg_id              = azurerm_network_security_group.ssh_nsg.id
# }
