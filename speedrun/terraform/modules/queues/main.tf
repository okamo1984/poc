resource "azurerm_servicebus_namespace" "speedrun" {
  name                = "speedrun-namespace"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "Standard"
}

resource "azurerm_servicebus_queue" "speedrun-vm-creation" {
  name                = "speedrun-vm-creation-queue"
  resource_group_name = var.resource_group_name
  namespace_name      = azurerm_servicebus_namespace.speedrun.name
}

resource "azurerm_servicebus_queue" "speedrun-vm-deletion" {
  name                = "speedrun-vm-deletion-queue"
  resource_group_name = var.resource_group_name
  namespace_name      = azurerm_servicebus_namespace.speedrun.name
}
