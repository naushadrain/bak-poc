export interface Projects {
  estate_code: string;
  client_code: string;
  projects_active: number;
  /** Null when there's no photo, including on the PORTFOLIO row. */
  progress_photo_url: string | null;
  _synced_to_sql_at: string;
}
