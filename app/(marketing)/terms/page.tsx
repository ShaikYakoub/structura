import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Structura",
  description: "Terms and conditions for using Structura platform",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using Structura ("Service"), you agree to be bound by these
            Terms of Service. If you disagree with any part of these terms, you may not
            access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>
            Structura is a website builder platform that allows users to create, design,
            and publish websites. We provide the tools and hosting infrastructure, but
            you retain full ownership and responsibility for your content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p>You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All content you publish through the Service</li>
            <li>Ensuring your content complies with all applicable laws</li>
            <li>Not using the Service for illegal or unauthorized purposes</li>
            <li>Not attempting to breach security or interfere with the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Content Ownership</h2>
          <p>
            You retain all rights to content you create and publish using Structura.
            However, by using our Service, you grant us a license to host, store, and
            display your content as necessary to provide the Service.
          </p>
          <p className="mt-4 font-semibold">
            We are not responsible for user-generated content. You are solely liable
            for any content you publish through our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Content</h2>
          <p>You may not create or publish websites containing:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Illegal content or content promoting illegal activities</li>
            <li>Malware, viruses, or malicious code</li>
            <li>Phishing or scam content</li>
            <li>Content that infringes intellectual property rights</li>
            <li>Hate speech, harassment, or discriminatory content</li>
            <li>Adult content or sexually explicit material</li>
          </ul>
          <p className="mt-4">
            We reserve the right to remove any content that violates these terms without
            prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payments</h2>
          <p>
            Some features require a paid subscription. By subscribing, you agree to pay
            the stated fees. Subscriptions automatically renew unless cancelled before
            the renewal date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice,
            for conduct that we believe violates these Terms or is harmful to other
            users, us, or third parties, or for any other reason.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
          <p>
            Structura is provided "as is" without warranties of any kind. We are not
            liable for any damages arising from your use of the Service, including but
            not limited to data loss, service interruptions, or security breaches.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users
            of significant changes via email or platform notification. Continued use of
            the Service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:legal@structura.com" className="text-primary underline">
              legal@structura.com
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
