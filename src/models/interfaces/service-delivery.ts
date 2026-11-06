export interface ServiceDelivery {
  estate_code: string;
  client_code: string;
  open_orders: number;
  backlog_aged_30d: number;
  sla_pct: number;
  avg_response_min: number;
  ppm_completion_pct: number;
  mttr_hours: number;
  guest_requests_open: number;
  vip_response_min: number;
  _synced_to_sql_at: string;
}
