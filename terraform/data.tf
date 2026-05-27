# global config lookup
data "azuread_client_config" "current" {}

data "azurerm_client_config" "current" {}

data "azuread_service_principal" "terraform_service_principal" {
  display_name = var.terraform_service_principal_display_name
}

data "azurerm_subscription" "current" {}

# vnet lookup
data "azurerm_virtual_network" "polaris_vnet" {
  name                = var.vnet_name
  resource_group_name = var.vnet_rg
}

# To reference a specific subnet use data.azurerm_subnet.materials_subnets["<subnet-name>"].id
data "azurerm_subnet" "materials_subnets" {
  for_each             = toset(data.azurerm_virtual_network.polaris_vnet.subnets)
  name                 = each.value
  virtual_network_name = var.vnet_name
  resource_group_name  = var.vnet_rg
}

# private dns zone lookup
data "azurerm_private_dns_zone" "hub_dns_zones" {
  for_each            = var.private_dns_zones
  name                = each.value
  resource_group_name = var.vnet_rg
}

#Backend
data "azuread_application" "fa_polaris_gateway" {
  display_name = var.fa_polaris_gateway_name
}

data "azuread_application_published_app_ids" "well_known" {}

# New block below using v3 of provider which replaces application ID with client_id.
resource "azuread_service_principal" "msgraph" {
  client_id    = data.azuread_application_published_app_ids.well_known.result.MicrosoftGraph
  use_existing = true
  owners       = var.app_reg_owners
}

# Retrieval of casework app redaction logger
data "azuread_application" "fa_redaction_log_reporting" {
  display_name = "fa-${local.redaction_log_resource_name}-reporting"
}

# begin: app insights lookups
data "azurerm_application_insights" "global_ai" {
  name                = local.polaris_monitor_ai_name
  resource_group_name = local.polaris_monitor_rg_name
}

data "azurerm_log_analytics_workspace" "global_la" {
  name                = local.polaris_monitor_la_name
  resource_group_name = local.polaris_monitor_rg_name
}
# end: app insights lookups
