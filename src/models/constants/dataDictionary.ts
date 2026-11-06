/**
 * Field names and types mirror src/models/interfaces, which match the API's OpenAPI
 * spec. Definitions, sources, refresh rates, sensitivity and status come from
 * source_to_target_mapping.csv where it has a row for the field.
 */
export interface DictionaryField {
  name: string;
  type: string;
  definition: string;
  source?: string;
  refresh?: string;
  sensitivity?: "Client" | "Internal";
  status?: "Mapped" | "Partial" | "Proposed" | "TBC" | "Gap";
}

export interface DictionaryEndpoint {
  name: string;
  interfaceName: string;
  route: string;
  /** Roles allowed by the API integration guide. Null when the guide doesn't list the dataset. */
  roles: string | null;
  fields: DictionaryField[];
}

const ESTATE_CODE: DictionaryField = {
  name: "estate_code",
  type: "string",
  definition: "Estate service code. PORTFOLIO marks the portfolio roll-up row.",
};
const CLIENT_CODE: DictionaryField = {
  name: "client_code",
  type: "string",
  definition: "Client the estate belongs to. Used for row-level security.",
};
const SYNCED_AT: DictionaryField = {
  name: "_synced_to_sql_at",
  type: "string",
  definition: "When the row was last synced to Azure SQL.",
};
const INGESTED_AT: DictionaryField = {
  name: "_ingested_at",
  type: "string",
  definition: "When the source record was ingested.",
};
const SOURCE_FILE: DictionaryField = {
  name: "_source_file",
  type: "string",
  definition: "File the record was ingested from.",
};

function kpiFields(valueDefinition: string, hasTier = true): DictionaryField[] {
  return [
    ESTATE_CODE,
    { name: "kpi_id", type: "string", definition: "KPI identifier from the mapping, such as M041." },
    { name: "kpi_name", type: "string", definition: "KPI name, such as projects_by_stage:Mobilisation." },
    { name: "value", type: "string", definition: valueDefinition },
    { name: "unit", type: "string", definition: "Unit of the value, such as count, % or AED." },
    CLIENT_CODE,
    ...(hasTier ? [{ name: "tier", type: "number", definition: "Estate tier." }] : []),
    SYNCED_AT,
  ];
}

export const DATA_DICTIONARY: DictionaryEndpoint[] = [
  {
    name: "Service Delivery",
    interfaceName: "ServiceDelivery",
    route: "/api/vw_service_delivery",
    roles: "excom, ops, client",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "open_orders", type: "number", definition: "Count of work orders with an open status.", source: "MRI CAFM", refresh: "Near-live", sensitivity: "Client", status: "Mapped" },
      { name: "backlog_aged_30d", type: "number", definition: "Count of open work orders older than 30 days.", source: "MRI CAFM", refresh: "Daily", sensitivity: "Client", status: "Proposed" },
      { name: "sla_pct", type: "number", definition: "% closed within SLA, rolling 30 days.", source: "MRI CAFM", refresh: "Daily", sensitivity: "Client", status: "Mapped" },
      { name: "avg_response_min", type: "number", definition: "Average response in minutes over 30 days, excluding PPM.", source: "MRI CAFM", refresh: "Daily", sensitivity: "Client", status: "Mapped" },
      { name: "ppm_completion_pct", type: "number", definition: "% of PPM due in the rolling 90 days that was completed.", source: "MRI CAFM", refresh: "Daily", sensitivity: "Client", status: "Proposed" },
      { name: "mttr_hours", type: "number", definition: "Average hours to repair reactive work orders, 12 months.", source: "MRI CAFM", refresh: "Daily", sensitivity: "Client", status: "Proposed" },
      { name: "guest_requests_open", type: "number", definition: "Count of open guest-class requests.", source: "MRI CAFM", refresh: "Near-live", sensitivity: "Client", status: "TBC" },
      { name: "vip_response_min", type: "number", definition: "Average response in minutes to VIP requests, 90 days.", source: "MRI CAFM", refresh: "Daily", sensitivity: "Client", status: "Proposed" },
      SYNCED_AT,
    ],
  },
  {
    name: "Asset Management",
    interfaceName: "AssetMgmt",
    route: "/api/vw_asset_mgmt",
    roles: "excom, ops, client",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "asset_count", type: "number", definition: "Count of active assets per estate.", source: "MRI CAFM", refresh: "Weekly", sensitivity: "Client", status: "Mapped" },
      { name: "asset_health_idx", type: "number", definition: "Invisible Care Index, 0-100. Weights are still to be confirmed.", source: "MRI CAFM", refresh: "Monthly", sensitivity: "Client", status: "Partial" },
      { name: "assets_beyond_life", type: "number", definition: "Count of assets older than their expected life.", source: "MRI CAFM", refresh: "Monthly", sensitivity: "Client", status: "Mapped" },
      { name: "spares_value_aed_m", type: "number", definition: "Value of spares on hand, AED millions.", source: "D365 F&O", refresh: "Weekly", sensitivity: "Client", status: "Proposed" },
      SYNCED_AT,
    ],
  },
  {
    name: "Finance",
    interfaceName: "Finance",
    route: "/api/vw_finance",
    roles: "excom, fin",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "opex_ytd_aed", type: "number", definition: "Sum of OPEX actuals year to date, AED.", source: "D365 F&O", refresh: "Daily", sensitivity: "Client", status: "Mapped" },
      { name: "opex_var_pct", type: "number", definition: "(Actual - budget) / budget x 100.", source: "D365 F&O", refresh: "Monthly", sensitivity: "Client", status: "Mapped" },
      { name: "capex_committed_aed", type: "number", definition: "Sum of committed CAPEX purchase orders, AED.", source: "D365 F&O", refresh: "Daily", sensitivity: "Client", status: "Mapped" },
      SYNCED_AT,
    ],
  },
  {
    name: "Procurement",
    interfaceName: "Procurement",
    route: "/api/vw_procurement",
    roles: "excom, fin, client",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "pipeline_aed_m", type: "number", definition: "Sum of active tenders, AED millions.", source: "D365 F&O", refresh: "Weekly", sensitivity: "Client", status: "Mapped" },
      { name: "gates_live", type: "number", definition: "Count of tenders at gates 1 to 13.", source: "Excel tracker", refresh: "Weekly", sensitivity: "Client", status: "Partial" },
      { name: "awarded_ytd_aed_m", type: "number", definition: "Sum awarded this financial year, AED millions.", source: "D365 F&O", refresh: "Weekly", sensitivity: "Client", status: "Mapped" },
      SYNCED_AT,
    ],
  },
  {
    name: "Projects",
    interfaceName: "Projects",
    route: "/api/vw_projects",
    roles: "excom, ops, fin, client",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "projects_active", type: "number", definition: "Count of projects not closed or cancelled.", source: "D365 Projects", refresh: "Weekly", sensitivity: "Client", status: "Mapped" },
      { name: "progress_photo_url", type: "string | null", definition: "Latest progress photo, found through governed file naming.", source: "OneDrive", refresh: "On change", sensitivity: "Client", status: "Partial" },
      SYNCED_AT,
    ],
  },
  {
    name: "Projects by Stage",
    interfaceName: "ProjectsByStage",
    route: "/api/vw_projects_by_stage",
    roles: "excom, ops, fin, client",
    fields: kpiFields("Count of projects at the stage named in kpi_name, sent as text."),
  },
  {
    name: "HSE",
    interfaceName: "HSE",
    route: "/api/vw_hse",
    roles: "excom, ops, client",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "permits_valid_pct", type: "number", definition: "% of permits that are unexpired.", source: "MRI CAFM", refresh: "Weekly", sensitivity: "Client", status: "Partial" },
      { name: "incidents_mtd", type: "number", definition: "Count of incidents month to date.", source: "SharePoint", refresh: "Daily", sensitivity: "Internal", status: "TBC" },
      { name: "lti_free_days", type: "number", definition: "Days since the last lost-time injury.", source: "SharePoint", refresh: "Daily", sensitivity: "Internal", status: "Proposed" },
      { name: "near_miss_closeout_pct", type: "number", definition: "% of near misses closed, year to date.", source: "SharePoint", refresh: "Daily", sensitivity: "Internal", status: "Proposed" },
      { name: "ptw_compliance_pct", type: "number", definition: "% of permits to work that are compliant, year to date.", source: "MRI CAFM", refresh: "Daily", sensitivity: "Client", status: "Proposed" },
      SYNCED_AT,
    ],
  },
  {
    name: "HR",
    interfaceName: "HR",
    route: "/api/vw_hr",
    roles: "excom, ops",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "staff_deployed", type: "number", definition: "Count of distinct staff on site today.", source: "D365 HR + T&A", refresh: "Near-live", sensitivity: "Client", status: "Mapped" },
      { name: "deployment_vs_plan_pct", type: "number", definition: "Deployed / planned x 100.", source: "D365 HR", refresh: "Daily", sensitivity: "Client", status: "Mapped" },
      SYNCED_AT,
    ],
  },
  {
    name: "Invisible Care",
    interfaceName: "InvisibleCare",
    route: "/api/vw_invisible_care",
    roles: "excom, ops, client",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "avg_temp_c", type: "number", definition: "Average temperature over the last 15 minutes per zone, °C.", source: "IoT / Event Hub", refresh: "Near-live", sensitivity: "Client", status: "Mapped" },
      { name: "env_alerts_open", type: "number", definition: "Count of unresolved environmental alerts.", source: "IoT / Event Hub", refresh: "Near-live", sensitivity: "Internal", status: "Mapped" },
      { name: "asset_health_idx", type: "number", definition: "Invisible Care Index, 0-100. Same measure as in Asset Management." },
      SYNCED_AT,
    ],
  },
  {
    name: "Sustainability",
    interfaceName: "Sustainability",
    route: "/api/vw_sustainability",
    roles: "excom, ops, client",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "energy_kwh_mtd", type: "number", definition: "Energy use month to date, kWh. Manually keyed, no digital source yet.", source: "Utility bills", refresh: "Monthly", sensitivity: "Client", status: "Gap" },
      { name: "water_m3_mtd", type: "number", definition: "Water use month to date, m³. Manually keyed, no digital source yet.", source: "Utility bills", refresh: "Monthly", sensitivity: "Client", status: "Gap" },
      SYNCED_AT,
    ],
  },
  {
    name: "Approvals",
    interfaceName: "Approvals",
    route: "/api/vw_approvals",
    roles: "excom",
    fields: kpiFields("Latest approval state per document class, such as Approved.", false),
  },
  {
    name: "Gold KPI Values",
    interfaceName: "GoldKpiValues",
    route: "/api/gold_kpi_values",
    roles: null,
    fields: kpiFields("KPI value sent as text: a number, a URL or a state, depending on the KPI."),
  },
  {
    name: "Estate Directory",
    interfaceName: "SecurityDimEstate",
    route: "/api/security_dim_estate",
    roles: "excom, ops, fin, client, admin",
    fields: [
      ESTATE_CODE,
      CLIENT_CODE,
      { name: "emirate", type: "string", definition: "Emirate the estate is in." },
      { name: "tier", type: "number", definition: "Estate tier number. 0 is the portfolio row." },
      { name: "tier_name", type: "string", definition: "Tier name, such as Flagship Estate." },
      { name: "occupancy_status", type: "string", definition: "Occupancy, such as Active or Dormant." },
      { name: "category", type: "string", definition: "Estate category, such as Icon or Residential." },
      { name: "managed_since", type: "number", definition: "Year management started." },
      INGESTED_AT,
      SOURCE_FILE,
      SYNCED_AT,
    ],
  },
  {
    name: "User Access",
    interfaceName: "SecurityUserAccess",
    route: "/api/security_user_access",
    roles: "excom, admin",
    fields: [
      { name: "user_principal_name", type: "string", definition: "User's sign-in name." },
      { name: "role", type: "string", definition: "Access role, such as ESTATE_MANAGER." },
      { name: "client_code", type: "string", definition: "Client the user can access. ALL means every client." },
      { name: "estate_code", type: "string", definition: "Estate the user can access. * means every estate." },
      INGESTED_AT,
      SOURCE_FILE,
      SYNCED_AT,
    ],
  },
];
