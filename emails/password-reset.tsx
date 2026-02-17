import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Structura password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Someone requested a password reset for your Structura account. If
            this was you, click the button below to reset your password:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          <Text style={text}>
            This link will expire in 1 hour for security reasons.
          </Text>
          <Text style={text}>
            If you didn't request a password reset, you can safely ignore this
            email. Your password will remain unchanged.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Structura Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 8px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#5469d4",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 8px 0",
};
