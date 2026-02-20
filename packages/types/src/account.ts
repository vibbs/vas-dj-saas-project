export type AccountRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export interface Account {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  abbreviated_name: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  role: AccountRole;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_2fa_enabled: boolean;
  date_joined: string;
  status: AccountStatus;
  is_admin: boolean;
  is_org_admin: boolean;
  is_org_creator: boolean;
  can_invite_users: boolean;
  can_manage_billing: boolean;
  can_delete_org: boolean;
}
