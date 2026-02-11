import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create or update Demo User
  const hashedPassword = await bcrypt.hash("password", 10);

  // First, create or get a tenant for demo user
  const demoTenant = await prisma.tenant.upsert({
    where: { email: "demo@structura.in" },
    update: {},
    create: {
      name: "Demo Tenant",
      email: "demo@structura.in",
      slug: "demo-tenant",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@structura.in" },
    update: {},
    create: {
      email: "demo@structura.in",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      tenantId: demoTenant.id,
    },
  });

  console.log("✅ Demo user created:", demoUser.email);

  // 2. Create FitLife Gym Site
  const gymSite = await prisma.site.upsert({
    where: { subdomain: "fitlife" },
    update: {},
    create: {
      name: "FitLife Gym",
      subdomain: "fitlife",
      tenantId: demoTenant.id,
      logo: null,
      navColor: "#1a1a1a",
      navigation: [
        { label: "Home", href: "/" },
        { label: "Classes", href: "/classes" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" },
      ],
      styles: {
        primary: "#ff6b35",
        background: "#ffffff",
        fontHeading: "Inter",
        fontBody: "Inter",
        radius: "0.5",
      },
    },
  });

  console.log("✅ Gym site created:", gymSite.subdomain);

  // Create homepage for Gym
  const gymHomePage = await prisma.page.create({
    data: {
      name: "Home",
      slug: "home",
      path: "/",
      siteId: gymSite.id,
      isHomePage: true,
      isPublished: true,
      draftContent: [
        {
          id: "hero-1",
          type: "hero",
          content: {
            title: "Transform Your Body & Mind",
            subtitle:
              "Join FitLife Gym and start your fitness journey today. Expert trainers, modern equipment, and a supportive community.",
            primaryButton: {
              text: "Get Started",
              link: "/contact",
            },
            secondaryButton: {
              text: "View Classes",
              link: "/classes",
            },
            backgroundImage: null,
          },
        },
        {
          id: "features-1",
          type: "features",
          content: {
            title: "Why Choose FitLife?",
            features: [
              {
                icon: "dumbbell",
                title: "Expert Trainers",
                description:
                  "Certified professionals to guide your fitness journey",
              },
              {
                icon: "clock",
                title: "24/7 Access",
                description: "Work out on your schedule, any time of day",
              },
              {
                icon: "users",
                title: "Community",
                description:
                  "Join a supportive community of fitness enthusiasts",
              },
            ],
          },
        },
      ],
      publishedContent: [
        {
          id: "hero-1",
          type: "hero",
          content: {
            title: "Transform Your Body & Mind",
            subtitle:
              "Join FitLife Gym and start your fitness journey today. Expert trainers, modern equipment, and a supportive community.",
            primaryButton: {
              text: "Get Started",
              link: "/contact",
            },
            secondaryButton: {
              text: "View Classes",
              link: "/classes",
            },
            backgroundImage: null,
          },
        },
        {
          id: "features-1",
          type: "features",
          content: {
            title: "Why Choose FitLife?",
            features: [
              {
                icon: "dumbbell",
                title: "Expert Trainers",
                description:
                  "Certified professionals to guide your fitness journey",
              },
              {
                icon: "clock",
                title: "24/7 Access",
                description: "Work out on your schedule, any time of day",
              },
              {
                icon: "users",
                title: "Community",
                description:
                  "Join a supportive community of fitness enthusiasts",
              },
            ],
          },
        },
      ],
      lastPublishedAt: new Date(),
    },
  });

  console.log("✅ Gym homepage created");

  // 3. Create Sweet Treats Bakery Site
  const bakerySite = await prisma.site.upsert({
    where: { subdomain: "bakery" },
    update: {},
    create: {
      name: "Sweet Treats Bakery",
      subdomain: "bakery",
      tenantId: demoTenant.id,
      logo: null,
      navColor: "#fef6f0",
      navigation: [
        { label: "Home", href: "/" },
        { label: "Menu", href: "/menu" },
        { label: "About", href: "/about" },
        { label: "Order", href: "/order" },
      ],
      styles: {
        primary: "#d4a574",
        background: "#ffffff",
        fontHeading: "Inter",
        fontBody: "Inter",
        radius: "0.5",
      },
    },
  });

  console.log("✅ Bakery site created:", bakerySite.subdomain);

  // Create homepage for Bakery
  const bakeryHomePage = await prisma.page.create({
    data: {
      name: "Home",
      slug: "home",
      path: "/",
      siteId: bakerySite.id,
      isHomePage: true,
      isPublished: true,
      draftContent: [
        {
          id: "hero-1",
          type: "hero",
          content: {
            title: "Freshly Baked Every Day",
            subtitle:
              "Artisan breads, delicious pastries, and custom cakes made with love. Visit Sweet Treats Bakery for the finest baked goods in town.",
            primaryButton: {
              text: "Order Now",
              link: "/order",
            },
            secondaryButton: {
              text: "View Menu",
              link: "/menu",
            },
            backgroundImage: null,
          },
        },
        {
          id: "features-1",
          type: "features",
          content: {
            title: "What We Offer",
            features: [
              {
                icon: "cake",
                title: "Custom Cakes",
                description: "Beautiful custom cakes for all occasions",
              },
              {
                icon: "croissant",
                title: "Fresh Pastries",
                description: "Baked fresh daily with premium ingredients",
              },
              {
                icon: "bread",
                title: "Artisan Breads",
                description: "Traditional recipes with a modern twist",
              },
            ],
          },
        },
      ],
      publishedContent: [
        {
          id: "hero-1",
          type: "hero",
          content: {
            title: "Freshly Baked Every Day",
            subtitle:
              "Artisan breads, delicious pastries, and custom cakes made with love. Visit Sweet Treats Bakery for the finest baked goods in town.",
            primaryButton: {
              text: "Order Now",
              link: "/order",
            },
            secondaryButton: {
              text: "View Menu",
              link: "/menu",
            },
            backgroundImage: null,
          },
        },
        {
          id: "features-1",
          type: "features",
          content: {
            title: "What We Offer",
            features: [
              {
                icon: "cake",
                title: "Custom Cakes",
                description: "Beautiful custom cakes for all occasions",
              },
              {
                icon: "croissant",
                title: "Fresh Pastries",
                description: "Baked fresh daily with premium ingredients",
              },
              {
                icon: "bread",
                title: "Artisan Breads",
                description: "Traditional recipes with a modern twist",
              },
            ],
          },
        },
      ],
      lastPublishedAt: new Date(),
    },
  });

  console.log("✅ Bakery homepage created");

  console.log("🎉 Seed completed successfully!");
  console.log("\n📝 Demo credentials:");
  console.log("   Email: demo@structura.in");
  console.log("   Password: password");
  console.log("\n🌐 Demo sites:");
  console.log("   Gym: http://fitlife.localhost:3000");
  console.log("   Bakery: http://bakery.localhost:3000");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

