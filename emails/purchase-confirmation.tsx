import * as React from "react";
import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Heading } from "@react-email/heading";
import { Hr } from "@react-email/hr";
import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";

export type PurchaseConfirmationEmailProps = {
  pluginName: string;
  licenseKey: string;
  downloadUrl: string;
  buyerDashboardUrl: string;
};

export default function PurchaseConfirmationEmail({
  pluginName,
  licenseKey,
  downloadUrl,
  buyerDashboardUrl
}: PurchaseConfirmationEmailProps) {
  return (
    <Container>
      <Heading>Your MCMerchant purchase: {pluginName}</Heading>
      <Section>
        <Text>Thanks for your purchase! Your license key:</Text>
        <Text
          style={{
            fontFamily: "monospace",
            padding: "12px",
            background: "#0f172a",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}
        >
          {licenseKey}
        </Text>
      </Section>

      <Hr />

      <Section>
        <Button href={downloadUrl}>Download</Button>
        <Text style={{ marginTop: 12 }}>
          Or manage your licenses at{" "}
          <Link href={buyerDashboardUrl}>your dashboard</Link>.
        </Text>
      </Section>
    </Container>
  );
}

