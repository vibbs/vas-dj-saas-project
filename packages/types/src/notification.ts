export type NotificationCategory =
  | "system"
  | "billing"
  | "team"
  | "security"
  | "updates";
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  category_preferences: Record<NotificationCategory, boolean>;
}
