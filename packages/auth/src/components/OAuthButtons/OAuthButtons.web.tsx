import React from "react";
import { useTheme, Button, Text } from "@vas-dj-saas/ui";
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
    icon: "\u2B22", // hexagon
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
        gap: `${theme.spacing.md}px`,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: `${theme.spacing.md}px`,
          color: theme.colors.mutedForeground,
          fontSize: theme.typography.fontSize.sm,
        }}
      >
        <div
          style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }}
        />
        <span>{label}</span>
        <div
          style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${theme.spacing.sm}px`,
        }}
      >
        {providers.map((provider) => {
          const config = providerConfig[provider];
          return (
            <button
              key={provider}
              type="button"
              onClick={() => onOAuthLogin(provider)}
              disabled={isLoading || disabled}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "10px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: config.bgColor,
                color: config.textColor,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: 500,
                cursor: isLoading || disabled ? "not-allowed" : "pointer",
                opacity: isLoading || disabled ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "16px" }}>
                {config.icon}
              </span>
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
