locals {

  # Naming conventions: {serviceType}-{appName}-{optional:componentName}-{environment}-{location}
  resource_name               = "${var.project_name}-${var.environment}-${var.location_abbr}"
  web_materials_name          = "${var.project_name}-web-${var.environment}-${var.location_abbr}"
  web_components_name         = "components-web-${var.environment}-${var.location_abbr}"
  redaction_log_resource_name = var.environment != "prod" ? var.environment != "dev" ? "redaction-log-qa" : "redaction-log-${var.environment}" : "redaction-log"
  polaris_monitor_rg_name     = var.environment != "prod" ? var.environment != "dev" ? "rg-polaris-analytics-qa" : "rg-polaris-analytics-${var.environment}" : "rg-polaris-analytics"
  
  # The below map has been added to handle the relationship between environments with Polaris. Materials Staging will use Polaris QA.
  polaris_name_map = {
    dev  = "polaris-dev"
    stg  = "polaris-qa"
    prod = "polaris-prod"
  }
  common_tags = {
    environment = var.environment_tag
    project     = "${var.project_name}-ui"
    creator     = "Created by Terraform"
  }
}