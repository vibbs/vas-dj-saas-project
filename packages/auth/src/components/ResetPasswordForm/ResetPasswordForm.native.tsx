import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text } from "@vas-dj-saas/ui";
import { ResetPasswordFormProps, ResetPasswordFormState } from "./types";

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  token,
  isLoading = false,
  error,
  successMessage,
  onBackToLogin,
}) => {
  const [formState, setFormState] = useState<ResetPasswordFormState>({
    newPassword: "",
    confirmPassword: "",
    errors: {},
    touched: { newPassword: false, confirmPassword: false },
  });

  const handleSubmit = async () => {
    const errors: Record<string, string[]> = {};
    if (!formState.newPassword) errors.newPassword = ["Password is required"];
    else if (formState.newPassword.length < 8)
      errors.newPassword = ["Password must be at least 8 characters"];
    if (formState.confirmPassword !== formState.newPassword)
      errors.confirmPassword = ["Passwords do not match"];

    setFormState((prev) => ({
      ...prev,
      errors,
      touched: { newPassword: true, confirmPassword: true },
    }));

    if (Object.values(errors).every((e) => e.length === 0)) {
      await onSubmit({
        token,
        newPassword: formState.newPassword,
        confirmPassword: formState.confirmPassword,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="New password"
        value={formState.newPassword}
        onChangeText={(t) =>
          setFormState((p) => ({
            ...p,
            newPassword: t,
            touched: { ...p.touched, newPassword: true },
          }))
        }
        secureTextEntry
        editable={!isLoading}
      />
      {formState.touched.newPassword && formState.errors.newPassword?.[0] && (
        <Text style={styles.error}>{formState.errors.newPassword[0]}</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        value={formState.confirmPassword}
        onChangeText={(t) =>
          setFormState((p) => ({
            ...p,
            confirmPassword: t,
            touched: { ...p.touched, confirmPassword: true },
          }))
        }
        secureTextEntry
        editable={!isLoading}
      />
      {formState.touched.confirmPassword &&
        formState.errors.confirmPassword?.[0] && (
          <Text style={styles.error}>
            {formState.errors.confirmPassword[0]}
          </Text>
        )}
      {error && <Text style={styles.error}>{error}</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Resetting..." : "Reset password"}
        </Text>
      </TouchableOpacity>

      {onBackToLogin && (
        <TouchableOpacity onPress={onBackToLogin}>
          <Text style={styles.link}>Back to sign in</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  error: { color: "#ef4444", fontSize: 14 },
  success: { color: "#4F46E5", fontSize: 14, textAlign: "center" },
  link: { color: "#4F46E5", textAlign: "center", fontSize: 14 },
});
