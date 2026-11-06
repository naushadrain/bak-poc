export interface HSE {
  estate_code: string;
  client_code: string;
  permits_valid_pct: number;
  incidents_mtd: number;
  /** Sample data only has this at PORTFOLIO level, so estate rows may be null. */
  lti_free_days: number | null;
  /** Sample data only has this at PORTFOLIO level, so estate rows may be null. */
  near_miss_closeout_pct: number | null;
  /** Sample data only has this at PORTFOLIO level, so estate rows may be null. */
  ptw_compliance_pct: number | null;
  _synced_to_sql_at: string;
}
