import React, { useState } from "react";
import { useTheme, Button, Input, Text, Link } from "@vas-dj-saas/ui";
import { ForgotPasswordFormProps, ForgotPasswordFormState } from "./types";

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  successMessage,
  onBackToLogin,
  className,
  style,
}) => {
  const { theme } = useTheme();
  const [formState, setFormState] = useState<ForgotPasswordFormState>({
    email: "",
    errors: {},
    touched: { email: false },
  });

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Please enter a valid email";
    return null;
  };

  const handleChange = (value: string) => {
    const error = validateEmail(value);
    setFormState({
      email: value,
      touched: { email: true },
      errors: { email: error ? [error] : [] },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(formState.email);
    setFormState((prev) => ({
      ...prev,
      errors: { email: emailError ? [emailError] : [] },
      touched: { email: true },
    }));
    if (!emailError) {
      await onSubmit(formState.email);
    }
  };

  return (
    <form
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${theme.spacing.lg}px`,
        ...style,
      }}
      onSubmit={handleSubmit}
    >
      <Input
        type="email"
        label="Email"
        value={formState.email}
        onChange={(e) => handleChange(e.target.value)}
        errorText={
          formState.touched.email ? formState.errors.email?.[0] : undefined
        }
        disabled={isLoading}
        autoComplete="email"
        required
      />

      {error && (
        <Text
          style={{
            color: theme.colors.destructive,
            fontSize: theme.typography.fontSize.sm,
            textAlign: "center",
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
            textAlign: "center",
          }}
        >
          {successMessage}
        </Text>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        style={{ width: "100%" }}
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>

      {onBackToLogin && (
        <div style={{ textAlign: "center" }}>
          <Link href="#" onClick={onBackToLogin} size="sm">
            Back to sign in
          </Link>
        </div>
      )}
    </form>
  );
};
