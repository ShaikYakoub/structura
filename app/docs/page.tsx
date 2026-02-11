import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Structura Documentation and Help",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Documentation
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn how to build amazing websites with Structura
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-3">🚀 Getting Started</h2>
              <p className="text-muted-foreground mb-4">
                Learn the basics of Structura and create your first website in minutes.
              </p>
              <Link href="#getting-started" className="text-primary hover:underline">
                Read more →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-3">🎨 Templates</h2>
              <p className="text-muted-foreground mb-4">
                Explore our collection of professionally designed templates.
              </p>
              <Link href="#templates" className="text-primary hover:underline">
                Browse templates →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-3">⚙️ Advanced Features</h2>
              <p className="text-muted-foreground mb-4">
                Discover powerful features like custom domains, analytics, and more.
              </p>
              <Link href="#advanced" className="text-primary hover:underline">
                Learn more →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-3">💬 Support</h2>
              <p className="text-muted-foreground mb-4">
                Need help? Contact our support team or browse FAQs.
              </p>
              <a href="mailto:support@structura.com" className="text-primary hover:underline">
                Get support →
              </a>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-primary hover:underline font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
