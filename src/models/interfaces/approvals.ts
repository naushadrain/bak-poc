export interface Approvals {
  estate_code: string;
  kpi_id: string;
  kpi_name: string;
  /** State such as "Approved" in sample data. May arrive as text, as gold KPI values are mixed. */
  value: string | number;
  unit: string;
  client_code: string;
  tier: number;
  _synced_to_sql_at: string;
}
