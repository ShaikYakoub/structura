import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Structura",
  description: "How Structura collects, uses, and protects your data",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>We collect the following information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Information:</strong> Email address, name, and password
              (encrypted)
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, features used, and interaction
              patterns
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely through Razorpay
              (we do not store card details)
            </li>
            <li>
              <strong>Website Analytics:</strong> Simple page view counts (no personal
              identifiers)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain the Service</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send important service notifications</li>
            <li>Improve our platform and user experience</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
          <p className="mt-4 font-semibold">
            We collect emails for login purposes only. We do not sell or share your
            personal information with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption. Passwords
            are hashed and never stored in plain text. We implement appropriate
            technical and organizational measures to protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. Optional
            cookies may be used for analytics if you consent via our cookie banner.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
          <p>We integrate with the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Razorpay:</strong> Payment processing (subject to their privacy
              policy)
            </li>
            <li>
              <strong>Resend:</strong> Transactional email delivery
            </li>
            <li>
              <strong>Digital Ocean:</strong> Hosting infrastructure
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights (GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@structura.com" className="text-primary underline">
              privacy@structura.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. When you delete
            your account, we permanently remove your data within 30 days, except where
            required by law to retain it longer.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p>
            Our Service is not intended for users under 13 years of age. We do not
            knowingly collect information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Changes to Privacy Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of
            significant changes via email or platform notification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p>
            For privacy-related questions, contact:{" "}
            <a href="mailto:privacy@structura.com" className="text-primary underline">
              privacy@structura.com
            </a>
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: February 11, 2026
        </p>
      </div>
    </div>
  );
}
