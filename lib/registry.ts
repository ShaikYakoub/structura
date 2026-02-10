import { ComponentType } from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { CTASection } from "@/components/sections/cta-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { FAQSection } from "@/components/sections/faq-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ContentBlock } from "@/components/sections/content-block";
import { ImageGallery } from "@/components/sections/image-gallery";
import { VideoEmbed } from "@/components/sections/video-embed";
import { MapEmbed } from "@/components/sections/map-embed";
import { ContactForm } from "@/components/sections/contact-form";
import { FooterSection } from "@/components/sections/footer-section";
import { SocialBar } from "@/components/sections/social-bar";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { TeamSection } from "@/components/sections/team-section";
import { LogoGrid } from "@/components/sections/logo-grid";
import { TextColumns } from "@/components/sections/text-columns";
import { QuoteSection } from "@/components/sections/quote-section";

// Field types supported in the editor
export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "select"
  | "image"
  | "array";

// Schema for a single field
export interface FieldSchema {
  label: string;
  type: FieldType;
  defaultValue: any;
  options?: string[]; // For select fields
  arrayItemSchema?: Record<string, Omit<FieldSchema, "arrayItemSchema">>; // For array fields
}

// Schema for a component
export interface ComponentSchema {
  name: string;
  description: string;
  category: string;
  fields: Record<string, FieldSchema>;
  defaultData: Record<string, any>;
}

// Registry entry combining component and schema
export interface RegistryEntry {
  component: ComponentType<{ data: any }>;
  schema: ComponentSchema;
}

// The main registry
export const componentRegistry: Record<string, RegistryEntry> = {
  hero: {
    component: HeroSection,
    schema: {
      name: "Hero",
      description: "Large banner section with image and text",
      category: "headers",
      fields: {
        title: {
          label: "Title",
          type: "text",
          defaultValue: "Welcome to Our Site",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "Your journey starts here",
        },
        image: {
          label: "Background Image",
          type: "image",
          defaultValue:
            "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
        },
      },
      defaultData: {
        title: "Welcome to Our Site",
        subtitle: "Your journey starts here",
        image:
          "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
      },
    },
  },

  features: {
    component: FeaturesSection,
    schema: {
      name: "Features",
      description: "Grid of feature cards",
      category: "content",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Our Features",
        },
        features: {
          label: "Features",
          type: "array",
          defaultValue: [
            { title: "Feature 1", description: "Description here" },
            { title: "Feature 2", description: "Description here" },
            { title: "Feature 3", description: "Description here" },
          ],
          arrayItemSchema: {
            title: {
              label: "Feature Title",
              type: "text",
              defaultValue: "Feature Title",
            },
            description: {
              label: "Feature Description",
              type: "textarea",
              defaultValue: "Feature description",
            },
          },
        },
      },
      defaultData: {
        title: "Our Features",
        features: [
          { title: "Feature 1", description: "Description here" },
          { title: "Feature 2", description: "Description here" },
          { title: "Feature 3", description: "Description here" },
        ],
      },
    },
  },

  cta: {
    component: CTASection,
    schema: {
      name: "Call to Action",
      description: "Prominent call-to-action section with button",
      category: "marketing",
      fields: {
        title: {
          label: "Title",
          type: "text",
          defaultValue: "Ready to Get Started?",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "Join thousands of satisfied customers today",
        },
        buttonText: {
          label: "Button Text",
          type: "text",
          defaultValue: "Get Started",
        },
        buttonLink: {
          label: "Button Link",
          type: "url",
          defaultValue: "#",
        },
        variant: {
          label: "Style",
          type: "select",
          defaultValue: "primary",
          options: ["primary", "outline"],
        },
      },
      defaultData: {
        title: "Ready to Get Started?",
        subtitle: "Join thousands of satisfied customers today",
        buttonText: "Get Started",
        buttonLink: "#",
        variant: "primary",
      },
    },
  },

  pricing: {
    component: PricingSection,
    schema: {
      name: "Pricing",
      description: "Pricing table with monthly/yearly toggle",
      category: "business",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Choose Your Plan",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "Select the perfect plan for your needs",
        },
        plans: {
          label: "Pricing Plans",
          type: "array",
          defaultValue: [
            {
              name: "Basic",
              priceMonthly: 9,
              priceYearly: 90,
              features: ["Feature 1", "Feature 2", "Feature 3"],
              buttonText: "Get Started",
              isPopular: false,
            },
            {
              name: "Pro",
              priceMonthly: 29,
              priceYearly: 290,
              features: ["Everything in Basic", "Feature 4", "Feature 5", "Feature 6"],
              buttonText: "Get Started",
              isPopular: true,
            },
            {
              name: "Enterprise",
              priceMonthly: 99,
              priceYearly: 990,
              features: ["Everything in Pro", "Feature 7", "Feature 8", "Feature 9"],
              buttonText: "Contact Sales",
              isPopular: false,
            },
          ],
          arrayItemSchema: {
            name: {
              label: "Plan Name",
              type: "text",
              defaultValue: "Plan Name",
            },
            priceMonthly: {
              label: "Monthly Price",
              type: "text",
              defaultValue: "9",
            },
            priceYearly: {
              label: "Yearly Price",
              type: "text",
              defaultValue: "90",
            },
            features: {
              label: "Features",
              type: "array",
              defaultValue: ["Feature 1", "Feature 2"],
            },
            buttonText: {
              label: "Button Text",
              type: "text",
              defaultValue: "Get Started",
            },
            isPopular: {
              label: "Mark as Popular",
              type: "select",
              defaultValue: "false",
              options: ["true", "false"],
            },
          },
        },
      },
      defaultData: {
        title: "Choose Your Plan",
        subtitle: "Select the perfect plan for your needs",
        plans: [
          {
            name: "Basic",
            priceMonthly: 9,
            priceYearly: 90,
            features: ["Feature 1", "Feature 2", "Feature 3"],
            buttonText: "Get Started",
            isPopular: false,
          },
          {
            name: "Pro",
            priceMonthly: 29,
            priceYearly: 290,
            features: ["Everything in Basic", "Feature 4", "Feature 5", "Feature 6"],
            buttonText: "Get Started",
            isPopular: true,
          },
          {
            name: "Enterprise",
            priceMonthly: 99,
            priceYearly: 990,
            features: ["Everything in Pro", "Feature 7", "Feature 8", "Feature 9"],
            buttonText: "Contact Sales",
            isPopular: false,
          },
        ],
      },
    },
  },

  faq: {
    component: FAQSection,
    schema: {
      name: "FAQ",
      description: "Frequently asked questions with accordion",
      category: "business",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Frequently Asked Questions",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "Find answers to common questions",
        },
        items: {
          label: "FAQ Items",
          type: "array",
          defaultValue: [
            {
              question: "What is your return policy?",
              answer: "We offer a 30-day money-back guarantee on all purchases.",
            },
            {
              question: "How long does shipping take?",
              answer: "Standard shipping takes 5-7 business days.",
            },
            {
              question: "Do you offer customer support?",
              answer: "Yes, we provide 24/7 customer support via email and chat.",
            },
          ],
          arrayItemSchema: {
            question: {
              label: "Question",
              type: "text",
              defaultValue: "Your question here",
            },
            answer: {
              label: "Answer",
              type: "textarea",
              defaultValue: "Your answer here",
            },
          },
        },
      },
      defaultData: {
        title: "Frequently Asked Questions",
        subtitle: "Find answers to common questions",
        items: [
          {
            question: "What is your return policy?",
            answer: "We offer a 30-day money-back guarantee on all purchases.",
          },
          {
            question: "How long does shipping take?",
            answer: "Standard shipping takes 5-7 business days.",
          },
          {
            question: "Do you offer customer support?",
            answer: "Yes, we provide 24/7 customer support via email and chat.",
          },
        ],
      },
    },
  },

  testimonials: {
    component: TestimonialsSection,
    schema: {
      name: "Testimonials",
      description: "Customer testimonials with ratings",
      category: "business",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "What Our Customers Say",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "Read reviews from our satisfied customers",
        },
        reviews: {
          label: "Reviews",
          type: "array",
          defaultValue: [
            {
              name: "John Doe",
              role: "CEO, Company Inc",
              avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
              content: "This product has completely transformed our business.",
              rating: 5,
            },
            {
              name: "Jane Smith",
              role: "Marketing Director",
              avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
              content: "Outstanding service and incredible results.",
              rating: 5,
            },
            {
              name: "Mike Johnson",
              role: "Founder, Startup Co",
              avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
              content: "Highly recommend to anyone looking for quality.",
              rating: 4,
            },
          ],
          arrayItemSchema: {
            name: {
              label: "Name",
              type: "text",
              defaultValue: "Customer Name",
            },
            role: {
              label: "Role/Title",
              type: "text",
              defaultValue: "Job Title, Company",
            },
            avatarUrl: {
              label: "Avatar Image",
              type: "image",
              defaultValue: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
            },
            content: {
              label: "Review Content",
              type: "textarea",
              defaultValue: "This is a great product!",
            },
            rating: {
              label: "Rating (1-5)",
              type: "select",
              defaultValue: "5",
              options: ["1", "2", "3", "4", "5"],
            },
          },
        },
      },
      defaultData: {
        title: "What Our Customers Say",
        subtitle: "Read reviews from our satisfied customers",
        reviews: [
          {
            name: "John Doe",
            role: "CEO, Company Inc",
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
            content: "This product has completely transformed our business.",
            rating: 5,
          },
          {
            name: "Jane Smith",
            role: "Marketing Director",
            avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
            content: "Outstanding service and incredible results.",
            rating: 5,
          },
          {
            name: "Mike Johnson",
            role: "Founder, Startup Co",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
            content: "Highly recommend to anyone looking for quality.",
            rating: 4,
          },
        ],
      },
    },
  },

  stats: {
    component: StatsSection,
    schema: {
      name: "Statistics",
      description: "Key metrics and statistics display",
      category: "business",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Our Impact in Numbers",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "See what we've achieved together",
        },
        stats: {
          label: "Statistics",
          type: "array",
          defaultValue: [
            { label: "Active Users", value: "10K+", icon: "users" },
            { label: "Growth Rate", value: "250%", icon: "trending" },
            { label: "Awards Won", value: "15+", icon: "award" },
            { label: "Satisfaction", value: "4.9/5", icon: "star" },
          ],
          arrayItemSchema: {
            label: {
              label: "Label",
              type: "text",
              defaultValue: "Stat Label",
            },
            value: {
              label: "Value",
              type: "text",
              defaultValue: "100",
            },
            icon: {
              label: "Icon",
              type: "select",
              defaultValue: "users",
              options: ["users", "trending", "award", "star"],
            },
          },
        },
      },
      defaultData: {
        title: "Our Impact in Numbers",
        subtitle: "See what we've achieved together",
        stats: [
          { label: "Active Users", value: "10K+", icon: "users" },
          { label: "Growth Rate", value: "250%", icon: "trending" },
          { label: "Awards Won", value: "15+", icon: "award" },
          { label: "Satisfaction", value: "4.9/5", icon: "star" },
        ],
      },
    },
  },

  "content-block": {
    component: ContentBlock,
    schema: {
      name: "Rich Text Block",
      description: "Rich text content with HTML formatting",
      category: "media",
      fields: {
        content: {
          label: "Content (HTML)",
          type: "textarea",
          defaultValue: `<h2>Welcome to Our Platform</h2>
<p>This is a rich text block where you can add any HTML content. You can include:</p>
<ul>
  <li>Headings and paragraphs</li>
  <li>Lists (ordered and unordered)</li>
  <li>Links and emphasis</li>
  <li>And much more!</li>
</ul>
<p><strong>Note:</strong> You can edit this content directly as HTML in the editor.</p>`,
        },
        className: {
          label: "Custom CSS Classes",
          type: "text",
          defaultValue: "",
        },
      },
      defaultData: {
        content: `<h2>Welcome to Our Platform</h2>
<p>This is a rich text block where you can add any HTML content.</p>`,
        className: "",
      },
    },
  },

  "image-gallery": {
    component: ImageGallery,
    schema: {
      name: "Image Gallery",
      description: "Photo gallery with lightbox zoom",
      category: "media",
      fields: {
        title: {
          label: "Gallery Title",
          type: "text",
          defaultValue: "Our Gallery",
        },
        columns: {
          label: "Columns",
          type: "select",
          defaultValue: "3",
          options: ["2", "3", "4"],
        },
        images: {
          label: "Images",
          type: "array",
          defaultValue: [
            {
              url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
              alt: "Mountain landscape",
            },
            {
              url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
              alt: "Nature scene",
            },
            {
              url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
              alt: "Sunset view",
            },
            {
              url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
              alt: "Forest path",
            },
            {
              url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
              alt: "Mountain peak",
            },
            {
              url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
              alt: "Wildlife scene",
            },
          ],
          arrayItemSchema: {
            url: {
              label: "Image URL",
              type: "image",
              defaultValue: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            },
            alt: {
              label: "Alt Text",
              type: "text",
              defaultValue: "Gallery image",
            },
          },
        },
      },
      defaultData: {
        title: "Our Gallery",
        columns: 3,
        images: [
          {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            alt: "Mountain landscape",
          },
          {
            url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
            alt: "Nature scene",
          },
          {
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
            alt: "Sunset view",
          },
        ],
      },
    },
  },

  "video-embed": {
    component: VideoEmbed,
    schema: {
      name: "Video Embed",
      description: "YouTube or Vimeo video player",
      category: "media",
      fields: {
        title: {
          label: "Video Title",
          type: "text",
          defaultValue: "Watch Our Video",
        },
        url: {
          label: "Video URL (YouTube or Vimeo)",
          type: "url",
          defaultValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
        caption: {
          label: "Caption",
          type: "text",
          defaultValue: "",
        },
      },
      defaultData: {
        title: "Watch Our Video",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        caption: "",
      },
    },
  },

  "map-embed": {
    component: MapEmbed,
    schema: {
      name: "Map Embed",
      description: "Google Maps location embed",
      category: "media",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Find Us Here",
        },
        address: {
          label: "Address",
          type: "text",
          defaultValue: "1600 Amphitheatre Parkway, Mountain View, CA",
        },
        embedUrl: {
          label: "Custom Embed URL (Optional)",
          type: "url",
          defaultValue: "",
        },
        height: {
          label: "Map Height (px)",
          type: "text",
          defaultValue: "450",
        },
      },
      defaultData: {
        title: "Find Us Here",
        address: "1600 Amphitheatre Parkway, Mountain View, CA",
        embedUrl: "",
        height: 450,
      },
    },
  },

  "contact-form": {
    component: ContactForm,
    schema: {
      name: "Contact Form",
      description: "Contact form with validation and Server Actions",
      category: "forms",
      fields: {
        title: {
          label: "Form Title",
          type: "text",
          defaultValue: "Get in Touch",
        },
        subtitle: {
          label: "Subtitle",
          type: "text",
          defaultValue: "We'd love to hear from you",
        },
        successMessage: {
          label: "Success Message",
          type: "textarea",
          defaultValue: "Thank you for your message! We'll get back to you soon.",
        },
      },
      defaultData: {
        title: "Get in Touch",
        subtitle: "We'd love to hear from you",
        successMessage: "Thank you for your message! We'll get back to you soon.",
      },
    },
  },

  "footer-section": {
    component: FooterSection,
    schema: {
      name: "Footer",
      description: "Site footer with links and social media",
      category: "layout",
      fields: {
        logo: {
          label: "Logo",
          type: "image",
          defaultValue: "",
        },
        siteName: {
          label: "Site Name",
          type: "text",
          defaultValue: "Your Company",
        },
        description: {
          label: "Description",
          type: "textarea",
          defaultValue: "Building amazing products for the modern web.",
        },
        columns: {
          label: "Link Columns",
          type: "array",
          defaultValue: [
            {
              title: "Products",
              links: [
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "Security", href: "/security" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Careers", href: "/careers" },
              ],
            },
            {
              title: "Support",
              links: [
                { label: "Help Center", href: "/help" },
                { label: "Contact", href: "/contact" },
                { label: "Documentation", href: "/docs" },
              ],
            },
          ],
          arrayItemSchema: {
            title: {
              label: "Column Title",
              type: "text",
              defaultValue: "Products",
            },
            links: {
              label: "Links",
              type: "array",
              defaultValue: [
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
              ],
            },
          },
        },
        socialLinks: {
          label: "Social Links",
          type: "array",
          defaultValue: [
            { platform: "twitter", url: "https://twitter.com/yourcompany" },
            { platform: "linkedin", url: "https://linkedin.com/company/yourcompany" },
            { platform: "github", url: "https://github.com/yourcompany" },
          ],
          arrayItemSchema: {
            platform: {
              label: "Platform",
              type: "select",
              defaultValue: "twitter",
              options: ["facebook", "twitter", "instagram", "linkedin", "github", "youtube"],
            },
            url: {
              label: "URL",
              type: "url",
              defaultValue: "https://twitter.com/yourcompany",
            },
          },
        },
        copyrightText: {
          label: "Copyright Text",
          type: "text",
          defaultValue: "© 2026 Your Company. All rights reserved.",
        },
      },
      defaultData: {
        siteName: "Your Company",
        description: "Building amazing products for the modern web.",
        columns: [
          {
            title: "Products",
            links: [
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Security", href: "/security" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "Careers", href: "/careers" },
            ],
          },
        ],
        socialLinks: [
          { platform: "twitter", url: "https://twitter.com/yourcompany" },
          { platform: "linkedin", url: "https://linkedin.com/company/yourcompany" },
        ],
        copyrightText: "© 2026 Your Company. All rights reserved.",
      },
    },
  },

  "social-bar": {
    component: SocialBar,
    schema: {
      name: "Social Links Bar",
      description: "Social media links with icons",
      category: "layout",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Follow Us",
        },
        subtitle: {
          label: "Subtitle",
          type: "text",
          defaultValue: "Stay connected on social media",
        },
        variant: {
          label: "Button Style",
          type: "select",
          defaultValue: "default",
          options: ["default", "outline", "ghost"],
        },
        size: {
          label: "Button Size",
          type: "select",
          defaultValue: "default",
          options: ["sm", "default", "lg"],
        },
        links: {
          label: "Social Links",
          type: "array",
          defaultValue: [
            { platform: "twitter", url: "https://twitter.com/yourcompany" },
            { platform: "instagram", url: "https://instagram.com/yourcompany" },
            { platform: "linkedin", url: "https://linkedin.com/company/yourcompany" },
            { platform: "github", url: "https://github.com/yourcompany" },
          ],
          arrayItemSchema: {
            platform: {
              label: "Platform",
              type: "select",
              defaultValue: "twitter",
              options: ["facebook", "twitter", "instagram", "linkedin", "github", "youtube", "website"],
            },
            url: {
              label: "URL",
              type: "url",
              defaultValue: "https://twitter.com/yourcompany",
            },
          },
        },
      },
      defaultData: {
        title: "Follow Us",
        subtitle: "Stay connected on social media",
        variant: "default",
        size: "default",
        links: [
          { platform: "twitter", url: "https://twitter.com/yourcompany" },
          { platform: "instagram", url: "https://instagram.com/yourcompany" },
          { platform: "linkedin", url: "https://linkedin.com/company/yourcompany" },
        ],
      },
    },
  },

  "newsletter-section": {
    component: NewsletterSection,
    schema: {
      name: "Newsletter Signup",
      description: "Email newsletter subscription form",
      category: "conversion",
      fields: {
        title: {
          label: "Title",
          type: "text",
          defaultValue: "Subscribe to Our Newsletter",
        },
        subtitle: {
          label: "Subtitle",
          type: "text",
          defaultValue: "Get the latest updates and news delivered to your inbox",
        },
        buttonText: {
          label: "Button Text",
          type: "text",
          defaultValue: "Subscribe",
        },
        disclaimer: {
          label: "Disclaimer Text",
          type: "text",
          defaultValue: "No spam, unsubscribe anytime",
        },
      },
      defaultData: {
        title: "Subscribe to Our Newsletter",
        subtitle: "Get the latest updates and news delivered to your inbox",
        buttonText: "Subscribe",
        disclaimer: "No spam, unsubscribe anytime",
      },
    },
  },

  "team-section": {
    component: TeamSection,
    schema: {
      name: "Team Grid",
      description: "Team members with photos and bios",
      category: "trust",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Meet Our Team",
        },
        subtitle: {
          label: "Subtitle",
          type: "text",
          defaultValue: "The talented people behind our success",
        },
        columns: {
          label: "Columns",
          type: "select",
          defaultValue: "3",
          options: ["2", "3", "4"],
        },
        members: {
          label: "Team Members",
          type: "array",
          defaultValue: [
            {
              name: "Sarah Johnson",
              role: "CEO & Founder",
              bio: "Visionary leader with 15+ years in tech. Passionate about innovation and team culture.",
              avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/in/sarahjohnson" },
              ],
            },
            {
              name: "Michael Chen",
              role: "CTO",
              bio: "Tech enthusiast and problem solver. Building scalable systems that make a difference.",
              avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/in/michaelchen" },
              ],
            },
            {
              name: "Emily Rodriguez",
              role: "Head of Design",
              bio: "Creating beautiful, intuitive experiences that users love. Design thinking advocate.",
              avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
              socialLinks: [
                { platform: "linkedin", url: "https://linkedin.com/in/emilyrodriguez" },
              ],
            },
          ],
          arrayItemSchema: {
            name: {
              label: "Name",
              type: "text",
              defaultValue: "John Doe",
            },
            role: {
              label: "Role",
              type: "text",
              defaultValue: "CEO & Founder",
            },
            bio: {
              label: "Bio",
              type: "textarea",
              defaultValue: "Passionate about building great products and leading amazing teams.",
            },
            avatarUrl: {
              label: "Avatar Image",
              type: "image",
              defaultValue: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            },
            socialLinks: {
              label: "Social Links",
              type: "array",
              defaultValue: [
                { platform: "linkedin", url: "https://linkedin.com/in/johndoe" },
              ],
            },
          },
        },
      },
      defaultData: {
        title: "Meet Our Team",
        subtitle: "The talented people behind our success",
        columns: 3,
        members: [
          {
            name: "Sarah Johnson",
            role: "CEO & Founder",
            bio: "Visionary leader with 15+ years in tech. Passionate about innovation and team culture.",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            socialLinks: [
              { platform: "linkedin", url: "https://linkedin.com/in/sarahjohnson" },
            ],
          },
          {
            name: "Michael Chen",
            role: "CTO",
            bio: "Tech enthusiast and problem solver. Building scalable systems that make a difference.",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
            socialLinks: [
              { platform: "linkedin", url: "https://linkedin.com/in/michaelchen" },
            ],
          },
          {
            name: "Emily Rodriguez",
            role: "Head of Design",
            bio: "Creating beautiful, intuitive experiences that users love. Design thinking advocate.",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
            socialLinks: [
              { platform: "linkedin", url: "https://linkedin.com/in/emilyrodriguez" },
            ],
          },
        ],
      },
    },
  },

  "logo-grid": {
    component: LogoGrid,
    schema: {
      name: "Logo Grid",
      description: "Client/partner logos showcase",
      category: "trust",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Trusted by leading companies",
        },
        logos: {
          label: "Logos",
          type: "array",
          defaultValue: [
            {
              name: "Company 1",
              imageUrl: "https://via.placeholder.com/150x60?text=Logo+1",
            },
            {
              name: "Company 2",
              imageUrl: "https://via.placeholder.com/150x60?text=Logo+2",
            },
            {
              name: "Company 3",
              imageUrl: "https://via.placeholder.com/150x60?text=Logo+3",
            },
            {
              name: "Company 4",
              imageUrl: "https://via.placeholder.com/150x60?text=Logo+4",
            },
          ],
          arrayItemSchema: {
            name: {
              label: "Company Name",
              type: "text",
              defaultValue: "Company",
            },
            imageUrl: {
              label: "Logo Image",
              type: "image",
              defaultValue: "https://via.placeholder.com/150x60?text=Logo",
            },
          },
        },
      },
      defaultData: {
        title: "Trusted by leading companies",
        logos: [
          {
            name: "Company 1",
            imageUrl: "https://via.placeholder.com/150x60?text=Logo+1",
          },
          {
            name: "Company 2",
            imageUrl: "https://via.placeholder.com/150x60?text=Logo+2",
          },
          {
            name: "Company 3",
            imageUrl: "https://via.placeholder.com/150x60?text=Logo+3",
          },
          {
            name: "Company 4",
            imageUrl: "https://via.placeholder.com/150x60?text=Logo+4",
          },
        ],
      },
    },
  },

  "text-columns": {
    component: TextColumns,
    schema: {
      name: "Multi-Column Text",
      description: "Flexible multi-column text layout",
      category: "content",
      fields: {
        layout: {
          label: "Layout",
          type: "select",
          defaultValue: "2-col",
          options: ["2-col", "3-col", "1-2", "2-1"],
        },
        columns: {
          label: "Columns",
          type: "array",
          defaultValue: [
            {
              content: `<h3>About Us</h3>\n<p>We are a team of passionate individuals dedicated to creating amazing products that solve real problems.</p>\n<p>Our mission is to empower businesses with the tools they need to succeed in the digital age.</p>`,
            },
            {
              content: `<h3>Our Vision</h3>\n<p>We envision a world where technology brings people together and makes their lives easier.</p>\n<p>Through innovation and dedication, we're building the future one product at a time.</p>`,
            },
          ],
          arrayItemSchema: {
            content: {
              label: "Content (HTML)",
              type: "textarea",
              defaultValue: "<h3>Column Title</h3>\n<p>Your content here...</p>",
            },
          },
        },
      },
      defaultData: {
        layout: "2-col",
        columns: [
          {
            content: `<h3>About Us</h3>\n<p>We are a team of passionate individuals dedicated to creating amazing products.</p>`,
          },
          {
            content: `<h3>Our Vision</h3>\n<p>We envision a world where technology brings people together.</p>`,
          },
        ],
      },
    },
  },

  "quote-section": {
    component: QuoteSection,
    schema: {
      name: "Quote Section",
      description: "Large pull quote with attribution",
      category: "trust",
      fields: {
        quote: {
          label: "Quote",
          type: "textarea",
          defaultValue: "This product has completely transformed how we do business. The results speak for themselves.",
        },
        author: {
          label: "Author Name",
          type: "text",
          defaultValue: "Jane Smith",
        },
        role: {
          label: "Role/Title",
          type: "text",
          defaultValue: "CEO",
        },
        company: {
          label: "Company",
          type: "text",
          defaultValue: "TechCorp Inc.",
        },
      },
      defaultData: {
        quote: "This product has completely transformed how we do business. The results speak for themselves.",
        author: "Jane Smith",
        role: "CEO",
        company: "TechCorp Inc.",
      },
    },
  },
};

// Helper functions
export function getComponent(
  type: string,
): ComponentType<{ data: any }> | null {
  return componentRegistry[type]?.component || null;
}

export function getSchema(type: string): ComponentSchema | null {
  return componentRegistry[type]?.schema || null;
}

export function getDefaultData(type: string): Record<string, any> {
  return componentRegistry[type]?.schema.defaultData || {};
}

export function getAllComponentTypes(): string[] {
  return Object.keys(componentRegistry);
}

export function getComponentsByCategory(category: string): string[] {
  return Object.entries(componentRegistry)
    .filter(([_, entry]) => entry.schema.category === category)
    .map(([key]) => key);
}
