import type { Account } from "./account";
import type { Organization } from "./organization";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user: Account;
}

export interface RegisterResponse extends AuthTokens {
  user: Account;
  organization?: {
    id: string;
    name: string;
    subdomain: string;
    on_trial: boolean;
    trial_ends_on?: string;
  };
}

export interface MFAChallengeResponse {
  mfa_required: true;
  mfa_token: string;
}
