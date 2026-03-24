import * as React from "react";
import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Heading } from "@react-email/heading";
import { Hr } from "@react-email/hr";
import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";

export type NewVersionNotificationEmailProps = {
  pluginName: string;
  version: string;
  changelog: string | null;
  downloadUrl: string;
  pluginUrl: string;
  managePrefsUrl: string;
};

export default function NewVersionNotificationEmail({
  pluginName,
  version,
  changelog,
  downloadUrl,
  pluginUrl,
  managePrefsUrl
}: NewVersionNotificationEmailProps) {
  return (
    <Container>
      <Heading>
        {pluginName} has been updated to v{version}
      </Heading>

      <Section>
        <Text style={{ marginTop: 12 }}>Changelog</Text>
        <Text
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            padding: "12px",
            background: "#0f172a",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}
        >
          {changelog ?? "No changelog provided."}
        </Text>
      </Section>

      <Hr />

      <Section>
        <Button href={downloadUrl}>Download</Button>
        <Text style={{ marginTop: 12 }}>
          View plugin page: <Link href={pluginUrl}>{pluginName}</Link>
        </Text>
        <Text style={{ marginTop: 12, color: "#71717a", fontSize: 12 }}>
          <Link href={managePrefsUrl}>Manage email preferences</Link>
        </Text>
      </Section>
    </Container>
  );
}

