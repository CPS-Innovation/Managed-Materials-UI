terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.50.0"
    }

    azuread = {
      source  = "hashicorp/azuread"
      version = "3.7.0"
    }
  }
  required_version = ">= 1.13.0"
}