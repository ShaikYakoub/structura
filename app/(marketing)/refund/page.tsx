import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Structura",
  description:
    "Information about refunds and cancellations for Structura subscriptions",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto max-w-4xl py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Our Commitment</h2>
          <p>
            We want you to be completely satisfied with Structura. This policy
            explains when and how refunds are provided.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            2. 7-Day Money-Back Guarantee
          </h2>
          <p>
            New Pro subscriptions are eligible for a full refund within 7 days
            of the initial purchase. This applies to first-time subscribers
            only.
          </p>
          <p className="mt-4">To qualify for a refund:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request must be made within 7 days of purchase</li>
            <li>Account must not have violated our Terms of Service</li>
            <li>No excessive resource usage or abuse of the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            3. Subscription Renewals
          </h2>
          <p>
            <strong>Renewals are non-refundable.</strong> If you don't wish to
            renew, cancel your subscription before the renewal date. You'll
            retain access until the end of your current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            4. Cancellation Process
          </h2>
          <p>You can cancel your subscription anytime from your dashboard:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Log in to your Structura account</li>
            <li>Navigate to Settings → Billing</li>
            <li>Click "Cancel Subscription"</li>
          </ol>
          <p className="mt-4">
            Upon cancellation, you'll continue to have Pro access until the end
            of your current billing cycle. No partial refunds are provided for
            unused time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            5. How to Request a Refund
          </h2>
          <p>To request a refund within the 7-day window:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Email us at{" "}
              <a
                href="mailto:support@structura.com"
                className="text-primary underline"
              >
                support@structura.com
              </a>
            </li>
            <li>Include your account email and reason for refund</li>
            <li>We'll process your request within 3-5 business days</li>
          </ol>
          <p className="mt-4">
            Refunds are issued to the original payment method via Razorpay.
            Processing time depends on your bank (typically 5-10 business days).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            6. Non-Refundable Items
          </h2>
          <p>The following are not eligible for refunds:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Subscription renewals after the initial 7-day period</li>
            <li>Custom domain purchases (managed by third-party registrars)</li>
            <li>Accounts terminated for Terms of Service violations</li>
            <li>Partial months of service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            7. Service Interruptions
          </h2>
          <p>
            If our service experiences significant downtime (more than 24
            consecutive hours), you may be eligible for a prorated credit or
            refund. Contact support to discuss compensation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Disputes</h2>
          <p>
            Before filing a chargeback with your bank, please contact us to
            resolve the issue. Chargebacks may result in immediate account
            suspension pending resolution.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Refund Policy. Changes will be posted on this
            page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Questions?</h2>
          <p>
            Contact our support team:{" "}
            <a
              href="mailto:support@structura.com"
              className="text-primary underline"
            >
              support@structura.com
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
