resource "azurerm_subnet" "speedrun_aks" {
  name                 = "speedrun-aks-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["10.10.20.0/24"]

  service_endpoints = [
    "Microsoft.Storage"
  ]
}

resource "azurerm_subnet" "speedrun_aks_spot" {
  name                 = "speedrun-aks-spot-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["10.10.30.0/24"]

  service_endpoints = [
    "Microsoft.Storage"
  ]
}

resource "azurerm_subnet_network_security_group_association" "speedrun_aks_nsg" {
  subnet_id                 = azurerm_subnet.speedrun_aks.id
  network_security_group_id = var.nsg_id
}

resource "azurerm_subnet_network_security_group_association" "speedrun_aks_spot_nsg" {
  subnet_id                 = azurerm_subnet.speedrun_aks_spot.id
  network_security_group_id = var.nsg_id
}

resource "azurerm_kubernetes_cluster" "speedrun" {
  name                = "speedrun-aks1"
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = "speedrunaks1"

  network_profile {
    network_plugin = "azure"
    network_policy = "azure"
  }

  default_node_pool {
    name           = "default"
    node_count     = 1
    vm_size        = "Standard_D2_v2"
    vnet_subnet_id = azurerm_subnet.speedrun_aks.id
  }

  identity {
    type = "SystemAssigned"
  }
}

resource "local_file" "speedrun_kubeconfig" {
  content  = azurerm_kubernetes_cluster.speedrun.kube_config_raw
  filename = pathexpand("~/.kube/speedrun")
}

resource "azurerm_kubernetes_cluster_node_pool" "speedrun_spot" {
  name                  = "internal"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.speedrun.id
  vm_size               = "Standard_DS2_v2"

  priority            = "Spot"
  enable_auto_scaling = true
  node_count          = 0
  min_count           = 0
  max_count           = 5
  vnet_subnet_id      = azurerm_subnet.speedrun_aks_spot.id
}
