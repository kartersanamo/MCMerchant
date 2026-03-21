import * as React from "react";
import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Heading } from "@react-email/heading";
import { Hr } from "@react-email/hr";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";

export type PasswordChangeEmailProps = {
  /** Supabase recovery / magic link (single-use). */
  resetUrl: string;
  appName?: string;
};

export default function PasswordChangeEmail({
  resetUrl,
  appName = "MCMerchant"
}: PasswordChangeEmailProps) {
  return (
    <Container style={{ backgroundColor: "#09090b", padding: "32px 24px" }}>
      <Section
        style={{
          maxWidth: 480,
          margin: "0 auto",
          backgroundColor: "#18181b",
          borderRadius: 16,
          border: "1px solid #27272a",
          padding: "32px 28px"
        }}
      >
        <Heading
          style={{
            color: "#fafafa",
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 8px",
            letterSpacing: "-0.02em"
          }}
        >
          Set a new password
        </Heading>
        <Text style={{ color: "#a1a1aa", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px" }}>
          You asked to change your password on <strong style={{ color: "#e4e4e7" }}>{appName}</strong>. Click the
          button below to open our site and choose a new password. This link expires after a short time.
        </Text>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: "#4ade80",
            color: "#0a0a0a",
            fontWeight: 700,
            fontSize: 16,
            padding: "14px 28px",
            borderRadius: 10,
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          Change my password
        </Button>
        <Hr style={{ borderColor: "#27272a", margin: "28px 0" }} />
        <Text style={{ color: "#71717a", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          If you didn&apos;t request this, you can ignore this email—your password will stay the same.
        </Text>
      </Section>
    </Container>
  );
}
