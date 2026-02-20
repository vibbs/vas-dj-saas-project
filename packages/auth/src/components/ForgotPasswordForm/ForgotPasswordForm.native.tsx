import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text } from "@vas-dj-saas/ui";
import { ForgotPasswordFormProps, ForgotPasswordFormState } from "./types";

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  successMessage,
  onBackToLogin,
}) => {
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

  const handleSubmit = async () => {
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
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formState.email}
        onChangeText={(text) => {
          const err = validateEmail(text);
          setFormState({
            email: text,
            touched: { email: true },
            errors: { email: err ? [err] : [] },
          });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      {formState.touched.email && formState.errors.email?.[0] && (
        <Text style={styles.error}>{formState.errors.email[0]}</Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Sending..." : "Send reset link"}
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
