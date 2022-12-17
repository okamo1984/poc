resource "azurerm_subnet" "management" {
  name                 = "management-subnet"
  resource_group_name  = var.resource_group_name
  virtual_network_name = var.vnet_name
  address_prefixes     = ["10.10.0.0/24"]

  service_endpoints = [
    "Microsoft.Storage"
  ]
}

resource "azurerm_subnet_network_security_group_association" "subnet_nsg" {
  subnet_id                 = azurerm_subnet.management.id
  network_security_group_id = var.nsg_id
}

resource "azurerm_public_ip" "management" {
  name                = "management-pip"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_method   = "Static"
}

resource "azurerm_network_interface" "management" {
  name                = "management-nic"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.management.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.management.id
  }
}

data "azurerm_image" "speedrun_python" {
  name                = var.image_name
  resource_group_name = var.resource_group_name
}

resource "azurerm_linux_virtual_machine" "management" {
  name                            = "management-machine"
  resource_group_name             = var.resource_group_name
  location                        = var.location
  size                            = var.vm_size
  admin_username                  = "speedrun"
  admin_password                  = var.vm_password
  disable_password_authentication = false
  network_interface_ids = [
    azurerm_network_interface.management.id,
  ]
  source_image_id = data.azurerm_image.speedrun_python.id

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
}
