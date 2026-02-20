export type MembershipRole = "owner" | "admin" | "member" | "viewer";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  sub_domain: string;
  logo?: string;
  description?: string;
  plan: string;
  on_trial: boolean;
  trial_ends_on?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization: Organization;
  user_id: string;
  role: MembershipRole;
  status: "active" | "invited" | "suspended";
  joined_at: string;
}
