terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.55.0"
    }

    azuread = {
      source  = "hashicorp/azuread"
      version = "3.6.0"
    }
  }
  required_version = ">= 1.13.0"
}