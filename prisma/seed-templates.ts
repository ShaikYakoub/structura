import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS FOR BLOCK CREATION
// ============================================

function createHeroBlock(content: {
  title: string;
  subtitle: string;
  primaryButton?: { text: string; link: string };
  secondaryButton?: { text: string; link: string };
  backgroundImage?: string;
  alignment?: "left" | "center" | "right";
}) {
  return {
    id: `hero-${Date.now()}-${Math.random()}`,
    type: "hero",
    content: {
      title: content.title,
      subtitle: content.subtitle,
      primaryButton: content.primaryButton || null,
      secondaryButton: content.secondaryButton || null,
      backgroundImage: content.backgroundImage || null,
      alignment: content.alignment || "center",
    },
  };
}

function createFeaturesBlock(content: {
  title: string;
  subtitle?: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}) {
  return {
    id: `features-${Date.now()}-${Math.random()}`,
    type: "features",
    content: {
      title: content.title,
      subtitle: content.subtitle || "",
      features: content.features,
    },
  };
}

function createTextBlock(content: {
  heading?: string;
  text: string;
  alignment?: "left" | "center" | "right";
}) {
  return {
    id: `text-${Date.now()}-${Math.random()}`,
    type: "text",
    content: {
      heading: content.heading || "",
      text: content.text,
      alignment: content.alignment || "left",
    },
  };
}

function createPricingBlock(content: {
  title: string;
  plans: Array<{
    name: string;
    price: string;
    features: string[];
    cta: string;
    featured?: boolean;
  }>;
}) {
  return {
    id: `pricing-${Date.now()}-${Math.random()}`,
    type: "pricing",
    content: {
      title: content.title,
      plans: content.plans,
    },
  };
}

function createGalleryBlock(content: {
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
}) {
  return {
    id: `gallery-${Date.now()}-${Math.random()}`,
    type: "gallery",
    content: {
      images: content.images,
      columns: content.columns || 3,
    },
  };
}

function createContactBlock(content: {
  title: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  return {
    id: `contact-${Date.now()}-${Math.random()}`,
    type: "contact",
    content: {
      title: content.title,
      subtitle: content.subtitle || "",
      email: content.email || "",
      phone: content.phone || "",
      address: content.address || "",
    },
  };
}

// ============================================
// TEMPLATE DATA
// ============================================

const templates = [
  // ==================== PORTFOLIO ====================
  {
    subdomain: "template-minimalist-designer",
    name: "Minimalist Designer Portfolio",
    category: "portfolio",
    description:
      "Clean and minimal portfolio perfect for designers and creatives who want their work to speak for itself.",
    thumbnailKeyword: "minimalist,design",
    styles: {
      primary: "#000000",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0",
    },
    blocks: [
      createHeroBlock({
        title: "Creating Digital Experiences",
        subtitle: "Designer & Creative Director based in New York",
        primaryButton: { text: "View Work", link: "#work" },
        secondaryButton: { text: "Contact Me", link: "#contact" },
        alignment: "center",
      }),
      createGalleryBlock({
        images: [
          {
            url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
            alt: "Project 1",
          },
          {
            url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop",
            alt: "Project 2",
          },
          {
            url: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600&h=400&fit=crop",
            alt: "Project 3",
          },
          {
            url: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=400&fit=crop",
            alt: "Project 4",
          },
          {
            url: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&h=400&fit=crop",
            alt: "Project 5",
          },
          {
            url: "https://images.unsplash.com/photo-1506097425191-7ad538b29cef?w=600&h=400&fit=crop",
            alt: "Project 6",
          },
        ],
        columns: 2,
      }),
      createContactBlock({
        title: "Let's Work Together",
        subtitle: "Available for freelance projects",
        email: "hello@designer.com",
      }),
    ],
  },
  {
    subdomain: "template-creative-agency",
    name: "Creative Agency",
    category: "portfolio",
    description:
      "Bold and energetic portfolio for creative agencies and design studios.",
    thumbnailKeyword: "creative,agency",
    styles: {
      primary: "#ff6b35",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "We Create Bold Brands",
        subtitle:
          "A full-service creative agency specializing in brand strategy, design, and digital experiences.",
        primaryButton: { text: "See Our Work", link: "#portfolio" },
        secondaryButton: { text: "Start a Project", link: "#contact" },
        alignment: "left",
      }),
      createFeaturesBlock({
        title: "What We Do",
        features: [
          {
            icon: "palette",
            title: "Brand Identity",
            description: "Creating memorable brand identities that stand out",
          },
          {
            icon: "globe",
            title: "Web Design",
            description: "Beautiful, responsive websites that convert",
          },
          {
            icon: "video",
            title: "Motion Graphics",
            description: "Engaging animations and video content",
          },
        ],
      }),
      createTextBlock({
        heading: "Our Team",
        text: "We're a collective of designers, developers, and strategists passionate about creating exceptional digital experiences. With over 10 years of experience, we've helped brands of all sizes achieve their goals.",
      }),
    ],
  },
  {
    subdomain: "template-photography-portfolio",
    name: "Photography Portfolio",
    category: "portfolio",
    description:
      "Stunning full-screen portfolio for photographers to showcase their best work.",
    thumbnailKeyword: "photography,camera",
    styles: {
      primary: "#2c3e50",
      background: "#1a1a1a",
      foreground: "#ffffff",
      muted: "#2a2a2a",
      mutedForeground: "#a0a0a0",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0",
    },
    blocks: [
      createHeroBlock({
        title: "Capturing Moments",
        subtitle: "Professional Wedding & Portrait Photography",
        primaryButton: { text: "View Gallery", link: "#gallery" },
        backgroundImage:
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop",
      }),
      createGalleryBlock({
        images: [
          {
            url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop",
            alt: "Wedding Photo",
            caption: "Sarah & John - Summer 2025",
          },
          {
            url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=600&fit=crop",
            alt: "Portrait",
            caption: "Studio Portrait",
          },
          {
            url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop",
            alt: "Engagement",
            caption: "Engagement Session",
          },
          {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            alt: "Landscape",
            caption: "Nature Photography",
          },
        ],
        columns: 2,
      }),
    ],
  },

  // ==================== BUSINESS ====================
  {
    subdomain: "template-saas-startup",
    name: "SaaS Startup",
    category: "business",
    description:
      "Modern landing page for SaaS companies with features and pricing sections.",
    thumbnailKeyword: "saas,technology",
    styles: {
      primary: "#6366f1",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Automate Your Workflow",
        subtitle:
          "Save time and boost productivity with our powerful automation platform. Get started in minutes.",
        primaryButton: { text: "Start Free Trial", link: "/signup" },
        secondaryButton: { text: "Watch Demo", link: "#demo" },
      }),
      createFeaturesBlock({
        title: "Everything You Need",
        subtitle: "Powerful features to streamline your business",
        features: [
          {
            icon: "zap",
            title: "Lightning Fast",
            description: "Optimized performance for maximum speed",
          },
          {
            icon: "shield",
            title: "Secure & Reliable",
            description: "Enterprise-grade security and 99.9% uptime",
          },
          {
            icon: "users",
            title: "Team Collaboration",
            description: "Work together seamlessly with your team",
          },
          {
            icon: "chart",
            title: "Analytics & Insights",
            description: "Track performance with detailed analytics",
          },
          {
            icon: "smartphone",
            title: "Mobile Ready",
            description: "Access anywhere on any device",
          },
          {
            icon: "headphones",
            title: "24/7 Support",
            description: "Expert support whenever you need it",
          },
        ],
      }),
      createPricingBlock({
        title: "Simple, Transparent Pricing",
        plans: [
          {
            name: "Starter",
            price: "₹999/mo",
            features: [
              "5 Projects",
              "10 GB Storage",
              "Basic Support",
              "API Access",
            ],
            cta: "Start Free Trial",
          },
          {
            name: "Professional",
            price: "₹2,999/mo",
            features: [
              "Unlimited Projects",
              "100 GB Storage",
              "Priority Support",
              "Advanced Analytics",
              "Custom Integrations",
            ],
            cta: "Get Started",
            featured: true,
          },
          {
            name: "Enterprise",
            price: "Custom",
            features: [
              "Unlimited Everything",
              "Dedicated Support",
              "Custom Solutions",
              "SLA Guarantee",
              "Training & Onboarding",
            ],
            cta: "Contact Sales",
          },
        ],
      }),
    ],
  },
  {
    subdomain: "template-local-restaurant",
    name: "Local Restaurant",
    category: "business",
    description:
      "Appetizing website for restaurants with menu and contact information.",
    thumbnailKeyword: "restaurant,food",
    styles: {
      primary: "#d4a574",
      background: "#fef6f0",
      foreground: "#1a1a1a",
      muted: "#f5e9dc",
      mutedForeground: "#8b7355",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Authentic Italian Cuisine",
        subtitle:
          "Family recipes passed down through generations. Experience the taste of Italy in every bite.",
        primaryButton: { text: "Reserve Table", link: "#booking" },
        secondaryButton: { text: "View Menu", link: "#menu" },
        backgroundImage:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1920&h=1080&fit=crop",
      }),
      createTextBlock({
        heading: "Our Menu",
        text: `**Appetizers**
• Bruschetta - Fresh tomatoes, basil, and mozzarella on toasted bread - ₹450
• Caprese Salad - Buffalo mozzarella, tomatoes, and basil - ₹550
• Arancini - Fried risotto balls with marinara sauce - ₹500

**Main Courses**
• Spaghetti Carbonara - Classic Roman pasta with pancetta and pecorino - ₹850
• Margherita Pizza - San Marzano tomatoes, mozzarella, basil - ₹750
• Lasagna Bolognese - Layers of pasta, meat sauce, and béchamel - ₹950
• Risotto ai Funghi - Creamy mushroom risotto - ₹900

**Desserts**
• Tiramisu - Classic Italian coffee-flavored dessert - ₹450
• Panna Cotta - Vanilla cream with berry compote - ₹400`,
      }),
      createContactBlock({
        title: "Visit Us",
        email: "reservations@italiana.com",
        phone: "+91 98765 43210",
        address: "123 MG Road, Bangalore, Karnataka 560001",
      }),
    ],
  },
  {
    subdomain: "template-fitness-gym",
    name: "FitLife Fitness Studio",
    category: "business",
    description:
      "High-energy website for gyms and fitness studios with class schedules.",
    thumbnailKeyword: "fitness,gym",
    styles: {
      primary: "#ff6b35",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Transform Your Body & Mind",
        subtitle:
          "Join our community of fitness enthusiasts. Expert trainers, modern equipment, and a supportive environment.",
        primaryButton: { text: "Join Now", link: "#membership" },
        secondaryButton: { text: "Free Trial", link: "#trial" },
        backgroundImage:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop",
      }),
      createFeaturesBlock({
        title: "Why Choose FitLife?",
        features: [
          {
            icon: "dumbbell",
            title: "Expert Trainers",
            description: "Certified professionals to guide your journey",
          },
          {
            icon: "clock",
            title: "24/7 Access",
            description: "Work out on your schedule, any time",
          },
          {
            icon: "users",
            title: "Group Classes",
            description: "Yoga, Zumba, CrossFit, and more",
          },
        ],
      }),
      createTextBlock({
        heading: "Class Schedule",
        text: `**Monday - Friday**
• 6:00 AM - Morning Yoga
• 7:00 AM - HIIT Training
• 9:00 AM - Pilates
• 5:00 PM - Spin Class
• 6:30 PM - CrossFit
• 7:30 PM - Zumba

**Weekend**
• 8:00 AM - Yoga Flow
• 10:00 AM - Boot Camp
• 4:00 PM - Family Fitness`,
      }),
      createPricingBlock({
        title: "Membership Plans",
        plans: [
          {
            name: "Basic",
            price: "₹1,999/mo",
            features: ["Gym Access", "Locker Room", "Basic Equipment"],
            cta: "Get Started",
          },
          {
            name: "Premium",
            price: "₹3,999/mo",
            features: [
              "24/7 Access",
              "All Classes",
              "Personal Trainer (2 sessions/mo)",
              "Nutrition Guidance",
            ],
            cta: "Most Popular",
            featured: true,
          },
        ],
      }),
    ],
  },

  // ==================== E-COMMERCE ====================
  {
    subdomain: "template-fashion-store",
    name: "Fashion Boutique",
    category: "ecommerce",
    description: "Elegant e-commerce template for fashion and clothing stores.",
    thumbnailKeyword: "fashion,clothing",
    styles: {
      primary: "#1a1a1a",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0",
    },
    blocks: [
      createHeroBlock({
        title: "Spring Collection 2026",
        subtitle:
          "Discover our latest arrivals. Timeless pieces for the modern wardrobe.",
        primaryButton: { text: "Shop Now", link: "#shop" },
        backgroundImage:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop",
      }),
      createGalleryBlock({
        images: [
          {
            url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
            alt: "Dresses",
            caption: "Dresses",
          },
          {
            url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
            alt: "Outerwear",
            caption: "Outerwear",
          },
          {
            url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
            alt: "Footwear",
            caption: "Footwear",
          },
          {
            url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop",
            alt: "Accessories",
            caption: "Accessories",
          },
        ],
        columns: 4,
      }),
      createFeaturesBlock({
        title: "Why Shop With Us",
        features: [
          {
            icon: "truck",
            title: "Free Shipping",
            description: "On orders over ₹2,000",
          },
          {
            icon: "refresh",
            title: "Easy Returns",
            description: "30-day return policy",
          },
          {
            icon: "shield",
            title: "Secure Payment",
            description: "100% secure transactions",
          },
        ],
      }),
    ],
  },
  {
    subdomain: "template-tech-gadgets",
    name: "TechGear Store",
    category: "ecommerce",
    description: "Modern dark-themed store for electronics and tech gadgets.",
    thumbnailKeyword: "technology,gadgets",
    styles: {
      primary: "#3b82f6",
      background: "#0a0a0a",
      foreground: "#ffffff",
      muted: "#1a1a1a",
      mutedForeground: "#a0a0a0",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Next-Gen Technology",
        subtitle:
          "Shop the latest smartphones, laptops, and accessories. Innovation delivered to your doorstep.",
        primaryButton: { text: "Browse Catalog", link: "#products" },
        backgroundImage:
          "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&h=1080&fit=crop",
      }),
      createFeaturesBlock({
        title: "Featured Products",
        features: [
          {
            icon: "smartphone",
            title: "Smartphones",
            description: "Latest flagship devices from top brands",
          },
          {
            icon: "laptop",
            title: "Laptops",
            description: "High-performance computing for work and play",
          },
          {
            icon: "headphones",
            title: "Audio",
            description: "Premium headphones and speakers",
          },
          {
            icon: "watch",
            title: "Wearables",
            description: "Smartwatches and fitness trackers",
          },
        ],
      }),
      createTextBlock({
        heading: "Why Choose TechGear",
        text: "✓ Authorized dealer for all major brands\n✓ Extended warranty options\n✓ Expert technical support\n✓ Trade-in program available\n✓ Same-day delivery in select cities",
      }),
    ],
  },
  {
    subdomain: "template-handmade-crafts",
    name: "Artisan Crafts",
    category: "ecommerce",
    description:
      "Warm and cozy store for handmade crafts and artisan products.",
    thumbnailKeyword: "handmade,crafts",
    styles: {
      primary: "#8b5a3c",
      background: "#fefaf6",
      foreground: "#1a1a1a",
      muted: "#f5ebe0",
      mutedForeground: "#6b4423",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Handcrafted With Love",
        subtitle:
          "Unique, handmade items crafted by artisans. Each piece tells a story.",
        primaryButton: { text: "Shop Collection", link: "#shop" },
        backgroundImage:
          "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1920&h=1080&fit=crop",
      }),
      createGalleryBlock({
        images: [
          {
            url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
            alt: "Pottery",
            caption: "Ceramic Pottery",
          },
          {
            url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
            alt: "Jewelry",
            caption: "Handmade Jewelry",
          },
          {
            url: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400&h=400&fit=crop",
            alt: "Textiles",
            caption: "Woven Textiles",
          },
          {
            url: "https://images.unsplash.com/photo-1565043666747-c3aab6798956?w=400&h=400&fit=crop",
            alt: "Woodwork",
            caption: "Wooden Crafts",
          },
          {
            url: "https://images.unsplash.com/photo-1602874801006-c2b5a6e843f9?w=400&h=400&fit=crop",
            alt: "Candles",
            caption: "Scented Candles",
          },
          {
            url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
            alt: "Art",
            caption: "Original Art",
          },
        ],
        columns: 3,
      }),
      createTextBlock({
        heading: "Our Story",
        text: "Every item in our collection is carefully handcrafted by skilled artisans. We believe in preserving traditional craftsmanship while supporting local communities. When you purchase from us, you're not just buying a product – you're supporting someone's passion and livelihood.",
      }),
    ],
  },

  // ==================== BLOG ====================
  {
    subdomain: "template-tech-news",
    name: "TechBeat Blog",
    category: "blog",
    description: "Clean blog layout for tech news and industry updates.",
    thumbnailKeyword: "technology,blog",
    styles: {
      primary: "#2563eb",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Tech News & Insights",
        subtitle:
          "Stay updated with the latest in technology, startups, and innovation.",
        alignment: "center",
      }),
      createTextBlock({
        heading: "Latest Articles",
        text: `**The Future of AI in 2026**
Exploring how artificial intelligence is reshaping industries and our daily lives.
*Published: Feb 10, 2026 • 5 min read*

---

**Web3 and Blockchain: What's Next?**
A deep dive into decentralized technologies and their real-world applications.
*Published: Feb 8, 2026 • 8 min read*

---

**Building Scalable SaaS Applications**
Best practices and architecture patterns for modern cloud-native apps.
*Published: Feb 5, 2026 • 10 min read*

---

**The Rise of No-Code Platforms**
How no-code tools are democratizing software development.
*Published: Feb 1, 2026 • 6 min read*`,
      }),
      createContactBlock({
        title: "Subscribe to Our Newsletter",
        subtitle: "Get weekly tech insights delivered to your inbox",
        email: "subscribe@techbeat.com",
      }),
    ],
  },
  {
    subdomain: "template-travel-diary",
    name: "Wanderlust Travel Blog",
    category: "blog",
    description:
      "Beautiful travel blog with large photos and destination guides.",
    thumbnailKeyword: "travel,adventure",
    styles: {
      primary: "#0891b2",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Adventures Around the World",
        subtitle:
          "Travel stories, tips, and guides from a full-time digital nomad.",
        backgroundImage:
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop",
      }),
      createGalleryBlock({
        images: [
          {
            url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop",
            alt: "Bali",
            caption: "Bali, Indonesia - Paradise Found",
          },
          {
            url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=500&fit=crop",
            alt: "Paris",
            caption: "Paris, France - City of Lights",
          },
          {
            url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop",
            alt: "Tokyo",
            caption: "Tokyo, Japan - Modern Meets Traditional",
          },
          {
            url: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&h=500&fit=crop",
            alt: "Iceland",
            caption: "Iceland - Land of Fire and Ice",
          },
        ],
        columns: 2,
      }),
      createTextBlock({
        heading: "Recent Adventures",
        text: `**3 Weeks in Southeast Asia: A Complete Guide**
From the beaches of Thailand to the temples of Cambodia, here's everything you need to know for your Southeast Asian adventure.

**Solo Female Travel in Europe: Safety Tips & Best Destinations**
My experiences and advice for women traveling alone through European cities.

**Working Remotely While Traveling: The Digital Nomad Life**
How I balance work and wanderlust across different time zones.`,
      }),
    ],
  },
  {
    subdomain: "template-lifestyle-blog",
    name: "Simply Living Blog",
    category: "blog",
    description: "Personal lifestyle blog with author bio and curated content.",
    thumbnailKeyword: "lifestyle,minimal",
    styles: {
      primary: "#be185d",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      fontHeading: "Inter",
      fontBody: "Inter",
      radius: "0.5",
    },
    blocks: [
      createHeroBlock({
        title: "Simple Living, Intentional Life",
        subtitle:
          "Hi, I'm Sarah. Welcome to my corner of the internet where I share thoughts on mindful living, wellness, and creativity.",
        alignment: "center",
      }),
      createTextBlock({
        heading: "About Me",
        text: "I'm a writer, wellness enthusiast, and minimalist based in Portland. After years of chasing the hustle, I discovered the beauty of slowing down and living with intention. This blog is where I share my journey towards a more meaningful, balanced life.",
      }),
      createTextBlock({
        heading: "Recent Posts",
        text: `**Morning Rituals That Changed My Life**
The simple practices that help me start each day with intention and clarity.

**Minimalism Isn't About Having Less**
It's about making room for more of what matters.

**5 Books That Shifted My Perspective**
Life-changing reads that inspired personal transformation.

**Creating a Cozy Home on a Budget**
Tips for making your space feel warm and inviting without breaking the bank.

**Digital Detox: My 30-Day Journey**
What I learned from disconnecting from social media for a month.`,
      }),
      createContactBlock({
        title: "Let's Connect",
        email: "hello@simplyliving.com",
      }),
    ],
  },
];

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function main() {
  console.log("🌱 Starting template seeding...\n");

  // Create or get demo user and tenant for templates
  const hashedPassword = await bcrypt.hash("template-user-password", 10);

  const templateUser = await prisma.user.upsert({
    where: { email: "templates@structura.in" },
    update: {},
    create: {
      email: "templates@structura.in",
      name: "Template User",
      password: hashedPassword,
      isPro: true,
    },
  });

  const templateTenant = await prisma.tenant.upsert({
    where: { email: "templates@structura.in" },
    update: {},
    create: {
      name: "Structura Templates",
      email: "templates@structura.in",
      slug: "structura-templates",
    },
  });

  // Update user with tenant
  await prisma.user.update({
    where: { id: templateUser.id },
    data: { tenantId: templateTenant.id },
  });

  console.log("✅ Template user and tenant ready\n");

  let successCount = 0;
  let errorCount = 0;

  for (const template of templates) {
    try {
      // Generate thumbnail URL
      const thumbnailUrl = `https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop&q=80`;

      // Upsert site
      const site = await prisma.site.upsert({
        where: { subdomain: template.subdomain },
        update: {
          name: template.name,
          isTemplate: true,
          templateCategory: template.category,
          templateDescription: template.description,
          thumbnailUrl: thumbnailUrl,
          styles: template.styles,
          isPublished: true,
        },
        create: {
          name: template.name,
          subdomain: template.subdomain,
          tenantId: templateTenant.id,
          isTemplate: true,
          templateCategory: template.category,
          templateDescription: template.description,
          thumbnailUrl: thumbnailUrl,
          styles: template.styles,
          isPublished: true,
          navigation: [
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
        },
      });

      // Create or update homepage
      await prisma.page.upsert({
        where: {
          siteId_slug: {
            siteId: site.id,
            slug: "/",
          },
        },
        update: {
          name: "Home",
          path: "/",
          draftContent: template.blocks,
          publishedContent: template.blocks,
          lastPublishedAt: new Date(),
          isPublished: true,
          isHomePage: true,
        },
        create: {
          siteId: site.id,
          name: "Home",
          slug: "/",
          path: "/",
          draftContent: template.blocks,
          publishedContent: template.blocks,
          lastPublishedAt: new Date(),
          isPublished: true,
          isHomePage: true,
        },
      });

      console.log(`✅ ${template.name}`);
      console.log(`   └─ ${template.subdomain}`);
      console.log(`   └─ Category: ${template.category}`);
      console.log(`   └─ Blocks: ${template.blocks.length}\n`);

      successCount++;
    } catch (error) {
      console.error(`❌ Failed to seed ${template.name}:`, error);
      errorCount++;
    }
  }

  console.log("\n🎉 Template seeding complete!");
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log("\n📝 Demo credentials:");
  console.log("   Email: templates@structura.in");
  console.log("   Password: template-user-password");
  console.log("\n🌐 View templates at:");
  templates.forEach((t) => {
    console.log(`   http://${t.subdomain}.localhost:3000`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
