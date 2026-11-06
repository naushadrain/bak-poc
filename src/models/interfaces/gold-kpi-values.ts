export interface GoldKpiValues {
  estate_code: string;
  kpi_id: string;
  kpi_name: string;
  /** Mixed in sample data: numbers, URLs (M042) and states such as "Approved" (M091). */
  value: string | number;
  unit: string;
  client_code: string;
  tier: number;
  _synced_to_sql_at: string;
}
