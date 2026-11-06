export interface Projects {
  estate_code: string;
  client_code: string;
  projects_active: number;
  /** Sample data has a photo for 8 of 11 estate codes. */
  progress_photo_url: string | null;
  _synced_to_sql_at: string;
}
