import React, { useState } from "react";
import { useTheme, Button, Input, Text, Link } from "@vas-dj-saas/ui";
import { ResetPasswordFormProps, ResetPasswordFormState } from "./types";

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  token,
  isLoading = false,
  error,
  successMessage,
  onBackToLogin,
  className,
  style,
}) => {
  const { theme } = useTheme();
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    newPassword: "",
    confirmPassword: "",
    errors: {},
    touched: { newPassword: false, confirmPassword: false },
  });

  const validate = (
    name: string,
    value: string,
    state: ResetPasswordFormState,
  ) => {
    if (name === "newPassword") {
      if (!value) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters";
      return null;
    }
    if (name === "confirmPassword") {
      if (!value) return "Please confirm your password";
      if (value !== state.newPassword) return "Passwords do not match";
      return null;
    }
    return null;
  };

  const handleChange = (
    name: "newPassword" | "confirmPassword",
    value: string,
  ) => {
    const newState = { ...formState, [name]: value };
    const err = validate(name, value, newState);
    setFormState({
      ...newState,
      touched: { ...formState.touched, [name]: true },
      errors: { ...formState.errors, [name]: err ? [err] : [] },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwErr = validate("newPassword", formState.newPassword, formState);
    const cfErr = validate(
      "confirmPassword",
      formState.confirmPassword,
      formState,
    );
    setFormState((prev) => ({
      ...prev,
      errors: {
        newPassword: pwErr ? [pwErr] : [],
        confirmPassword: cfErr ? [cfErr] : [],
      },
      touched: { newPassword: true, confirmPassword: true },
    }));
    if (!pwErr && !cfErr) {
      await onSubmit({
        token,
        newPassword: formState.newPassword,
        confirmPassword: formState.confirmPassword,
      });
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
        type="password"
        label="New password"
        value={formState.newPassword}
        onChange={(e) => handleChange("newPassword", e.target.value)}
        errorText={
          formState.touched.newPassword
            ? formState.errors.newPassword?.[0]
            : undefined
        }
        disabled={isLoading}
        autoComplete="new-password"
        required
      />
      <Input
        type="password"
        label="Confirm password"
        value={formState.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        errorText={
          formState.touched.confirmPassword
            ? formState.errors.confirmPassword?.[0]
            : undefined
        }
        disabled={isLoading}
        autoComplete="new-password"
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
        {isLoading ? "Resetting..." : "Reset password"}
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
