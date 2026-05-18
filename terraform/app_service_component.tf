resource "azurerm_linux_web_app" "as_comp_materials" {
  #checkov:skip=CKV_AZURE_66:Ensure that App service enables failed request tracing
  #checkov:skip=CKV_AZURE_88:Ensure that app services use Azure Files
  #checkov:skip=CKV_AZURE_213:Ensure that App Service configures health check
  #checkov:skip=CKV_AZURE_13:Ensure App Service Authentication is set on Azure App Service
  #checkov:skip=CKV_AZURE_17:Ensure the web app has 'Client Certificates (Incoming client certificates)' set
  name                = "as-${local.web_components_name}"
  location            = azurerm_resource_group.rg_materials.location
  service_plan_id     = azurerm_service_plan.web_linux.id
  resource_group_name = azurerm_resource_group.rg_materials.name
  #virtual_network_subnet_id     = data.azurerm_subnet.materials_subnets[var.ui_subnet_name].id #TBC vnet integration is not required
  public_network_access_enabled = false
  https_only                    = true
  client_certificate_enabled    = false

  site_config {
    ftps_state              = "FtpsOnly"
    http2_enabled           = true
    app_command_line        = "" #TBC
    always_on               = true
    vnet_route_all_enabled  = true
    minimum_tls_version     = "1.3"
    scm_minimum_tls_version = "1.3"

    application_stack {
      node_version = "22-lts" #TBC
    }
  }

  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY"                  = data.azurerm_application_insights.global_ai.instrumentation_key
    "APPINSIGHTS_PROFILERFEATURE_VERSION"             = "1.0.0"
    "APPINSIGHTS_SNAPSHOTFEATURE_VERSION"             = "1.0.0"
    "APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"       = ""
    "APPLICATIONINSIGHTS_CONNECTION_STRING"           = data.azurerm_application_insights.global_ai.connection_string
    "ApplicationInsightsAgent_EXTENSION_VERSION"      = "~3"
    "DiagnosticServices_EXTENSION_VERSION"            = "~3"
    "InstrumentationEngine_EXTENSION_VERSION"         = "disabled"
    "SnapshotDebugger_EXTENSION_VERSION"              = "disabled"
    "XDT_MicrosoftApplicationInsights_BaseExtensions" = "disabled"
    "XDT_MicrosoftApplicationInsights_Mode"           = "recommended"
    "XDT_MicrosoftApplicationInsights_PreemptSdk"     = "disabled"
    "HostType"                                        = "Production"
  }

  sticky_settings {
    app_setting_names = ["HostType"]
  }

  /*
  auth_settings_v2 {
    auth_enabled           = true
    require_authentication = true
    default_provider       = "AzureActiveDirectory"
    unauthenticated_action = "AllowAnonymous"
    excluded_paths         = ["/status"]

    # our default_provider:
    active_directory_v2 {
      tenant_auth_endpoint = "https://sts.windows.net/${data.azurerm_client_config.current.tenant_id}/v2.0"
      client_secret_setting_name = "MICROSOFT_PROVIDER_AUTHENTICATION_SECRET"
      client_id                  = module.azurerm_app_reg_as_web_xxxxxxx.client_id
    }

    # use a store for tokens (az blob storage backed)
    login {
      token_store_enabled = true
    }
  }
*/

  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  identity {
    type = "SystemAssigned"
  }

  tags = local.common_tags

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}

resource "azurerm_private_endpoint" "pep_as_comp_materials" {
  name                = "${azurerm_linux_web_app.as_comp_materials.name}-pe"
  location            = azurerm_resource_group.rg_materials.location
  resource_group_name = azurerm_resource_group.rg_materials.name
  subnet_id           = data.azurerm_subnet.materials_subnets[var.app_subnet_name].id

  private_service_connection {
    name                           = azurerm_linux_web_app.as_comp_materials.name
    private_connection_resource_id = azurerm_linux_web_app.as_comp_materials.id
    subresource_names              = ["sites"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "app-dns-zone-group"
    private_dns_zone_ids = [data.azurerm_private_dns_zone.hub_dns_zones["sites"].id]
  }

  # dynamic "ip_configuration" {
  #   for_each = var.as_comp_pe_ip == null ? [] : [1]
  #   content {
  #     name               = "ip-${azurerm_linux_web_app.as_comp_materials.name}"
  #     private_ip_address = var.as_comp_pe_ip
  #     subresource_name   = "sites"
  #     member_name        = "sites"
  #   }
  # }

  tags = local.common_tags
}