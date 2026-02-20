import React from "react";
import { useTheme, Button, Text, Link } from "@vas-dj-saas/ui";
import { VerifyEmailFormProps } from "./types";

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email,
  onResend,
  isLoading = false,
  error,
  successMessage,
  onBackToLogin,
  className,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: `${theme.spacing.lg}px`,
        textAlign: "center",
        ...style,
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: `${theme.spacing.sm}px` }}>
        &#9993;
      </div>

      <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 600 }}>
        Check your email
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: theme.typography.fontSize.sm,
        }}
      >
        {email
          ? `We sent a verification link to ${email}`
          : "We sent a verification link to your email address"}
      </Text>

      {error && (
        <Text
          style={{
            color: theme.colors.destructive,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          {error}
        </Text>
      )}

      {successMessage && (
        <Text
          style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          {successMessage}
        </Text>
      )}

      <Button
        variant="outline"
        size="md"
        loading={isLoading}
        disabled={isLoading}
        onClick={onResend}
      >
        {isLoading ? "Sending..." : "Resend verification email"}
      </Button>

      {onBackToLogin && (
        <Link href="#" onClick={onBackToLogin} size="sm">
          Back to sign in
        </Link>
      )}
    </div>
  );
};
