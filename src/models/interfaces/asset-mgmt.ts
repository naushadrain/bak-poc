export interface AssetMgmt {
  estate_code: string;
  client_code: string;
  asset_count: number;
  asset_health_idx: number;
  assets_beyond_life: number;
  /** Sample data only has this at PORTFOLIO level, so estate rows may be null. */
  spares_value_aed_m: number | null;
  _synced_to_sql_at: string;
}
