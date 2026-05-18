# Logging is set to point to the existing polaris resources
# resource "azurerm_log_analytics_workspace" "law_materials" {
#   name                = "la-${local.resource_name}"
#   location            = azurerm_resource_group.rg_materials.location
#   resource_group_name = azurerm_resource_group.rg_materials.name
#   sku                 = "PerGB2018"
#   retention_in_days   = 30
# }

# resource "azurerm_application_insights" "ai_materials" {
#   name                = "ai-${local.resource_name}"
#   location            = azurerm_resource_group.rg_materials.location
#   resource_group_name = azurerm_resource_group.rg_materials.name
#   application_type    = "web"
#   workspace_id        = azurerm_log_analytics_workspace.law_materials.id
#   retention_in_days   = 30
#   tags                = local.common_tags
# }
