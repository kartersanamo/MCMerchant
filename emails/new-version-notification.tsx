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

export type NewVersionNotificationEmailProps = {
  pluginName: string;
  version: string;
  changelog: string | null;
  downloadUrl: string;
  pluginUrl: string;
};

export default function NewVersionNotificationEmail({
  pluginName,
  version,
  changelog,
  downloadUrl,
  pluginUrl
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
      </Section>
    </Container>
  );
}

