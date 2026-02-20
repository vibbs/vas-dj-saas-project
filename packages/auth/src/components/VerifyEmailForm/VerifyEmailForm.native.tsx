import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@vas-dj-saas/ui";
import { VerifyEmailFormProps } from "./types";

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({
  email,
  onResend,
  isLoading = false,
  error,
  successMessage,
  onBackToLogin,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>&#9993;</Text>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        {email
          ? `We sent a verification link to ${email}`
          : "We sent a verification link to your email"}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}

      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={onResend}
        disabled={isLoading}
      >
        <Text style={styles.outlineButtonText}>
          {isLoading ? "Sending..." : "Resend verification email"}
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
  container: { gap: 16, alignItems: "center" },
  icon: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: "600" },
  subtitle: { color: "#6b7280", fontSize: 14, textAlign: "center" },
  button: { padding: 14, borderRadius: 8, alignItems: "center", width: "100%" },
  outlineButton: { borderWidth: 1, borderColor: "#d1d5db" },
  outlineButtonText: { color: "#4F46E5", fontWeight: "600" },
  error: { color: "#ef4444", fontSize: 14 },
  success: { color: "#4F46E5", fontSize: 14, textAlign: "center" },
  link: { color: "#4F46E5", fontSize: 14 },
});
