import * as React from "react";
import {
  Button,
  Container,
  Heading,
  Hr,
  Link,
  Section,
  Text
} from "@react-email/components";

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
      <Heading>Your Plugdex purchase: {pluginName}</Heading>
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

