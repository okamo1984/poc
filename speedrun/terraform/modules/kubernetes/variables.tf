variable "vnet_name" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "vm_size" {
  type    = string
  default = "Standard_DS2_v2"
}

variable "vm_password" {
  type    = string
  default = "P@$$w0rd!"
}

variable "nsg_id" {
  type = string
}
