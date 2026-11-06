export interface ProjectsByStage {
  estate_code: string;
  kpi_id: string;
  kpi_name: string;
  /** Always text, including for numeric KPIs such as counts. */
  value: string;
  unit: string;
  client_code: string;
  tier: number;
  _synced_to_sql_at: string;
}
