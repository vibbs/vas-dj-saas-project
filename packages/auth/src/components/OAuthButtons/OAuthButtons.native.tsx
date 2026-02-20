import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@vas-dj-saas/ui";
import { OAuthButtonsProps, OAuthProvider } from "./types";

const providerConfig: Record<
  OAuthProvider,
  { label: string; icon: string; bgColor: string; textColor: string }
> = {
  google: {
    label: "Continue with Google",
    icon: "G",
    bgColor: "#ffffff",
    textColor: "#374151",
  },
  github: {
    label: "Continue with GitHub",
    icon: "\u2B22",
    bgColor: "#24292f",
    textColor: "#ffffff",
  },
};

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  onOAuthLogin,
  isLoading = false,
  disabled = false,
  providers = ["google", "github"],
  label = "Or continue with",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{label}</Text>
        <View style={styles.dividerLine} />
      </View>

      {providers.map((provider) => {
        const config = providerConfig[provider];
        return (
          <TouchableOpacity
            key={provider}
            onPress={() => onOAuthLogin(provider)}
            disabled={isLoading || disabled}
            style={[
              styles.button,
              {
                backgroundColor: config.bgColor,
                opacity: isLoading || disabled ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.icon, { color: config.textColor }]}>
              {config.icon}
            </Text>
            <Text style={[styles.buttonText, { color: config.textColor }]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { color: "#9ca3af", fontSize: 14 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  icon: { fontWeight: "700", fontSize: 16 },
  buttonText: { fontWeight: "500", fontSize: 14 },
});
