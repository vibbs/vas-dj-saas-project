export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  /** Full key is only returned on creation */
  key?: string;
  scopes: string[];
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
