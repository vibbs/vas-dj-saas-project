export type OAuthProvider = "google" | "github";

export interface OAuthButtonsProps {
  onOAuthLogin: (provider: OAuthProvider) => void;
  isLoading?: boolean;
  disabled?: boolean;
  /** Providers to show. Default: ['google', 'github'] */
  providers?: OAuthProvider[];
  label?: string;
  className?: string;
  style?: any;
}
