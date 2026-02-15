import { z } from "zod";

// Hero component schema
const heroSchema = z.object({
  title: z.string().describe("Main headline that captures attention"),
  subtitle: z
    .string()
    .describe("Supporting text explaining the value proposition"),
  ctaText: z
    .string()
    .describe('Call-to-action button text (e.g., "Get Started", "Learn More")'),
  ctaLink: z.string().default("#contact").describe("Link for the CTA button"),
  image: z
    .string()
    .describe(
      "Unsplash URL: https://images.unsplash.com/photo-xxxxx?w=1200&h=600",
    ),
  alignment: z.enum(["left", "center", "right"]).default("center"),
});

// Features component schema
const featuresSchema = z.object({
  title: z.string().describe("Section heading"),
  subtitle: z.string().optional().describe("Optional subheading"),
  features: z
    .array(
      z.object({
        icon: z
          .enum([
            "zap",
            "shield",
            "users",
            "globe",
            "heart",
            "star",
            "clock",
            "check",
            "trending-up",
            "smartphone",
            "mail",
            "phone",
            "map-pin",
            "calendar",
            "camera",
            "shopping-cart",
            "credit-card",
            "truck",
            "package",
            "gift",
            "award",
          ])
          .describe("Lucide icon name"),
        title: z.string().describe("Feature name"),
        description: z.string().describe("Feature description"),
      }),
    )
    .min(3)
    .max(6)
    .describe("List of 3-6 features"),
});

// Pricing component schema
const pricingSchema = z.object({
  title: z.string().describe("Pricing section heading"),
  subtitle: z.string().optional(),
  plans: z
    .array(
      z.object({
        name: z
          .string()
          .describe('Plan name (e.g., "Basic", "Pro", "Enterprise")'),
        price: z
          .string()
          .describe('Price with currency (e.g., "₹999/mo", "Free")'),
        description: z.string().describe("Short plan description"),
        features: z.array(z.string()).min(3).describe("List of plan features"),
        ctaText: z.string().describe("Button text"),
        featured: z.boolean().default(false).describe("Highlight this plan"),
      }),
    )
    .min(2)
    .max(3)
    .describe("2-3 pricing tiers"),
});

// Testimonials component schema
const testimonialsSchema = z.object({
  title: z.string().describe("Testimonials section heading"),
  testimonials: z
    .array(
      z.object({
        quote: z.string().describe("Customer testimonial text"),
        author: z.string().describe("Customer name"),
        role: z.string().describe("Job title or company"),
        avatar: z
          .string()
          .describe(
            "Unsplash portrait URL: https://images.unsplash.com/photo-xxxxx?w=100&h=100",
          ),
      }),
    )
    .min(3)
    .max(6)
    .describe("3-6 customer testimonials"),
});

// FAQ component schema
const faqSchema = z.object({
  title: z.string().describe("FAQ section heading"),
  faqs: z
    .array(
      z.object({
        question: z.string().describe("Frequently asked question"),
        answer: z.string().describe("Detailed answer"),
      }),
    )
    .min(4)
    .max(8)
    .describe("4-8 common questions"),
});

// Contact component schema
const contactSchema = z.object({
  title: z.string().describe("Contact section heading"),
  subtitle: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Text/About component schema
const textSchema = z.object({
  heading: z.string().describe("Section heading"),
  text: z.string().describe("Body text content"),
  alignment: z.enum(["left", "center", "right"]).default("left"),
});

// Gallery component schema
const gallerySchema = z.object({
  title: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z
          .string()
          .describe(
            "Unsplash URL: https://images.unsplash.com/photo-xxxxx?w=600&h=400",
          ),
        alt: z.string().describe("Image alt text"),
        caption: z.string().optional(),
      }),
    )
    .min(4)
    .max(8),
  columns: z.number().min(2).max(4).default(3),
});

// Component union schema
const componentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    props: heroSchema,
  }),
  z.object({
    type: z.literal("features"),
    props: featuresSchema,
  }),
  z.object({
    type: z.literal("pricing"),
    props: pricingSchema,
  }),
  z.object({
    type: z.literal("testimonials"),
    props: testimonialsSchema,
  }),
  z.object({
    type: z.literal("faq"),
    props: faqSchema,
  }),
  z.object({
    type: z.literal("contact"),
    props: contactSchema,
  }),
  z.object({
    type: z.literal("text"),
    props: textSchema,
  }),
  z.object({
    type: z.literal("gallery"),
    props: gallerySchema,
  }),
]);

// Main site schema
export const siteGenerationSchema = z.object({
  name: z
    .string()
    .describe(
      'Business/site name (e.g., "Apex Fitness", "TechStart Solutions")',
    ),
  subdomain: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(3)
    .max(30)
    .describe(
      'URL-friendly subdomain: lowercase, hyphens only, no spaces (e.g., "apex-fitness")',
    ),
  description: z
    .string()
    .max(160)
    .describe("SEO meta description (max 160 characters)"),
  industry: z
    .string()
    .describe(
      'Industry/category (e.g., "fitness", "technology", "restaurant")',
    ),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .default("#3b82f6")
    .describe("Primary brand color in hex format"),
  components: z
    .array(componentSchema)
    .min(3)
    .max(8)
    .describe("Ordered list of landing page sections (3-8 components)"),
});

export type SiteGeneration = z.infer<typeof siteGenerationSchema>;
export type ComponentGeneration = z.infer<typeof componentSchema>;
