resource "azurerm_linux_web_app" "as_web_materials" {
  #checkov:skip=CKV_AZURE_66:Ensure that App service enables failed request tracing
  #checkov:skip=CKV_AZURE_88:Ensure that app services use Azure Files
  #checkov:skip=CKV_AZURE_213:Ensure that App Service configures health check
  #checkov:skip=CKV_AZURE_13:Ensure App Service Authentication is set on Azure App Service
  #checkov:skip=CKV_AZURE_17:Ensure the web app has 'Client Certificates (Incoming client certificates)' set
  name                = "as-${local.web_materials_name}"
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
    app_command_line        = "npx serve -s"
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
      client_id                  = module.azurerm_app_reg_as_web_materials.client_id
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
      app_settings["APPINSIGHTS_INSTRUMENTATIONKEY"],
      app_settings["APPINSIGHTS_PROFILERFEATURE_VERSION"],
      app_settings["APPINSIGHTS_SNAPSHOTFEATURE_VERSION"],
      app_settings["APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"],
      app_settings["APPLICATIONINSIGHTS_CONNECTION_STRING"],
      app_settings["ApplicationInsightsAgent_EXTENSION_VERSION"],
      app_settings["DiagnosticServices_EXTENSION_VERSION"],
      app_settings["InstrumentationEngine_EXTENSION_VERSION"],
      app_settings["SnapshotDebugger_EXTENSION_VERSION"],
      app_settings["XDT_MicrosoftApplicationInsights_BaseExtensions"],
      app_settings["XDT_MicrosoftApplicationInsights_Mode"],
      app_settings["XDT_MicrosoftApplicationInsights_PreemptSdk"],
      app_settings["HostType"],
      tags
    ]
  }
}

module "azurerm_app_reg_as_web_materials" { # Note, app roles are currently being managed outside of terraform and it's functionality has been commented out from the module.
  source                  = "./modules/terraform-azurerm-azuread-app-registration"
  display_name            = "as-${local.web_materials_name}-appreg"
  identifier_uris         = ["https://CPSGOVUK.onmicrosoft.com/as-${local.web_materials_name}"]
  owners                  = concat([data.azuread_service_principal.terraform_service_principal.object_id], var.app_reg_owners)
  prevent_duplicate_names = true
  group_membership_claims = ["ApplicationGroup"]
  optional_claims = {
    access_token = {
      name = "groups"
    }
    id_token = {
      name = "groups"
    }
    saml2_token = {
      name = "groups"
    }
  }
  #use this code for adding api permissions
  required_resource_access = [{
    # Microsoft Graph
    resource_app_id = "00000003-0000-0000-c000-000000000000" # AppId for Microsoft Graph
    resource_access = [{
      id   = "e1fe6dd8-ba31-4d61-89e7-88639da4683d" # user.read for Microsoft Graph)
      type = "Scope"
    }]
    },
    {
      resource_app_id = data.azuread_application.fa_redaction_log_reporting.client_id
      resource_access = [{
        id   = data.azuread_application.fa_redaction_log_reporting.oauth2_permission_scope_ids["user_impersonation"]
        type = "Scope"
      }]
    },
    {
      resource_app_id = data.azuread_application.fa_polaris_gateway.client_id
      resource_access = [{
        id   = data.azuread_application.fa_polaris_gateway.oauth2_permission_scope_ids["user_impersonation"]
        type = "Scope"
      }]
    }
  ]

  single_page_application = {
    redirect_uris = var.environment != "prod" ? ["https://as-${local.web_materials_name}.azurewebsites.net/${var.materials_ui_sub_folder}", "http://localhost:3000/${var.materials_ui_sub_folder}/", "https://${local.polaris_name_map[var.environment]}-notprod.cps.gov.uk/${var.materials_ui_sub_folder}/"] : ["https://as-${local.web_materials_name}.azurewebsites.net/${var.materials_ui_sub_folder}", "https://polaris.cps.gov.uk/${var.materials_ui_sub_folder}/"]
  }

  api = {
    mapped_claims_enabled          = true
    requested_access_token_version = 1
  }
  web = {
    homepage_url  = "https://as-${local.web_materials_name}.azurewebsites.net"
    redirect_uris = ["https://getpostman.com/oauth2/callback"]
    implicit_grant = {
      access_token_issuance_enabled = true
      id_token_issuance_enabled     = true
    }
  }
  tags = ["created by terraform"]
}

resource "azuread_application_password" "asap_web_materials_app_service" {
  application_id    = module.azurerm_app_reg_as_web_materials.id
  end_date_relative = "17520h"
}

# # Create life cycle for e2e-tests' version of the client secret
# resource "time_rotating" "schedule" {
#   rotation_days = 90
# }

# Will most likely be needed in future
# resource "azuread_application_password" "e2e_test_secret" {
#   application_object_id = module.azurerm_app_reg_as_web_materials.object_id
#   display_name          = "e2e-tests client secret"
#   rotate_when_changed = {
#     rotation = time_rotating.schedule.id
#   }
# }

module "azurerm_service_principal_sp_materials_web" { # Note, app roles are currently being managed outside of terraform and it's functionality has been commented out from the module.
  source                       = "./modules/terraform-azurerm-azuread_service_principal"
  client_id                    = module.azurerm_app_reg_as_web_materials.client_id
  app_role_assignment_required = false
  owners                       = concat([data.azurerm_client_config.current.object_id], var.app_reg_owners)
  depends_on                   = [module.azurerm_app_reg_as_web_materials]
}

resource "azuread_service_principal_password" "sp_materials_web_pw" {
  service_principal_id = module.azurerm_service_principal_sp_materials_web.id
}

resource "azuread_application_pre_authorized" "fapre_materials_web" { # Adding the App Reg we created above as an authorized app to the App Reg for the backend polaris function app
  application_id       = data.azuread_application.fa_polaris_gateway.id
  authorized_client_id = module.azurerm_app_reg_as_web_materials.client_id
  permission_ids       = [data.azuread_application.fa_polaris_gateway.oauth2_permission_scope_ids["user_impersonation"]]
}

resource "azuread_service_principal_delegated_permission_grant" "materials_web_grant_access_to_msgraph" {
  service_principal_object_id          = module.azurerm_service_principal_sp_materials_web.object_id
  resource_service_principal_object_id = azuread_service_principal.msgraph.object_id
  claim_values                         = ["User.Read"]
}

resource "azurerm_private_endpoint" "pep_as_web_materials" {
  name                = "${azurerm_linux_web_app.as_web_materials.name}-pe"
  location            = azurerm_resource_group.rg_materials.location
  resource_group_name = azurerm_resource_group.rg_materials.name
  subnet_id           = data.azurerm_subnet.materials_subnets[var.app_subnet_name].id

  private_service_connection {
    name                           = azurerm_linux_web_app.as_web_materials.name
    private_connection_resource_id = azurerm_linux_web_app.as_web_materials.id
    subresource_names              = ["sites"]
    is_manual_connection           = false
  }

  private_dns_zone_group {
    name                 = "app-dns-zone-group"
    private_dns_zone_ids = [data.azurerm_private_dns_zone.hub_dns_zones["sites"].id]
  }

  dynamic "ip_configuration" {
    for_each = var.as_web_pe_ip == null ? [] : [1]
    content {
      name               = "ip-${azurerm_linux_web_app.as_web_materials.name}"
      private_ip_address = var.as_web_pe_ip
      subresource_name   = "sites"
      member_name        = "sites"
    }
  }

  tags = local.common_tags
}