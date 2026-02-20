export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  trial_period_days: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export interface Subscription {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  due_date?: string;
  paid_at?: string;
  invoice_url?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account";
  brand?: string;
  last4: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}
